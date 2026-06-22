import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Navbar } from "@/components/Navbar";
import { NAV_LINKS } from "@/lib/constants";

describe("Navbar", () => {
	it("renders all navigation links", () => {
		render(<Navbar />);
		for (const link of NAV_LINKS) {
			expect(screen.getAllByText(link.label).length).toBeGreaterThan(0);
		}
	});

	it("toggles mobile menu on hamburger click", () => {
		render(<Navbar />);
		const menuButton = screen.getByLabelText("Ouvrir le menu");
		expect(menuButton).toHaveAttribute("aria-expanded", "false");
		fireEvent.click(menuButton);
		const mobileLinks = screen.getAllByText(NAV_LINKS[0]!.label);
		expect(mobileLinks.length).toBeGreaterThanOrEqual(2);
		// The button now reflects the open state for screen-reader users.
		expect(screen.getByLabelText("Fermer le menu")).toHaveAttribute("aria-expanded", "true");
	});

	it("links to in-page anchors on the home (overlay) variant", () => {
		render(<Navbar />);
		for (const link of NAV_LINKS) {
			const anchors = screen.getAllByRole("link", { name: link.label });
			expect(anchors.some((a) => a.getAttribute("href") === link.href)).toBe(true);
		}
	});

	// The "solid" variant powers standalone routes (e.g. /mentions-legales) that
	// have no hero logo to drive the scroll-spy, so the header must be visible
	// immediately and its links must point back to the home page sections.
	describe("solid variant", () => {
		it("renders a visible header even without scrolling", () => {
			render(<Navbar variant="solid" />);
			const nav = screen.getByRole("navigation");
			expect(nav.className).toContain("bg-white");
		});

		it("points its links back to the home page sections", () => {
			render(<Navbar variant="solid" />);
			for (const link of NAV_LINKS) {
				const anchors = screen.getAllByRole("link", { name: link.label });
				// e.g. "#accueil" on the home page becomes "/#accueil" here.
				expect(anchors.some((a) => a.getAttribute("href") === `/${link.href}`)).toBe(true);
			}
		});
	});
});
