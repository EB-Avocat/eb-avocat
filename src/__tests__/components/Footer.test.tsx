import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/Footer";
import { NAV_LINKS } from "@/lib/constants";

describe("Footer", () => {
	it("links to in-page anchors on the home (overlay) variant", () => {
		render(<Footer />);
		for (const link of NAV_LINKS) {
			const anchor = screen.getByRole("link", { name: link.label });
			expect(anchor).toHaveAttribute("href", link.href);
		}
	});

	// On standalone routes (e.g. /mentions-legales) the footer nav links must point
	// back to the home page sections instead of resolving to a bare in-page anchor
	// on the current route (which would yield /mentions-legales#accueil).
	it("points its links back to the home page sections on the solid variant", () => {
		render(<Footer variant="solid" />);
		for (const link of NAV_LINKS) {
			const anchor = screen.getByRole("link", { name: link.label });
			// e.g. "#accueil" on the home page becomes "/#accueil" here.
			expect(anchor).toHaveAttribute("href", `/${link.href}`);
		}
	});
});
