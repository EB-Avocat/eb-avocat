import Image from "next/image";
import Link from "next/link";
import { ArticleBody } from "@/components/publications/ArticleBody";
import { PUBLICATIONS } from "@/lib/constants";
import { formatPublicationDate, type PublicationDetail } from "@/lib/publications-parse";

/**
 * An article as displayed on the public site: categories, title, summary,
 * byline, cover and body. Used by /publications/[slug] and by the back-office
 * "Aperçu" tab, so the preview is pixel-identical to the published page.
 */
export function ArticleView({
	publication,
}: {
	publication: Omit<PublicationDetail, "id" | "slug" | "updatedAt">;
}) {
	const { title, summary, date, cover, coverAlt, author, categories, html } = publication;

	return (
		<article>
			<header className="mb-8">
				{categories.length > 0 && (
					<ul className="mb-4 flex flex-wrap gap-2" aria-label={PUBLICATIONS.categoriesLabel}>
						{categories.map((c) => (
							<li key={c.id}>
								<Link
									href={`/publications?category=${encodeURIComponent(c.slug)}`}
									className="inline-block rounded-full bg-primary-light/10 px-3 py-1 text-xs font-500 text-primary hover:bg-primary-light/20"
								>
									{c.name}
								</Link>
							</li>
						))}
					</ul>
				)}
				<h1 className="mb-4 text-3xl font-700 text-near-black md:text-4xl">{title}</h1>
				{summary && (
					<p className="mb-4 text-lg font-300 leading-relaxed text-gray-600">{summary}</p>
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
									className="h-7 w-7 rounded-full object-cover"
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
						alt={coverAlt || PUBLICATIONS.coverAlt}
						fill
						sizes="(min-width: 768px) 768px, 100vw"
						priority
						className="object-cover"
					/>
				</div>
			)}

			<ArticleBody html={html} />
		</article>
	);
}
