"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollSpyState {
	activeId: string;
	navBackground: boolean;
	logoVisible: boolean;
}

export function useScrollSpy(
	sectionIds: string[],
	navRef: React.RefObject<HTMLElement | null>,
	enabled = true,
	offset = 100,
) {
	const [state, setState] = useState<ScrollSpyState>({
		activeId: "",
		navBackground: false,
		logoVisible: false,
	});
	const rafId = useRef(0);
	const heroLogoRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!enabled) return;
		heroLogoRef.current = document.getElementById("hero-logo");

		const handleScroll = () => {
			cancelAnimationFrame(rafId.current);
			rafId.current = requestAnimationFrame(() => {
				let activeId = sectionIds[0] ?? "";
				for (let i = sectionIds.length - 1; i >= 0; i--) {
					const id = sectionIds[i]!;
					const el = document.getElementById(id);
					if (el && el.getBoundingClientRect().top <= offset) {
						activeId = id;
						break;
					}
				}

				let navBackground = false;
				let logoVisible = false;
				const heroLogo = heroLogoRef.current;
				const nav = navRef.current;
				if (heroLogo && nav) {
					const heroLogoRect = heroLogo.getBoundingClientRect();
					const navBottom = nav.getBoundingClientRect().bottom;
					// Require the hero logo to have actually scrolled behind the nav,
					// not just be naturally close to it on load (e.g. Firefox mobile)
					const hasScrolled = window.scrollY > 10;
					navBackground = hasScrolled && heroLogoRect.top <= navBottom;
					logoVisible = hasScrolled && heroLogoRect.top + heroLogoRect.height * 0.25 <= navBottom;
				}

				setState({ activeId, navBackground, logoVisible });
			});
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
			cancelAnimationFrame(rafId.current);
		};
	}, [sectionIds, navRef, enabled, offset]);

	return state;
}
