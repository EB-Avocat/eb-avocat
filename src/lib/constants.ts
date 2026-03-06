export const SITE = {
	name: "Eva Biezunski",
	title: "Eva Biezunski - Avocate en droit des affaires",
	description:
		"Cabinet d'avocat spécialisé en droit des affaires pour les professionnels de santé libéraux. Conseil juridique, création de sociétés, cession de patientèle.",
	url: "https://eva-biezunski-avocate.fr",
} as const;

export const NAV_LINKS = [
	{ label: "Accueil", href: "#accueil" },
	{ label: "À propos", href: "#a-propos" },
	{ label: "Services", href: "#services" },
	{ label: "Témoignages", href: "#temoignages" },
	{ label: "Contact", href: "#contact" },
] as const;

export const HERO = {
	heading: "Votre avocate en droit des affaires",
	subheading: "Spécialisée dans l'accompagnement juridique des professionnels de santé libéraux",
	cta: "Prendre rendez-vous",
} as const;

export const ABOUT = {
	sectionTitle: "À propos",
	paragraphs: [
		"Me Eva Biezunski est avocate au Barreau de Lyon, spécialisée en droit des affaires et plus particulièrement dans l'accompagnement des professionnels de santé libéraux.",
		"Forte d'une expérience approfondie dans le conseil aux médecins, dentistes, kinésithérapeutes et autres praticiens, elle propose un accompagnement juridique sur mesure, adapté aux spécificités de chaque profession.",
		"Son approche allie rigueur juridique et écoute attentive, afin de fournir des solutions pragmatiques et personnalisées à chacun de ses clients.",
	],
} as const;

export const SERVICES = {
	sectionTitle: "Domaines d'intervention",
	items: [
		{
			title: "Création de sociétés",
			description:
				"Accompagnement dans la création de structures d'exercice : SEL, SELARL, SELAS, SCM, SCI. Rédaction des statuts et formalités.",
		},
		{
			title: "Cession de patientèle",
			description:
				"Conseil et rédaction des actes de cession de patientèle, négociation des conditions et sécurisation juridique de la transaction.",
		},
		{
			title: "Contrats professionnels",
			description:
				"Rédaction et négociation de contrats d'exercice, de collaboration, de remplacement, baux professionnels et conventions entre praticiens.",
		},
		{
			title: "Conseil juridique",
			description:
				"Conseil permanent en droit des affaires, droit des sociétés et droit médical. Accompagnement dans les décisions stratégiques.",
		},
		{
			title: "Contentieux",
			description:
				"Représentation et défense devant les juridictions compétentes. Gestion des litiges commerciaux et professionnels.",
		},
		{
			title: "Mise en conformité",
			description:
				"Audit juridique et mise en conformité réglementaire. RGPD, obligations professionnelles et normes sectorielles.",
		},
	],
} as const;

export const TESTIMONIALS = {
	sectionTitle: "Témoignages",
	items: [
		{
			quote:
				"Me Biezunski m'a accompagné dans la création de ma SELARL avec un professionnalisme remarquable. Elle a su rendre accessible des notions juridiques complexes et m'a guidé à chaque étape.",
			author: "Dr. Martin D.",
			profession: "Médecin généraliste",
		},
		{
			quote:
				"Lors de la cession de mon cabinet dentaire, j'ai pu compter sur les conseils avisés de Me Biezunski. Sa rigueur et sa disponibilité ont été déterminantes pour le succès de cette opération.",
			author: "Dr. Sophie L.",
			profession: "Chirurgien-dentiste",
		},
		{
			quote:
				"Un accompagnement juridique de grande qualité pour la rédaction de nos contrats de collaboration. Me Biezunski comprend parfaitement les enjeux spécifiques de notre profession.",
			author: "Dr. Pierre M.",
			profession: "Kinésithérapeute",
		},
	],
} as const;

export const CONTACT = {
	sectionTitle: "Contact",
	address: "12 rue de l'Exemple, 69001 Lyon",
	phone: "+33 7 56 85 62 75",
	email: "eva@biezunski-avocat.fr",
	formFields: {
		lastName: "Nom",
		firstName: "Prénom",
		email: "Email",
		phone: "Téléphone",
		subject: "Objet",
		message: "Message",
		submit: "Envoyer",
	},
	subjectOptions: [
		"Création de société",
		"Cession de patientèle",
		"Contrat professionnel",
		"Conseil juridique",
		"Contentieux",
		"Autre",
	],
} as const;

export const FOOTER = {
	copyright: `\u00A9 ${new Date().getFullYear()} Eva Biezunski - Avocate au Barreau de Lyon. Tous droits réservés.`,
	legalNotice: "Mentions légales",
	privacyPolicy: "Politique de confidentialité",
} as const;
