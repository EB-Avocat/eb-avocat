// Pure, dependency-free helpers for the Publications feature: API payload
// mapping, pagination math, category grouping and date formatting. Kept free of
// `server-only` so it can be imported directly from Vitest.

export interface Author {
	name: string;
	avatarUrl: string | null;
}

export interface Category {
	id: string;
	name: string;
	slug: string;
	isPrimary: boolean;
}

export interface Publication {
	id: string;
	slug: string;
	title: string;
	/** Short summary shown on cards and atop the article. */
	summary: string;
	categories: Category[];
	/** ISO date string of publication. */
	date: string;
	cover: string | null;
	coverAlt: string;
	author: Author | null;
}

export interface PublicationDetail extends Publication {
	/** Sanitised HTML rendered by the backend from the article's Markdown. */
	html: string;
	updatedAt: string;
}

/** Page size of the backend's public article list (DRF PAGE_SIZE). */
export const PAGE_SIZE = 12;

// --- API payloads (snake_case, as returned by Django REST Framework) ---

export interface ApiCategory {
	id: string;
	name: string;
	slug: string;
	is_primary: boolean;
}

export interface ApiArticle {
	id: string;
	slug: string;
	title: string;
	summary: string;
	categories: ApiCategory[];
	published_at: string | null;
	cover: string | null;
	cover_alt: string;
	author: { id: string; name: string; avatar: string | null } | null;
}

export interface ApiArticleDetail extends ApiArticle {
	body_html: string;
	updated_at: string;
}

export interface ApiPage<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

export function mapCategory(category: ApiCategory): Category {
	return {
		id: category.id,
		name: category.name,
		slug: category.slug,
		isPrimary: category.is_primary,
	};
}

export function mapArticle(article: ApiArticle): Publication {
	return {
		id: article.id,
		slug: article.slug,
		title: article.title,
		summary: article.summary,
		categories: article.categories.map(mapCategory),
		date: article.published_at ?? "",
		cover: article.cover,
		coverAlt: article.cover_alt,
		author: article.author ? { name: article.author.name, avatarUrl: article.author.avatar } : null,
	};
}

export function mapArticleDetail(article: ApiArticleDetail): PublicationDetail {
	return { ...mapArticle(article), html: article.body_html, updatedAt: article.updated_at };
}

/** Number of list pages for `total` items (at least 1). */
export function pageCount(total: number, size = PAGE_SIZE): number {
	return Math.max(1, Math.ceil(total / size));
}

/** Parse a raw `?page=` value into a positive integer (1 when invalid). */
export function parsePage(raw: unknown): number {
	const n =
		typeof raw === "number" ? raw : typeof raw === "string" ? Number.parseInt(raw, 10) : Number.NaN;
	if (!Number.isFinite(n) || n < 1) return 1;
	return Math.floor(n);
}

/** Split categories into primary filters (main chips) and the others. */
export function groupCategories(categories: Category[]): {
	primary: Category[];
	other: Category[];
} {
	return {
		primary: categories.filter((c) => c.isPrimary),
		other: categories.filter((c) => !c.isPrimary),
	};
}

/** The category highlighted on a card: the first primary one, else the first one. */
export function leadCategory(categories: Category[]): Category | null {
	return categories.find((c) => c.isPrimary) ?? categories[0] ?? null;
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

/** Format an ISO date as a French long date (e.g. "5 mars 2026"); "" on invalid input. */
export function formatPublicationDate(iso: string): string {
	const date = new Date(iso);
	if (!iso || Number.isNaN(date.valueOf())) return "";
	return dateFormatter.format(date);
}
