import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Main } from "@/components/ui/Main";
import { PUBLICATIONS } from "@/lib/constants";
import {
	getPublicationBySlug,
	getPublicationMetaBySlug,
	getPublicationSlugs,
} from "@/lib/publications";
import { formatPublicationDate } from "@/lib/publications-parse";

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
	const publication = await getPublicationMetaBySlug(slug);
	if (!publication) return { title: PUBLICATIONS.pageTitle };

	return {
		title: publication.title,
		description: publication.header || PUBLICATIONS.metaDescription,
		alternates: { canonical: `/publications/${publication.slug}` },
		openGraph: {
			type: "article",
			title: publication.title,
			description: publication.header || undefined,
			images: publication.cover ? [{ url: publication.cover }] : undefined,
		},
	};
}

export default async function PublicationPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const publication = await getPublicationBySlug(slug);
	if (!publication) notFound();

	const { title, header, date, cover, author, html } = publication;

	return (
		<Main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
			<Link
				href="/publications"
				className="mb-8 inline-block text-sm font-500 text-primary transition-colors hover:text-primary-light"
			>
				← {PUBLICATIONS.backToList}
			</Link>

			<article>
				<header className="mb-8">
					<h1 className="mb-4 text-3xl font-700 text-near-black md:text-4xl">{title}</h1>
					{header && (
						<p className="mb-4 text-lg font-300 leading-relaxed text-gray-600">{header}</p>
					)}
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-300 text-gray-500">
						{author && (
							<span className="flex items-center gap-2">
								{author.avatarUrl && (
									<Image
										src={author.avatarUrl}
										alt=""
										width={28}
										height={28}
										className="rounded-full"
									/>
								)}
								<span>
									{PUBLICATIONS.by} {author.name}
								</span>
							</span>
						)}
						{date && <time dateTime={date}>{formatPublicationDate(date)}</time>}
					</div>
				</header>

				{cover && (
					<div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-lg">
						<Image
							src={cover}
							alt={PUBLICATIONS.coverAlt}
							fill
							sizes="(min-width: 768px) 768px, 100vw"
							priority
							className="object-cover"
						/>
					</div>
				)}

				{/* Body authored by Eva in Notion (trusted source) → rendered as-is. */}
				<div
					className="prose prose-neutral max-w-none prose-headings:font-museo prose-headings:text-near-black prose-a:text-primary hover:prose-a:text-primary-light prose-img:rounded-lg"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			</article>
		</Main>
	);
}
