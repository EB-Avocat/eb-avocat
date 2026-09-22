"use client";

import type { Editor } from "@tiptap/core";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
	Bold,
	Code,
	GripVertical,
	Heading2,
	Heading3,
	Italic,
	Link2,
	Loader2,
	Pencil,
	RefreshCw,
	Strikethrough,
	Trash2,
	Unlink,
} from "lucide-react";
import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { checkImageFile, ImageDialog } from "@/components/backoffice/ImageDialog";
import { BoButton, Field, Modal, TextArea, TextInput } from "@/components/backoffice/ui";
import { type ImageSource, messageOf } from "@/lib/backoffice/api";
import { articleExtensions } from "./extensions";
import { FIGURE_WIDTH_LABELS, FIGURE_WIDTHS, type FigureWidth } from "./figure";
import { SlashCommand } from "./SlashCommand";
import { slashItems } from "./slash-items";

interface RichEditorProps {
	/** Markdown source (the single source of truth). */
	value: string;
	onChange: (markdown: string) => void;
	/** Store an image (file or web link) and return its public URL. */
	uploadImage: (source: ImageSource) => Promise<string>;
	onError: (message: string) => void;
	labelledBy: string;
}

interface FigureAttrs {
	src: string;
	alt: string;
	title: string;
	width: FigureWidth;
}

function imageFiles(list: FileList | null | undefined): File[] {
	return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}

/** Position of the selected image node, or null when the selection is something else. */
function selectedImagePos(editor: Editor): number | null {
	const { selection } = editor.state;
	return editor.isActive("image") ? selection.from : null;
}

/**
 * WYSIWYG Markdown editor: "/" block menu, bubble toolbars (text and images), drag
 * handles, image paste/drop. Images are figures with alt text, caption and width.
 */
