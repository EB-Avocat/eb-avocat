import Link from "next/link";
import { PUBLICATIONS } from "@/lib/constants";
import { type Category, groupCategories } from "@/lib/publications-parse";

function chipClass(isActive: boolean): string {
	return `rounded-full px-4 py-2 text-sm font-500 transition-colors ${
		isActive
			? "bg-primary text-white"
			: "bg-primary-light/10 text-primary hover:bg-primary-light/20"
	}`;
}

function CategoryLink({ label, slug, active }: { label: string; slug?: string; active?: string }) {
	const isActive = slug === active || (!slug && !active);
	const href = slug ? `/publications?category=${encodeURIComponent(slug)}` : "/publications";
	return (
		<Link href={href} aria-current={isActive ? "true" : undefined} className={chipClass(isActive)}>
			{label}
		</Link>
	);
}

/**
 * Category filter as server-rendered links (`?category=<slug>`), so filtered URLs
 * are shareable and crawlable with no client JS. Primary categories are the main
 * chips; the others sit in a native <details> disclosure (open when one of them
 * is active). Selecting a category resets to page 1.
 */
export function CategoryFilter({
	categories,
	active,
}: {
	categories: Category[];
	active?: string;
}) {
	if (categories.length === 0) return null;

	const { primary, other } = groupCategories(categories);
	// No primary category configured yet: every category is a main chip.
	const main = primary.length > 0 ? primary : other;
	const secondary = primary.length > 0 ? other : [];
	const secondaryActive = secondary.some((c) => c.slug === active);

	return (
		<nav aria-label={PUBLICATIONS.filterLabel} className="mb-10 flex flex-col items-center gap-4">
			<div className="flex flex-wrap justify-center gap-2">
				<CategoryLink label={PUBLICATIONS.allCategories} active={active} />
				{main.map((c) => (
					<CategoryLink key={c.id} label={c.name} slug={c.slug} active={active} />
				))}
			</div>

			{secondary.length > 0 && (
				<details open={secondaryActive} className="group w-full text-center">
					<summary className="cursor-pointer list-none text-sm font-500 text-primary underline-offset-4 hover:underline">
						{PUBLICATIONS.moreCategories}
					</summary>
					<div className="mt-4 flex flex-wrap justify-center gap-2">
						{secondary.map((c) => (
							<CategoryLink key={c.id} label={c.name} slug={c.slug} active={active} />
						))}
					</div>
				</details>
			)}
		</nav>
	);
}
