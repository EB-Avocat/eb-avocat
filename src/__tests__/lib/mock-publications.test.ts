import { afterEach, describe, expect, it, vi } from "vitest";
import { getMockHtml, mockPublications } from "@/lib/mock-publications";

describe("mockPublications", () => {
	it("is sorted newest-first", () => {
		const dates = mockPublications.map((p) => p.date);
		const sorted = [...dates].sort((a, b) => b.localeCompare(a));
		expect(dates).toEqual(sorted);
	});

	it("covers the edge cases the UI must handle", () => {
		expect(mockPublications.some((p) => !p.cover)).toBe(true); // no-cover card
		expect(mockPublications.some((p) => !p.author)).toBe(true); // no-author card
		expect(new Set(mockPublications.map((p) => p.category)).size).toBeGreaterThan(1); // multiple categories
	});

	it("exposes body HTML by id, undefined for unknown ids", () => {
		const first = mockPublications[0]!;
		expect(getMockHtml(first.id)).toContain("<p>");
		expect(getMockHtml("does-not-exist")).toBeUndefined();
	});
});

describe("useMocks gating", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it("uses mocks only locally without a Notion token", async () => {
		// Local dev, no token → mocks.
		vi.stubEnv("NOTION_TOKEN", "");
		vi.stubEnv("VERCEL", "");
		vi.resetModules();
		expect((await import("@/lib/mock-publications")).useMocks).toBe(true);

		// With a token → real data, never mocks.
		vi.stubEnv("NOTION_TOKEN", "secret_abc");
		vi.stubEnv("VERCEL", "");
		vi.resetModules();
		expect((await import("@/lib/mock-publications")).useMocks).toBe(false);

		// On Vercel (preview/prod) without a token → empty state, not mocks.
		vi.stubEnv("NOTION_TOKEN", "");
		vi.stubEnv("VERCEL", "1");
		vi.resetModules();
		expect((await import("@/lib/mock-publications")).useMocks).toBe(false);
	});
});