export function RichEditor({ value, onChange, uploadImage, onError, labelledBy }: RichEditorProps) {
	const lastEmitted = useRef(value);
	const [uploads, setUploads] = useState(0);
	// Image dialog: insert at a position, or replace the image at a position.
	const [imageDialog, setImageDialog] = useState<null | { insertAt: number } | { replace: number }>(
		null,
	);
	const [editing, setEditing] = useState<null | { pos: number; attrs: FigureAttrs }>(null);

	async function store(source: ImageSource): Promise<string> {
		setUploads((n) => n + 1);
		try {
			return await uploadImage(source);
		} finally {
			setUploads((n) => n - 1);
		}
	}

	async function insertImages(editor: Editor, files: File[], pos?: number) {
		const valid = files.filter((file) => {
			const problem = checkImageFile(file);
			if (problem) onError(problem);
			return !problem;
		});
		// Upload in parallel, insert in the original order.
		const results = await Promise.allSettled(valid.map((file) => store({ file })));
		for (const result of results) {
			if (result.status === "rejected") {
				onError(messageOf(result.reason, "Import de l'image impossible."));
				continue;
			}
			const chain = editor.chain().focus();
			(pos === undefined ? chain : chain.setTextSelection(pos))
				.setImage({ src: result.value, alt: "" })
				.run();
		}
	}

	const items = useMemo(
		() => slashItems((editor) => setImageDialog({ insertAt: editor.state.selection.from })),
		[],
	);

	const editor = useEditor({
		immediatelyRender: false,
		extensions: articleExtensions([SlashCommand.configure({ items })]),
		content: value,
		contentType: "markdown",
		editorProps: {
			attributes: {
				class:
					"article-figures prose prose-neutral max-w-none min-h-[24rem] px-10 py-6 focus:outline-none prose-headings:font-museo prose-headings:text-near-black prose-a:text-primary prose-img:rounded-lg",
				"aria-labelledby": labelledBy,
				"aria-multiline": "true",
				role: "textbox",
			},
			handlePaste: (_view, event) => {
				const files = imageFiles(event.clipboardData?.files);
				if (files.length === 0 || !editor) return false;
				void insertImages(editor, files);
				return true;
			},
			handleDrop: (view, event) => {
				const files = imageFiles(event.dataTransfer?.files);
				if (files.length === 0 || !editor) return false;
				event.preventDefault();
				const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
				void insertImages(editor, files, pos);
				return true;
			},
			handleDoubleClickOn: (_view, pos, node) => {
				if (node.type.name !== "image") return false;
				openFigureDialog(pos, node.attrs as FigureAttrs);
				return true;
			},
		},
		onUpdate: ({ editor: e }) => {
			const markdown = e.getMarkdown();
			lastEmitted.current = markdown;
			onChange(markdown);
		},
	});

	// External changes (Markdown tab, reload) → push into the editor.
	useEffect(() => {
		if (!editor || value === lastEmitted.current) return;
		lastEmitted.current = value;
		editor.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
	}, [editor, value]);

	function openFigureDialog(pos: number, attrs: FigureAttrs) {
		setEditing({
			pos,
			attrs: {
				src: attrs.src,
				alt: attrs.alt ?? "",
				title: attrs.title ?? "",
				width: attrs.width ?? 100,
			},
		});
	}

	function updateFigure(pos: number, attrs: Partial<FigureAttrs>) {
		editor
			?.chain()
			.focus()
			.setNodeSelection(pos)
			.updateAttributes("image", { ...attrs, title: attrs.title?.trim() || null })
			.run();
	}

	async function pickImage(source: ImageSource): Promise<null> {
		const target = imageDialog;
		const src = await store(source);
		if (editor && target) {
			if ("replace" in target) {
				editor
					.chain()
					.focus()
					.setNodeSelection(target.replace)
					.updateAttributes("image", { src })
					.run();
			} else {
				editor.chain().focus().setTextSelection(target.insertAt).setImage({ src, alt: "" }).run();
			}
		}
		return null; // nothing to crop: article images keep their own proportions
	}

	return (
		<div className="relative rounded-lg border border-gray-200 bg-white">
			{uploads > 0 && (
				<div
					role="status"
					className="absolute top-3 right-3 z-10 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-500 text-gray-600 shadow"
				>
					<Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden="true" />
					Import de l'image…
				</div>
			)}
			{editor && (
				<>
					<DragHandle editor={editor}>
						<span
							className="flex h-6 w-5 cursor-grab items-center justify-center rounded text-gray-400 hover:bg-gray-100"
							title="Glisser pour déplacer"
						>
							<GripVertical className="h-4 w-4" aria-hidden="true" />
						</span>
					</DragHandle>
					<FormatBubble editor={editor} />
					<ImageBubble
						editor={editor}
						onEdit={openFigureDialog}
						onReplace={(pos) => setImageDialog({ replace: pos })}
						onWidth={(pos, width) => updateFigure(pos, { width })}
					/>
				</>
			)}
			<EditorContent editor={editor} />

			<ImageDialog
				open={imageDialog !== null}
				title={imageDialog && "replace" in imageDialog ? "Remplacer l'image" : "Insérer une image"}
				onPick={pickImage}
				onClose={() => setImageDialog(null)}
			/>
			<FigureDialog
				editing={editing}
				onSave={(pos, attrs) => {
					updateFigure(pos, attrs);
					setEditing(null);
				}}
				onClose={() => setEditing(null)}
			/>
		</div>
	);
}

const toolbarButton = (active: boolean) =>
	`flex items-center gap-1 rounded p-1.5 text-xs font-500 ${active ? "bg-primary text-white" : "text-near-black hover:bg-gray-100"}`;

const WIDTH_SHORT: Record<FigureWidth, string> = { 33: "S", 50: "M", 75: "L", 100: "XL" };

