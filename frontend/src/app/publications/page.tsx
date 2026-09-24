import type { Metadata } from "next";
import { CategoryFilter } from "@/components/publications/CategoryFilter";
import { Pagination } from "@/components/publications/Pagination";
import { PublicationGrid } from "@/components/publications/PublicationGrid";
import { Main } from "@/components/ui/Main";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PUBLICATIONS } from "@/lib/constants";
import { getPublications } from "@/lib/publications";

export const revalidate = 3600;

export const metadata: Metadata = {
	title: PUBLICATIONS.pageTitle,
	description: PUBLICATIONS.metaDescription,
	alternates: { canonical: "/publications" },
};

export default async function PublicationsPage({
	searchParams,
}: {
	searchParams: Promise<{ category?: string; page?: string }>;
}) {
	const { category, page } = await searchParams;
	const {
		items,
		categories,
		page: currentPage,
		pageCount,
	} = await getPublications({ category, page });

	return (
		<Main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
			<SectionHeading as="h1">{PUBLICATIONS.pageTitle}</SectionHeading>
			<p className="mx-auto mb-12 max-w-2xl text-center font-300 leading-relaxed text-gray-600">
				{PUBLICATIONS.intro}
			</p>

			<CategoryFilter categories={categories} active={category} />
			<PublicationGrid items={items} />
			<Pagination page={currentPage} pageCount={pageCount} category={category} />
		</Main>
	);
}
