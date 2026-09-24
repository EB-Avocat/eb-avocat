import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Services } from "@/components/Services";
import { SERVICES } from "@/lib/constants";

describe("Services", () => {
	it("renders the section title", () => {
		render(<Services />);
		expect(screen.getByText(SERVICES.sectionTitle)).toBeInTheDocument();
	});

	it("renders all service cards", () => {
		render(<Services />);
		for (const service of SERVICES.items) {
			expect(screen.getByText(service.title)).toBeInTheDocument();
		}
	});
});
