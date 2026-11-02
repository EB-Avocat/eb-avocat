import { CONTACT, CONTACT_LIMITS, OTHER_SUBJECT, SITE } from "@/lib/constants";

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

/** Submissions sent faster than this after the form rendered are treated as bots. */
export const MIN_FILL_MS = 3000;

/** Messages with more links than this are treated as link spam. */
export const MAX_MESSAGE_URLS = 3;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Counts each scheme or bare "www." (but not the "www." of "https://www."), so links glued
// together without whitespace ("http://a.fr,http://b.fr") still count separately.
const URL_RE = /https?:\/\/|(?<!\/\/)\bwww\./gi;

/** Trimmed string with line breaks normalised to LF, as the browser's `maxLength` counts them. */
function asString(value: unknown): string {
	return typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim() : "";
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

	if (data.lastName.length > CONTACT_LIMITS.name || data.firstName.length > CONTACT_LIMITS.name) {
		errors.push(formErrors.nameTooLong);
	}
	if (data.email.length > CONTACT_LIMITS.email) errors.push(formErrors.emailTooLong);
	if (data.phone.length > CONTACT_LIMITS.phone) errors.push(formErrors.phoneTooLong);
	if (
		data.subject.length > CONTACT_LIMITS.subject ||
		(data.customSubject?.length ?? 0) > CONTACT_LIMITS.subject
	) {
		errors.push(formErrors.subjectTooLong);
	}
	if (data.message.length > CONTACT_LIMITS.message) errors.push(formErrors.messageTooLong);

	if (errors.length > 0) return { ok: false, errors };
	return { ok: true, data };
}

export type SpamReason = "honeypot" | "too-fast" | "too-many-links" | "botid";

/**
 * Cheap bot heuristics on a submission that passed validation: the hidden `website` honeypot
 * of the raw payload is filled, the form was sent less than MIN_FILL_MS after it rendered (or
 * without a numeric `elapsedMs`), or the message carries more than MAX_MESSAGE_URLS links.
 * Returns the first reason found, or null.
 */
export function detectSpam(
	input: unknown,
	data: ContactFormData,
): Exclude<SpamReason, "botid"> | null {
	const raw = (input ?? {}) as Record<string, unknown>;
	if (asString(raw.website)) return "honeypot";

	const elapsed = Number(raw.elapsedMs);
	if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return "too-fast";

	if ((data.message.match(URL_RE)?.length ?? 0) > MAX_MESSAGE_URLS) {
		return "too-many-links";
	}
	return null;
}

/**
 * False when the request carries an `Origin` header for another host than the one it was sent
 * to (a cross-site form post or a forged script request). Requests without `Origin` pass.
 */
export function isSameOrigin(request: Request): boolean {
	const origin = request.headers.get("origin");
	if (!origin) return true;
	const host = request.headers.get("host") ?? new URL(request.url).host;
	try {
		return new URL(origin).host === host;
	} catch {
		return false;
	}
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
 * The address in a bare email or a `Display Name <email>` value. BREVO_SENDER_EMAIL is shared with
 * the backend, which shows that name; contact messages keep their own "(site web)" sender name.
 */
function mailboxAddress(value: string): string {
	return (value.match(/<([^<>]+)>\s*$/)?.[1] ?? value).trim();
}

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

	const payload = buildBrevoPayload(data, {
		senderEmail: mailboxAddress(senderEmail),
		recipientEmail,
	});

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
