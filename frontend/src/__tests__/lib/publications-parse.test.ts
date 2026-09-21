import { describe, expect, it } from "vitest";
import {
	type ApiArticleDetail,
	type Category,
	formatPublicationDate,
	groupCategories,
	leadCategory,
	mapArticleDetail,
	PAGE_SIZE,
	pageCount,
	parsePage,
} from "@/lib/publications-parse";

const category = (name: string, isPrimary = false): Category => ({
	id: name,
	name,
	slug: name.toLowerCase(),
	isPrimary,
});

describe("mapArticleDetail", () => {
	it("maps the DRF payload to the camelCase model", () => {
		const payload: ApiArticleDetail = {
			id: "7c0f6a2e-2d0b-4f5e-9d59-0d7c3b1c2a11",
			slug: "structurer-son-activite-en-sel",
			title: "Structurer son activité en SEL",
			summary: "SELARL ou SELAS ?",
			categories: [{ id: "c1", name: "Sociétés", slug: "societes", is_primary: true, order: 0 }],
			published_at: "2026-09-01T10:00:00+02:00",
			cover: "https://x.public.blob.vercel-storage.com/covers/a.png",
			cover_alt: "Un cabinet",
			author: { id: "u1", name: "Eva Biezunski", avatar: null },
			body_html: "<p>Bonjour</p>",
			updated_at: "2026-09-02T10:00:00+02:00",
		};

		expect(mapArticleDetail(payload)).toEqual({
			id: payload.id,
			slug: payload.slug,
			title: payload.title,
			summary: payload.summary,
			categories: [{ id: "c1", name: "Sociétés", slug: "societes", isPrimary: true }],
			date: payload.published_at,
			cover: payload.cover,
			coverAlt: "Un cabinet",
			author: { name: "Eva Biezunski", avatarUrl: null },
			html: "<p>Bonjour</p>",
			updatedAt: payload.updated_at,
		});
	});
});

describe("pagination helpers", () => {
	it("computes at least one page", () => {
		expect(pageCount(0)).toBe(1);
		expect(pageCount(PAGE_SIZE)).toBe(1);
		expect(pageCount(PAGE_SIZE + 1)).toBe(2);
	});

	it("parses ?page= defensively", () => {
		expect(parsePage("3")).toBe(3);
		expect(parsePage(undefined)).toBe(1);
		expect(parsePage("abc")).toBe(1);
		expect(parsePage("-2")).toBe(1);
		expect(parsePage(2.7)).toBe(2);
	});
});

describe("categories", () => {
	it("splits primary filters from the others, preserving order", () => {
		const cats = [category("Santé", true), category("Contrats"), category("Sociétés", true)];
		expect(groupCategories(cats)).toEqual({
			primary: [cats[0], cats[2]],
			other: [cats[1]],
		});
	});

	it("highlights the first primary category on cards", () => {
		expect(leadCategory([category("Contrats"), category("Santé", true)])?.name).toBe("Santé");
		expect(leadCategory([category("Contrats")])?.name).toBe("Contrats");
		expect(leadCategory([])).toBeNull();
	});
});

describe("formatPublicationDate", () => {
	it("formats in French", () => {
		expect(formatPublicationDate("2026-03-05T12:00:00Z")).toBe("5 mars 2026");
	});

	it("returns an empty string for invalid or missing dates", () => {
		expect(formatPublicationDate("")).toBe("");
		expect(formatPublicationDate("not a date")).toBe("");
	});
});
