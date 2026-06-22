import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Main } from "@/components/ui/Main";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTACT, SITE } from "@/lib/constants";

export const metadata: Metadata = {
	title: "Politique de confidentialité",
	description:
		"Politique de confidentialité du site Eva Biezunski Avocate : traitement de vos données personnelles (RGPD).",
	alternates: {
		canonical: "/politique-de-confidentialite",
	},
};

const linkClass = "text-primary underline transition-colors hover:text-primary-light";
const thClass = "border border-near-black/15 bg-darker-teal/5 p-3 font-500 align-top";
const tdClass = "border border-near-black/15 p-3 align-top";

const processingHeaders = [
	"Finalité du traitement",
	"Catégories de Données collectées",
	"Base légale",
];

const processingRows = [
	[
		"Gestion des demandes de contact",
		"Nom, email, contenu du message",
		"Selon les situations, la base légale est votre consentement ou l'exécution du contrat ou de mesures précontractuelles.",
	],
	[
		"Prospection, newsletters et organisation d'évènements",
		"Coordonnées de contact",
		"La base légale est l'intérêt légitime ou le consentement",
	],
	[
		"Traitement des candidatures RH",
		"Identité, informations figurant dans le curriculum vitae, courriers et emails transmis par les candidats, suites données à la candidature",
		"La base légale est l'exécution de mesures précontractuelles",
	],
	[
		"Gestion de l'exercice des droits des individus",
		"Nom, prénom, email, type de demande, le cas échéant une copie des documents d'identité",
		"La base légale est le respect de nos obligations légales",
	],
];

const retentionHeaders = ["Finalités", "Durée de conservation"];

const retentionRows = [
	[
		"Gestion des demandes de contact",
		"Les Données relatives à une demande sont conservées 5 ans à compter du traitement de cette demande",
	],
	["Traitement des candidatures", "2 ans après le dernier contact avec le candidat"],
	[
		"Gestion de l'exercice des droits des individus",
		"Les Données sont conservées l'année civile de la demande, plus cinq ans. Les documents d'identité éventuellement fournis à l'appui de la demande sont supprimés au maximum 1 an après réception de la demande.",
	],
	[
		"Prospection, newsletters et organisation d'évènements",
		"3 ans à compter du dernier contact ou jusqu'à ce que la personne retire son consentement lorsque la base légale est le consentement",
	],
];

const rights = [
	{
		term: "Obtenir une copie de vos Données – « droit d'accès »",
		description:
			"Vous avez le droit de demander une confirmation sur les Données effectivement traitées, d'obtenir une copie de ces Données et des informations sur la façon dont le Cabinet traite ces Données.",
	},
	{
		term: "Corriger vos Données – « droit de rectification »",
		description:
			"Vous avez le droit de demander de rectifier vos Données si elles sont inexactes ou incomplètes.",
	},
	{
		term: "Supprimer vos Données – « droit à l'effacement »",
		description:
			"Vous avez le droit de demander de supprimer vos Données lorsque qu'il n'existe plus de raison pour le Cabinet de les traiter, si vous retirez votre consentement ou si vous vous opposez à la façon dont le Cabinet traite vos Données (voir « droit d'opposition » ci-dessous), si leur traitement est illicite, si leur suppression est nécessaire pour respecter une obligation légale ou si les Données ont été collectées dans le cadre de l'offre de services de la société de l'information lorsque vous aviez moins de 15 ans.",
	},
	{
		term: "Geler l'utilisation de vos Données – « droit à la limitation du traitement »",
		description:
			"Vous pouvez demander au Cabinet de limiter le traitement de vos Données si : vous pensez que les Données sont inexactes ; le traitement est illicite et vous préférez un blocage de vos Données plutôt que leur effacement ; les Données ne sont plus nécessaires pour nos traitements mais peuvent vous êtres nécessaires dans le cadre d'actions en justice ; vous avez exercé votre droit d'opposition (voir ci-dessous) et souhaitez vérifier si les motifs légitimes que le Cabinet poursuit prévalent sur les vôtres.",
	},
	{
		term: "Demander l'arrêt du traitement de vos Données – « droit d'opposition »",
		description:
			"Vous pouvez vous opposer au traitement de vos Données reposant sur les intérêts légitimes du Cabinet, sauf si le Cabinet peut démontrer que les intérêts légitimes l'emportent sur vos droits ou si vos Données sont nécessaires dans le cadre d'actions en justice.",
	},
	{
		term: "Choisir et changer d'avis – « droit de retirer votre consentement »",
		description:
			"Si vous aviez consenti au traitement de vos Données, vous avez le droit de retirer votre consentement à tout moment.",
	},
	{
		term: "Emporter vos Données – « droit à la portabilité »",
		description:
			"Sous certaines conditions, vous avez le droit de recevoir une copie de vos Données afin de les transmettre à un autre responsable de traitement.",
	},
	{
		term: "Donner des directives post-mortem – « droit de donner des directives sur le sort des Données après son décès »",
		description:
			"Vous avez le droit de faire enregistrer auprès du Cabinet des directives sur le sort à apporter à vos Données après votre décès.",
	},
	{
		term: "Demander une intervention humaine – « droit de ne pas être soumis à des décisions automatisées »",
		description:
			"Si une décision automatisée qui a un effet juridique ou vous affecte est prise sur vous, vous avez le droit de demander l'intervention d'une personne humaine pour réexaminer la décision, ou dans certains cas, vous opposer à faire l'objet d'une décision entièrement automatisée.",
	},
];

