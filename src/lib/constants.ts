export const SITE = {
	name: "Eva Biezunski",
	title: "Eva Biezunski Avocate, Cabinet dédié aux professionnels libéraux",
	description:
		"Cabinet d'avocat dédié aux professionnels libéraux : création de sociétés, clientèle/patientèle, contrats professionnels, contentieux, mécénat et formations.",
	url: "https://biezunski-avocat.fr",
} as const;

export const REVIEW_URL = "https://maps.app.goo.gl/qjynjiyhA1APuACL8";
export const LINKEDIN_URL = "https://www.linkedin.com/in/eva-biezunski-36a4b691/";

// Subject value that reveals the free-text "Précisez l'objet" field in the contact form.
export const OTHER_SUBJECT = "Autre";

export const NAV_LINKS = [
	{ label: "Accueil", href: "#accueil" },
	{ label: "À propos", href: "#a-propos" },
	{ label: "Domaines d'intervention", href: "#domaines-intervention" },
	{ label: "Témoignages", href: "#temoignages" },
	{ label: "Contact", href: "#contact" },
] as const;

export const HERO = {
	heading: "Avocate en droit des sociétés",
	subheading: "Cabinet d'avocat dédié aux professionnels libéraux",
	cta: "Prendre rendez-vous",
} as const;

export const ABOUT = {
	sectionTitle: "À propos",
	paragraphs: [
		"Aider les professionnels libéraux à se structurer et à entretenir des relations harmonieuses est le cœur de l'activité d'Eva.",
		"Elle détermine aux côtés des professionnels libéraux le type de sociétés, les contrats les plus adaptés à leurs projets, qu'ils relèvent de leur activité professionnelle réglementée, ou de démarches entrepreneuriales.",
		"Elle anticipe le développement de ces activités, afin de proposer un cadre adapté dès la création du projet tout en prenant en compte les ambitions futures de ses clients. Elle apporte une attention particulière aux relations entre associés en traitant en amont les sujets de friction éventuels.",
		"Son accompagnement se poursuit pour trouver des réponses adaptées aux questions déontologiques, et dans leurs relations avec les Ordres professionnels.",
	],
} as const;

export const SERVICES = {
	sectionTitle: "Domaines d'intervention",
	items: [
		{
			icon: "building",
			title: "Création de sociétés",
			description:
				"Je vous guide dans la création de structures adaptées à vos besoins, pour votre activité (SEL), pour votre matériel (SCM), pour vos locaux (SCI), pour vos activités commerciales (SARL, SAS), pour une restructuration (SPFPL), de la rédaction des statuts aux démarches devant les Ordres.",
		},
		{
			icon: "handshake",
			title: "Clientèle / Patientèle",
			description:
				"Prêt, cession, apport : je vous conseille pour déterminer l'opération qui vous correspond pour sécuriser votre fonds libéral.",
		},
		{
			icon: "document",
			title: "Contrats professionnels",
			description:
				"Je rédige et je négocie des contrats d'exercice libéral, de collaboration, de remplacement, de prestation de services.",
		},
		{
			icon: "scale",
			title: "Contentieux",
			description: "Je représente les professionnels libéraux devant les Conseils de l'Ordre.",
		},
		{
			icon: "heart",
			title: "Mécénat",
			description:
				"J'aide les porteurs de projets dans la création d'associations, de fonds de dotation.",
		},
		{
			icon: "graduation",
			title: "Formations",
			description:
				"Auprès des Élèves-avocats, des Confrères, d'entrepreneurs, j'interviens pour leur parler de structures d'exercice, de passage du statut d'entrepreneur individuel à celui de dirigeant de société, d'activités commerciales pour les avocats, etc.",
		},
	],
} as const;

export const TESTIMONIALS = {
	sectionTitle: "Témoignages",
	items: [
		{
			quote:
				"Maître Biezunski, une femme d'exception, parfaitement disponible et efficace, m'a accompagnée à quitter mon cabinet infirmier. Son professionnalisme et sa réactivité m'ont permis de vivre cette période sereinement. Ses explications et ses conseils étaient pertinents. Je recommande vivement.",
			author: "N.F.",
		},
		{
			quote:
				"Je suis très satisfait de l'accompagnement de Me Biezunski pour la création de ma société et de mon statut d'auto-entrepreneur, et la mise en relation avec d'autres professionnels compétents (avocat en droit de la propriété intellectuelle, expert-comptable). Grâce à elle, je me sens sécurisé pour le lancement de mon activité.",
			author: "G.O.",
		},
	],
} as const;

const ADDRESS = {
	street: "29 rue du Président Édouard Herriot",
	postalCode: "69002",
	city: "Lyon",
	country: "France",
	countryCode: "FR",
} as const;

export const CONTACT = {
	sectionTitle: "Contact",
	addressParts: ADDRESS,
	address: `${ADDRESS.street}, ${ADDRESS.postalCode} ${ADDRESS.city}`,
	phone: "+33 7 56 85 62 75",
	email: "eva@biezunski-avocat.fr",
	formFields: {
		lastName: "Nom",
		firstName: "Prénom",
		email: "Email",
		phone: "Téléphone",
		subject: "Objet",
		customSubject: "Précisez l'objet",
		message: "Message",
		submit: "Envoyer",
	},
	formMessages: {
		sending: "Envoi en cours…",
		success: "Merci, votre message a bien été envoyé. Eva vous répondra rapidement.",
		error: "Une erreur est survenue. Veuillez réessayer ou nous contacter par téléphone.",
	},
	formErrors: {
		lastNameRequired: "Le nom est requis.",
		firstNameRequired: "Le prénom est requis.",
		emailRequired: "L'email est requis.",
		emailInvalid: "L'email est invalide.",
		messageRequired: "Le message est requis.",
		customSubjectRequired: "Veuillez préciser l'objet.",
	},
	subjectOptions: [
		"Création de société",
		"Clientèle / Patientèle",
		"Contrats professionnels",
		"Contentieux",
		"Mécénat",
		"Formation",
		OTHER_SUBJECT,
	],
} as const;

export const QR_CARD = {
	title: "Eva Biezunski",
	subtitle: "Avocate au Barreau de Lyon",
	saveContact: "Enregistrer le contact",
	visitWebsite: "Visiter le site web",
	firefoxHint:
		"Sur Firefox, l'enregistrement du contact n'est pas pris en charge. Ouvrez cette page dans Safari, ou utilisez les liens ci-dessous.",
} as const;

export const FOOTER = {
	copyright: `\u00A9 ${new Date().getFullYear()} Eva Biezunski - Avocate au Barreau de Lyon. Tous droits réservés.`,
	legalNotice: "Mentions légales",
	privacyPolicy: "Politique de confidentialité",
} as const;

export const NOT_FOUND = {
	metaTitle: "Page introuvable — Eva Biezunski Avocate",
	title: "Nous n'avons pas trouvé cette page",
	message:
		"La page que vous recherchez n'existe pas ou a été déplacée. Vérifiez l'adresse saisie ou revenez à l'accueil.",
	homeCta: "Retour à l'accueil",
	contactCta: "Nous contacter",
} as const;

export const ERROR_PAGE = {
	title: "Une erreur est survenue",
	message:
		"Un incident technique nous empêche d'afficher cette page. Vous pouvez réessayer ; si le problème persiste, n'hésitez pas à nous contacter.",
	retryCta: "Réessayer",
	homeCta: "Retour à l'accueil",
} as const;
