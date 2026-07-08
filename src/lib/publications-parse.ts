import type { PageObjectResponse } from "@notionhq/client";

// Pure, dependency-free helpers for the Publications feature: Notion property
// parsing, slug derivation, pagination math, category extraction and date
// formatting. Kept free of `server-only`, the Notion client and @vercel/blob so
// it can be imported directly from Vitest without a server runtime.

export interface Author {
	name: string;
	avatarUrl: string | null;
}

export interface Publication {
	id: string;
	/** URL slug (explicit `slug` property, else derived from the title). */
	slug: string;
	title: string;
	/** The newspaper-style summary/hook shown on cards and atop the article. */
	header: string;
	category: string | null;
	/** ISO date string (from `pubDate`, falling back to the page's created time). */
	date: string;
	cover?: string;
	author?: Author;
}

export interface PublicationDetail extends Publication {
	/** Rendered Notion body as an HTML string. */
	html: string;
}

/** Max publications rendered per list page. */
export const PAGE_SIZE = 50;

type NotionProperty = PageObjectResponse["properties"][string];

export function readTitle(prop: NotionProperty | undefined): string {
	if (prop?.type !== "title") return "";
	return prop.title.map((t) => t.plain_text).join("");
}

export function readRichText(prop: NotionProperty | undefined): string {
	if (prop?.type !== "rich_text") return "";
	return prop.rich_text.map((t) => t.plain_text).join("");
}

export function readSelect(prop: NotionProperty | undefined): string | null {
	if (prop?.type !== "select") return null;
	return prop.select?.name ?? null;
}

export function readDate(prop: NotionProperty | undefined): string | null {
	if (prop?.type !== "date") return null;
	return prop.date?.start ?? null;
}

export function readPeople(prop: NotionProperty | undefined): Author | undefined {
	if (prop?.type !== "people") return undefined;
	const first = prop.people[0];
	// People objects only expose `name`/`avatar_url` when the integration has
	// "read user information" access; otherwise they are partial (id only).
	if (!first || !("name" in first) || !first.name) return undefined;
	const avatarUrl = "avatar_url" in first ? (first.avatar_url ?? null) : null;
	return { name: first.name, avatarUrl };
}

/** The page cover URL (external link or Notion-hosted file), if any. */
export function readCoverUrl(page: Pick<PageObjectResponse, "cover">): string | undefined {
	const cover = page.cover;
	if (!cover) return undefined;
	return cover.type === "external" ? cover.external.url : cover.file.url;
}

/**
 * Slug from arbitrary text: lowercase, strip diacritics, drop non-alphanumerics,
 * collapse whitespace/dashes. Returns "" when nothing usable remains.
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

/**
 * Map a raw Notion page to a `Publication`, using the raw (un-mirrored) cover and
 * avatar URLs. The server layer replaces those with permanent Blob URLs. Slug is
 * the explicit `slug` property, else derived from the title, else the page id.
 */
export function mapPageToPublication(page: PageObjectResponse): Publication {
	const props = page.properties;
	const title = readTitle(props.Name);
	const explicitSlug = readRichText(props.slug).trim();
	return {
		id: page.id,
		slug: explicitSlug || slugify(title) || page.id,
		title,
		header: readRichText(props.header),
		category: readSelect(props.category),
		date: readDate(props.pubDate) ?? page.created_time,
		cover: readCoverUrl(page),
		author: readPeople(props.author),
	};
}

/** Number of list pages for `total` items (at least 1). */
export function pageCount(total: number, size = PAGE_SIZE): number {
	return Math.max(1, Math.ceil(total / size));
}

/** Parse and clamp a raw `?page=` value into [1, pageCount]. */
export function clampPage(raw: unknown, total: number, size = PAGE_SIZE): number {
	const max = pageCount(total, size);
	const n =
		typeof raw === "number" ? raw : typeof raw === "string" ? Number.parseInt(raw, 10) : Number.NaN;
	if (!Number.isFinite(n) || n < 1) return 1;
	return Math.min(Math.floor(n), max);
}

/** The slice of `items` for a (1-based) page. */
export function paginate<T>(items: T[], page: number, size = PAGE_SIZE): T[] {
	const start = (page - 1) * size;
	return items.slice(start, start + size);
}

/** Distinct categories in first-seen order (nulls ignored). */
export function extractCategories(items: Pick<Publication, "category">[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const { category } of items) {
		if (category && !seen.has(category)) {
			seen.add(category);
			out.push(category);
		}
	}
	return out;
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

/** Format an ISO date as a French long date (e.g. "5 mars 2026"); "" on invalid input. */
export function formatPublicationDate(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.valueOf())) return "";
	return dateFormatter.format(date);
}