export default function PolitiqueDeConfidentialitePage() {
	return (
		<>
			<Navbar variant="solid" />
			<Main className="mx-auto max-w-6xl px-6 py-16 text-near-black">
				<SectionHeading as="h1">Politique de confidentialité</SectionHeading>

				<div className="mx-auto max-w-3xl space-y-12 font-300 leading-relaxed">
					<section className="space-y-4">
						<p className="font-500">Date de dernière mise à jour : 19 juin 2026</p>
						<p>
							Eva Biezunski (EI) met tout en œuvre pour protéger vos Données Personnelles
							conformément au Règlement Européen sur la Protection des Données (RGPD) et à la loi
							informatique et liberté n°78-17 modifiée.
						</p>
						<p>
							La présente politique s&apos;applique aux traitements de Données que le Cabinet
							effectue sur vos Données à caractère personnel lorsque vous transmettez des Données au
							Cabinet par l&apos;intermédiaire du site Internet{" "}
							<a href={SITE.url} className={linkClass}>
								{SITE.url}
							</a>{" "}
							et ses sous domaines (ci-après le « Site ») et décrit la manière dont vos Données
							Personnelles sont traitées par Eva Biezunski (EI).
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-2xl font-700">1. Définitions</h2>
						<p>
							« Données Personnelles » ou « Données » désigne toute information identifiant
							directement ou indirectement une personne physique (ex. nom, prénom, numéro de
							téléphone, date de naissance, adresse…).
						</p>
						<p>
							« Responsable de traitement » désigne la personne physique ou morale qui, seule ou
							conjointement avec d&apos;autres, détermine les finalités et les moyens du traitement.
						</p>
						<p>
							« Personne concernée » désigne toute personne physique dont les Données Personnelles
							sont collectées et traitées par le biais du Site.
						</p>
						<p>
							Les expressions ci-dessus définies ont la même signification qu&apos;elles soient
							employées au pluriel ou au singulier.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-2xl font-700">2. Coordonnées du responsable de traitement</h2>
						<p>
							Dans la présente politique de confidentialité, les termes « Cabinet » ou « Eva
							Biezunski » sont utilisés pour désigner :
						</p>
						<p>Eva Biezunski (EI) domiciliée au {CONTACT.address}.</p>
						<p>
							Eva Biezunski agit en qualité de Responsable de traitement pour le traitement de vos
							Données.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-2xl font-700">3. Comment vos données sont-elles utilisées ?</h2>
						<p>
							Lorsque vous utilisez les fonctionnalités du Site, le Cabinet traite vos Données dans
							les conditions et pour les finalités suivantes :
						</p>
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-left text-sm">
								<thead>
									<tr>
										{processingHeaders.map((header) => (
											<th key={header} className={thClass}>
												{header}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{processingRows.map((row) => (
										<tr key={row[0]}>
											{row.map((cell, cellIndex) => (
												<td key={processingHeaders[cellIndex]} className={tdClass}>
													{cell}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<p>
							Le caractère obligatoire ou facultatif des Données qui vous sont demandées ainsi que
							les conséquences en cas d&apos;absence de réponse vous sont précisées au moment de la
							collecte des Données, notamment via la présence ou l&apos;absence d&apos;un
							astérisque.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-2xl font-700">4. Destinataire de vos données</h2>
						<p>
							Vos Données Personnelles peuvent être transmises à des tiers par Eva Biezunski dans
							les situations suivantes :
						</p>
						<ul className="list-disc space-y-2 pl-6">
							<li>
								Transferts à nos partenaires et prestataires de services, par exemple pour gérer les
								services de paiement de loyer offerts depuis le Site ;
							</li>
							<li>
								Aux autorités de règlementation, aux autorités de contrôle, aux autorités chargées
								de l&apos;application de la loi ou de la prévention de la fraude, ainsi qu&apos;à
								nos conseillers (y compris avocats ou commissaires aux comptes), aux tribunaux, à
								tout autre organisme autorisé à des fins de prévention ou de détection d&apos;une
								activité illégale, protéger la sécurité de toute personne ou faire valoir nos droits
								;
							</li>
							<li>
								En cas de fusion, d&apos;acquisition de nos activités ou actifs ou autre événement
								similaire, à un acheteur potentiel ou autre de nos activités ou actifs avec lequel
								le Cabinet aurait une relation contractuelle.
							</li>
						</ul>
					</section>

					<section className="space-y-4">
						<h2 className="text-2xl font-700">5. Conservation de vos données personnelles</h2>
						<p>Vos Données sont conservées pour les durées suivantes :</p>
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-left text-sm">
								<thead>
									<tr>
										{retentionHeaders.map((header) => (
											<th key={header} className={thClass}>
												{header}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{retentionRows.map((row) => (
										<tr key={row[0]}>
											{row.map((cell, cellIndex) => (
												<td key={retentionHeaders[cellIndex]} className={tdClass}>
													{cell}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<p>
							À l&apos;issue des durées de conservations énoncées ci-dessus, vos Données seront
							supprimées ou anonymisées.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-2xl font-700">6. Vos droits</h2>
						<p>
							Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée, vous
							disposez des droits suivants :
						</p>
						{rights.map((right) => (
							<p key={right.term}>
								<span className="font-500">{right.term}</span>
								<br />
								{right.description}
							</p>
						))}
						<p>
							Vous pouvez obtenir plus d&apos;informations sur l&apos;étendue de ces droits sur le{" "}
							<a
								href="https://www.cnil.fr/fr/comprendre-vos-droits"
								target="_blank"
								rel="noopener noreferrer"
								className={linkClass}
							>
								site de la CNIL
							</a>
							.
						</p>
						<p>
							Vous pouvez exercer ces droits en adressant une demande écrite à l&apos;adresse
							suivante : Eva Biezunski {CONTACT.address} ou par email :{" "}
							<a href={`mailto:${CONTACT.email}`} className={linkClass}>
								{CONTACT.email}
							</a>
							. Si nécessaire, le Cabinet se réserve le droit de vous demander un justificatif
							d&apos;identité pour répondre à votre demande.
						</p>
						<p>
							Le Cabinet répondra à toute demande reçue de votre part dans un délai d&apos;un mois à
							compter de la date de la demande. Si votre demande n&apos;est pas suffisamment précise
							ou ne comporte pas tous les éléments permettant de répondre à votre demande, le
							Cabinet peut vous demander de fournir des éléments supplémentaires.
						</p>
						<p>
							En cas de réclamation sur la manière dont Eva Biezunski traite vos Données, vous
							disposez également du droit de saisir la Commission Nationale de l&apos;Informatique
							et des Libertés (CNIL), 3 Place de Fontenoy – TSA 80715 – 75334 PARIS CEDEX 07.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-2xl font-700">7. Sécurité des données</h2>
						<p>
							Le Cabinet a mis en œuvre des mesures de sécurité adéquates aux standards de sécurité
							en matière de traitement de Données Personnelles afin d&apos;éviter toute faille de
							sécurité et éviter que vos Données ne soient rendues accessibles, altérées, divulguées
							ou détruites de manière non légitime.
						</p>
						<p>
							Toutes les informations que vous transmettez au Cabinet sont stockées sur nos serveurs
							sécurisés, ou ceux de nos prestataires, au sein de l&apos;Espace Économique Européen
							(« EEE »).
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-2xl font-700">
							8. Modification de la politique de confidentialité
						</h2>
						<p>
							Le Cabinet se réserve la possibilité de modifier la présente politique de
							confidentialité.
						</p>
						<p>
							En cas de modification importante pour vos droits, le Cabinet prendra les mesures
							nécessaires pour vous en informer et affichera la politique de confidentialité mise à
							jour sur le Site.
						</p>
					</section>

					<section className="space-y-4">
						<h2 className="text-2xl font-700">9. Contacter le cabinet / litiges</h2>
						<p>
							Pour toute question relative à cette politique de confidentialité, veuillez contacter
							le Cabinet :
						</p>
						<ul className="list-disc space-y-2 pl-6">
							<li>
								par e-mail :{" "}
								<a href={`mailto:${CONTACT.email}`} className={linkClass}>
									{CONTACT.email}
								</a>
							</li>
							<li>à l&apos;adresse postale : {CONTACT.address}</li>
						</ul>
					</section>
				</div>
			</Main>
			<Footer variant="solid" />
		</>
	);
}