function ImageBubble({
	editor,
	onEdit,
	onReplace,
	onWidth,
}: {
	editor: Editor;
	onEdit: (pos: number, attrs: FigureAttrs) => void;
	onReplace: (pos: number) => void;
	onWidth: (pos: number, width: FigureWidth) => void;
}) {
	const state = useEditorState({
		editor,
		selector: ({ editor: e }) => ({
			pos: selectedImagePos(e),
			attrs: e.getAttributes("image") as FigureAttrs,
		}),
	});
	const { pos, attrs } = state;

	return (
		<BubbleMenu
			editor={editor}
			pluginKey="imageBubble"
			options={{ placement: "top" }}
			shouldShow={({ editor: e }) => e.isActive("image")}
		>
			{pos !== null && (
				<div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
					<button
						type="button"
						className={toolbarButton(false)}
						onClick={() => onEdit(pos, attrs)}
						title="Double-cliquez sur l'image pour y revenir"
					>
						<Pencil className="h-4 w-4" aria-hidden="true" />
						Texte alternatif et légende
					</button>
					<span className="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />
					<fieldset className="flex gap-0.5">
						<legend className="sr-only">Taille de l'image</legend>
						{FIGURE_WIDTHS.map((width) => (
							<button
								key={width}
								type="button"
								aria-pressed={(attrs.width ?? 100) === width}
								aria-label={`Taille : ${FIGURE_WIDTH_LABELS[width]}`}
								title={FIGURE_WIDTH_LABELS[width]}
								className={`${toolbarButton((attrs.width ?? 100) === width)} min-w-7 justify-center`}
								onClick={() => onWidth(pos, width)}
							>
								{WIDTH_SHORT[width]}
							</button>
						))}
					</fieldset>
					<span className="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />
					<button
						type="button"
						className={toolbarButton(false)}
						onClick={() => onReplace(pos)}
						aria-label="Remplacer l'image"
						title="Remplacer l'image"
					>
						<RefreshCw className="h-4 w-4" aria-hidden="true" />
					</button>
					<button
						type="button"
						className={`${toolbarButton(false)} text-red-700`}
						onClick={() => editor.chain().focus().setNodeSelection(pos).deleteSelection().run()}
						aria-label="Supprimer l'image"
						title="Supprimer l'image"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
			)}
		</BubbleMenu>
	);
}

