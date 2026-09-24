import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/contact/route";

const validBody = {
	lastName: "Dupont",
	firstName: "Marie",
	email: "marie@example.com",
	phone: "0600000000",
	subject: "Contentieux",
	message: "Bonjour.",
};

function postRequest(body: unknown, raw?: string) {
	return new Request("http://localhost/api/contact", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: raw ?? JSON.stringify(body),
	});
}

describe("POST /api/contact", () => {
	beforeEach(() => {
		vi.stubEnv("BREVO_API_KEY", "secret-key");
		vi.stubEnv("BREVO_SENDER_EMAIL", "noreply@biezunski-avocat.fr");
	});
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	it("returns 200 when the email is sent", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(null, { status: 201 })),
		);
		const res = await POST(postRequest(validBody));
		expect(res.status).toBe(200);
		await expect(res.json()).resolves.toEqual({ ok: true });
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
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(null, { status: 500 })),
		);
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
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(null, { status: 500 })),
		);
		const res = await POST(postRequest(validBody));
		const text = await res.text();
		expect(text).not.toContain("secret-key");
	});
});
