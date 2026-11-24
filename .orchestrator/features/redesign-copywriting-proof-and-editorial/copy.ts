/**
 * Site copy for the redesign (#68, T-504): `copy.md`, key for key, in `frontend/src/lib/constants.ts`
 * form. Not imported by the app; #79–#84 paste or diff it into `constants.ts`.
 * Check: `bun .orchestrator/features/redesign-copywriting-proof-and-editorial/check-copy.ts`.
 *
 * Conventions
 * - Every string is the exact text of its `copy.md` quote block (U+00A0 before » : ; ? ! and after «,
 *   typographic ’). `check-copy.ts` compares them byte for byte.
 * - Multi-line blocks of `copy.md` with no sub-keys become arrays:
 *   FAQ → `{ q, a }[]`; situations and `FIRST_CONTACT.steps` → `{ title, text }[]`;
 *   one-line lists (`forWhom.items`, `how.steps`, …) → `string[]`.
 * - `DOMAINES.items` is the one domaine list (#67 §2: slug, label, hasPage). The `copy.md` key
 *   `DOMAINES.items[<slug>]` is the entry with that slug.
 * - Build-time placeholders of `copy.md` (`{{phoneDisplay}}`, `{{email}}`, `{{address}}`, `{{year}}`,
 *   `{{limit.*}}`) are resolved here. Runtime ones (`{{rating}}`, `{{count}}`, `{{date}}`, `{{author}}`,
 *   `{{title}}`, `{{label}}`) are functions taking one object, e.g. `PROOF.rating.line({ rating, count })`.
 * - Meta titles are kept as full strings, suffix included (`SITE.titleSuffix` is there for new pages).
 */

/** Contact-form field caps (characters, after trimming): the form's `maxLength` and the API's checks. */
export const CONTACT_LIMITS = {
	name: 100,
	email: 254,
	phone: 30,
	subject: 150,
	message: 5000,
	urls: 3,
} as const;

const NBSP = " ";

/** French number with U+00A0 as thousands separator (`toLocaleString` writes U+202F, G §5). */
const frNumber = (n: number) => n.toLocaleString("fr-FR").replace(/\s/g, NBSP);
const maxChars = (limit: number) => `${frNumber(limit)} caractères maximum`;

// Brand teal, mirroring the Tailwind `@theme` vars in globals.css (which TS/JSON can't
// import). Source of truth for the hero gradient, the PWA icons, and the theme-color meta.
export const BRAND_COLORS = {
	darkerTeal: "#162729", // --color-darker-teal
	darkTeal: "#264445", // --color-dark-teal
} as const;

export const REVIEW_URL = "https://maps.app.goo.gl/qjynjiyhA1APuACL8";
export const LINKEDIN_URL = "https://www.linkedin.com/in/eva-biezunski-36a4b691/";

// Subject value that reveals the free-text "Précisez l’objet" field in the contact form.
export const OTHER_SUBJECT = "Autre";

const ADDRESS = {
	street: "29 rue du Président Édouard Herriot",
	postalCode: "69002",
	city: "Lyon",
	country: "France",
	countryCode: "FR",
} as const;

const PHONE = "+33 7 56 85 62 75";
const EMAIL = "eva@biezunski-avocat.fr";
const ADDRESS_LINE = `${ADDRESS.street}, ${ADDRESS.postalCode} ${ADDRESS.city}`;
/** `07 56 85 62 75` with U+00A0 between pairs, derived from PHONE (G §5). */
const PHONE_DISPLAY = `0${PHONE.replace(/^\+33\s*/, "")}`.replace(/ /g, NBSP);

export const SITE = {
	name: "Eva Biezunski",
	title: "Eva Biezunski, avocate au Barreau de Lyon",
	titleSuffix: " | Eva Biezunski",
	description:
		"Avocate au Barreau de Lyon, j’accompagne les professionnels libéraux et les entrepreneurs : choix de la société, statuts, contrats, patientèle, Ordre.",
	url: "https://biezunski-avocat.fr",
} as const;

export const HEADER = {
	logoLabel: "Eva Biezunski, avocate, retour à l’accueil",
	skipLink: "Aller au contenu",
	navLabel: "Menu principal",
	nav: {
		domaines: "Domaines",
		aPropos: "À propos",
		publications: "Publications",
	},
	domainesPanel: {
		all: "Tous les domaines",
	},
	cta: "Contacter le cabinet",
	phone: {
		name: `Appeler le cabinet au ${PHONE_DISPLAY}`,
	},
	call: {
		label: "Appeler",
		name: `Appeler le cabinet au ${PHONE_DISPLAY}`,
	},
	menu: {
		open: "Menu",
		close: "Fermer",
		email: {
			name: `Envoyer un email au cabinet : ${EMAIL}`,
		},
	},
} as const;

// #67 routes (no more hash anchors). « Contact » is the header CTA, not a nav link.
export const NAV_LINKS = [
	{ label: HEADER.nav.domaines, href: "/domaines" },
	{ label: HEADER.nav.aPropos, href: "/a-propos" },
	{ label: HEADER.nav.publications, href: "/publications" },
] as const;

export const BREADCRUMB = {
	label: "Fil d’Ariane",
	home: "Accueil",
	domaines: "Domaines",
	publications: "Publications",
} as const;

export const REVIEW = {
	footerLink: "Laisser un avis",
	externalSuffix: "(Google, s’ouvre dans un nouvel onglet)",
	articleLine: "Vous avez fait appel à moi ?",
	// Printed only once Eva agrees (E9c).
	shortUrl: "biezunski-avocat.fr/avis",
} as const;

export const FOOTER = {
	navLabel: "Pied de page",
	credential: "Avocate au Barreau de Lyon",
	address: {
		name: `${ADDRESS_LINE}, voir sur la carte (s’ouvre dans un nouvel onglet)`,
	},
	phone: {
		name: `Appeler le cabinet au ${PHONE_DISPLAY}`,
	},
	email: {
		name: `Envoyer un email au cabinet : ${EMAIL}`,
	},
	linkedin: {
		label: "LinkedIn",
		name: "Mon profil LinkedIn (s’ouvre dans un nouvel onglet)",
	},
	groups: {
		domaines: {
			title: "Domaines",
		},
		cabinet: {
			title: "Le cabinet",
			// → /a-propos, /publications, /contact, then REVIEW.footerLink.
			links: ["À propos", "Publications", "Contact", REVIEW.footerLink],
		},
	},
	copyright: `© ${new Date().getFullYear()} Eva Biezunski, avocate au Barreau de Lyon. Tous droits réservés.`,
	legalNotice: "Mentions légales",
	privacyPolicy: "Politique de confidentialité",
	credit: {
		prefix: "Site créé par ",
		name: "Guillaume Ojardias",
		suffix: "(s’ouvre dans un nouvel onglet)",
		href: "https://guillaume.ojardias.info",
	},
} as const;

