import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { ABOUT, CONTACT, HERO, REVIEW_CTA, SERVICES } from "@/lib/constants";

describe("Home page", () => {
	it("renders all sections", () => {
		render(<Home />);
		expect(screen.getByText(HERO.heading)).toBeInTheDocument();
		expect(screen.getAllByText(ABOUT.sectionTitle).length).toBeGreaterThan(0);
		expect(screen.getAllByText(SERVICES.sectionTitle).length).toBeGreaterThan(0);
		expect(screen.getAllByText(REVIEW_CTA.title).length).toBeGreaterThan(0);
		expect(screen.getAllByText(CONTACT.sectionTitle).length).toBeGreaterThan(0);
	});
});
