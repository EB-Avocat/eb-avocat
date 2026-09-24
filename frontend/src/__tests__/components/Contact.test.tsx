import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Contact } from "@/components/Contact";
import { CONTACT, OTHER_SUBJECT } from "@/lib/constants";

function fillRequiredFields() {
	fireEvent.change(screen.getByLabelText(CONTACT.formFields.lastName), {
		target: { value: "Dupont" },
	});
	fireEvent.change(screen.getByLabelText(CONTACT.formFields.firstName), {
		target: { value: "Marie" },
	});
	fireEvent.change(screen.getByLabelText(CONTACT.formFields.email), {
		target: { value: "marie@example.com" },
	});
	fireEvent.change(screen.getByLabelText(CONTACT.formFields.message), {
		target: { value: "Bonjour." },
	});
}

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

	it("shows the custom subject field only when 'Autre' is selected", () => {
		render(<Contact />);
		expect(screen.queryByLabelText(CONTACT.formFields.customSubject)).not.toBeInTheDocument();

		fireEvent.change(screen.getByLabelText(CONTACT.formFields.subject), {
			target: { value: OTHER_SUBJECT },
		});
		expect(screen.getByLabelText(CONTACT.formFields.customSubject)).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText(CONTACT.formFields.subject), {
			target: { value: "Contentieux" },
		});
		expect(screen.queryByLabelText(CONTACT.formFields.customSubject)).not.toBeInTheDocument();
	});

	describe("submission", () => {
		afterEach(() => vi.restoreAllMocks());

		it("posts the form to /api/contact and shows a success message", async () => {
			const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
			vi.stubGlobal("fetch", fetchMock);

			render(<Contact />);
			fillRequiredFields();
			fireEvent.click(screen.getByText(CONTACT.formFields.submit));

			await waitFor(() =>
				expect(screen.getByText(CONTACT.formMessages.success)).toBeInTheDocument(),
			);

			expect(fetchMock).toHaveBeenCalledTimes(1);
			const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
			expect(url).toBe("/api/contact");
			expect(init.method).toBe("POST");
			const body = JSON.parse(init.body as string);
			expect(body).toMatchObject({
				lastName: "Dupont",
				firstName: "Marie",
				email: "marie@example.com",
				message: "Bonjour.",
			});
		});

		it("shows an error message when the request fails", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn(async () => new Response(null, { status: 500 })),
			);

			render(<Contact />);
			fillRequiredFields();
			fireEvent.click(screen.getByText(CONTACT.formFields.submit));

			await waitFor(() => expect(screen.getByText(CONTACT.formMessages.error)).toBeInTheDocument());
		});
	});
});
