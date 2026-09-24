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
export const contactItems: ContactItem[] = [
	{ Icon: MapPin, text: CONTACT.address },
	{ Icon: Phone, text: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
	{ Icon: Mail, text: CONTACT.email, href: `mailto:${CONTACT.email}` },
	{ Icon: LinkedinIcon, text: "LinkedIn", href: LINKEDIN_URL, external: true },
];
