import { Globe, Mail, MapPin, Phone, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { CONTACT, QR_CARD } from "@/lib/constants";

export const metadata: Metadata = {
	title: `${QR_CARD.title} — ${QR_CARD.subtitle}`,
	robots: { index: false, follow: false },
};

const MOBILE_UA = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i;

const contactLinks = [
	{
		Icon: MapPin,
		label: CONTACT.address,
		href: `https://maps.apple.com/?q=${encodeURIComponent(CONTACT.address)}`,
	},
	{
		Icon: Phone,
		label: CONTACT.phone,
		href: `tel:${CONTACT.phone.replace(/\s/g, "")}`,
	},
	{
		Icon: Mail,
		label: CONTACT.email,
		href: `mailto:${CONTACT.email}`,
	},
];

export default async function CartePage() {
	const userAgent = (await headers()).get("user-agent") ?? "";
	if (!MOBILE_UA.test(userAgent)) {
		redirect("/");
	}

	// Firefox on iOS cannot hand a .vcf off to Contacts (known Mozilla bug), so we
	// nudge those users to Safari and always expose tap-to-act links as a fallback.
	const isFirefox = /FxiOS|Firefox/i.test(userAgent);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-darker-teal to-dark-teal px-6 py-16">
			<div className="flex w-full max-w-sm flex-col items-center text-center">
				<Image
					src="/images/logo-for-dark-green-background.svg"
					alt="Eva Biezunski - Avocate"
					width={260}
					height={70}
					className="mb-10"
					priority
				/>
				<h1 className="text-3xl font-700 text-white">{QR_CARD.title}</h1>
				<p className="mt-2 text-lg font-300 text-white/80">{QR_CARD.subtitle}</p>

				<div className="mt-12 flex w-full flex-col gap-4">
					{isFirefox ? (
						<button
							type="button"
							disabled
							className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded bg-primary-light/40 px-8 py-4 font-500 text-white/50"
						>
							<UserPlus className="h-5 w-5" strokeWidth={1.5} />
							{QR_CARD.saveContact}
						</button>
					) : (
						<a
							href="/carte/vcard"
							className="inline-flex items-center justify-center gap-2 rounded bg-primary-light px-8 py-4 font-500 text-white transition-all duration-300 hover:bg-primary"
						>
							<UserPlus className="h-5 w-5" strokeWidth={1.5} />
							{QR_CARD.saveContact}
						</a>
					)}
					<a
						href="/"
						className="inline-flex items-center justify-center gap-2 rounded border-2 border-white px-8 py-4 font-500 text-white transition-all duration-300 hover:bg-white/10"
					>
						<Globe className="h-5 w-5" strokeWidth={1.5} />
						{QR_CARD.visitWebsite}
					</a>
				</div>

				{isFirefox && (
					<p className="mt-6 rounded bg-white/10 px-4 py-3 text-sm font-300 text-white/80">
						{QR_CARD.firefoxHint}
					</p>
				)}

				<div className="mt-10 flex w-full flex-col gap-4 border-t border-white/15 pt-8 text-left">
					{contactLinks.map(({ Icon, label, href }) => (
						<a
							key={href}
							href={href}
							className="flex items-start gap-3 font-300 text-sm text-white/70 transition-colors hover:text-white"
						>
							<span className="flex h-5 shrink-0 items-center">
								<Icon className="h-5 w-5 text-primary-light" strokeWidth={1.5} />
							</span>
							<span className="leading-5">{label}</span>
						</a>
					))}
				</div>
			</div>
		</main>
	);
}
