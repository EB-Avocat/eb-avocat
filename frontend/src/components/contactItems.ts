import { Mail, MapPin, Phone } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { LinkedinIcon } from "@/components/ui/LinkedinIcon";
import { CONTACT, LINKEDIN_URL } from "@/lib/constants";

type ContactItem = {
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
	text: string;
	href?: string;
	external?: boolean;
};

// Single source of truth for the contact channels rendered in Contact and Footer.
// Each component keeps its own markup (different tags/classes); only the data is shared.
// Static copies of these icons live in public/images/icons/ (brand color baked in) and are
// hot-linked from the e-mail signature: keep them in sync if an icon changes here, then
// re-run scripts/generate-signature-images.ts to refresh the PNG/WebP copies.
export const contactItems: ContactItem[] = [
	{ Icon: MapPin, text: CONTACT.address },
	{ Icon: Phone, text: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
	{ Icon: Mail, text: CONTACT.email, href: `mailto:${CONTACT.email}` },
	{ Icon: LinkedinIcon, text: "LinkedIn", href: LINKEDIN_URL, external: true },
];
