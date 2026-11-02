import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTACT, OTHER_SUBJECT } from "@/lib/constants";
import {
	BREVO_API_URL,
	buildBrevoPayload,
	CONTACT_LIMITS,
	type ContactFormData,
	detectSpam,
	isSameOrigin,
	MAX_MESSAGE_URLS,
	MIN_FILL_MS,
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

describe("validateContactForm length caps", () => {
	const tooLong = (limit: number) => "a".repeat(limit + 1);

	it("accepts values at the limits", () => {
		const result = validateContactForm({
			...valid,
			lastName: "a".repeat(CONTACT_LIMITS.name),
			firstName: "a".repeat(CONTACT_LIMITS.name),
			email: `${"a".repeat(CONTACT_LIMITS.email - "@example.com".length)}@example.com`,
			phone: "0".repeat(CONTACT_LIMITS.phone),
			subject: OTHER_SUBJECT,
			customSubject: "a".repeat(CONTACT_LIMITS.subject),
			message: "a".repeat(CONTACT_LIMITS.message),
		});
		expect(result.ok).toBe(true);
	});

	it("counts a CRLF line break as one character, like the browser's maxLength", () => {
		const message = `${"a".repeat(CONTACT_LIMITS.message - 2)}\r\nb`;
		const result = validateContactForm({ ...valid, message });
		expect(result).toEqual({
			ok: true,
			data: expect.objectContaining({ message: message.replace("\r\n", "\n") }),
		});
	});

	it("measures trimmed values", () => {
		const result = validateContactForm({
			...valid,
			lastName: ` ${"a".repeat(CONTACT_LIMITS.name)} `,
		});
		expect(result.ok).toBe(true);
	});

	it.each([
		["lastName", tooLong(CONTACT_LIMITS.name), CONTACT.formErrors.nameTooLong],
		["firstName", tooLong(CONTACT_LIMITS.name), CONTACT.formErrors.nameTooLong],
		["email", `${"a".repeat(CONTACT_LIMITS.email)}@example.com`, CONTACT.formErrors.emailTooLong],
		["phone", tooLong(CONTACT_LIMITS.phone), CONTACT.formErrors.phoneTooLong],
		["subject", tooLong(CONTACT_LIMITS.subject), CONTACT.formErrors.subjectTooLong],
		["customSubject", tooLong(CONTACT_LIMITS.subject), CONTACT.formErrors.subjectTooLong],
		["message", tooLong(CONTACT_LIMITS.message), CONTACT.formErrors.messageTooLong],
	])("rejects an over-long %s", (field, value, error) => {
		const result = validateContactForm({ ...valid, [field]: value });
		expect(result).toEqual({ ok: false, errors: [error] });
	});
});

describe("detectSpam", () => {
	const human = { ...valid, website: "", elapsedMs: MIN_FILL_MS + 1000 };

	it("lets a normal submission through", () => {
		expect(detectSpam(human)).toBeNull();
		expect(detectSpam({ ...human, elapsedMs: String(MIN_FILL_MS) })).toBeNull();
		expect(detectSpam({ ...human, website: undefined })).toBeNull();
	});

	it("flags a filled honeypot", () => {
		expect(detectSpam({ ...human, website: "https://spam.example" })).toBe("honeypot");
	});

	it("ignores a whitespace-only honeypot", () => {
		expect(detectSpam({ ...human, website: "  " })).toBeNull();
	});

	it.each([
		["too fast", MIN_FILL_MS - 1],
		["missing", undefined],
		["empty", ""],
		["not a number", "soon"],
		["not a number type", true],
		["infinite", Number.POSITIVE_INFINITY],
	])("flags an elapsedMs that is %s", (_label, elapsedMs) => {
		expect(detectSpam({ ...human, elapsedMs })).toBe("too-fast");
	});

	it("flags a message with too many links", () => {
		const links = (n: number) =>
			Array.from({ length: n }, (_, i) => `https://spam${i}.example/x`).join(" ");
		expect(detectSpam({ ...human, message: links(MAX_MESSAGE_URLS) })).toBeNull();
		expect(detectSpam({ ...human, message: links(MAX_MESSAGE_URLS + 1) })).toBe("too-many-links");
	});

	it("counts www links and does not double-count https://www.", () => {
		const message = "https://www.a.fr www.b.fr http://c.fr WWW.d.fr";
		expect(detectSpam({ ...human, message })).toBe("too-many-links");
		expect(
			detectSpam({ ...human, message: "https://www.a.fr https://www.b.fr https://www.c.fr" }),
		).toBeNull();
	});

	it("counts links glued together without whitespace", () => {
		const message = "http://a.fr,http://b.fr|https://c.fr<br>www.d.fr";
		expect(detectSpam({ ...human, message })).toBe("too-many-links");
	});

	it("tolerates a non-object payload", () => {
		expect(detectSpam(null)).toBe("too-fast");
	});
});

describe("isSameOrigin", () => {
	const request = (headers: Record<string, string>) =>
		new Request("https://biezunski-avocat.fr/api/contact", { method: "POST", headers });

	it("accepts a request without Origin", () => {
		expect(isSameOrigin(request({}))).toBe(true);
	});

	it("accepts an Origin matching the request host", () => {
		expect(isSameOrigin(request({ origin: "https://biezunski-avocat.fr" }))).toBe(true);
	});

	it("compares against the Host header when present", () => {
		expect(
			isSameOrigin(request({ origin: "https://preview.vercel.app", host: "preview.vercel.app" })),
		).toBe(true);
	});

	it("rejects a foreign Origin", () => {
		expect(isSameOrigin(request({ origin: "https://evil.example" }))).toBe(false);
	});

	it("rejects an opaque or malformed Origin", () => {
		expect(isSameOrigin(request({ origin: "null" }))).toBe(false);
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

	it("sends from the address of a 'Name <email>' sender, keeping its own name", async () => {
		const fetchMock = vi.fn(async () => new Response(null, { status: 201 }));
		vi.stubGlobal("fetch", fetchMock);

		await sendContactEmail(valid, {
			BREVO_API_KEY: "k",
			BREVO_SENDER_EMAIL: '"Eva Biezunski, avocate" <contact@biezunski-avocat.fr>',
		});
		const body = JSON.parse(
			(fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string,
		);
		expect(body.sender).toEqual({
			name: "Eva Biezunski (site web)",
			email: "contact@biezunski-avocat.fr",
		});
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
