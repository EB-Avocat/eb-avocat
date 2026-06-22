import Image from "next/image";
import { contactItems } from "@/components/contactItems";
import { FOOTER, NAV_LINKS } from "@/lib/constants";

type FooterProps = {
	// On pages without the home-page sections (e.g. /mentions-legales), the nav
	// links must point back to the home page (/#section) rather than resolving to
	// a bare in-page anchor on the current route. Mirrors the Navbar's variant.
	variant?: "overlay" | "solid";
};

export function Footer({ variant = "overlay" }: FooterProps) {
	const solid = variant === "solid";
	const sectionHref = (href: string) => (solid ? `/${href}` : href);

	return (
		<footer className="bg-darker-teal py-12 text-white">
			<div className="mx-auto max-w-6xl px-6">
				<div className="grid gap-8 md:grid-cols-3">
					{/* Logo */}
					<div>
						<Image
							src="/images/logo-white-for-black-background.svg"
							alt="Eva Biezunski - Avocate"
							width={180}
							height={40}
							className="mb-4"
						/>
						<p className="text-sm font-300 text-white/60">Avocate au Barreau de Lyon</p>
					</div>

					{/* Quick links */}
					<div>
						<h2 className="mb-4 text-sm font-700">Navigation</h2>
						<ul className="space-y-2">
							{NAV_LINKS.map((link) => (
								<li key={link.href}>
									<a
										href={sectionHref(link.href)}
										className="text-sm font-300 text-white/60 transition-colors hover:text-white"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Contact */}
					<div>
						<h2 className="mb-4 text-sm font-700">Contact</h2>
						<ul className="space-y-2 text-sm text-white/60">
							{contactItems.map(({ Icon, text, href, external }) => (
								<li key={text} className="flex items-start gap-2 font-300">
									<span className="flex h-5 shrink-0 items-center">
										<Icon className="h-4 w-4 text-primary-light" />
									</span>
									{href ? (
										<a
											href={href}
											target={external ? "_blank" : undefined}
											rel={external ? "noopener noreferrer" : undefined}
											className="leading-5 transition-colors hover:text-white"
										>
											{text}
										</a>
									) : (
										<span className="leading-5">{text}</span>
									)}
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
					<p className="text-xs font-300 text-white/60">{FOOTER.copyright}</p>
					<div className="flex gap-4">
						<a
							href="/mentions-legales"
							className="text-xs font-300 text-white/60 transition-colors hover:text-white"
						>
							{FOOTER.legalNotice}
						</a>
						<a
							href="/politique-de-confidentialite"
							className="text-xs font-300 text-white/60 transition-colors hover:text-white"
						>
							{FOOTER.privacyPolicy}
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
