import type { PageObjectResponse } from "@notionhq/client";
import { describe, expect, it } from "vitest";
import {
	clampPage,
	extractCategories,
	formatPublicationDate,
	mapPageToPublication,
	PAGE_SIZE,
	pageCount,
	paginate,
	readCoverUrl,
	readDate,
	readPeople,
	readRichText,
	readSelect,
	readTitle,
	slugify,
} from "@/lib/publications-parse";

// Minimal builders for Notion property/page fixtures. The SDK types are wide
// unions; we cast the small shapes each parser actually reads.
const titleProp = (text: string) =>
	({
		type: "title",
		title: [{ plain_text: text }],
	}) as unknown as PageObjectResponse["properties"][string];
const richTextProp = (text: string) =>
	({
		type: "rich_text",
		rich_text: text ? [{ plain_text: text }] : [],
	}) as unknown as PageObjectResponse["properties"][string];
const selectProp = (name: string | null) =>
	({
		type: "select",
		select: name ? { name } : null,
	}) as unknown as PageObjectResponse["properties"][string];
const dateProp = (start: string | null) =>
	({
		type: "date",
		date: start ? { start } : null,
	}) as unknown as PageObjectResponse["properties"][string];
const peopleProp = (people: unknown[]) =>
	({ type: "people", people }) as unknown as PageObjectResponse["properties"][string];

function buildPage(
	overrides: {
		id?: string;
		title?: string;
		header?: string;
		slug?: string;
		category?: string | null;
		pubDate?: string | null;
		author?: unknown[];
		cover?: PageObjectResponse["cover"];
		createdTime?: string;
	} = {},
): PageObjectResponse {
	return {
		id: overrides.id ?? "page-id-1",
		created_time: overrides.createdTime ?? "2026-01-01T00:00:00.000Z",
		cover: overrides.cover ?? null,
		properties: {
			Name: titleProp(overrides.title ?? "Titre"),
			header: richTextProp(overrides.header ?? ""),
			slug: richTextProp(overrides.slug ?? ""),
			category: selectProp(overrides.category ?? null),
			pubDate: dateProp(overrides.pubDate ?? null),
			author: peopleProp(overrides.author ?? []),
		},
	} as unknown as PageObjectResponse;
}

describe("slugify", () => {
	it("lowercases and strips diacritics", () => {
		expect(slugify("Éva Biézunski")).toBe("eva-biezunski");
	});

	it("drops apostrophes and punctuation", () => {
		expect(slugify("Céder sa patientèle, en toute sécurité !")).toBe(
			"ceder-sa-patientele-en-toute-securite",
		);
	});

	it("collapses whitespace and dashes", () => {
		expect(slugify("  Droit   des --- sociétés  ")).toBe("droit-des-societes");
	});

	it("returns an empty string when nothing usable remains", () => {
		expect(slugify("!!! ??? …")).toBe("");
		expect(slugify("")).toBe("");
	});
});

describe("property parsers", () => {
	it("readTitle joins title fragments, empty on wrong type", () => {
		expect(readTitle(titleProp("Mon titre"))).toBe("Mon titre");
		expect(readTitle(richTextProp("x"))).toBe("");
		expect(readTitle(undefined)).toBe("");
	});

	it("readRichText joins fragments, empty on wrong type", () => {
		expect(readRichText(richTextProp("Un résumé"))).toBe("Un résumé");
		expect(readRichText(richTextProp(""))).toBe("");
		expect(readRichText(titleProp("x"))).toBe("");
	});

	it("readSelect returns the option name or null", () => {
		expect(readSelect(selectProp("Contrats"))).toBe("Contrats");
		expect(readSelect(selectProp(null))).toBeNull();
		expect(readSelect(richTextProp("x"))).toBeNull();
	});

	it("readDate returns the start date or null", () => {
		expect(readDate(dateProp("2026-05-01"))).toBe("2026-05-01");
		expect(readDate(dateProp(null))).toBeNull();
		expect(readDate(undefined)).toBeNull();
	});

	it("readPeople extracts the first person's name and avatar", () => {
		expect(
			readPeople(peopleProp([{ name: "Eva Biezunski", avatar_url: "https://x/a.png" }])),
		).toEqual({ name: "Eva Biezunski", avatarUrl: "https://x/a.png" });
	});

	it("readPeople is undefined for empty, partial (id only), or wrong-type", () => {
		expect(readPeople(peopleProp([]))).toBeUndefined();
		expect(readPeople(peopleProp([{ id: "u1" }]))).toBeUndefined();
		expect(readPeople(richTextProp("x"))).toBeUndefined();
	});

	it("readPeople tolerates a missing avatar", () => {
		expect(readPeople(peopleProp([{ name: "Eva" }]))).toEqual({
			name: "Eva",
			avatarUrl: null,
		});
	});
});