export const CONTACT_BAND = {
	heading: "Parlons de votre situation",
	cta: "Contacter le cabinet",
	phoneLead: "Ou appelez-moi :",
	lines: {
		home: "Décrivez-moi votre projet en quelques lignes, ou appelez-moi. Je lis chaque demande.",
		domaines:
			"Vous ne savez pas quel domaine correspond à votre situation ? Écrivez-moi, nous la regarderons ensemble.",
		"creation-de-societe":
			"Vous créez ou réorganisez une société ? Décrivez-moi votre projet, ou appelez-moi.",
		"cession-clientele-patientele":
			"Vous préparez une cession ? Écrivez-moi avant la signature : je regarde le projet avec vous.",
		"contrats-professionnels":
			"Un contrat à signer ou à écrire ? Décrivez-moi la situation, ou appelez-moi.",
		"ordre-et-deontologie":
			"Votre Ordre vous a écrit, ou vous avez une question de déontologie ? Écrivez-moi ou appelez-moi.",
		publications: "Vous ne trouvez pas la réponse à votre question ? Écrivez-moi.",
		aPropos:
			"Vous voulez savoir si je peux vous aider ? Écrivez-moi quelques lignes, ou appelez-moi.",
	},
} as const;

/** Google reviews block: (a) rating + count + link is the default; (b) adds the quotes (E8c, `lead`). */
export type ReviewsVariant = "a" | "b";

// Every proof block is conditional: not rendered without its data (copy.md §1.7).
export const PROOF = {
	credentials: {
		// « Experte des professions libérales »: at most once per page, here only.
		items: ["Avocate au Barreau de Lyon depuis 2020", "Experte des professions libérales"],
	},
	professions:
		"Je travaille avec toutes les professions de santé libérales, avec les autres professions libérales et avec les entrepreneurs.",
	reviews: {
		variant: "a" as ReviewsVariant,
		heading: "Avis sur Google",
		attribution: "Avis publiés sur Google",
		// Fallback when the fetch fails or returns no review: this link alone.
		link: "Voir tous les avis sur Google",
		linkName: "Voir tous les avis sur Google (s’ouvre dans un nouvel onglet)",
		/** Variant (b) only: render these when `variant === "b"`. Review text is Google’s, never typed here. */
		quotes: {
			item: {
				meta: ({ author, date }: { author: string; date: string }) => `${author} · ${date}`,
				name: ({ author, date }: { author: string; date: string }) => `Avis de ${author}, ${date}`,
			},
		},
	},
	rating: {
		// `rating` with a decimal comma (« 4,8 »), from the Places API.
		line: ({ rating, count }: { rating: string; count: number | string }) =>
			`Note Google : ${rating} / 5 (${count} avis)`,
		// `date` as « 2 décembre 2026 », never relative.
		updated: ({ date }: { date: string }) => `Mis à jour le ${date}`,
	},
	portrait: {
		alt: "Portrait d’Eva Biezunski, avocate au Barreau de Lyon",
	},
} as const;

