import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { ABOUT, CONTACT, HERO, SERVICES, TESTIMONIALS } from "@/lib/constants";

vi.mock("next/image", () => ({
	default: (props: Record<string, unknown>) => <img {...props} />,
}));

describe("Home page", () => {
	it("renders all sections", () => {
		render(<Home />);
		expect(screen.getByText(HERO.heading)).toBeInTheDocument();
		expect(screen.getAllByText(ABOUT.sectionTitle).length).toBeGreaterThan(0);
		expect(screen.getAllByText(SERVICES.sectionTitle).length).toBeGreaterThan(0);
		expect(screen.getAllByText(TESTIMONIALS.sectionTitle).length).toBeGreaterThan(0);
		expect(screen.getAllByText(CONTACT.sectionTitle).length).toBeGreaterThan(0);
	});
});
