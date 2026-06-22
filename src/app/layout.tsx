import type { Metadata } from "next";
import { CONTACT, LINKEDIN_URL, SITE } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(SITE.url),
	title: {
		default: SITE.title,
		template: `%s — ${SITE.name} Avocate`,
	},
	description: SITE.description,
	keywords: [
		"avocat professions libérales",
		"avocat droit des sociétés Lyon",
		"avocat droit des affaires",
		"création de société SEL SCM SCI SPFPL",
		"contrats d'exercice libéral",
		"clientèle patientèle",
		"contentieux ordinal",
		"Eva Biezunski avocate",
		"avocat Barreau de Lyon",
	],
	authors: [{ name: SITE.name }],
	creator: SITE.name,
	icons: {
		icon: "/images/favicon.svg",
	},
	alternates: {
		canonical: "/",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
	},
	openGraph: {
		title: SITE.title,
		description: SITE.description,
		url: SITE.url,
		siteName: SITE.name,
		locale: "fr_FR",
		type: "website",
		images: [
			{
				url: "/images/portrait.jpeg",
				width: 835,
				height: 1112,
				alt: `${SITE.name}, avocate au Barreau de Lyon`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: SITE.title,
		description: SITE.description,
		images: ["/images/portrait.jpeg"],
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "Attorney",
	"@id": `${SITE.url}/#attorney`,
	name: "Eva Biezunski",
	description: SITE.description,
	url: SITE.url,
	image: `${SITE.url}/images/portrait.jpeg`,
	telephone: CONTACT.phone,
	email: CONTACT.email,
	priceRange: "$$",
	address: {
		"@type": "PostalAddress",
		streetAddress: CONTACT.addressParts.street,
		addressLocality: CONTACT.addressParts.city,
		postalCode: CONTACT.addressParts.postalCode,
		addressCountry: CONTACT.addressParts.countryCode,
	},
	areaServed: {
		"@type": "City",
		name: CONTACT.addressParts.city,
	},
	knowsAbout: ["Droit des sociétés", "Droit des affaires", "Professionnels libéraux"],
	sameAs: [LINKEDIN_URL],
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
