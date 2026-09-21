import { PublicationCard } from "@/components/ui/PublicationCard";
import { PUBLICATIONS } from "@/lib/constants";
import type { Publication } from "@/lib/publications-parse";

/** Responsive card grid for a set of publications, or the empty-state placeholder. */
export function PublicationGrid({ items }: { items: Publication[] }) {
	if (items.length === 0) {
		return <p className="text-center font-300 text-gray-600">{PUBLICATIONS.empty}</p>;
	}
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{items.map((publication) => (
				<PublicationCard key={publication.id} publication={publication} />
			))}
		</div>
	);
}