export const DOMAINES = {
	// Order (E3) is the order of the home, the hub, the panel and the footer. `hasPage`: all four pass
	// the launch gate (copy.md §14); a page ships only once Eva validates it, else set false and every
	// link goes to `/domaines#<slug>`.
	items: [
		{
			slug: "creation-de-societe",
			hasPage: true,
			label: "Création de sociétés",
			card: "Vous vous installez ou vous vous associez ? Je choisis avec vous la société adaptée, j’en rédige les statuts (ses règles de fonctionnement) et je fais les démarches devant votre Ordre.",
			hubSection: {
				text: "Je choisis avec vous la société adaptée à votre profession. Par exemple une société d’exercice libéral (SEL) pour exercer, ou une société civile de moyens (SCM) pour partager matériel et locaux. Je rédige les statuts, le document qui fixe les règles de la société, et je fais les démarches devant votre Ordre.",
			},
			metaTitle: "Créer une SEL ou une SCM à Lyon | Eva Biezunski",
			metaDescription:
				"Vous vous installez ou vous vous associez ? Avocate à Lyon, je choisis avec vous la société adaptée, je rédige les statuts et je fais les démarches.",
			h1: "Créer la société qui correspond à votre exercice",
			lead: "Une société d’exercice libéral (SEL) pour exercer, une société civile de moyens (SCM) pour partager matériel et locaux : je choisis la forme avec vous.",
			forWhom: {
				items: [
					"vous vous installez, seul ou à plusieurs",
					"vous vous associez avec un ou plusieurs confrères",
					"vous voulez mettre en commun du matériel ou des locaux",
					"vous exercez en votre nom propre (entrepreneur individuel) et vous voulez créer une société",
				],
			},
			whatIDo: {
				items: [
					"Je compare avec vous les formes de société possibles pour votre profession et je vous conseille la plus adaptée.",
					"Je rédige les statuts, le document qui fixe les règles de fonctionnement de la société.",
					"Je fais les démarches devant votre Ordre.",
				],
			},
			forms: {
				heading: "Les formes de société les plus courantes",
				items: [
					"Société d’exercice libéral (SEL) : société dans laquelle un professionnel libéral exerce sa profession. Elle peut être créée seul ou à plusieurs.",
					"Société civile de moyens (SCM) : société qui met en commun le matériel et les locaux, sans partager les honoraires.",
					"Société civile immobilière (SCI) : société qui détient un bien immobilier, par exemple les locaux de votre cabinet.",
					"Société de participations financières de professions libérales (SPFPL) : société qui détient les parts de votre société d’exercice.",
					"Société à responsabilité limitée (SARL) et société par actions simplifiée (SAS) : sociétés commerciales, pour une activité commerciale à côté de votre exercice.",
				],
			},
			how: {
				steps: [
					"Nous faisons le point sur votre profession, votre projet et vos associés éventuels.",
					"Je compare avec vous les formes possibles et je vous recommande l’une d’elles.",
					"Je rédige les statuts. Vous relisez, nous ajustons.",
					"Je fais les démarches devant votre Ordre.",
					"Dès la création, je prévois la suite : l’arrivée d’un associé, un départ, un changement de projet.",
				],
			},
			// 4 to 6 are composites: if the page feels long, cut from the end; the first three stay.
			situations: [
				{
					title: "Vous créez votre société",
					text: "Vous exercez seul ou avec des confrères et vous voulez une société. Je compare les formes possibles, je rédige les statuts et je fais les démarches devant votre Ordre.",
				},
				{
					title: "Un associé arrive",
					text: "Un confrère rejoint votre société. Je regarde ce que prévoient les statuts, je les adapte et je règle avec vous ce que cela change pour chacun.",
				},
				{
					title: "Un associé part",
					text: "L’un des associés quitte la société. Je règle avec vous les conditions de son départ : ses parts, ce que prévoient les statuts, la suite de l’activité.",
				},
				{
					title: "Un professionnel veut partager des locaux et du matériel",
					text: "Chacun garde ses propres honoraires, mais les locaux et le matériel sont communs. Je vous conseille une SCM et j’en rédige les statuts.",
				},
				{
					title: "Un entrepreneur individuel devient dirigeant",
					text: "Vous exercez en votre nom depuis des années et vous voulez créer une société. Je vous explique ce qui change pour vous, puis je rédige les statuts avec vous.",
				},
				{
					title: "Un professionnel veut acheter ses locaux",
					text: "Vous voulez détenir les locaux de votre cabinet sans les mettre dans votre société d’exercice. Je vous conseille sur une SCI distincte et j’en rédige les statuts.",
				},
			],
			faq: [
				{
					q: "Quelle société choisir pour exercer à plusieurs ?",
					a: "Cela dépend de votre profession, du nombre d’associés et de ce que vous mettez en commun. Certaines professions n’ont accès qu’à certaines formes de société. Je compare les options avec vous avant de vous recommander une forme.",
				},
				{
					q: "Dois-je prévenir mon Ordre quand je crée une société ?",
					a: "Dans de nombreuses professions réglementées, oui : l’Ordre doit être informé, parfois autorisé, avant ou après la création. La règle dépend de votre profession. Je vérifie avec vous ce que prévoit la vôtre.",
				},
				{
					q: "Qu’est-ce qu’un pacte d’associés, et en ai-je besoin ?",
					a: "C’est un accord privé entre associés qui complète les statuts, par exemple en cas de départ ou de désaccord. Il n’est pas obligatoire. Il règle à l’avance ce qui pourrait vous opposer plus tard.",
				},
				{
					q: "Combien cela coûte-t-il ?",
					a: "Avant de commencer, je vous remets une convention d’honoraires : un accord écrit qui fixe le prix de mon travail.",
				},
			],
			band: CONTACT_BAND.lines["creation-de-societe"],
		},
		{
			slug: "cession-clientele-patientele",
			hasPage: true,
			label: "Clientèle ou patientèle",
			card: "Vous reprenez ou vous cédez une clientèle ou une patientèle ? Je vous conseille sur la forme la plus adaptée, vente ou apport à une société, et je rédige l’acte avec vous.",
			hubSection: {
				text: "Une cession est la vente ou le transfert d’une clientèle ou d’une patientèle. Je vous conseille sur la forme la plus adaptée : cession ou apport à une société. Je rédige l’acte avec vous et je vérifie ce que demande votre Ordre.",
			},
			metaTitle: "Cession de patientèle ou de clientèle à Lyon | Eva Biezunski",
			metaDescription:
				"Vous cédez ou reprenez une patientèle ? Avocate à Lyon, je vous conseille sur la cession ou l’apport, et je rédige l’acte avec vous.",
			h1: "Céder ou reprendre une clientèle ou une patientèle",
			lead: "Une cession est la vente ou le transfert d’une clientèle ou d’une patientèle. Je vous conseille sur la forme la plus adaptée et je rédige l’acte.",
			forWhom: {
				items: [
					"vous reprenez la clientèle ou la patientèle d’un confrère",
					"vous cédez la vôtre, par exemple avant de partir à la retraite",
					"vous rejoignez une société et vous y apportez la vôtre",
				],
			},
			whatIDo: {
				// Items 2 and 3 are the sub-list of item 1 (copy.md §5).
				items: [
					"Je vous conseille sur la forme de l’opération :",
					"une cession, vente ou transfert à quelqu’un d’autre ;",
					"un apport, ce que vous mettez dans une société : argent, matériel ou clientèle ;",
					"Je rédige l’acte avec vous, et j’y prévois ce qui est cédé, à quelles conditions et quand.",
					"Je vérifie ce que demande votre Ordre pour cette opération.",
				],
			},
			how: {
				steps: [
					"Vous m’exposez votre projet : qui cède, qui reprend, ce qui est concerné.",
					"Je vous conseille sur la forme la plus adaptée et sur les points à régler avant de signer.",
					"Je rédige l’acte avec vous et je négocie avec l’autre partie si vous le souhaitez.",
					"Je vérifie ce que demande votre Ordre, puis vous signez en connaissance de cause.",
				],
			},
			situations: [
				{
					title: "Vous reprenez la patientèle d’un confrère",
					text: "Vous voulez savoir ce que vous achetez et comment votre Ordre voit l’opération. Je vérifie le projet, je vous conseille et je rédige l’acte.",
				},
				{
					title: "Vous cédez votre patientèle à un confrère",
					text: "Vous voulez un acte clair sur ce qui est cédé, à quel moment et comment vos patients sont informés. Je rédige l’acte et je négocie les conditions avec vous.",
				},
				{
					title: "Vous entrez dans une société et vous y apportez votre clientèle",
					text: "Votre apport doit être décrit et évalué dans l’acte. Je rédige avec vous les statuts et l’acte d’apport.",
				},
			],
			faq: [
				{
					q: "Quelle différence entre cession et apport ?",
					a: "Une cession transfère la clientèle contre un prix. Un apport la place dans une société, en échange de parts. Le bon choix dépend de votre projet.",
				},
				{
					q: "Mon Ordre doit-il être informé d’une cession ?",
					a: "Souvent oui : beaucoup d’Ordres demandent à être informés, voire à approuver l’opération. La règle dépend de votre profession. Je vérifie ce qui s’applique à vous avant la signature.",
				},
				{
					q: "Combien cela coûte-t-il ?",
					a: "Avant de commencer, je vous remets une convention d’honoraires : un accord écrit qui fixe le prix de mon travail.",
				},
			],
			band: CONTACT_BAND.lines["cession-clientele-patientele"],
		},
		{
			slug: "contrats-professionnels",
			hasPage: true,
			label: "Contrats professionnels",
			card: "Vous rejoignez un confrère, vous le remplacez ou vous exercez à ses côtés ? Je rédige et je négocie le contrat qui fixe les règles, y compris celles du départ.",
			hubSection: {
				text: "Je rédige et je négocie les contrats de votre exercice : collaboration, remplacement, exercice en commun, prestation de services. Chacun fixe vos droits, votre rémunération et les conditions d’un départ.",
			},
			metaTitle: "Contrats de collaboration et de remplacement | Eva Biezunski",
			metaDescription:
				"Collaboration, remplacement, exercice en commun : avocate à Lyon, je rédige et je négocie les contrats des professionnels libéraux.",
			h1: "Poser par écrit les règles de votre exercice",
			lead: "Vous rejoignez un confrère, vous le remplacez, vous exercez à ses côtés : je rédige et je négocie le contrat qui fixe les règles.",
			forWhom: {
				items: [
					"vous rejoignez un confrère comme collaborateur",
					"vous remplacez un confrère, ou vous cherchez un remplaçant",
					"vous partagez des locaux ou des charges avec d’autres professionnels",
					"vous faites appel à un prestataire, ou vous l’êtes",
				],
			},
			whatIDo: {
				items: [
					"Un contrat de collaboration : contrat où un professionnel travaille à son compte, pour un confrère, avec sa propre clientèle.",
					"Un contrat de remplacement : contrat par lequel un confrère exerce à votre place pendant votre absence.",
					"Un contrat d’exercice : contrat qui organise l’exercice commun de plusieurs professionnels, locaux, charges, départ.",
					"Un contrat de prestation de services : contrat où un professionnel réalise un travail précis pour un autre, contre rémunération.",
				],
			},
			how: {
				steps: [
					"Vous me décrivez la situation, et le projet de contrat si vous en avez un.",
					"Je vous dis ce qu’il prévoit, ce qui manque et ce que je vous conseille de négocier.",
					"Je rédige ou j’ajuste le contrat, et je négocie avec l’autre partie si vous le souhaitez.",
					"Je vous explique les clauses sur la rémunération, la clientèle et le départ, avant que vous signiez.",
				],
			},
			situations: [
				{
					title: "Un jeune professionnel est invité à collaborer avec un confrère",
					text: "On lui remet un contrat à signer. Je le lis avec lui, j’explique chaque clause (rémunération, clientèle, départ) et je négocie ce qui doit l’être.",
				},
				{
					title: "Un professionnel part en congé et cherche un remplaçant",
					text: "Il veut un contrat clair sur les dates, la rémunération et la clientèle ou la patientèle. Je rédige un contrat de remplacement adapté.",
				},
				{
					title: "Trois professionnels partagent des locaux et des charges",
					text: "Ils veulent écrire qui paie quoi, qui décide et comment l’un d’eux peut partir. Je rédige un contrat d’exercice en commun.",
				},
			],
			faq: [
				{
					q: "Un contrat de collaboration doit-il être écrit ?",
					a: "Dans de nombreuses professions, oui, et il doit parfois être transmis à l’Ordre. La règle dépend de votre profession. Je vérifie ce qui s’applique à vous.",
				},
				{
					q: "Que doit prévoir un contrat de remplacement ?",
					a: "Les dates, la rémunération, les conditions d’exercice et ce que devient la clientèle ou la patientèle à la fin. Je l’adapte à votre profession.",
				},
				{
					q: "Puis-je faire relire un contrat qu’on m’a déjà remis ?",
					a: "Oui, avant de signer. Contactez-moi : je vous dis ce qu’il prévoit, ce qui manque et ce que je vous conseille de négocier. Je vous indiquerai comment me le transmettre.",
				},
				{
					q: "Combien coûte la rédaction d’un contrat ?",
					a: "Avant de commencer, je vous remets une convention d’honoraires : un accord écrit qui fixe le prix de mon travail.",
				},
			],
			band: CONTACT_BAND.lines["contrats-professionnels"],
		},
		{
			slug: "ordre-et-deontologie",
			hasPage: true,
			label: "Ordre et déontologie",
			card: "Une question sur les règles de votre profession (la déontologie), un échange avec votre Ordre, une procédure disciplinaire ? Je vous conseille et, si besoin, je vous défends devant le Conseil de l’Ordre.",
			hubSection: {
				text: "Votre Ordre fixe la déontologie, les règles de conduite de votre profession. Je vous conseille sur vos questions et vos échanges avec lui. Si un litige s’ouvre devant l’Ordre (contentieux ordinal), je vous défends devant le Conseil de l’Ordre.",
			},
			metaTitle: "Ordre, déontologie et contentieux ordinal | Eva Biezunski",
			metaDescription:
				"Question de déontologie, échange avec votre Ordre, contentieux ordinal : avocate à Lyon, je conseille et je défends les professionnels libéraux.",
			h1: "Face à votre Ordre : un conseil, et une défense si besoin",
			lead: "Votre Ordre réunit les membres de votre profession et fixe sa déontologie, ses règles de conduite. Je vous conseille et, si besoin, je vous défends devant lui.",
			forWhom: {
				items: [
					"vous avez une question sur ce que votre profession permet",
					"votre Ordre vous écrit ou vous demande des explications",
					"une plainte ou une procédure disciplinaire vise votre exercice",
					"vous voulez vérifier un projet avant de le soumettre à votre Ordre",
				],
			},
			whatIDo: {
				items: [
					"Je vous conseille sur vos questions de déontologie : société, contrat, communication, secret professionnel.",
					"Je lis les courriers de votre Ordre avec vous et je prépare vos réponses.",
					"Je vérifie un projet (société, cession, contrat) au regard des règles de votre profession.",
					"Si une procédure s’ouvre, je vous défends devant le Conseil de l’Ordre.",
				],
			},
			contentieux: {
				heading: "Contentieux ordinal : l’Ordre vous met en cause",
				text: "Un litige devant l’Ordre (contentieux ordinal) peut venir, par exemple, d’une plainte ou d’une sanction. Je vous défends devant le Conseil de l’Ordre, l’instance élue qui représente votre profession.",
			},
			how: {
				steps: [
					"Vous m’exposez la situation et vous me transmettez les courriers de votre Ordre.",
					"Je regarde ce que prévoient les règles de votre profession.",
					"Je vous conseille sur la marche à suivre et je prépare vos réponses.",
					"Si une procédure s’ouvre, je vous défends devant le Conseil de l’Ordre.",
				],
			},
			situations: [
				{
					title: "Vous hésitez sur ce que votre déontologie permet",
					text: "Un projet vous inquiète : une société, un contrat, une communication. Je vérifie les règles de votre profession et je vous dis ce que vous pouvez faire.",
				},
				{
					title: "Votre Ordre vous demande des explications",
					text: "Vous avez reçu un courrier et vous ne savez pas comment répondre. Je le lis avec vous et je prépare la réponse.",
				},
				{
					title: "Une plainte est déposée contre vous",
					text: "Vous voulez une défense devant le Conseil de l’Ordre. Je prépare votre dossier et je vous défends.",
				},
			],
			faq: [
				{
					q: "Qu’est-ce qu’un litige devant l’Ordre ?",
					a: "C’est un litige porté devant l’Ordre de votre profession, par exemple après une plainte. Il peut aboutir à une sanction. Je vous conseille dès que vous recevez le premier courrier.",
				},
				{
					q: "Mon échange avec vous reste-t-il confidentiel ?",
					a: "Oui. Je suis tenue au secret professionnel : je ne révèle rien de ce que vous me confiez.",
				},
				{
					q: "Puis-je vous consulter avant que mon Ordre m’écrive ?",
					a: "Oui, et c’est souvent utile pour vérifier un projet. Une question de déontologie peut se régler avant tout litige.",
				},
				{
					q: "Que se passe-t-il si vous conseillez déjà la partie adverse ?",
					a: "Je ne peux pas vous conseiller : c’est un conflit d’intérêts, une situation où les intérêts d’un autre client s’opposent aux vôtres. Je vérifie ce point dès votre premier message.",
				},
			],
			band: CONTACT_BAND.lines["ordre-et-deontologie"],
		},
	],
	hub: {
		metaTitle: "Domaines d’intervention | Eva Biezunski",
		metaDescription:
			"Création de sociétés, clientèle ou patientèle, contrats, Ordre et déontologie : les domaines où j’accompagne les professionnels libéraux, à Lyon.",
		h1: "Mes domaines d’intervention",
		lead: "Quatre domaines, un même fil : structurer votre exercice libéral, en accord avec votre Ordre et vos associés. Choisissez celui qui ressemble à votre situation.",
		forWhom: {
			heading: "Pour qui",
			text: "Je travaille avec les professionnels de santé libéraux, les autres professions libérales et les entrepreneurs. Vous créez, vous reprenez ou vous réorganisez votre activité, ou votre Ordre, l’organisme qui réunit les membres de votre profession, vous interroge.",
		},
	},
	template: {
		forWhom: {
			heading: "Pour qui",
			intro: "Cette page s’adresse aux professionnels de santé, aux autres professions libérales et aux entrepreneurs. Elle vous concerne si :",
			professions: PROOF.professions,
		},
		whatIDo: {
			heading: "Ce que je fais",
		},
		how: {
			heading: "Comment je travaille",
		},
		situations: {
			heading: "Exemples de situations",
			note: "Ces exemples sont généraux. Ce ne sont pas des dossiers réels.",
		},
		exampleLabel: "Exemple",
		faq: {
			heading: "Questions fréquentes",
		},
		related: {
			heading: "Publications sur ce thème",
			// → /publications?category=<slug>; hidden when the domaine has no article.
			all: "Voir les publications sur ce thème",
		},
		others: {
			heading: "Autres domaines",
		},
	},
} as const;

