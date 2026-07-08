import "server-only";
import { unstable_cache } from "next/cache";
import { uploadAvatarIfMissing, uploadCoverIfMissing } from "./blob-images";
import { getMockHtml, mockPublications, useMocks } from "./mock-publications";
import { queryPublishedPages, renderNotionPage } from "./notion";
import {
	clampPage,
	extractCategories,
	mapPageToPublication,
	type Publication,
	type PublicationDetail,
	pageCount,
	paginate,
} from "./publications-parse";

// Cache tag busted by POST /api/revalidate on Notion changes. Data + rendered
// bodies are cached for an hour so ISR regenerations don't re-hit Notion.
export const PUBLICATIONS_TAG = "publications";
const REVALIDATE_SECONDS = 3600;

/** Fetch + map all published pages, mirroring cover/avatar images to Blob. */
async function loadPublicationsUncached(): Promise<Publication[]> {
	if (useMocks) return mockPublications;
	// On Vercel without a Notion token (e.g. before the database is connected),
	// show no publications rather than crash on a Notion call.
	if (!process.env.NOTION_TOKEN) return [];

	const pages = await queryPublishedPages();
	const publications = await Promise.all(
		pages.map(async (page) => {
			const publication = mapPageToPublication(page);
			const [cover, author] = await Promise.all([
				publication.cover ? uploadCoverIfMissing(publication.cover) : undefined,
				publication.author?.avatarUrl
					? uploadAvatarIfMissing(publication.author.avatarUrl).then((avatarUrl) => ({
							...publication.author!,
							avatarUrl,
						}))
					: publication.author,
			]);
			return { ...publication, cover, author };
		}),
	);
	return publications;
}

const loadPublications = unstable_cache(loadPublicationsUncached, ["publications-list"], {
	tags: [PUBLICATIONS_TAG],
	revalidate: REVALIDATE_SECONDS,
});

const loadPublicationHtml = unstable_cache(
	(id: string) => renderNotionPage(id),
	["publication-html"],
	{ tags: [PUBLICATIONS_TAG], revalidate: REVALIDATE_SECONDS },
);

export interface PublicationsResult {
	items: Publication[];
	total: number;
	page: number;
	pageCount: number;
	categories: string[];
}

/**
 * A page of publications, optionally filtered by category. `categories` always
 * lists every category across all publications (for the filter UI). `page` is
 * clamped to the valid range of the filtered set.
 */
export async function getPublications(
	opts: { category?: string; page?: number | string } = {},
): Promise<PublicationsResult> {
	const all = await loadPublications();
	const categories = extractCategories(all);
	const filtered = opts.category ? all.filter((p) => p.category === opts.category) : all;
	const total = filtered.length;
	const page = clampPage(opts.page ?? 1, total);
	return {
		items: paginate(filtered, page),
		total,
		page,
		pageCount: pageCount(total),
		categories,
	};
}

/** The `n` most recent publications, plus the overall count (for the homepage teaser). */
export async function getLatestPublications(
	n: number,
): Promise<{ items: Publication[]; total: number }> {
	const all = await loadPublications();
	return { items: all.slice(0, n), total: all.length };
}

/** A single publication (metadata only, no body render), or null when the slug is unknown. */
export async function getPublicationMetaBySlug(slug: string): Promise<Publication | null> {
	const all = await loadPublications();
	return all.find((p) => p.slug === slug) ?? null;
}

/** A single publication with its rendered body, or null when the slug is unknown. */
export async function getPublicationBySlug(slug: string): Promise<PublicationDetail | null> {
	const publication = await getPublicationMetaBySlug(slug);
	if (!publication) return null;
	const html = useMocks
		? (getMockHtml(publication.id) ?? "")
		: await loadPublicationHtml(publication.id);
	return { ...publication, html };
}

/** All publication slugs, for generateStaticParams. */
export async function getPublicationSlugs(): Promise<string[]> {
	const all = await loadPublications();
	return all.map((p) => p.slug);
}
