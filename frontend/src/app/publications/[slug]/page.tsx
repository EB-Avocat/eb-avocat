import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/publications/ArticleView";
import { Main } from "@/components/ui/Main";
import { PUBLICATIONS } from "@/lib/constants";
import { getPublicationBySlug, getPublicationSlugs } from "@/lib/publications";

export const revalidate = 3600;
// Render publications added after the last build on first request.
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
	const slugs = await getPublicationSlugs();
	return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const publication = await getPublicationBySlug(slug);
	if (!publication) return { title: PUBLICATIONS.pageTitle };

	return {
		title: publication.title,
		description: publication.summary || PUBLICATIONS.metaDescription,
		alternates: { canonical: `/publications/${publication.slug}` },
		openGraph: {
			type: "article",
			title: publication.title,
			description: publication.summary || undefined,
			publishedTime: publication.date || undefined,
			modifiedTime: publication.updatedAt,
			authors: publication.author ? [publication.author.name] : undefined,
			tags: publication.categories.map((c) => c.name),
			images: publication.cover
				? [{ url: publication.cover, alt: publication.coverAlt }]
				: undefined,
		},
	};
}

export default async function PublicationPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const publication = await getPublicationBySlug(slug);
	if (!publication) notFound();

	return (
		<Main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
			<Link
				href="/publications"
				className="mb-8 inline-block text-sm font-500 text-primary transition-colors hover:text-primary-light"
			>
				← {PUBLICATIONS.backToList}
			</Link>
			<ArticleView publication={publication} />
		</Main>
	);
}
