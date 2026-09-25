import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getLatestPublications, getPublicationBySlug, getPublications } from "@/lib/publications";

const fetchMock = vi.fn();

describe("publications data", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", fetchMock);
		vi.stubEnv("BACKEND_INTERNAL_URL", "http://backend.test");
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
		fetchMock.mockReset();
	});

	it("tags backend fetches for on-demand revalidation", async () => {
		fetchMock.mockResolvedValue(Response.json({ count: 0, results: [] }));

		await getLatestPublications(3);
		expect(fetchMock).toHaveBeenCalledWith(
			new URL("http://backend.test/api/v1/articles/"),
			expect.objectContaining({ next: expect.objectContaining({ tags: ["articles"] }) }),
		);
	});

	it("does not fetch without a backend (build time)", async () => {
		vi.stubEnv("BACKEND_INTERNAL_URL", "");
		vi.stubEnv("BACKEND_URL", "");

		await expect(getPublicationBySlug("x")).resolves.toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("returns null for an unknown article", async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

		await expect(getPublicationBySlug("nope")).resolves.toBeNull();
	});

	it("throws for an article on backend errors so ISR keeps the last good page", async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 400 }));

		await expect(getPublicationBySlug("x")).rejects.toThrow("HTTP 400");
	});

	it("keeps the homepage teaser up when the backend fails", async () => {
		fetchMock.mockRejectedValue(new TypeError("fetch failed"));

		await expect(getLatestPublications(3)).resolves.toEqual({ items: [], total: 0 });
	});

	it("shows the empty list page when the backend fails", async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

		await expect(getPublications({})).resolves.toMatchObject({ items: [], categories: [] });
	});
});
