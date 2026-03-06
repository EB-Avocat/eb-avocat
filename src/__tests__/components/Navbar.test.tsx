import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/Navbar";
import { NAV_LINKS } from "@/lib/constants";

vi.mock("next/image", () => ({
	default: (props: Record<string, unknown>) => <img {...props} />,
}));

describe("Navbar", () => {
	it("renders all navigation links", () => {
		render(<Navbar />);
		for (const link of NAV_LINKS) {
			expect(screen.getAllByText(link.label).length).toBeGreaterThan(0);
		}
	});

	it("toggles mobile menu on hamburger click", () => {
		render(<Navbar />);
		const menuButton = screen.getByLabelText("Menu");
		fireEvent.click(menuButton);
		const mobileLinks = screen.getAllByText(NAV_LINKS[0]!.label);
		expect(mobileLinks.length).toBeGreaterThanOrEqual(2);
	});
});
