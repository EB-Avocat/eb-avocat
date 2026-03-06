"use client";

import Image from "next/image";
import { useState } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { NAV_LINKS } from "@/lib/constants";

const sectionIds = NAV_LINKS.map((l) => l.href.replace("#", ""));

export function Navbar() {
	const { activeId, scrolled } = useScrollSpy(sectionIds);
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<nav
			className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
				scrolled ? "bg-white/90 shadow-md backdrop-blur-md" : "bg-transparent"
			}`}
		>
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				<a href={NAV_LINKS[0].href} className="flex items-center">
					<Image
						src={
							scrolled
								? "/images/logo-black-for-white-background.svg"
								: "/images/logo-white-for-black-background.svg"
						}
						alt="Eva Biezunski - Avocate"
						width={180}
						height={40}
						priority
					/>
				</a>

				{/* Desktop nav */}
				<div className="hidden items-center gap-8 md:flex">
					{NAV_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className={`text-sm font-500 transition-colors ${
								activeId === link.href.replace("#", "")
									? scrolled
										? "text-primary"
										: "text-white"
									: scrolled
										? "text-near-black/70 hover:text-primary"
										: "text-white/70 hover:text-white"
							}`}
						>
							{link.label}
						</a>
					))}
				</div>

				{/* Mobile hamburger */}
				<button
					type="button"
					className="md:hidden"
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label="Menu"
				>
					<svg
						className={`h-6 w-6 ${scrolled ? "text-near-black" : "text-white"}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						{menuOpen ? (
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						) : (
							<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
						)}
					</svg>
				</button>
			</div>

			{/* Mobile menu */}
			{menuOpen && (
				<div className="border-t border-gray-100 bg-white/95 backdrop-blur-md md:hidden">
					<div className="flex flex-col px-6 py-4">
						{NAV_LINKS.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onClick={() => setMenuOpen(false)}
								className={`border-b border-gray-100 py-3 text-sm font-500 last:border-0 ${
									activeId === link.href.replace("#", "") ? "text-primary" : "text-near-black/70"
								}`}
							>
								{link.label}
							</a>
						))}
					</div>
				</div>
			)}
		</nav>
	);
}
