import "server-only";

import {
	type ApiArticleDetail,
	type ApiArticlePage,
	type ApiCategory,
	type Category,
	mapArticle,
	mapArticleDetail,
	mapCategory,
	PAGE_SIZE,
	type Publication,
	type PublicationDetail,
	pageCount,
	parsePage,
} from "@/lib/publications-parse";

/** Cache tag busted by the backend (POST /api/revalidate) whenever content changes. */
export const PUBLICATIONS_TAG = "articles";
const REVALIDATE_SECONDS = 3600;

function backendUrl(): string | null {
	// BACKEND_INTERNAL_URL is the Vercel Services binding (runtime only);
	// BACKEND_URL is the local/docker fallback.
	return process.env.BACKEND_INTERNAL_URL || process.env.BACKEND_URL || null;
}

/**
 * GET a public API path, strictly: null when the backend is not configured (e.g.
 * during a build) or answers 404, throws on any other failure. For ISR pages,
 * which then keep serving their last good version instead of caching a 404.
 */
async function getJsonOrThrow<T>(path: string): Promise<T | null> {
	const base = backendUrl();
	if (!base) return null;
	const response = await fetch(new URL(path, base), {
		headers: { accept: "application/json" },
		next: { tags: [PUBLICATIONS_TAG], revalidate: REVALIDATE_SECONDS },
	});
	if (response.status === 404) return null;
	if (!response.ok) throw new Error(`Backend GET ${path} failed: HTTP ${response.status}`);
	return (await response.json()) as T;
}

/** Like getJsonOrThrow, but any failure is null: the page shows its empty state. */
function getJson<T>(path: string): Promise<T | null> {
	return getJsonOrThrow<T>(path).catch((error: unknown) => {
		console.error(error);
		return null;
	});
}

export interface PublicationList {
	items: Publication[];
	total: number;
	page: number;
	pageCount: number;
	categories: Category[];
}

export async function getPublications({
	category,
	page,
}: {
	category?: string;
	page?: string | number;
}): Promise<PublicationList> {
	const current = parsePage(page);
	const params = new URLSearchParams();
	if (category) params.set("category", category);
	if (current > 1) params.set("page", String(current));

	const [list, categories] = await Promise.all([
		getJson<ApiArticlePage>(`/api/v1/articles/?${params}`),
		getJson<ApiCategory[]>("/api/v1/categories/"),
	]);
	const total = list?.count ?? 0;

	return {
		items: list?.results.map(mapArticle) ?? [],
		total,
		page: list ? current : 1,
		pageCount: pageCount(total, PAGE_SIZE),
		categories: categories?.map(mapCategory) ?? [],
	};
}

export async function getLatestPublications(
	count: number,
): Promise<{ items: Publication[]; total: number }> {
	const list = await getJson<ApiArticlePage>("/api/v1/articles/");
	return { items: list?.results.slice(0, count).map(mapArticle) ?? [], total: list?.count ?? 0 };
}

export async function getPublicationBySlug(slug: string): Promise<PublicationDetail | null> {
	const article = await getJsonOrThrow<ApiArticleDetail>(
		`/api/v1/articles/${encodeURIComponent(slug)}/`,
	);
	return article ? mapArticleDetail(article) : null;
}

/** Every published slug (walks the paginated list); [] when the backend is unavailable. */
export async function getPublicationSlugs(): Promise<string[]> {
	const slugs: string[] = [];
	// The largest page the API allows (100): a few requests even for a big archive.
	for (let page = 1; page <= 50; page++) {
		const list = await getJson<ApiArticlePage>(`/api/v1/articles/?page=${page}&page_size=100`);
		if (!list) break;
		slugs.push(...list.results.map((a) => a.slug));
		if (!list.next) break;
	}
	return slugs;
}
