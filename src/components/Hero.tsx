import Image from "next/image";
import { HERO, NAV_LINKS } from "@/lib/constants";

export function Hero() {
	return (
		<section
			id="accueil"
			className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-darker-teal to-dark-teal pt-20 md:pt-0"
		>
			<div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
				<Image
					id="hero-logo"
					src="/images/logo-for-dark-green-background.svg"
					alt="Eva Biezunski - Avocate"
					width={300}
					height={80}
					className="mb-8"
					priority
				/>
				<h1 className="mb-6 text-4xl font-700 text-white md:text-5xl lg:text-6xl">
					{HERO.heading}
				</h1>
				<p className="mb-10 max-w-2xl text-lg font-300 text-white/80 md:text-xl">
					{HERO.subheading}
				</p>
				<a
					href={NAV_LINKS[4].href}
					className="inline-block rounded bg-primary-light px-8 py-3 font-500 text-white transition-all duration-300 hover:bg-primary"
				>
					{HERO.cta}
				</a>
			</div>

			{/* Scroll indicator (decorative) */}
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
				<svg
					className="h-8 w-8 text-white/60"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
				</svg>
			</div>
		</section>
	);
}
