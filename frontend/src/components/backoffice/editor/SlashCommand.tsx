"use client";

import { type Editor, Extension, type Range } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";
import { type Ref, useEffect, useImperativeHandle, useState } from "react";
import { filterSlashItems, type SlashItem } from "./slash-items";

interface MenuHandle {
	onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

function SlashMenu({
	items,
	command,
	ref,
}: {
	items: SlashItem[];
	command: (item: SlashItem) => void;
	ref: Ref<MenuHandle>;
}) {
	const [selected, setSelected] = useState(0);
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset highlight when the filtered list changes
	useEffect(() => setSelected(0), [items]);

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }) => {
			if (items.length === 0) return false;
			if (event.key === "ArrowDown") {
				setSelected((i) => (i + 1) % items.length);
				return true;
			}
			if (event.key === "ArrowUp") {
				setSelected((i) => (i + items.length - 1) % items.length);
				return true;
			}
			const item = items[selected];
			if (event.key === "Enter" && item) {
				command(item);
				return true;
			}
			return false;
		},
	}));

	if (items.length === 0) {
		return (
			<div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
				Aucun bloc
			</div>
		);
	}

	return (
		<div
			role="listbox"
			aria-label="Insérer un bloc"
			className="max-h-80 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
		>
			{items.map((item, index) => {
				const Icon = item.icon;
				return (
					<button
						key={item.title}
						type="button"
						role="option"
						aria-selected={index === selected}
						onMouseEnter={() => setSelected(index)}
						onClick={() => command(item)}
						className={`flex w-full items-center gap-3 rounded px-2 py-1.5 text-left ${index === selected ? "bg-primary-light/10" : ""}`}
					>
						<span className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white">
							<Icon className="h-4 w-4 text-primary" aria-hidden="true" />
						</span>
						<span>
							<span className="block text-sm font-500 text-near-black">{item.title}</span>
							<span className="block text-xs text-gray-500">{item.description}</span>
						</span>
					</button>
				);
			})}
		</div>
	);
}

type MenuProps = { items: SlashItem[]; command: (item: SlashItem) => void };

/** "/" command menu (Notion-style), rendered as a floating React popup. */
export const SlashCommand = Extension.create<{ items: SlashItem[] }>({
	name: "slashCommand",

	addOptions() {
		return { items: [] };
	},

	addProseMirrorPlugins() {
		return [
			Suggestion<SlashItem, SlashItem>({
				editor: this.editor,
				char: "/",
				allowSpaces: false,
				items: ({ query }) => filterSlashItems(this.options.items, query),
				command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashItem }) =>
					props.run(editor, range),
				render: () => {
					let renderer: ReactRenderer<MenuHandle, MenuProps> | null = null;

					const place = (props: SuggestionProps<SlashItem, SlashItem>) => {
						const rect = props.clientRect?.();
						const element = renderer?.element as HTMLElement | undefined;
						if (!rect || !element) return;
						element.style.position = "absolute";
						element.style.zIndex = "50";
						element.style.left = `${rect.left + window.scrollX}px`;
						element.style.top = `${rect.bottom + window.scrollY + 6}px`;
					};

					return {
						onStart: (props) => {
							renderer = new ReactRenderer(SlashMenu, {
								props: { items: props.items, command: props.command },
								editor: props.editor,
							});
							document.body.appendChild(renderer.element);
							place(props);
						},
						onUpdate: (props) => {
							renderer?.updateProps({ items: props.items, command: props.command });
							place(props);
						},
						onKeyDown: (props) => {
							if (props.event.key === "Escape") {
								renderer?.destroy();
								renderer?.element.remove();
								renderer = null;
								return true;
							}
							return renderer?.ref?.onKeyDown(props) ?? false;
						},
						onExit: () => {
							renderer?.element.remove();
							renderer?.destroy();
							renderer = null;
						},
					};
				},
			}),
		];
	},
});
