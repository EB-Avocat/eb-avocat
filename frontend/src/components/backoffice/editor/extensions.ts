import type { AnyExtension } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";

/**
 * Editor schema. Limited to what the backend Markdown renderer (markdown-it +
 * tables, strikethrough, task lists, footnotes) turns into HTML, so what you see
 * in the editor is what gets published.
 */
export function articleExtensions(extra: AnyExtension[] = []): AnyExtension[] {
	return [
		StarterKit.configure({
			heading: { levels: [2, 3, 4] },
			link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
			// Underline has no Markdown syntax: it would be lost on save.
			underline: false,
		}),
		Image.configure({ inline: false }),
		TableKit.configure({ table: { resizable: false } }),
		TaskList,
		TaskItem.configure({ nested: true }),
		Placeholder.configure({ placeholder: "Écrivez, ou tapez « / » pour insérer un bloc…" }),
		Markdown,
		...extra,
	];
}
