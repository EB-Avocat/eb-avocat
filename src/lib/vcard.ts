import { CONTACT, SITE } from "@/lib/constants";

/**
 * Builds a vCard 3.0 for Eva Biezunski from the centralized contact constants.
 * Opening the resulting `.vcf` on a phone offers to add her to the address book.
 */
export function buildVCard(): string {
	const { addressParts, phone, email } = CONTACT;
	const tel = phone.replace(/\s/g, "");

	const lines = [
		"BEGIN:VCARD",
		"VERSION:3.0",
		"N:Biezunski;Eva;;;",
		"FN:Eva Biezunski",
		"TITLE:Avocate en droit des sociétés",
		`TEL;TYPE=CELL:${tel}`,
		`EMAIL;TYPE=WORK:${email}`,
		`ADR;TYPE=WORK:;;${addressParts.street};${addressParts.city};;${addressParts.postalCode};${addressParts.country}`,
		`URL:${SITE.url}`,
		"END:VCARD",
	];

	return lines.join("\r\n");
}
