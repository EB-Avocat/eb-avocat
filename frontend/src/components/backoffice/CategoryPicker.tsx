"use client";

import { Plus, Star, X } from "lucide-react";
import { type KeyboardEvent, useId, useMemo, useState } from "react";
import { api, messageOf } from "@/lib/backoffice/api";
import type { AdminCategory } from "@/lib/backoffice/types";

/**
 * Multi-select for an article's categories. Type to filter; Enter picks the
 * highlighted match or creates a new category with that name. Primary
 * categories (main filters on the site) are marked with a star.
 */
export function CategoryPicker({
	all,
	selectedIds,
	onChange,
	onCreated,
	onError,
}: {
	all: AdminCategory[];
	selectedIds: string[];
	onChange: (ids: string[]) => void;
	onCreated: (category: AdminCategory) => void;
	onError: (message: string) => void;
}) {
	const inputId = useId();
	const listId = useId();
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [highlight, setHighlight] = useState(0);

	const selected = selectedIds
		.map((id) => all.find((c) => c.id === id))
		.filter((c): c is AdminCategory => !!c);
	const normalized = query.trim().toLowerCase();
	const matches = useMemo(
		() =>
			all
				.filter((c) => !selectedIds.includes(c.id) && c.name.toLowerCase().includes(normalized))
				.slice(0, 8),
		[all, selectedIds, normalized],
	);
	const exact = all.some((c) => c.name.toLowerCase() === normalized);
	const canCreate = normalized.length > 0 && !exact;
	const options = [
		...matches.map((c) => ({ kind: "pick" as const, category: c })),
		...(canCreate ? [{ kind: "create" as const }] : []),
	];

	function pick(category: AdminCategory) {
		onChange([...selectedIds, category.id]);
		setQuery("");
		setHighlight(0);
	}

	async function create() {
		try {
			const category = await api.categories.create(query.trim());
			onCreated(category);
			pick(category);
		} catch (err) {
			onError(messageOf(err, "Création de la catégorie impossible."));
		}
	}

	function choose(index: number) {
		const option = options[index];
		if (!option) return;
		if (option.kind === "pick") pick(option.category);
		else void create();
	}

	function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setOpen(true);
			setHighlight((h) => Math.min(h + 1, options.length - 1));
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setHighlight((h) => Math.max(h - 1, 0));
		} else if (event.key === "Enter") {
			event.preventDefault();
			choose(highlight);
		} else if (event.key === "Escape") {
			setOpen(false);
		} else if (event.key === "Backspace" && !query && selected.length > 0) {
			onChange(selectedIds.slice(0, -1));
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={inputId} className="text-sm font-500">
				Catégories
			</label>
			<div className="relative flex flex-wrap items-center gap-1.5 rounded border border-gray-300 bg-white px-2 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
				{selected.length > 0 && (
					<ul className="contents">
						{selected.map((c) => (
							<li
								key={c.id}
								className="inline-flex items-center gap-1 rounded-full bg-primary-light/10 py-0.5 pr-1 pl-2.5 text-xs font-500 text-primary"
							>
								{c.is_primary && (
									<Star className="h-3 w-3 fill-current" aria-label="Catégorie principale" />
								)}
								{c.name}
								<button
									type="button"
									onClick={() => onChange(selectedIds.filter((id) => id !== c.id))}
									className="rounded-full p-0.5 hover:bg-primary-light/20"
									aria-label={`Retirer ${c.name}`}
								>
									<X className="h-3 w-3" aria-hidden="true" />
								</button>
							</li>
						))}
					</ul>
				)}
				<input
					id={inputId}
					type="text"
					role="combobox"
					aria-expanded={open && options.length > 0}
					aria-controls={listId}
					aria-autocomplete="list"
					aria-activedescendant={open && options[highlight] ? `${listId}-${highlight}` : undefined}
					value={query}
					placeholder={selected.length > 0 ? "Ajouter…" : "Ajouter ou créer une catégorie…"}
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
						setHighlight(0);
					}}
					onFocus={() => setOpen(true)}
					onBlur={() => setTimeout(() => setOpen(false), 120)}
					onKeyDown={onKeyDown}
					className="min-w-40 flex-1 border-0 bg-transparent px-1 py-0.5 text-sm focus:outline-none"
				/>
				{open && options.length > 0 && (
					<div
						id={listId}
						role="listbox"
						className="absolute top-full left-0 z-10 mt-1 max-h-60 w-full overflow-y-auto rounded border border-gray-200 bg-white py-1 shadow-lg"
					>
						{options.map((option, index) => (
							<div
								key={option.kind === "pick" ? option.category.id : "create"}
								id={`${listId}-${index}`}
								role="option"
								tabIndex={-1}
								aria-selected={index === highlight}
								onMouseDown={(e) => {
									e.preventDefault();
									choose(index);
								}}
								onMouseEnter={() => setHighlight(index)}
								className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm ${index === highlight ? "bg-primary-light/10" : ""}`}
							>
								{option.kind === "pick" ? (
									<>
										{option.category.is_primary && (
											<Star className="h-3 w-3 fill-primary text-primary" aria-hidden="true" />
										)}
										{option.category.name}
									</>
								) : (
									<>
										<Plus className="h-3 w-3 text-primary" aria-hidden="true" />
										Créer « {query.trim()} »
									</>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
