"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { NAV_LINKS } from "@/lib/constants";

const sectionIds = NAV_LINKS.map((l) => l.href.replace("#", ""));

type NavbarProps = {
	// The default "overlay" variant is transparent at the top and turns solid as
	// the hero logo scrolls behind it (home page). Pages without a hero logo (e.g.
	// /mentions-legales) can't drive that scroll-spy, so they pass "solid" to force
	// the visible header and point the links back to the home page sections.
	variant?: "overlay" | "solid";
};

export function Navbar({ variant = "overlay" }: NavbarProps) {
	const solid = variant === "solid";
	const navRef = useRef<HTMLElement>(null);
	// Solid pages have no hero logo to spy on, so skip the scroll listener entirely.
	const { activeId, navBackground, logoVisible } = useScrollSpy(sectionIds, navRef, !solid);
	const [menuOpen, setMenuOpen] = useState(false);

	// When the mobile menu is open, force the header background and logo to show
	// even at the top of the page, so the menu doesn't drop from an empty header.
	const showBackground = solid || navBackground || menuOpen;
	const showLogo = solid || logoVisible || menuOpen;

	// In solid mode the links live on another route, so they must navigate to the
	// home page (/#section) rather than to a bare in-page anchor.
	const sectionHref = (href: string) => (solid ? `/${href}` : href);
	const logoHref = solid ? "/" : NAV_LINKS[0].href;

	return (
		<nav
			ref={navRef}
			aria-label="Navigation principale"
			// Overlay floats over the hero (fixed); solid sits in the flow (sticky) so
			// the page content clears the header on its own — no hand-tuned padding.
			className={`top-0 z-50 transition-all duration-300 ${solid ? "sticky" : "fixed right-0 left-0"} ${
				showBackground ? "bg-white/90 shadow-md backdrop-blur-md" : "bg-transparent"
			}`}
		>
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 md:py-4">
				<a
					href={logoHref}
					className={`flex items-center transition-all duration-500 ${showLogo ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"}`}
				>
					<Image
						src="/images/logo-for-white-background.svg"
						alt="Eva Biezunski - Avocate"
						width={180}
						height={40}
						className="w-[120px] md:w-[180px]"
						priority
					/>
				</a>

				{/* Desktop nav */}
				<div className="hidden items-center gap-8 md:flex">
					{NAV_LINKS.map((link) => {
						const isActive = !solid && activeId === link.href.replace("#", "");
						return (
							<a
								key={link.href}
								href={sectionHref(link.href)}
								aria-current={isActive ? "location" : undefined}
								className={`text-sm font-500 transition-colors ${
									isActive
										? showBackground
											? "text-primary"
											: "text-white"
										: showBackground
											? "text-near-black/70 hover:text-primary"
											: "text-white/70 hover:text-white"
								}`}
							>
								{link.label}
							</a>
						);
					})}
				</div>

				{/* Mobile hamburger */}
				<button
					type="button"
					className="md:hidden"
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
					aria-expanded={menuOpen}
					aria-controls="mobile-menu"
				>
					{menuOpen ? (
						<X className={`h-6 w-6 ${showBackground ? "text-near-black" : "text-white"}`} />
					) : (
						<Menu className={`h-6 w-6 ${showBackground ? "text-near-black" : "text-white"}`} />
					)}
				</button>
			</div>

			{/* Mobile menu */}
			{menuOpen && (
				<div id="mobile-menu" className="border-t border-gray-100 md:hidden">
					<div className="flex flex-col px-6 py-4">
						{NAV_LINKS.map((link) => {
							const isActive = !solid && activeId === link.href.replace("#", "");
							return (
								<a
									key={link.href}
									href={sectionHref(link.href)}
									onClick={() => setMenuOpen(false)}
									aria-current={isActive ? "location" : undefined}
									className={`border-b border-gray-100 py-3 text-sm font-500 last:border-0 ${
										isActive ? "text-primary" : "text-near-black/70"
									}`}
								>
									{link.label}
								</a>
							);
						})}
					</div>
				</div>
			)}
		</nav>
	);
}
