import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTACT, OTHER_SUBJECT } from "@/lib/constants";
import {
	BREVO_API_URL,
	buildBrevoPayload,
	type ContactFormData,
	resolveSubject,
	sendContactEmail,
	validateContactForm,
} from "@/lib/contact";

const valid: ContactFormData = {
	lastName: "Dupont",
	firstName: "Marie",
	email: "marie@example.com",
	phone: "0600000000",
	subject: "Contentieux",
	message: "Bonjour, j'aimerais un rendez-vous.",
};

describe("validateContactForm", () => {
	it("accepts a valid payload and trims values", () => {
		const result = validateContactForm({ ...valid, lastName: "  Dupont  " });
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.lastName).toBe("Dupont");
	});

	it("rejects missing required fields", () => {
		const result = validateContactForm({ subject: "Contentieux" });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.length).toBeGreaterThanOrEqual(4);
		}
	});

	it("rejects an invalid email", () => {
		const result = validateContactForm({ ...valid, email: "not-an-email" });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.errors).toContain(CONTACT.formErrors.emailInvalid);
	});

	it("requires customSubject when subject is 'Autre'", () => {
		const missing = validateContactForm({ ...valid, subject: OTHER_SUBJECT });
		expect(missing.ok).toBe(false);

		const provided = validateContactForm({
			...valid,
			subject: OTHER_SUBJECT,
			customSubject: "Question diverse",
		});
		expect(provided.ok).toBe(true);
	});
});

describe("resolveSubject", () => {
	it("returns the selected subject", () => {
		expect(resolveSubject(valid)).toBe("Contentieux");
	});

	it("returns the custom subject when 'Autre'", () => {
		expect(
			resolveSubject({ ...valid, subject: OTHER_SUBJECT, customSubject: "Mécénat spécial" }),
		).toBe("Mécénat spécial");
	});
});

describe("buildBrevoPayload", () => {
	const payload = buildBrevoPayload(valid, {
		senderEmail: "noreply@biezunski-avocat.fr",
		recipientEmail: "eva@biezunski-avocat.fr",
	});

	it("sends to the recipient and replies to the visitor", () => {
		expect(payload.to[0]?.email).toBe("eva@biezunski-avocat.fr");
		expect(payload.replyTo).toEqual({ email: "marie@example.com", name: "Marie Dupont" });
		expect(payload.sender.email).toBe("noreply@biezunski-avocat.fr");
	});

	it("reflects the objet in the subject", () => {
		expect(payload.subject).toContain("Contentieux");
	});

	it("includes the visitor details in the body", () => {
		for (const value of ["Dupont", "Marie", "marie@example.com", "0600000000"]) {
			expect(payload.textContent).toContain(value);
			expect(payload.htmlContent).toContain(value);
		}
		expect(payload.textContent).toContain(valid.message);
	});

	it("escapes HTML in the message", () => {
		const hostile = buildBrevoPayload(
			{ ...valid, message: "<script>alert(1)</script>" },
			{ senderEmail: "s@x.fr", recipientEmail: "r@x.fr" },
		);
		expect(hostile.htmlContent).not.toContain("<script>");
		expect(hostile.htmlContent).toContain("&lt;script&gt;");
	});
});

describe("sendContactEmail", () => {
	afterEach(() => vi.restoreAllMocks());

	it("posts to Brevo with the api-key header and returns ok on 2xx", async () => {
		const fetchMock = vi.fn(async () => new Response(null, { status: 201 }));
		vi.stubGlobal("fetch", fetchMock);

		const result = await sendContactEmail(valid, {
			BREVO_API_KEY: "secret-key",
			BREVO_SENDER_EMAIL: "noreply@biezunski-avocat.fr",
		});

		expect(result.ok).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe(BREVO_API_URL);
		expect(init.method).toBe("POST");
		expect((init.headers as Record<string, string>)["api-key"]).toBe("secret-key");
		const body = JSON.parse(init.body as string);
		expect(body.to[0].email).toBe(CONTACT.email);
	});

	it("defaults the recipient to the public contact email", async () => {
		const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
		vi.stubGlobal("fetch", fetchMock);

		await sendContactEmail(valid, {
			BREVO_API_KEY: "k",
			BREVO_SENDER_EMAIL: "s@x.fr",
		});
		const body = JSON.parse(
			(fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string,
		);
		expect(body.to[0].email).toBe(CONTACT.email);
	});

	it("returns an error on a non-2xx response", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(null, { status: 400 })),
		);
		const result = await sendContactEmail(valid, {
			BREVO_API_KEY: "k",
			BREVO_SENDER_EMAIL: "s@x.fr",
		});
		expect(result.ok).toBe(false);
	});

	it("returns an error when the API key is missing", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const result = await sendContactEmail(valid, { BREVO_SENDER_EMAIL: "s@x.fr" });
		expect(result.ok).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