export const HERO = {
	kicker: "Avocate au Barreau de Lyon",
	heading: "Structurer votre exercice libéral, en accord avec votre Ordre et vos associés.",
	subheading:
		"J’accompagne les professionnels de santé, les autres professions libérales et les entrepreneurs : leur société, leurs contrats et, pour les professions réglementées, leur Ordre.",
	cta: "Contacter le cabinet",
	phoneLead: "Ou appelez-moi :",
	panel: {
		lines: ["Barreau de Lyon", "Droit des sociétés, exercice libéral", ADDRESS_LINE],
		since: "Inscrite au Barreau depuis 2020",
	},
} as const;

export const PUBLICATIONS = {
	metaTitle: "Publications pour professionnels libéraux | Eva Biezunski",
	metaDescription:
		"Articles d’Eva Biezunski, avocate au Barreau de Lyon, pour les professionnels libéraux : sociétés, contrats, patientèle, Ordre et déontologie.",
	h1: "Publications : comprendre le droit de votre exercice",
	sectionTitle: "Publications",
	intro: "J’y explique en mots simples les questions juridiques que se posent les professionnels libéraux.",
	empty: "Aucune publication pour le moment. Revenez bientôt.",
	viewAll: "Voir toutes les publications",
	allCategories: "Toutes",
	filterLabel: "Filtrer par catégorie",
	moreCategories: "Plus de catégories",
	categoriesLabel: "Catégories de l’article",
	readMore: "Lire l’article",
	readMoreName: ({ title }: { title: string }) => `Lire l’article : ${title}`,
	by: "Par",
	previousPage: "Page précédente",
	nextPage: "Page suivante",
	pageLabel: "Page",
	// `backToList` removed (the breadcrumb replaces it). `coverAlt` removed: the cover is decorative,
	// alt="" unless the article has its own alt text.
} as const;

