import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getPublicationSlugs } from "@/lib/publications";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const lastModified = new Date();

	const staticEntries: MetadataRoute.Sitemap = [
		{
			url: SITE.url,
			lastModified,
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${SITE.url}/publications`,
			lastModified,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		{
			url: `${SITE.url}/mentions-legales`,
			lastModified,
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${SITE.url}/politique-de-confidentialite`,
			lastModified,
			changeFrequency: "yearly",
			priority: 0.3,
		},
	];

	// A Notion outage must not break the sitemap: fall back to the static entries.
	let publicationEntries: MetadataRoute.Sitemap = [];
	try {
		const slugs = await getPublicationSlugs();
		publicationEntries = slugs.map((slug) => ({
			url: `${SITE.url}/publications/${slug}`,
			lastModified,
			changeFrequency: "monthly",
			priority: 0.6,
		}));
	} catch {
		publicationEntries = [];
	}

	return [...staticEntries, ...publicationEntries];
}
