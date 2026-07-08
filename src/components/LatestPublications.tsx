import Link from "next/link";
import { PublicationGrid } from "@/components/publications/PublicationGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PUBLICATIONS } from "@/lib/constants";
import { getLatestPublications } from "@/lib/publications";

/**
 * Homepage teaser between the contact form and the footer: the three most recent
 * publications, a placeholder when there are none, and a "see all" button once
 * there is more than one publication.
 */
export async function LatestPublications() {
	const { items, total } = await getLatestPublications(3);

	return (
		<section id="publications" className="bg-primary-light/5 py-20">
			<div className="mx-auto max-w-6xl px-6">
				<SectionHeading>{PUBLICATIONS.sectionTitle}</SectionHeading>

				<PublicationGrid items={items} />

				{total > 1 && (
					<div className="mt-12 text-center">
						<Link
							href="/publications"
							className="inline-block rounded bg-primary-light px-8 py-3 font-500 text-base text-white transition-all duration-300 hover:bg-primary"
						>
							{PUBLICATIONS.viewAll}
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}
