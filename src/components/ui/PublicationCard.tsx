import Image from "next/image";
import Link from "next/link";
import { PUBLICATIONS } from "@/lib/constants";
import { formatPublicationDate, type Publication } from "@/lib/publications-parse";

/**
 * Presentational card for a single publication (list grid + homepage teaser).
 * Server component — no client JS. Falls back to a branded gradient when the
 * publication has no cover.
 */
export function PublicationCard({ publication }: { publication: Publication }) {
	const { slug, title, header, category, date, cover, author } = publication;

	return (
		<article className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
			<Link href={`/publications/${slug}`} className="flex flex-1 flex-col">
				<div className="relative aspect-[16/9] w-full overflow-hidden">
					{cover ? (
						<Image
							src={cover}
							alt={PUBLICATIONS.coverAlt}
							fill
							sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
							className="object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					) : (
						<div
							className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-darker-teal"
							aria-hidden="true"
						>
							<span className="font-museo text-2xl text-white/80">Eva Biezunski</span>
						</div>
					)}
				</div>

				<div className="flex flex-1 flex-col p-6">
					{category && (
						<span className="mb-3 inline-block self-start rounded-full bg-primary-light/10 px-3 py-1 text-xs font-500 text-primary">
							{category}
						</span>
					)}
					<h3 className="mb-2 text-xl font-700 text-near-black transition-colors group-hover:text-primary">
						{title}
					</h3>
					{header && (
						<p className="mb-4 line-clamp-3 flex-1 text-sm font-300 leading-relaxed text-gray-600">
							{header}
						</p>
					)}
					<div className="mt-auto flex flex-wrap items-center gap-x-2 text-xs font-300 text-gray-500">
						{author && (
							<>
								<span>
									{PUBLICATIONS.by} {author.name}
								</span>
								<span aria-hidden="true">·</span>
							</>
						)}
						{date && <time dateTime={date}>{formatPublicationDate(date)}</time>}
					</div>
				</div>
			</Link>
		</article>
	);
}
