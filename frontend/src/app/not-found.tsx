import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Main } from "@/components/ui/Main";
import { NAV_LINKS, NOT_FOUND } from "@/lib/constants";

export const metadata: Metadata = {
	title: NOT_FOUND.metaTitle,
	// A 404 is a dead end for crawlers; keep it out of the index.
	robots: { index: false, follow: true },
};

// Contact lives as a section on the home page (/#contact), so the secondary CTA
// points back there rather than to a standalone route.
const contactHref = `/${NAV_LINKS[4].href}`;

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar variant="solid" />
			<Main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center text-near-black">
				<h1 className="text-3xl font-700 md:text-4xl">{NOT_FOUND.title}</h1>
				<p className="mt-4 max-w-xl font-300 text-lg leading-relaxed text-near-black/70">
					{NOT_FOUND.message}
				</p>
				<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
					<a
						href="/"
						className="inline-block rounded bg-primary-light px-8 py-3 font-500 text-white transition-all duration-300 hover:bg-primary"
					>
						{NOT_FOUND.homeCta}
					</a>
					<a
						href={contactHref}
						className="inline-block rounded border-2 border-primary px-8 py-3 font-500 text-primary transition-all duration-300 hover:bg-primary hover:text-white"
					>
						{NOT_FOUND.contactCta}
					</a>
				</div>
			</Main>
			<Footer variant="solid" />
		</div>
	);
}