export const HOME = {
	metaTitle: SITE.title,
	metaDescription: SITE.description,
	domaines: {
		heading: "Comment je peux vous aider",
		// Cards: the four DOMAINES.items (label + card).
		all: "Tous les domaines",
	},
	proof: {
		heading: "Qui je suis",
		text: "Aider les professionnels libéraux à se structurer et à garder de bonnes relations avec leurs associés est le cœur de mon activité. Dès la création, je pense à la suite : vos projets, l’arrivée d’un associé, un départ.",
		link: "Mon parcours",
	},
	publications: {
		heading: "Mes publications récentes",
		intro: "J’y explique en mots simples les questions que se posent les professionnels libéraux.",
		viewAll: PUBLICATIONS.viewAll,
	},
} as const;

// « Comment ça se passe » (home, conditional: dropped as a whole if Eva rejects it).
export const FIRST_CONTACT = {
	heading: "Comment ça se passe",
	steps: [
		{
			title: "Vous m’écrivez ou vous m’appelez",
			text: "Par le formulaire, par email ou par téléphone, comme vous préférez. Dites-moi votre situation en quelques lignes.",
		},
		{
			title: "Je vous réponds",
			text: "Je vous réponds en général sous 48 heures.",
		},
		{
			title: "Vous préparez l’essentiel",
			text: "Apportez ce que vous avez : statuts ou projet de contrat, courriers de votre Ordre, dates importantes.",
		},
		{
			title: "Je vous indique mes honoraires",
			text: "Avant de commencer, je vous remets une convention d’honoraires : un accord écrit qui fixe le prix de mon travail.",
		},
	],
} as const;

