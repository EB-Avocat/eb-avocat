import { Star } from "lucide-react";
import Image from "next/image";
import { contactItems } from "@/components/contactItems";
import { FOOTER, NAV_LINKS, REVIEW_URL } from "@/lib/constants";

export function Footer() {
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
										href={link.href}
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
							<li className="flex items-start gap-2 font-300">
								<span className="flex h-5 shrink-0 items-center">
									<Star className="h-4 w-4 text-primary-light" />
								</span>
								<a
									href={REVIEW_URL}
									target="_blank"
									rel="noopener noreferrer"
									className="leading-5 transition-colors hover:text-white"
								>
									Laisser un avis
								</a>
							</li>
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
