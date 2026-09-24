import { describe, expect, it } from "vitest";
import { CONTACT, SITE } from "@/lib/constants";
import { buildVCard } from "@/lib/vcard";

describe("buildVCard", () => {
	const vcard = buildVCard();

	it("is wrapped in vCard delimiters", () => {
		expect(vcard.startsWith("BEGIN:VCARD")).toBe(true);
		expect(vcard.trimEnd().endsWith("END:VCARD")).toBe(true);
		expect(vcard).toContain("VERSION:3.0");
	});

	it("includes Eva's name", () => {
		expect(vcard).toContain("FN:Eva Biezunski");
	});

	it("includes the phone with spaces stripped", () => {
		expect(vcard).toContain(`TEL;TYPE=CELL:${CONTACT.phone.replace(/\s/g, "")}`);
		expect(vcard).toContain("TEL;TYPE=CELL:+33756856275");
	});

	it("includes the email and website url", () => {
		expect(vcard).toContain(`EMAIL;TYPE=WORK:${CONTACT.email}`);
		expect(vcard).toContain(`URL:${SITE.url}`);
	});

	it("includes the structured address", () => {
		expect(vcard).toContain(CONTACT.addressParts.street);
		expect(vcard).toContain(CONTACT.addressParts.postalCode);
		expect(vcard).toContain(CONTACT.addressParts.city);
	});

	it("uses CRLF line endings", () => {
		expect(vcard).toContain("\r\n");
	});
});
