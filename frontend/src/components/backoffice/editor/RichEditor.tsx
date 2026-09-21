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
	Strikethrough,
	Unlink,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { articleExtensions } from "./extensions";
import { SlashCommand } from "./SlashCommand";
import { slashItems } from "./slash-items";

interface RichEditorProps {
	/** Markdown source (the single source of truth). */
	value: string;
	onChange: (markdown: string) => void;
	/** Upload an image and return its public URL. */
	uploadImage: (file: File) => Promise<string>;
	onError: (message: string) => void;
	labelledBy: string;
}

function imageFiles(list: FileList | null | undefined): File[] {
	return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}

/** WYSIWYG Markdown editor: "/" block menu, bubble toolbar, drag handles, image paste/drop. */
export function RichEditor({ value, onChange, uploadImage, onError, labelledBy }: RichEditorProps) {
	const lastEmitted = useRef(value);
	const fileInput = useRef<HTMLInputElement>(null);
	const pendingEditor = useRef<Editor | null>(null);

	async function insertImages(editor: Editor, files: File[], pos?: number) {
		for (const file of files) {
			try {
				const src = await uploadImage(file);
				const chain = editor.chain().focus();
				(pos === undefined ? chain : chain.setTextSelection(pos)).setImage({ src, alt: "" }).run();
			} catch (err) {
				onError(err instanceof Error ? err.message : "Import de l'image impossible.");
			}
		}
	}

	const items = useMemo(
		() =>
			slashItems((editor) => {
				pendingEditor.current = editor;
				fileInput.current?.click();
			}),
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
					"prose prose-neutral max-w-none min-h-[24rem] px-10 py-6 focus:outline-none prose-headings:font-museo prose-headings:text-near-black prose-a:text-primary prose-img:rounded-lg",
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

	function onPickFile(event: FormEvent<HTMLInputElement>) {
		const target = pendingEditor.current ?? editor;
		const files = imageFiles(event.currentTarget.files);
		event.currentTarget.value = "";
		if (target && files.length > 0) void insertImages(target, files);
	}

	return (
		<div className="relative rounded-lg border border-gray-200 bg-white">
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
				</>
			)}
			<EditorContent editor={editor} />
			<input ref={fileInput} type="file" accept="image/*" hidden onChange={onPickFile} />
		</div>
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
