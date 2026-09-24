import Image from "@tiptap/extension-image";

/**
 * Display widths offered for article images, in percent of the text column.
 * Mirrors FIGURE_WIDTHS in backend/articles/rendering.py (100 = full width).
 */
export const FIGURE_WIDTHS = [33, 50, 75, 100] as const;
export type FigureWidth = (typeof FIGURE_WIDTHS)[number];

export const FIGURE_WIDTH_LABELS: Record<FigureWidth, string> = {
	33: "Petite",
	50: "Moyenne",
	75: "Grande",
	100: "Pleine largeur",
};

function isFigureWidth(value: number): value is FigureWidth {
	return (FIGURE_WIDTHS as readonly number[]).includes(value);
}

/** `"a.webp#w=50"` → `["a.webp", 50]`; anything else is full width. */
export function splitWidth(href: string): [string, FigureWidth] {
	const match = /#w=(\d+)$/.exec(href);
	if (!match) return [href, 100];
	const width = Number(match[1]);
	return [href.slice(0, match.index), isFigureWidth(width) ? width : 100];
}

const escapeAlt = (text: string) => text.replace(/([\\[\]])/g, "\\$1");
const escapeTitle = (text: string) => text.replace(/(["\\])/g, "\\$1").replace(/\s*\n\s*/g, " ");

/** `![alt](src#w=50 "caption")`: the format the backend turns into a <figure>. */
function figureMarkdown(attrs: {
	src: string;
	alt?: string | null;
	title?: string | null;
	width?: number | null;
}): string {
	const width = attrs.width && isFigureWidth(attrs.width) ? attrs.width : 100;
	const src = width === 100 ? attrs.src : `${attrs.src}#w=${width}`;
	const title = attrs.title?.trim() ? ` "${escapeTitle(attrs.title.trim())}"` : "";
	return `![${escapeAlt(attrs.alt ?? "")}](${src}${title})`;
}

/**
 * Block image with alternative text, an optional caption (the Markdown title) and
 * a display width. Rendered as <figure> in the editor, exactly like on the site.
 */
export const Figure = Image.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			width: {
				default: 100,
				parseHTML: (element) => {
					const [, width] = splitWidth(`#w=${element.getAttribute("data-width") ?? ""}`);
					return width;
				},
				renderHTML: (attributes) =>
					attributes.width === 100 ? {} : { "data-width": attributes.width },
			},
		};
	},

	parseMarkdown: (token, helpers) => {
		const [src, width] = splitWidth(token.href ?? "");
		return helpers.createNode("image", {
			src,
			alt: token.text ?? "",
			title: token.title || null,
			width,
		});
	},

	renderMarkdown: (node) =>
		figureMarkdown({
			src: node.attrs?.src ?? "",
			alt: node.attrs?.alt,
			title: node.attrs?.title,
			width: node.attrs?.width,
		}),

	addNodeView() {
		return ({ node: initial }) => {
			const dom = document.createElement("figure");
			const img = document.createElement("img");
			const caption = document.createElement("figcaption");
			dom.append(img, caption);
			dom.draggable = true;
			dom.dataset.dragHandle = "";

			const render = (node: typeof initial) => {
				const { src, alt, title, width } = node.attrs;
				img.src = src ?? "";
				img.alt = alt ?? "";
				dom.className = width && width !== 100 ? `figure-w${width}` : "";
				caption.textContent = title ?? "";
				caption.hidden = !title;
			};
			render(initial);

			return {
				dom,
				update: (node) => {
					if (node.type !== initial.type) return false;
					render(node);
					return true;
				},
			};
		};
	},
});
