import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Main } from "@/components/ui/Main";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTACT, SITE } from "@/lib/constants";

export const metadata: Metadata = {
	title: "Mentions légales — Eva Biezunski Avocate",
	description: "Mentions légales du site Eva Biezunski Avocate : éditeur, hébergeur et médiation.",
};

const linkClass = "text-primary underline transition-colors hover:text-primary-light";

export default function MentionsLegalesPage() {
	return (
		<>
			<Navbar variant="solid" />
			<Main className="mx-auto max-w-6xl px-6 py-16 text-near-black">
				<SectionHeading as="h1">Mentions légales</SectionHeading>

				<div className="mx-auto max-w-3xl space-y-12 font-300 leading-relaxed">
					<section className="space-y-4">
						<h2 className="text-2xl font-700">Présentation du site</h2>
						<p>
							Le site{" "}
							<a href={SITE.url} className={linkClass}>
								{SITE.url}
							</a>{" "}
							est édité par Eva Biezunski (EI), domiciliée au {CONTACT.address}.
						</p>
						<p>SIREN : 852 107 515</p>
						<p>Numéro TVA intracommunautaire : FR77852107515</p>
						<p>
							Adresse de contact :{" "}
							<a href={`mailto:${CONTACT.email}`} className={linkClass}>
								{CONTACT.email}
							</a>{" "}
							/ Téléphone :{" "}
							<a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className={linkClass}>
								{CONTACT.phone}
							</a>
						</p>
						<p>
							Le directeur de la publication est Mme Eva Biezunski et peut être contactée à
							l&apos;adresse suivante :{" "}
							<a href={`mailto:${CONTACT.email}`} className={linkClass}>
								{CONTACT.email}
							</a>
							.
						</p>
						<p>
							L&apos;hébergeur du site est Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
							United States — Email :{" "}
							<a href="mailto:privacy@vercel.com" className={linkClass}>
								privacy@vercel.com
							</a>
							.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-2xl font-700">Crédits création site internet</h2>
						<p>
							La direction artistique, la conception et la réalisation ont été confiées à{" "}
							<a
								href="https://guillaume.ojardias.info"
								target="_blank"
								rel="noopener noreferrer"
								className={linkClass}
							>
								Guillaume Ojardias
							</a>{" "}
							(EI).
						</p>
						<p>Création du gabarit de site : Guillaume Ojardias</p>
						<p>
							Contact :{" "}
							<a
								href="https://guillaume.ojardias.info"
								target="_blank"
								rel="noopener noreferrer"
								className={linkClass}
							>
								guillaume.ojardias.info
							</a>
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-2xl font-700">Médiateur de la consommation</h2>
						<p>
							Si vous êtes un consommateur ou un non-professionnel, vous avez la possibilité de
							recourir gratuitement au Médiateur de la Consommation auprès du Conseil National des
							Barreaux (CNB) en cas de conflit avec le Cabinet. Ses coordonnées sont les suivantes :
						</p>
						<p>CNB – Médiateur à la consommation – 180 Boulevard Haussmann 75008 PARIS</p>
						<p>
							Mail :{" "}
							<a href="mailto:mediateur@mediateur-consommation-avocat.fr" className={linkClass}>
								mediateur@mediateur-consommation-avocat.fr
							</a>
						</p>
						<p>
							Site internet :{" "}
							<a
								href="https://mediateur-consommation-avocat.fr"
								target="_blank"
								rel="noopener noreferrer"
								className={linkClass}
							>
								https://mediateur-consommation-avocat.fr
							</a>
						</p>
					</section>
				</div>
			</Main>
			<Footer />
		</>
	);
}
