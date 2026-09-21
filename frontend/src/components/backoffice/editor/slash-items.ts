import type { Editor, Range } from "@tiptap/core";
import {
	CheckSquare,
	Code,
	Heading2,
	Heading3,
	Heading4,
	ImageIcon,
	List,
	ListOrdered,
	type LucideIcon,
	Minus,
	Pilcrow,
	Quote,
	Table,
} from "lucide-react";

export interface SlashItem {
	title: string;
	description: string;
	icon: LucideIcon;
	keywords: string[];
	run: (editor: Editor, range: Range) => void;
}

/** Blocks offered by the "/" menu. `pickImage` opens the file picker and uploads. */
export function slashItems(pickImage: (editor: Editor) => void): SlashItem[] {
	const chain = (editor: Editor, range: Range) => editor.chain().focus().deleteRange(range);
	return [
		{
			title: "Texte",
			description: "Paragraphe simple",
			icon: Pilcrow,
			keywords: ["paragraphe", "texte", "p"],
			run: (e, r) => chain(e, r).setParagraph().run(),
		},
		{
			title: "Titre 2",
			description: "Titre de section",
			icon: Heading2,
			keywords: ["titre", "h2", "heading"],
			run: (e, r) => chain(e, r).setHeading({ level: 2 }).run(),
		},
		{
			title: "Titre 3",
			description: "Sous-titre",
			icon: Heading3,
			keywords: ["titre", "h3", "sous-titre"],
			run: (e, r) => chain(e, r).setHeading({ level: 3 }).run(),
		},
		{
			title: "Titre 4",
			description: "Petit intertitre",
			icon: Heading4,
			keywords: ["titre", "h4"],
			run: (e, r) => chain(e, r).setHeading({ level: 4 }).run(),
		},
		{
			title: "Liste à puces",
			description: "Liste non ordonnée",
			icon: List,
			keywords: ["liste", "puces", "ul"],
			run: (e, r) => chain(e, r).toggleBulletList().run(),
		},
		{
			title: "Liste numérotée",
			description: "Liste ordonnée",
			icon: ListOrdered,
			keywords: ["liste", "numéros", "ol"],
			run: (e, r) => chain(e, r).toggleOrderedList().run(),
		},
		{
			title: "Liste de tâches",
			description: "Cases à cocher",
			icon: CheckSquare,
			keywords: ["tâches", "todo", "checkbox"],
			run: (e, r) => chain(e, r).toggleTaskList().run(),
		},
		{
			title: "Citation",
			description: "Bloc de citation",
			icon: Quote,
			keywords: ["citation", "quote"],
			run: (e, r) => chain(e, r).toggleBlockquote().run(),
		},
		{
			title: "Code",
			description: "Bloc de code",
			icon: Code,
			keywords: ["code", "pre"],
			run: (e, r) => chain(e, r).toggleCodeBlock().run(),
		},
		{
			title: "Tableau",
			description: "Tableau 3 × 3",
			icon: Table,
			keywords: ["tableau", "table"],
			run: (e, r) => chain(e, r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
		},
		{
			title: "Image",
			description: "Importer une image",
			icon: ImageIcon,
			keywords: ["image", "photo", "illustration"],
			run: (e, r) => {
				chain(e, r).run();
				pickImage(e);
			},
		},
		{
			title: "Séparateur",
			description: "Ligne horizontale",
			icon: Minus,
			keywords: ["séparateur", "ligne", "hr"],
			run: (e, r) => chain(e, r).setHorizontalRule().run(),
		},
	];
}

/** Case- and accent-insensitive filter on title + keywords. */
export function filterSlashItems(items: SlashItem[], query: string): SlashItem[] {
	const normalize = (s: string) =>
		s
			.toLowerCase()
			.normalize("NFD")
			.replace(/\p{Diacritic}/gu, "");
	const q = normalize(query.trim());
	if (!q) return items;
	return items.filter((item) =>
		[item.title, ...item.keywords].some((k) => normalize(k).includes(q)),
	);
}
