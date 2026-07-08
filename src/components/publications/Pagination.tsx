import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PUBLICATIONS } from "@/lib/constants";

function buildHref(page: number, category?: string): string {
	const params = new URLSearchParams();
	if (category) params.set("category", category);
	if (page > 1) params.set("page", String(page));
	const qs = params.toString();
	return qs ? `/publications?${qs}` : "/publications";
}

/**
 * Server-rendered pagination (`?page=…`), preserving the active category. Hidden
 * when there is a single page.
 */
export function Pagination({
	page,
	pageCount,
	category,
}: {
	page: number;
	pageCount: number;
	category?: string;
}) {
	if (pageCount <= 1) return null;

	const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
	const linkBase =
		"flex h-10 min-w-10 items-center justify-center rounded px-3 text-sm font-500 transition-colors";

	return (
		<nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
			{page > 1 && (
				<Link
					href={buildHref(page - 1, category)}
					rel="prev"
					aria-label={PUBLICATIONS.previousPage}
					className={`${linkBase} bg-primary-light/10 text-primary hover:bg-primary-light/20`}
				>
					<ChevronLeft className="h-4 w-4" />
				</Link>
			)}

			{pages.map((p) => (
				<Link
					key={p}
					href={buildHref(p, category)}
					aria-current={p === page ? "page" : undefined}
					aria-label={`${PUBLICATIONS.pageLabel} ${p}`}
					className={`${linkBase} ${
						p === page
							? "bg-primary text-white"
							: "bg-primary-light/10 text-primary hover:bg-primary-light/20"
					}`}
				>
					{p}
				</Link>
			))}

			{page < pageCount && (
				<Link
					href={buildHref(page + 1, category)}
					rel="next"
					aria-label={PUBLICATIONS.nextPage}
					className={`${linkBase} bg-primary-light/10 text-primary hover:bg-primary-light/20`}
				>
					<ChevronRight className="h-4 w-4" />
				</Link>
			)}
		</nav>
	);
}
