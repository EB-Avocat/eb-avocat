import Link from "next/link";
import { PUBLICATIONS } from "@/lib/constants";

/**
 * Category filter as server-rendered links (`?category=…`), so filtered URLs are
 * shareable and crawlable with no client JS. Selecting a category resets to page 1.
 */
export function CategoryFilter({ categories, active }: { categories: string[]; active?: string }) {
	if (categories.length === 0) return null;

	const options: { label: string; value?: string }[] = [
		{ label: PUBLICATIONS.allCategories },
		...categories.map((c) => ({ label: c, value: c })),
	];

	return (
		<nav aria-label="Filtrer par catégorie" className="mb-10 flex flex-wrap justify-center gap-2">
			{options.map(({ label, value }) => {
				const isActive = value === active || (!value && !active);
				const href = value
					? `/publications?category=${encodeURIComponent(value)}`
					: "/publications";
				return (
					<Link
						key={label}
						href={href}
						aria-current={isActive ? "true" : undefined}
						className={`rounded-full px-4 py-2 text-sm font-500 transition-colors ${
							isActive
								? "bg-primary text-white"
								: "bg-primary-light/10 text-primary hover:bg-primary-light/20"
						}`}
					>
						{label}
					</Link>
				);
			})}
		</nav>
	);
}
