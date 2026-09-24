import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/Hero";
import { HERO } from "@/lib/constants";

describe("Hero", () => {
	it("renders the heading", () => {
		render(<Hero />);
		expect(screen.getByText(HERO.heading)).toBeInTheDocument();
	});

	it("renders the CTA button", () => {
		render(<Hero />);
		expect(screen.getByText(HERO.cta)).toBeInTheDocument();
	});

	it("renders the subheading", () => {
		render(<Hero />);
		expect(screen.getByText(HERO.subheading)).toBeInTheDocument();
	});
});
