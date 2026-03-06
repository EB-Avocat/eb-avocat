import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Contact } from "@/components/Contact";
import { CONTACT } from "@/lib/constants";

describe("Contact", () => {
	it("renders form fields", () => {
		render(<Contact />);
		expect(screen.getByLabelText(CONTACT.formFields.lastName)).toBeInTheDocument();
		expect(screen.getByLabelText(CONTACT.formFields.firstName)).toBeInTheDocument();
		expect(screen.getByLabelText(CONTACT.formFields.email)).toBeInTheDocument();
		expect(screen.getByLabelText(CONTACT.formFields.phone)).toBeInTheDocument();
		expect(screen.getByLabelText(CONTACT.formFields.message)).toBeInTheDocument();
	});

	it("renders the submit button", () => {
		render(<Contact />);
		expect(screen.getByText(CONTACT.formFields.submit)).toBeInTheDocument();
	});

	it("renders contact info", () => {
		render(<Contact />);
		expect(screen.getByText(CONTACT.address)).toBeInTheDocument();
		expect(screen.getByText(CONTACT.phone)).toBeInTheDocument();
		expect(screen.getByText(CONTACT.email)).toBeInTheDocument();
	});
});
