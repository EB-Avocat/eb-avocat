import { checkBotId } from "botid/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/contact/route";
import { CONTACT, CONTACT_LIMITS } from "@/lib/constants";
import { BREVO_API_URL, MIN_FILL_MS } from "@/lib/contact";

vi.mock("botid/server", () => ({ checkBotId: vi.fn() }));

const validBody = {
	lastName: "Dupont",
	firstName: "Marie",
	email: "marie@example.com",
	phone: "0600000000",
	subject: "Contentieux",
	message: "Bonjour.",
	hp_ref: "",
	elapsedMs: MIN_FILL_MS + 2000,
};

function postRequest(body: unknown, raw?: string, headers: Record<string, string> = {}) {
	return new Request("http://localhost/api/contact", {
		method: "POST",
		headers: { "content-type": "application/json", ...headers },
		body: raw ?? JSON.stringify(body),
	});
}

function botIdVerdict(isBot: boolean) {
	return { isHuman: !isBot, isBot, isVerifiedBot: false, bypassed: false };
}

function stubBrevo(status = 201) {
	const fetchMock = vi.fn(async () => new Response(null, { status }));
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

describe("POST /api/contact", () => {
	beforeEach(() => {
		vi.stubEnv("BREVO_API_KEY", "secret-key");
		vi.stubEnv("BREVO_SENDER_EMAIL", "noreply@biezunski-avocat.fr");
		vi.mocked(checkBotId).mockReset().mockResolvedValue(botIdVerdict(false));
	});
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("returns 200 when the email is sent", async () => {
		const fetchMock = stubBrevo();
		const res = await POST(postRequest(validBody));
		expect(res.status).toBe(200);
		await expect(res.json()).resolves.toEqual({ ok: true });
		expect(fetchMock).toHaveBeenCalledWith(BREVO_API_URL, expect.anything());
	});

	it("does not forward the honeypot or the timing to the email", async () => {
		const fetchMock = stubBrevo();
		await POST(postRequest(validBody));
		const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(init.body).not.toContain("elapsedMs");
		expect(init.body).not.toContain("hp_ref");
	});

	it("accepts a same-origin request", async () => {
		stubBrevo();
		const res = await POST(postRequest(validBody, undefined, { origin: "http://localhost" }));
		expect(res.status).toBe(200);
	});

	it("returns 403 for a foreign Origin, before reading the body", async () => {
		const fetchMock = stubBrevo();
		const res = await POST(postRequest(null, "{not json", { origin: "https://evil.example" }));
		expect(res.status).toBe(403);
		await expect(res.json()).resolves.toEqual({ ok: false });
		expect(fetchMock).not.toHaveBeenCalled();
		expect(checkBotId).not.toHaveBeenCalled();
	});

	it("returns 400 with a French error for an over-long field", async () => {
		const fetchMock = stubBrevo();
		const res = await POST(
			postRequest({ ...validBody, message: "a".repeat(CONTACT_LIMITS.message + 1) }),
		);
		expect(res.status).toBe(400);
		await expect(res.json()).resolves.toEqual({
			ok: false,
			errors: [CONTACT.formErrors.messageTooLong],
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	describe("honeypot", () => {
		beforeEach(() => {
			vi.spyOn(console, "warn").mockImplementation(() => {});
		});

		it("answers 200 without sending, and without asking BotID", async () => {
			const fetchMock = stubBrevo();
			const res = await POST(postRequest({ ...validBody, hp_ref: "https://spam.example" }));
			expect(res.status).toBe(200);
			await expect(res.json()).resolves.toEqual({ ok: true });
			expect(fetchMock).not.toHaveBeenCalled();
			expect(checkBotId).not.toHaveBeenCalled();
			expect(console.warn).toHaveBeenCalledWith("Contact spam dropped:", "honeypot");
		});

		it("never logs the visitor's data", async () => {
			stubBrevo();
			await POST(postRequest({ ...validBody, hp_ref: "x" }));
			const logged = JSON.stringify(vi.mocked(console.warn).mock.calls);
			expect(logged).not.toContain(validBody.email);
			expect(logged).not.toContain(validBody.message);
		});
	});

	describe("verification failed", () => {
		beforeEach(() => {
			vi.spyOn(console, "warn").mockImplementation(() => {});
		});

		async function expectVerificationFailed(body: unknown, reason: string) {
			const fetchMock = stubBrevo();
			const res = await POST(postRequest(body));
			expect(res.status).toBe(400);
			await expect(res.json()).resolves.toEqual({ ok: false, code: "verification_failed" });
			expect(fetchMock).not.toHaveBeenCalled();
			expect(console.warn).toHaveBeenCalledWith("Contact verification failed:", reason);
		}

		it.each([
			["too small", 500],
			["missing", undefined],
			["invalid", "soon"],
		])("answers 400 without sending when elapsedMs is %s", async (_label, elapsedMs) => {
			await expectVerificationFailed({ ...validBody, elapsedMs }, "too-fast");
			expect(checkBotId).not.toHaveBeenCalled();
		});

		it("answers 400 without sending when BotID flags a bot", async () => {
			vi.mocked(checkBotId).mockResolvedValue(botIdVerdict(true));
			await expectVerificationFailed(validBody, "botid");
		});
	});

	it("returns 400 with a French error for too many links", async () => {
		const fetchMock = stubBrevo();
		const res = await POST(
			postRequest({ ...validBody, message: "http://a.fr http://b.fr http://c.fr http://d.fr" }),
		);
		expect(res.status).toBe(400);
		await expect(res.json()).resolves.toEqual({
			ok: false,
			errors: [CONTACT.formErrors.tooManyLinks],
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("accepts a same-origin request behind a proxy that rewrites Host", async () => {
		stubBrevo();
		const res = await POST(
			postRequest(validBody, undefined, {
				origin: "https://biezunski-avocat.fr",
				"x-forwarded-host": "biezunski-avocat.fr",
				host: "frontend.internal",
			}),
		);
		expect(res.status).toBe(200);
	});

	it("still sends when the BotID check throws (fail open)", async () => {
		vi.mocked(checkBotId).mockRejectedValue(new Error("VERCEL_OIDC_TOKEN is not set"));
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const fetchMock = stubBrevo();
		const res = await POST(postRequest(validBody));
		expect(res.status).toBe(200);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(errorSpy).toHaveBeenCalledWith("Contact BotID check failed:", expect.any(Error));
	});

	it("returns 400 for invalid JSON", async () => {
		const res = await POST(postRequest(null, "{not json"));
		expect(res.status).toBe(400);
	});

	it("returns 400 with errors for a missing required field", async () => {
		const { message: _message, ...incomplete } = validBody;
		const res = await POST(postRequest(incomplete));
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.ok).toBe(false);
		expect(Array.isArray(json.errors)).toBe(true);
	});

	it("returns 500 when Brevo fails", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		stubBrevo(500);
		const res = await POST(postRequest(validBody));
		expect(res.status).toBe(500);
	});

	it("returns 500 when configuration is missing", async () => {
		vi.unstubAllEnvs();
		vi.spyOn(console, "error").mockImplementation(() => {});
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const res = await POST(postRequest(validBody));
		expect(res.status).toBe(500);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("never leaks the API key in the response", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		stubBrevo(500);
		const res = await POST(postRequest(validBody));
		const text = await res.text();
		expect(text).not.toContain("secret-key");
	});
});
