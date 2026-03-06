"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollSpy(sectionIds: string[], offset = 100) {
	const [activeId, setActiveId] = useState<string>("");
	const [scrolled, setScrolled] = useState(false);
	const rafId = useRef(0);

	useEffect(() => {
		const handleScroll = () => {
			cancelAnimationFrame(rafId.current);
			rafId.current = requestAnimationFrame(() => {
				setScrolled(window.scrollY > 50);

				for (let i = sectionIds.length - 1; i >= 0; i--) {
					const id = sectionIds[i]!;
					const el = document.getElementById(id);
					if (el) {
						const rect = el.getBoundingClientRect();
						if (rect.top <= offset) {
							setActiveId(id);
							return;
						}
					}
				}
				setActiveId(sectionIds[0] ?? "");
			});
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
			cancelAnimationFrame(rafId.current);
		};
	}, [sectionIds, offset]);

	return { activeId, scrolled };
}