/** Alt text, caption and width of an article image. */
function FigureDialog({
	editing,
	onSave,
	onClose,
}: {
	editing: null | { pos: number; attrs: FigureAttrs };
	onSave: (pos: number, attrs: FigureAttrs) => void;
	onClose: () => void;
}) {
	const [attrs, setAttrs] = useState<FigureAttrs | null>(null);
	const widthName = useId();

	useEffect(() => {
		if (editing) setAttrs(editing.attrs);
	}, [editing]);

	function submit(event: FormEvent) {
		event.preventDefault();
		if (editing && attrs) onSave(editing.pos, attrs);
	}

	return (
		<Modal open={editing !== null} title="Modifier l'image" onClose={onClose}>
			{attrs && (
				<form onSubmit={submit} className="flex flex-col gap-4">
					<img
						src={attrs.src}
						alt=""
						className="max-h-48 w-full rounded bg-gray-100 object-contain"
					/>
					<Field
						label="Texte alternatif"
						hint="Décrit l'image pour les personnes qui ne la voient pas (lecteurs d'écran, image non chargée). Laissez vide si elle est purement décorative."
					>
						{(props) => (
							<TextArea
								{...props}
								rows={2}
								value={attrs.alt}
								onChange={(e) => setAttrs({ ...attrs, alt: e.target.value })}
							/>
						)}
					</Field>
					<Field label="Légende (facultative)" hint="Affichée sous l'image.">
						{(props) => (
							<TextInput
								{...props}
								value={attrs.title}
								onChange={(e) => setAttrs({ ...attrs, title: e.target.value })}
							/>
						)}
					</Field>
					<fieldset>
						<legend className="mb-2 text-sm font-500 text-near-black">Taille</legend>
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
							{FIGURE_WIDTHS.map((width) => (
								<label
									key={width}
									className={`flex cursor-pointer flex-col items-center gap-1 rounded border px-2 py-2 text-xs has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30 ${attrs.width === width ? "border-primary bg-primary-light/10 text-primary" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
								>
									<input
										type="radio"
										name={widthName}
										value={width}
										checked={attrs.width === width}
										onChange={() => setAttrs({ ...attrs, width })}
										className="sr-only"
									/>
									<span
										aria-hidden="true"
										className="h-2 rounded-full bg-current"
										style={{ width: `${width * 0.6}%` }}
									/>
									{FIGURE_WIDTH_LABELS[width]}
								</label>
							))}
						</div>
					</fieldset>
					<div className="flex justify-end gap-2">
						<BoButton variant="secondary" onClick={onClose}>
							Annuler
						</BoButton>
						<BoButton type="submit">Enregistrer</BoButton>
					</div>
				</form>
			)}
		</Modal>
	);
}

function FormatBubble({ editor }: { editor: Editor }) {
	const [linkMode, setLinkMode] = useState(false);
	const [url, setUrl] = useState("");
	const state = useEditorState({
		editor,
		selector: ({ editor: e }) => ({
			bold: e.isActive("bold"),
			italic: e.isActive("italic"),
			strike: e.isActive("strike"),
			code: e.isActive("code"),
			h2: e.isActive("heading", { level: 2 }),
			h3: e.isActive("heading", { level: 3 }),
			link: e.isActive("link"),
			href: (e.getAttributes("link").href as string | undefined) ?? "",
		}),
	});

	function applyLink(event: FormEvent) {
		event.preventDefault();
		const chain = editor.chain().focus().extendMarkRange("link");
		if (url.trim()) chain.setLink({ href: url.trim() }).run();
		else chain.unsetLink().run();
		setLinkMode(false);
	}

	const button = (active: boolean) =>
		`rounded p-1.5 ${active ? "bg-primary text-white" : "text-near-black hover:bg-gray-100"}`;

	return (
		<BubbleMenu
			editor={editor}
			pluginKey="formatBubble"
			options={{ placement: "top" }}
			shouldShow={({ editor: e, from, to }) =>
				from !== to && !e.isActive("image") && !e.isActive("codeBlock")
			}
		>
			<div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
				{linkMode ? (
					<form onSubmit={applyLink} className="flex items-center gap-1">
						<input
							// biome-ignore lint/a11y/noAutofocus: the user just asked to edit the link
							autoFocus
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://…"
							aria-label="Adresse du lien"
							className="w-56 rounded border border-gray-300 px-2 py-1 text-sm"
						/>
						<button type="submit" className="rounded bg-primary px-2 py-1 text-xs text-white">
							OK
						</button>
					</form>
				) : (
					<>
						<button
							type="button"
							aria-label="Gras"
							aria-pressed={state.bold}
							className={button(state.bold)}
							onClick={() => editor.chain().focus().toggleBold().run()}
						>
							<Bold className="h-4 w-4" aria-hidden="true" />
						</button>
						<button
							type="button"
							aria-label="Italique"
							aria-pressed={state.italic}
							className={button(state.italic)}
							onClick={() => editor.chain().focus().toggleItalic().run()}
						>
							<Italic className="h-4 w-4" aria-hidden="true" />
						</button>
						<button
							type="button"
							aria-label="Barré"
							aria-pressed={state.strike}
							className={button(state.strike)}
							onClick={() => editor.chain().focus().toggleStrike().run()}
						>
							<Strikethrough className="h-4 w-4" aria-hidden="true" />
						</button>
						<button
							type="button"
							aria-label="Code"
							aria-pressed={state.code}
							className={button(state.code)}
							onClick={() => editor.chain().focus().toggleCode().run()}
						>
							<Code className="h-4 w-4" aria-hidden="true" />
						</button>
						<span className="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />
						<button
							type="button"
							aria-label="Titre 2"
							aria-pressed={state.h2}
							className={button(state.h2)}
							onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
						>
							<Heading2 className="h-4 w-4" aria-hidden="true" />
						</button>
						<button
							type="button"
							aria-label="Titre 3"
							aria-pressed={state.h3}
							className={button(state.h3)}
							onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
						>
							<Heading3 className="h-4 w-4" aria-hidden="true" />
						</button>
						<span className="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />
						<button
							type="button"
							aria-label={state.link ? "Modifier le lien" : "Ajouter un lien"}
							aria-pressed={state.link}
							className={button(state.link)}
							onClick={() => {
								setUrl(state.href);
								setLinkMode(true);
							}}
						>
							<Link2 className="h-4 w-4" aria-hidden="true" />
						</button>
						{state.link && (
							<button
								type="button"
								aria-label="Retirer le lien"
								className={button(false)}
								onClick={() => editor.chain().focus().unsetLink().run()}
							>
								<Unlink className="h-4 w-4" aria-hidden="true" />
							</button>
						)}
					</>
				)}
			</div>
		</BubbleMenu>
	);
}
