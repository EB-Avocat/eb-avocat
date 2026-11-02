import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Contact } from "@/components/Contact";
import { CONTACT, OTHER_SUBJECT } from "@/lib/constants";
import { CONTACT_LIMITS } from "@/lib/contact";

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

	it("caps field lengths like the server", () => {
		render(<Contact />);
		fireEvent.change(screen.getByLabelText(CONTACT.formFields.subject), {
			target: { value: OTHER_SUBJECT },
		});
		const maxLength = (label: string) =>
			(screen.getByLabelText(label) as HTMLInputElement).maxLength;
		expect(maxLength(CONTACT.formFields.lastName)).toBe(CONTACT_LIMITS.name);
		expect(maxLength(CONTACT.formFields.firstName)).toBe(CONTACT_LIMITS.name);
		expect(maxLength(CONTACT.formFields.email)).toBe(CONTACT_LIMITS.email);
		expect(maxLength(CONTACT.formFields.phone)).toBe(CONTACT_LIMITS.phone);
		expect(maxLength(CONTACT.formFields.customSubject)).toBe(CONTACT_LIMITS.subject);
		expect(maxLength(CONTACT.formFields.message)).toBe(CONTACT_LIMITS.message);
	});

	it("hides the honeypot from people and assistive technologies", () => {
		const { container } = render(<Contact />);
		const honeypot = container.querySelector<HTMLInputElement>('input[name="website"]');
		expect(honeypot).not.toBeNull();
		expect(honeypot?.tabIndex).toBe(-1);
		expect(honeypot?.autocomplete).toBe("off");
		expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
		expect(
			screen.queryByRole("textbox", { name: CONTACT.formFields.honeypot }),
		).not.toBeInTheDocument();
	});

	describe("submission", () => {
		afterEach(() => {
			vi.useRealTimers();
			vi.unstubAllGlobals();
			vi.restoreAllMocks();
		});

		it("sends the honeypot and the time since the form rendered", async () => {
			vi.useFakeTimers({ toFake: ["performance"] });
			const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
			vi.stubGlobal("fetch", fetchMock);

			render(<Contact />);
			fillRequiredFields();
			vi.advanceTimersByTime(4200);
			fireEvent.click(screen.getByText(CONTACT.formFields.submit));

			await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
			const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
			const body = JSON.parse(init.body as string);
			expect(body.website).toBe("");
			expect(body.elapsedMs).toBe(4200);
		});

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
