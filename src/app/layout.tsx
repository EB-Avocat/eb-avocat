import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
	title: SITE.title,
	description: SITE.description,
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
		streetAddress: "12 rue de l'Exemple",
		addressLocality: "Lyon",
		postalCode: "69001",
		addressCountry: "FR",
	},
	knowsAbout: ["Droit des affaires", "Droit des sociétés", "Professionnels de santé libéraux"],
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
			<body className="font-museo antialiased">{children}</body>
		</html>
	);
}
