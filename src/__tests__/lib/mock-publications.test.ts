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

	it("is true without a Notion token, false with one", async () => {
		vi.stubEnv("NOTION_TOKEN", "");
		vi.resetModules();
		const off = await import("@/lib/mock-publications");
		expect(off.useMocks).toBe(true);

		vi.stubEnv("NOTION_TOKEN", "secret_abc");
		vi.resetModules();
		const on = await import("@/lib/mock-publications");
		expect(on.useMocks).toBe(false);
	});
});
