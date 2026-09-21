import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackofficeBaseProvider } from "@/components/backoffice/BackofficeContext";

export const metadata: Metadata = {
	title: { default: "Espace de gestion", template: "%s — Espace de gestion" },
	robots: { index: false, follow: false },
};

// Reached only through the secret prefix rewritten by src/proxy.ts.
export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
	const secret = process.env.BACKOFFICE_PATH;
	if (!secret) notFound();

	return (
		<BackofficeBaseProvider base={`/${secret}`}>
			<div className="min-h-screen bg-gray-50 text-near-black">{children}</div>
		</BackofficeBaseProvider>
	);
}
