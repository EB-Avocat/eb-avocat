import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ABOUT, CONTACT, HERO, REVIEW_CTA, SERVICES } from "@/lib/constants";

// LatestPublications is an async server component that fetches from Notion (and
// imports server-only modules) — out of scope for a jsdom render. Stub it out.
vi.mock("@/components/LatestPublications", () => ({
	LatestPublications: () => null,
}));

const { default: Home } = await import("@/app/page");

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