export const ABOUT = {
	metaTitle: "Mon parcours d’avocate à Lyon | Eva Biezunski",
	metaDescription:
		"Eva Biezunski, avocate au Barreau de Lyon : son parcours et sa façon de travailler avec les professionnels libéraux et les entrepreneurs.",
	h1: "Qui je suis, et comment je travaille",
	lead: "Je suis avocate au Barreau de Lyon depuis 2020. J’aide les professionnels de santé, les autres professions libérales et les entrepreneurs à structurer leur activité.",
	portrait: {
		alt: PROOF.portrait.alt,
	},
	parcours: {
		heading: "Mon parcours",
		items: [...PROOF.credentials.items, PROOF.professions],
	},
	approche: {
		heading: "Ma façon de travailler",
	},
	paragraphs: [
		"Mon travail consiste à aider les professionnels libéraux à se structurer, et à garder de bonnes relations avec leurs associés.",
		"Je choisis avec vous la société et les contrats qui conviennent à votre projet, que votre activité soit réglementée ou entrepreneuriale.",
		"Dès la création, je pense à la suite : vos projets, l’arrivée d’un associé, un départ. Je règle en amont ce qui pourrait vous opposer plus tard.",
		"Je vous conseille aussi dans vos relations avec votre Ordre, l’organisme qui réunit les membres de votre profession. Je réponds à vos questions de déontologie, c’est-à-dire de règles de conduite.",
	],
	sectionTitle: "À propos",
	publications: {
		text: "J’écris des articles sur ces sujets.",
		link: "Voir toutes les publications",
	},
} as const;

export const CONTACT = {
	metaTitle: "Contacter le cabinet, avocate à Lyon | Eva Biezunski",
	metaDescription:
		"Trois façons de joindre Eva Biezunski, avocate au Barreau de Lyon : formulaire, téléphone, email. 29 rue du Président Édouard Herriot, 69002 Lyon.",
	h1: "Écrivez-moi ou appelez-moi",
	intro: "Décrivez votre situation en quelques lignes : je lis votre demande et je vous réponds. Si vous préférez, appelez-moi ou envoyez-moi un email.",
	addressParts: ADDRESS,
	address: ADDRESS_LINE,
	phone: PHONE,
	phoneDisplay: PHONE_DISPLAY,
	email: EMAIL,
	channels: {
		heading: "Trois façons de me joindre",
		phone: {
			label: "Téléphone",
			name: `Appeler le cabinet au ${PHONE_DISPLAY}`,
		},
		email: {
			label: "Email",
			name: `Envoyer un email au cabinet : ${EMAIL}`,
		},
		form: {
			label: "Formulaire",
			text: "Remplir le formulaire ci-dessous",
		},
	},
	// Replaces today's `sectionTitle`.
	formTitle: "Le formulaire",
	requiredLegend: "Les champs marqués d’un astérisque (*) sont obligatoires.",
	requiredMark: "obligatoire",
	formFields: {
		lastName: "Nom",
		firstName: "Prénom",
		email: "Email",
		phone: "Téléphone (facultatif)",
		subject: "Objet",
		customSubject: "Précisez l’objet",
		message: "Message",
		// Label of the hidden anti-spam field (never shown to people).
		honeypot: "Laisser ce champ vide",
		submit: "Envoyer mon message",
	},
	formHelp: {
		email: "Pour que je puisse vous répondre.",
		phone: "Si vous préférez que je vous rappelle.",
		message: "Décrivez votre situation en quelques lignes. N’envoyez pas de document confidentiel.",
	},
	formMessages: {
		sending: "Envoi en cours…",
		success: "Merci, j’ai bien reçu votre message. Je vous réponds en général sous 48 heures.",
		error: `Votre message n’a pas pu être envoyé. Réessayez, ou appelez-moi au ${PHONE_DISPLAY}, ou écrivez-moi à ${EMAIL}.`,
	},
	formErrors: {
		lastNameRequired: "Indiquez votre nom.",
		firstNameRequired: "Indiquez votre prénom.",
		emailRequired: "Indiquez votre email pour que je puisse vous répondre.",
		emailInvalid: "Cette adresse email semble incorrecte. Vérifiez-la.",
		messageRequired: "Écrivez votre message, même en quelques lignes.",
		customSubjectRequired: "Précisez l’objet de votre demande.",
		nameTooLong: `Raccourcissez votre nom ou votre prénom (${maxChars(CONTACT_LIMITS.name)}).`,
		emailTooLong: `Cet email est trop long (${maxChars(CONTACT_LIMITS.email)}).`,
		phoneTooLong: `Ce numéro est trop long (${maxChars(CONTACT_LIMITS.phone)}).`,
		subjectTooLong: `Raccourcissez l’objet (${maxChars(CONTACT_LIMITS.subject)}).`,
		messageTooLong: `Raccourcissez votre message (${maxChars(CONTACT_LIMITS.message)}).`,
		tooManyLinks: `Votre message contient trop de liens (${CONTACT_LIMITS.urls} au maximum). Supprimez-en.`,
		verificationFailed:
			"La vérification anti-spam n’a pas abouti. Réessayez dans quelques secondes, ou écrivez-moi par email, ou appelez-moi.",
	},
	// The four DOMAINES labels, then OTHER_SUBJECT (must stay last).
	subjectOptions: [
		"Création de sociétés",
		"Clientèle ou patientèle",
		"Contrats professionnels",
		"Ordre et déontologie",
		OTHER_SUBJECT,
	],
	gdpr: {
		text: "J’utilise vos données uniquement pour répondre à votre demande.",
		// → /politique-de-confidentialite
		link: "Lire la politique de confidentialité",
	},
	prepare: {
		heading: "Ce que vous pouvez m’indiquer",
		items: [
			"votre profession et, si elle existe, votre société",
			"votre projet ou votre question, en quelques lignes",
			"les dates importantes (signature, réponse de votre Ordre)",
			"les autres personnes concernées (associé, confrère), pour que je vérifie tout conflit d’intérêts (un autre client dont les intérêts s’opposent aux vôtres)",
		],
	},
	confidentiality: {
		heading: "Confidentialité",
		text: "Ce que vous m’écrivez est couvert par le secret professionnel. Pour un premier message, restez simple : n’envoyez pas de document confidentiel par ce formulaire. Je vous indiquerai comment me le transmettre.",
	},
	delay: {
		heading: "Délai de réponse",
		text: "Je vous réponds en général sous 48 heures. Pour une urgence, appelez-moi.",
	},
	addressBlock: {
		heading: "Adresse et accès",
		link: "Voir sur la carte (s’ouvre dans un nouvel onglet)",
		access: "Je vous reçois sur rendez-vous uniquement.",
	},
} as const;

