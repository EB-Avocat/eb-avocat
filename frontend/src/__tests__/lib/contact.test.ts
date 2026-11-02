import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTACT, CONTACT_LIMITS, OTHER_SUBJECT } from "@/lib/constants";
import {
	BREVO_API_URL,
	buildBrevoPayload,
	type ContactFormData,
	isHoneypotFilled,
	isSameOrigin,
	isTooFast,
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

describe("validateContactForm links", () => {
	const links = (n: number) =>
		Array.from({ length: n }, (_, i) => `https://spam${i}.example/x`).join(" ");
	const check = (message: string) => validateContactForm({ ...valid, message });
	const tooMany = { ok: false, errors: [CONTACT.formErrors.tooManyLinks] };

	it("accepts up to the limit and rejects more with a French error", () => {
		expect(check(links(CONTACT_LIMITS.urls)).ok).toBe(true);
		expect(check(links(CONTACT_LIMITS.urls + 1))).toEqual(tooMany);
	});

	it("counts www links and does not double-count https://www.", () => {
		expect(check("https://www.a.fr www.b.fr http://c.fr WWW.d.fr")).toEqual(tooMany);
		expect(check("https://www.a.fr https://www.b.fr https://www.c.fr").ok).toBe(true);
	});

	it("counts links glued together without whitespace", () => {
		expect(check("http://a.fr,http://b.fr|https://c.fr<br>www.d.fr")).toEqual(tooMany);
	});
});

describe("isHoneypotFilled", () => {
	it("flags a filled hp_ref", () => {
		expect(isHoneypotFilled({ hp_ref: "https://spam.example" })).toBe(true);
	});

	it.each([
		["empty", ""],
		["blank", "  "],
		["missing", undefined],
		["not a string", 1],
	])("lets a %s hp_ref through", (_label, hp_ref) => {
		expect(isHoneypotFilled({ hp_ref })).toBe(false);
	});

	it("ignores the old `website` field name", () => {
		expect(isHoneypotFilled({ website: "Mon site" })).toBe(false);
	});

	it("tolerates a non-object payload", () => {
		expect(isHoneypotFilled(null)).toBe(false);
	});
});

describe("isTooFast", () => {
	it.each([
		["at the minimum", MIN_FILL_MS],
		["after", MIN_FILL_MS + 1000],
		["a numeric string", String(MIN_FILL_MS)],
	])("lets elapsedMs %s through", (_label, elapsedMs) => {
		expect(isTooFast({ elapsedMs })).toBe(false);
	});

	it.each([
		["too small", MIN_FILL_MS - 1],
		["missing", undefined],
		["empty", ""],
		["not a number", "soon"],
		["a boolean", true],
		["infinite", Number.POSITIVE_INFINITY],
	])("flags an elapsedMs that is %s", (_label, elapsedMs) => {
		expect(isTooFast({ elapsedMs })).toBe(true);
	});

	it("flags a non-object payload", () => {
		expect(isTooFast(null)).toBe(true);
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

	it("prefers x-forwarded-host over an internal Host header", () => {
		expect(
			isSameOrigin(
				request({
					origin: "https://biezunski-avocat.fr",
					"x-forwarded-host": "biezunski-avocat.fr",
					host: "frontend.internal:3000",
				}),
			),
		).toBe(true);
		expect(
			isSameOrigin(
				request({
					origin: "https://evil.example",
					"x-forwarded-host": "biezunski-avocat.fr",
					host: "evil.example",
				}),
			),
		).toBe(false);
	});

	it("falls back to the Host header without x-forwarded-host", () => {
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