describe("readCoverUrl", () => {
	it("reads an external cover", () => {
		expect(
			readCoverUrl({ cover: { type: "external", external: { url: "https://x/e.jpg" } } }),
		).toBe("https://x/e.jpg");
	});

	it("reads a Notion-hosted file cover", () => {
		expect(
			readCoverUrl({
				cover: { type: "file", file: { url: "https://s3/f.jpg", expiry_time: "" } },
			}),
		).toBe("https://s3/f.jpg");
	});

	it("is undefined when there is no cover", () => {
		expect(readCoverUrl({ cover: null })).toBeUndefined();
	});
});

describe("mapPageToPublication", () => {
	it("uses the explicit slug when present", () => {
		const pub = mapPageToPublication(buildPage({ title: "Un titre", slug: "slug-choisi" }));
		expect(pub.slug).toBe("slug-choisi");
	});

	it("derives the slug from the title when slug is empty", () => {
		const pub = mapPageToPublication(buildPage({ title: "Structurer en SEL" }));
		expect(pub.slug).toBe("structurer-en-sel");
	});

	it("falls back to the page id when title yields no slug", () => {
		const pub = mapPageToPublication(buildPage({ id: "abc", title: "!!!" }));
		expect(pub.slug).toBe("abc");
	});

	it("maps header, category and full fields", () => {
		const pub = mapPageToPublication(
			buildPage({
				id: "p1",
				title: "Titre",
				header: "Le résumé",
				category: "Actualités",
				pubDate: "2026-05-12",
				author: [{ name: "Eva", avatar_url: "https://x/a.png" }],
				cover: { type: "external", external: { url: "https://x/c.jpg" } },
			}),
		);
		expect(pub).toEqual({
			id: "p1",
			slug: "titre",
			title: "Titre",
			header: "Le résumé",
			category: "Actualités",
			date: "2026-05-12",
			cover: "https://x/c.jpg",
			author: { name: "Eva", avatarUrl: "https://x/a.png" },
		});
	});

	it("falls back to created_time when pubDate is empty", () => {
		const pub = mapPageToPublication(
			buildPage({ pubDate: null, createdTime: "2025-12-31T10:00:00.000Z" }),
		);
		expect(pub.date).toBe("2025-12-31T10:00:00.000Z");
	});

	it("leaves cover and author undefined when absent", () => {
		const pub = mapPageToPublication(buildPage({}));
		expect(pub.cover).toBeUndefined();
		expect(pub.author).toBeUndefined();
	});
});

describe("pagination math", () => {
	it("pageCount is at least 1 and rounds up", () => {
		expect(pageCount(0)).toBe(1);
		expect(pageCount(50)).toBe(1);
		expect(pageCount(51)).toBe(2);
		expect(pageCount(100)).toBe(2);
		expect(pageCount(101)).toBe(3);
	});

	it("clampPage handles non-numeric, out-of-range and valid input", () => {
		expect(clampPage("abc", 100)).toBe(1);
		expect(clampPage(undefined, 100)).toBe(1);
		expect(clampPage("0", 100)).toBe(1);
		expect(clampPage("-3", 100)).toBe(1);
		expect(clampPage("2", 100)).toBe(2);
		expect(clampPage("99", 100)).toBe(2); // clamped to pageCount
	});

	it("paginate slices at the page boundary", () => {
		const items = Array.from({ length: 51 }, (_, i) => i);
		expect(paginate(items, 1)).toHaveLength(PAGE_SIZE);
		expect(paginate(items, 1)[0]).toBe(0);
		expect(paginate(items, 2)).toEqual([50]);
		expect(paginate(items, 3)).toEqual([]);
	});
});

describe("extractCategories", () => {
	it("dedups, preserves first-seen order and ignores nulls", () => {
		expect(
			extractCategories([
				{ category: "Contrats" },
				{ category: "Sociétés" },
				{ category: null },
				{ category: "Contrats" },
				{ category: "Actualités" },
			]),
		).toEqual(["Contrats", "Sociétés", "Actualités"]);
	});

	it("is empty when there are no categories", () => {
		expect(extractCategories([{ category: null }, { category: null }])).toEqual([]);
	});
});

describe("formatPublicationDate", () => {
	it("formats an ISO date as a French long date", () => {
		expect(formatPublicationDate("2026-05-12")).toBe("12 mai 2026");
	});

	it("returns an empty string for invalid input", () => {
		expect(formatPublicationDate("not-a-date")).toBe("");
	});
});
