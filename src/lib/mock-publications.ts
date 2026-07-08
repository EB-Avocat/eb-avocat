import type { Author, Publication } from "./publications-parse";

// Fixtures served when NOTION_TOKEN is absent (local dev, CI, tests) so the whole
// Publications UI — list, filter, pagination, article body — renders without any
// Notion/Blob credentials. Mirrors the reference site's `mock-posts` idea.

export const useMocks = !process.env.NOTION_TOKEN;

const eva: Author = {
	name: "Eva Biezunski",
	avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop",
};

const BODY = `
	<p>Cet article de démonstration s'affiche lorsque aucun jeton Notion n'est configuré. Il permet de vérifier le rendu en local et pendant les tests, sans dépendre de Notion ni de Vercel Blob.</p>
	<h2>Un premier point</h2>
	<p>Le texte conserve la mise en forme : du <strong>gras</strong>, de l'<em>italique</em>, et des listes.</p>
	<ul>
		<li>Premier élément</li>
		<li>Deuxième élément</li>
		<li>Troisième élément</li>
	</ul>
	<h2>Un second point</h2>
	<blockquote>Une citation pour illustrer le rendu des blocs Notion.</blockquote>
	<p>En production, ce contenu est remplacé par le corps réel de la page Notion.</p>
`;

type MockEntry = { publication: Publication; html: string };

const entries: MockEntry[] = [
	{
		publication: {
			id: "mock-sel",
			slug: "structurer-son-activite-en-sel",
			title: "Structurer son activité libérale en SEL",
			header:
				"Pourquoi et comment passer en société d'exercice libéral : fiscalité, responsabilité et relations avec l'Ordre.",
			category: "Droit des sociétés",
			date: "2026-05-12",
			cover: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=675&fit=crop",
			author: eva,
		},
		html: BODY,
	},
	{
		publication: {
			id: "mock-cession",
			slug: "ceder-sa-patientele",
			title: "Céder sa patientèle en toute sécurité",
			header: "Prêt, cession ou apport : le choix de l'opération qui sécurise votre fonds libéral.",
			category: "Clientèle / Patientèle",
			date: "2026-04-03",
			cover: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&h=675&fit=crop",
			author: eva,
		},
		html: BODY,
	},
	{
		publication: {
			id: "mock-contrat",
			slug: "contrat-de-collaboration-liberale",
			title: "Le contrat de collaboration libérale",
			header: "Les clauses essentielles d'un contrat de collaboration équilibré.",
			category: "Contrats professionnels",
			// No cover — exercises the placeholder path on cards.
			date: "2026-02-18",
			author: eva,
		},
		html: BODY,
	},
	{
		publication: {
			id: "mock-actu",
			slug: "actualite-jurisprudence-ordinale",
			title: "Actualité : jurisprudence ordinale",
			header: "Retour sur une décision récente devant le Conseil de l'Ordre.",
			category: "Actualités",
			date: "2026-01-09",
			cover: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=675&fit=crop",
			// No author — exercises the missing-author path.
		},
		html: BODY,
	},
];

/** Mock publications, newest first (matching the real Notion `pubDate` sort). */
export const mockPublications: Publication[] = entries
	.map((entry) => entry.publication)
	.sort((a, b) => b.date.localeCompare(a.date));

const htmlById = new Map(entries.map((entry) => [entry.publication.id, entry.html]));

/** Pre-rendered mock body HTML for a publication id. */
export function getMockHtml(id: string): string | undefined {
	return htmlById.get(id);
}