export const ARTICLE = {
	byline: "Par Eva Biezunski",
	published: ({ date }: { date: string }) => `Publié le ${date}`,
	updated: ({ date }: { date: string }) => `Mis à jour le ${date}`,
	generalInfo:
		"Cet article donne une information générale. Il ne remplace pas un conseil adapté à votre situation.",
	authorCard: {
		name: "Eva Biezunski",
		credential: "Avocate au Barreau de Lyon",
		line: "J’écris pour les professionnels libéraux : sociétés, contrats, patientèle, Ordre.",
		// → /a-propos
		link: "Mon parcours",
	},
	// The line of the article's domaine (first category mapping to one), else `default`; then HEADER.cta.
	contact: {
		default: `Cet article touche à votre situation ? Écrivez-moi ou appelez-moi au ${PHONE_DISPLAY}.`,
		"creation-de-societe": `Vous créez ou réorganisez une société et vous voulez en parler ? Écrivez-moi ou appelez-moi au ${PHONE_DISPLAY}.`,
		"cession-clientele-patientele": `Vous reprenez ou vous cédez une clientèle ou une patientèle et vous voulez en parler ? Écrivez-moi ou appelez-moi au ${PHONE_DISPLAY}.`,
		"contrats-professionnels": `Un contrat à signer ou à négocier ? Écrivez-moi ou appelez-moi au ${PHONE_DISPLAY}.`,
		"ordre-et-deontologie": `Votre Ordre vous a écrit, ou vous avez une question de déontologie ? Écrivez-moi ou appelez-moi au ${PHONE_DISPLAY}.`,
	},
	domaineLink: ({ label }: { label: string }) => `Voir le domaine : ${label}`,
	related: {
		heading: "À lire aussi",
	},
} as const;

export const NOT_FOUND = {
	metaTitle: "Page introuvable | Eva Biezunski",
	title: "Je n’ai pas trouvé cette page",
	message:
		"Elle n’existe pas ou a été déplacée. Vérifiez l’adresse, ou reprenez depuis l’une des pages ci-dessous.",
	homeCta: "Retour à l’accueil",
	contactCta: "Contacter le cabinet",
	links: {
		// Then BREADCRUMB.home, HEADER.nav.domaines, HEADER.nav.publications and the phone link.
		label: "Pages principales",
	},
} as const;

export const ERROR_PAGE = {
	title: "Une erreur est survenue",
	message: `Un incident technique empêche l’affichage de cette page. Réessayez, ou appelez-moi au ${PHONE_DISPLAY}.`,
	retryCta: "Réessayer",
	homeCta: "Retour à l’accueil",
} as const;

// `global-error.tsx` (no header): phone and email as plain links.
export const GLOBAL_ERROR = {
	title: "Une erreur est survenue",
	message: `Un incident technique empêche l’affichage du site. Réessayez, ou appelez-moi au ${PHONE_DISPLAY}, ou écrivez-moi à ${EMAIL}.`,
	retryCta: "Réessayer",
	homeCta: "Retour à l’accueil",
} as const;

export const QR_CARD = {
	metaTitle: "Eva Biezunski, carte de visite",
	title: "Eva Biezunski",
	subtitle: "Avocate au Barreau de Lyon",
	saveContact: "Enregistrer le contact",
	visitWebsite: "Visiter le site",
	call: {
		label: "Téléphone",
	},
	email: {
		label: "Email",
	},
	address: {
		link: "Voir sur la carte (s’ouvre dans un nouvel onglet)",
	},
	review: REVIEW.footerLink,
	firefoxHint:
		"Sur Firefox, l’enregistrement du contact n’est pas pris en charge. Ouvrez cette page dans Safari, ou utilisez les liens ci-dessous.",
} as const;

// Privacy-policy edits (#66 §6, implemented by #80). Legal text: « le Cabinet », « Données » (R4).
export const PRIVACY = {
	edit1: {
		row: {
			// §3 table, new row: purpose, data, legal basis.
			measure: [
				"Mesure d’audience du Site",
				"Données techniques de navigation (pages vues, type d’appareil, pays, page de provenance), pseudonymisées puis agrégées ; aucun cookie",
				"Intérêt légitime du Cabinet à connaître la fréquentation de son Site",
			],
			// §3 table, row « Gestion des demandes de contact », cell 2.
			contact: "Nom, prénom, email, téléphone, objet, contenu du message",
		},
	},
	edit2: {
		processors:
			"À nos sous-traitants techniques : Vercel Inc. (hébergement, détection des robots, mesure d’audience) et Brevo (acheminement des emails du formulaire) ;",
	},
	edit3: {
		row: {
			retention: ["Mesure d’audience", "25 mois maximum"],
		},
	},
	edit4: {
		transfer:
			"Vos Données sont stockées dans l’Espace Économique Européen (« EEE ») lorsque c’est possible. Vercel Inc. est une société établie aux États-Unis. Les Données qu’elle traite peuvent y être transférées, selon le Data Privacy Framework UE-États-Unis ou les clauses contractuelles types de son accord.",
	},
	edit5: {
		objection: `Mesure d’audience. Le Site mesure sa fréquentation avec des outils qui ne déposent aucun cookie et ne vous suivent pas d’un site à l’autre. Vous pouvez vous opposer à cette mesure à tout moment, en écrivant à ${EMAIL}.`,
		updated: ({ date }: { date: string }) => `Date de dernière mise à jour : ${date}`,
	},
} as const;

/**
 * Glossary (editorial-guide §4), the source for tooltips or « À savoir » lines and for the acronym
 * rule of `check-copy.ts`. `inline` is the form to write on first use on a page; `acronym` is set for
 * acronyms. `onSite: false` rows are kept for later and not used by `copy.md`.
 */
