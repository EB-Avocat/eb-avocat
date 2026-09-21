import { CONTACT, OTHER_SUBJECT, SITE } from "@/lib/constants";

/** Brevo transactional email endpoint. */
export const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/** Shape of a contact-form submission once validated. */
export interface ContactFormData {
	lastName: string;
	firstName: string;
	email: string;
	phone: string;
	subject: string;
	customSubject?: string;
	message: string;
}

export type ValidationResult =
	| { ok: true; data: ContactFormData }
	| { ok: false; errors: string[] };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

/**
 * Validates a raw (untrusted) contact-form payload. Required: lastName,
 * firstName, email, message. When the subject is "Autre", a custom subject is
 * required. Returns the trimmed, typed data or a list of human-readable errors.
 */
export function validateContactForm(input: unknown): ValidationResult {
	const errors: string[] = [];
	const raw = (input ?? {}) as Record<string, unknown>;

	const data: ContactFormData = {
		lastName: asString(raw.lastName),
		firstName: asString(raw.firstName),
		email: asString(raw.email),
		phone: asString(raw.phone),
		subject: asString(raw.subject),
		customSubject: asString(raw.customSubject),
		message: asString(raw.message),
	};

	const { formErrors } = CONTACT;
	if (!data.lastName) errors.push(formErrors.lastNameRequired);
	if (!data.firstName) errors.push(formErrors.firstNameRequired);
	if (!data.email) {
		errors.push(formErrors.emailRequired);
	} else if (!EMAIL_RE.test(data.email)) {
		errors.push(formErrors.emailInvalid);
	}
	if (!data.message) errors.push(formErrors.messageRequired);
	if (data.subject === OTHER_SUBJECT && !data.customSubject) {
		errors.push(formErrors.customSubjectRequired);
	}

	if (errors.length > 0) return { ok: false, errors };
	return { ok: true, data };
}

/** The objet shown in the email: the free-text value when subject is "Autre". */
export function resolveSubject(data: ContactFormData): string {
	if (data.subject === OTHER_SUBJECT && data.customSubject) {
		return data.customSubject;
	}
	return data.subject || "Sans objet";
}

export interface BrevoPayloadOptions {
	senderEmail: string;
	recipientEmail: string;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

/**
 * Builds the Brevo transactional-email body for a contact submission. The email
 * is sent from the verified sender to Eva, with `replyTo` set to the visitor so
 * she can reply directly.
 */
export function buildBrevoPayload(data: ContactFormData, opts: BrevoPayloadOptions) {
	const objet = resolveSubject(data);
	const visitorName = `${data.firstName} ${data.lastName}`.trim();
	const phone = data.phone || "Non renseigné";

	const fields: [string, string][] = [
		["Nom", data.lastName],
		["Prénom", data.firstName],
		["Email", data.email],
		["Téléphone", phone],
		["Objet", objet],
	];

	const textContent = [
		...fields.map(([label, value]) => `${label} : ${value}`),
		"",
		"Message :",
		data.message,
	].join("\n");

	const htmlContent = [
		"<h2>Nouveau message depuis le site</h2>",
		"<ul>",
		...fields.map(([label, value]) => `<li><strong>${label} :</strong> ${escapeHtml(value)}</li>`),
		"</ul>",
		"<p><strong>Message :</strong></p>",
		`<p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>`,
	].join("");

	return {
		sender: { name: `${SITE.name} (site web)`, email: opts.senderEmail },
		to: [{ email: opts.recipientEmail, name: SITE.name }],
		replyTo: { email: data.email, name: visitorName || data.email },
		subject: `Contact site — ${objet}`,
		htmlContent,
		textContent,
	};
}

export type SendResult = { ok: true } | { ok: false; error: string };

/**
 * Sends a validated contact submission to Eva via the Brevo transactional API.
 * Reads BREVO_API_KEY / BREVO_SENDER_EMAIL from `env` (process.env by default)
 * and falls back to the public CONTACT.email for the recipient.
 */
export async function sendContactEmail(
	data: ContactFormData,
	env: Record<string, string | undefined> = process.env,
): Promise<SendResult> {
	const apiKey = env.BREVO_API_KEY;
	const senderEmail = env.BREVO_SENDER_EMAIL;
	const recipientEmail = env.BREVO_TO_EMAIL || CONTACT.email;

	if (!apiKey) return { ok: false, error: "BREVO_API_KEY is not configured." };
	if (!senderEmail) return { ok: false, error: "BREVO_SENDER_EMAIL is not configured." };

	const payload = buildBrevoPayload(data, { senderEmail, recipientEmail });

	let response: Response;
	try {
		response = await fetch(BREVO_API_URL, {
			method: "POST",
			headers: {
				"api-key": apiKey,
				"content-type": "application/json",
				accept: "application/json",
			},
			body: JSON.stringify(payload),
		});
	} catch {
		return { ok: false, error: "Failed to reach the email service." };
	}

	if (!response.ok) {
		return { ok: false, error: `Brevo responded with status ${response.status}.` };
	}

	return { ok: true };
}
