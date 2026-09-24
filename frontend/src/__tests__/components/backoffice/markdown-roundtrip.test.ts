import { Editor } from "@tiptap/core";
import { afterEach, describe, expect, it } from "vitest";
import { articleExtensions } from "@/components/backoffice/editor/extensions";
import { splitWidth } from "@/components/backoffice/editor/figure";
import { filterSlashItems, slashItems } from "@/components/backoffice/editor/slash-items";

let editor: Editor | null = null;

function load(markdown: string): Editor {
	editor = new Editor({
		extensions: articleExtensions(),
		content: markdown,
		contentType: "markdown",
	});
	return editor;
}

afterEach(() => {
	editor?.destroy();
	editor = null;
});

describe("editor Markdown round-trip", () => {
	it.each([
		["headings", "## Section\n\n### Sous-section"],
		["inline marks", "Du **gras**, de l'*italique*, du ~~barré~~ et du `code`."],
		["links", "Voir [le site](https://example.com)."],
		["bullet list", "- un\n- deux"],
		["ordered list", "1. un\n2. deux"],
		["blockquote", "> Une citation"],
		["image", "![Un cabinet](https://example.com/a.png)"],
	])("keeps %s intact", (_name, markdown) => {
		expect(load(markdown).getMarkdown().trim()).toBe(markdown);
	});

	it("serialises task lists as GFM checkboxes", () => {
		const out = load("- [ ] à faire\n- [x] fait").getMarkdown();
		expect(out).toContain("[ ] à faire");
		expect(out).toContain("[x] fait");
	});

	it("serialises tables as GFM pipe tables", () => {
		const out = load("| A | B |\n| --- | --- |\n| 1 | 2 |").getMarkdown();
		expect(out).toMatch(/\|\s*A\s*\|\s*B\s*\|/);
		expect(out).toMatch(/\|\s*-+\s*\|\s*-+\s*\|/);
		expect(out).toMatch(/\|\s*1\s*\|\s*2\s*\|/);
	});
});

describe("slash menu", () => {
	const items = slashItems(() => undefined);

	it("filters by title or keyword, ignoring accents and case", () => {
		expect(filterSlashItems(items, "tache").map((i) => i.title)).toEqual(["Liste de tâches"]);
		expect(filterSlashItems(items, "H3").map((i) => i.title)).toEqual(["Titre 3"]);
		expect(filterSlashItems(items, "")).toHaveLength(items.length);
	});

	it("applies the chosen block", () => {
		const e = load("");
		const heading = items.find((i) => i.title === "Titre 2");
		heading?.run(e, { from: 1, to: 1 });
		e.commands.insertContent("Titre");
		expect(e.getMarkdown().trim()).toBe("## Titre");
	});
});

describe("figures", () => {
	it.each([
		["caption", '![Salle d\'audience](https://example.com/a.webp "Palais de justice")'],
		["width", "![Schéma](https://example.com/a.webp#w=50)"],
		["caption and width", '![x](https://example.com/a.webp#w=33 "Une légende")'],
		["escaped characters", '![un \\[crochet\\]](https://example.com/a.webp "Dit \\"bonjour\\"")'],
	])("keeps the %s", (_name, markdown) => {
		expect(load(markdown).getMarkdown().trim()).toBe(markdown);
	});

	it("reads the width and caption into the node", () => {
		const image = load('![alt](https://example.com/a.webp#w=75 "légende")').getJSON().content?.[0];
		expect(image?.attrs).toMatchObject({
			src: "https://example.com/a.webp",
			alt: "alt",
			title: "légende",
			width: 75,
		});
	});

	it("updates attributes and writes them back as Markdown", () => {
		const e = load("![](https://example.com/a.webp)");
		e.commands.setNodeSelection(0);
		e.commands.updateAttributes("image", { alt: "Un bureau", title: "Le cabinet", width: 50 });
		expect(e.getMarkdown().trim()).toBe(
			'![Un bureau](https://example.com/a.webp#w=50 "Le cabinet")',
		);
	});
});

describe("splitWidth", () => {
	it("falls back to full width for unknown values", () => {
		expect(splitWidth("a.webp#w=12")).toEqual(["a.webp", 100]);
		expect(splitWidth("a.webp")).toEqual(["a.webp", 100]);
		expect(splitWidth("a.webp#w=33")).toEqual(["a.webp", 33]);
	});
});