export const GLOSSARY = [
	// §4.2 Acronyms and company forms
	{ term: "SEL", acronym: true, onSite: true, inline: "société d’exercice libéral (SEL)", gloss: "Société dans laquelle un professionnel libéral exerce sa profession." },
	{ term: "SELARL", acronym: true, onSite: false, inline: "société d’exercice libéral à responsabilité limitée (SELARL)", gloss: "Société d’exercice libéral où les associés ne répondent des dettes qu’à hauteur de leurs apports." },
	{ term: "SELAS", acronym: true, onSite: false, inline: "société d’exercice libéral par actions simplifiée (SELAS)", gloss: "Société d’exercice libéral dont les statuts organisent librement la direction et les relations entre associés." },
	{ term: "SELU", acronym: true, onSite: false, inline: "société d’exercice libéral unipersonnelle (SELU)", gloss: "Société d’exercice libéral créée et détenue par une seule personne." },
	{ term: "SCM", acronym: true, onSite: true, inline: "société civile de moyens (SCM)", gloss: "Société qui met en commun le matériel et les locaux, sans partager les honoraires." },
	{ term: "SCP", acronym: true, onSite: false, inline: "société civile professionnelle (SCP)", gloss: "Société où des professionnels exercent ensemble leur profession libérale." },
	{ term: "SCI", acronym: true, onSite: true, inline: "société civile immobilière (SCI)", gloss: "Société qui détient un bien immobilier, par exemple les locaux de votre cabinet." },
	{ term: "SPFPL", acronym: true, onSite: true, inline: "société de participations financières de professions libérales (SPFPL)", gloss: "Société qui détient les parts de votre société d’exercice." },
	{ term: "SARL", acronym: true, onSite: true, inline: "société à responsabilité limitée (SARL)", gloss: "Société commerciale où la responsabilité des associés est limitée à leurs apports." },
	{ term: "SAS", acronym: true, onSite: true, inline: "société par actions simplifiée (SAS)", gloss: "Société commerciale aux statuts très libres, avec un ou plusieurs associés." },
	{ term: "EURL", acronym: true, onSite: false, inline: "entreprise unipersonnelle à responsabilité limitée (EURL)", gloss: "Société à responsabilité limitée créée et détenue par une seule personne." },
	{ term: "SASU", acronym: true, onSite: false, inline: "société par actions simplifiée unipersonnelle (SASU)", gloss: "Société par actions simplifiée créée et détenue par une seule personne." },
	{ term: "RGPD", acronym: true, onSite: true, inline: "règlement général sur la protection des données (RGPD)", gloss: "Règlement européen qui protège vos données personnelles." },
	{ term: "CNIL", acronym: true, onSite: true, inline: "Commission nationale de l’informatique et des libertés (CNIL)", gloss: "Autorité française qui contrôle l’usage des données personnelles." },
	// §4.3 Operations and documents
	{ term: "statuts", acronym: false, onSite: true, inline: "les statuts", gloss: "Document qui fixe les règles de fonctionnement de la société." },
	{ term: "pacte d’associés", acronym: false, onSite: true, inline: "un pacte d’associés", gloss: "Accord privé entre associés qui complète les statuts, par exemple en cas de départ." },
	{ term: "apport", acronym: false, onSite: true, inline: "un apport", gloss: "Ce qu’un associé met dans la société : argent, matériel ou clientèle." },
	{ term: "cession", acronym: false, onSite: true, inline: "une cession", gloss: "Vente ou transfert d’une clientèle, de parts ou d’un bien à quelqu’un d’autre." },
	{ term: "fonds libéral", acronym: false, onSite: true, inline: "le fonds libéral", gloss: "Ce qu’on achète en reprenant une activité libérale : patientèle, matériel, bail." },
	{ term: "prêt de clientèle", acronym: false, onSite: false, inline: "un prêt de clientèle", gloss: "Mise à disposition temporaire d’une clientèle, sans la vendre." },
	{ term: "clause de non-réinstallation", acronym: false, onSite: false, inline: "une clause de non-réinstallation", gloss: "Engagement de ne pas rouvrir un cabinet près de l’ancien après une cession." },
	{ term: "convention d’honoraires", acronym: false, onSite: true, inline: "une convention d’honoraires", gloss: "Accord écrit qui fixe le prix de mon travail avant que je commence." },
	{ term: "honoraires", acronym: false, onSite: true, inline: "mes honoraires", gloss: "Le prix de mon travail d’avocate." },
	{ term: "contrat de collaboration", acronym: false, onSite: true, inline: "un contrat de collaboration", gloss: "Contrat où un professionnel travaille à son compte, pour un confrère, avec sa propre clientèle." },
	{ term: "contrat de remplacement", acronym: false, onSite: true, inline: "un contrat de remplacement", gloss: "Contrat par lequel un confrère exerce à votre place pendant votre absence." },
	{ term: "contrat d’exercice", acronym: false, onSite: true, inline: "un contrat d’exercice", gloss: "Contrat qui organise l’exercice commun de plusieurs professionnels : locaux, charges, départ." },
	{ term: "contrat de prestation de services", acronym: false, onSite: true, inline: "un contrat de prestation de services", gloss: "Contrat où un professionnel réalise un travail précis pour un autre, contre rémunération." },
	{ term: "entrepreneur individuel", acronym: false, onSite: true, inline: "entrepreneur individuel", gloss: "Vous exercez en votre nom propre, sans créer de société." },
	{ term: "dirigeant", acronym: false, onSite: true, inline: "dirigeant", gloss: "Personne qui dirige une société et l’engage envers les tiers." },
	{ term: "conflit d’intérêts", acronym: false, onSite: true, inline: "un conflit d’intérêts", gloss: "Les intérêts d’un autre client s’opposent aux vôtres : je ne peux pas vous conseiller." },
	// §4.4 Ordre, déontologie, contentieux
	{ term: "Ordre", acronym: false, onSite: true, inline: "votre Ordre", gloss: "Organisme qui réunit les membres d’une profession réglementée et en fixe les règles." },
	{ term: "Conseil de l’Ordre", acronym: false, onSite: true, inline: "le Conseil de l’Ordre", gloss: "Instance élue qui représente votre profession et veille au respect de ses règles." },
	{ term: "chambre disciplinaire", acronym: false, onSite: false, inline: "la chambre disciplinaire", gloss: "Juridiction de l’Ordre qui juge les manquements aux règles de la profession." },
	{ term: "contentieux ordinal", acronym: false, onSite: true, inline: "un litige devant l’Ordre (contentieux ordinal)", gloss: "Litige devant l’Ordre de votre profession, par exemple une plainte ou une sanction." },
	{ term: "déontologie", acronym: false, onSite: true, inline: "la déontologie", gloss: "Règles de conduite propres à une profession, par exemple le secret professionnel." },
	{ term: "secret professionnel", acronym: false, onSite: true, inline: "le secret professionnel", gloss: "Obligation de ne rien révéler de ce que vous me confiez." },
	{ term: "profession réglementée", acronym: false, onSite: true, inline: "profession réglementée", gloss: "Profession dont l’accès et l’exercice sont encadrés par la loi et un Ordre." },
	{ term: "profession libérale", acronym: false, onSite: true, inline: "profession libérale", gloss: "Profession exercée de façon indépendante, sous sa propre responsabilité." },
	{ term: "Barreau", acronym: false, onSite: true, inline: "Barreau de Lyon", gloss: "Ordre des avocats de Lyon, auquel je suis inscrite." },
] as const;
