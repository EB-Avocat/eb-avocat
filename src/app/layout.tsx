import type { Metadata } from "next";
import { CONTACT, SITE } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
	title: SITE.title,
	description: SITE.description,
	icons: {
		icon: "/images/favicon.svg",
	},
	openGraph: {
		title: SITE.title,
		description: SITE.description,
		url: SITE.url,
		siteName: SITE.name,
		locale: "fr_FR",
		type: "website",
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "Attorney",
	name: "Eva Biezunski",
	description: SITE.description,
	url: SITE.url,
	address: {
		"@type": "PostalAddress",
		streetAddress: CONTACT.addressParts.street,
		addressLocality: CONTACT.addressParts.city,
		postalCode: CONTACT.addressParts.postalCode,
		addressCountry: CONTACT.addressParts.countryCode,
	},
	knowsAbout: ["Droit des sociétés", "Droit des affaires", "Professionnels libéraux"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="fr">
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</head>
			<body className="font-museo antialiased">
				<a href="#contenu" className="skip-link">
					Aller au contenu
				</a>
				{children}
			</body>
		</html>
	);
}
