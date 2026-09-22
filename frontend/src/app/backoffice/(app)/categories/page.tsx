"use client";

import { ArrowDown, ArrowUp, Check, Pencil, Star, Trash2, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useSession } from "@/components/backoffice/BackofficeContext";
import {
	Alert,
	BoButton,
	ConfirmModal,
	ListSkeleton,
	PageHeader,
	Pager,
	TextInput,
} from "@/components/backoffice/ui";
import { api, messageOf } from "@/lib/backoffice/api";
import type { AdminCategory } from "@/lib/backoffice/types";

type Filter = "all" | "primary" | "secondary";

const FILTERS: { id: Filter; label: string }[] = [
	{ id: "all", label: "Toutes" },
	{ id: "primary", label: "Principales" },
	{ id: "secondary", label: "Secondaires" },
];

const PAGE_SIZE = 50;

/** Primary categories first (the site's main filters), keeping the manual order otherwise. */
function primaryFirst(list: AdminCategory[]): AdminCategory[] {
	return [...list].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
}

export default function CategoriesPage() {
	const { user } = useSession();
	const canManage = user.role !== "author";
	const [categories, setCategories] = useState<AdminCategory[] | null>(null);
	const [name, setName] = useState("");
	const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
	const [toDelete, setToDelete] = useState<AdminCategory | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [filter, setFilter] = useState<Filter>("all");
	const [page, setPage] = useState(1);

	const fail = (err: unknown) =>
		setError(err instanceof Error ? err.message : "Action impossible.");
	const replace = (c: AdminCategory) =>
		setCategories((list) =>
			list ? primaryFirst(list.map((x) => (x.id === c.id ? { ...x, ...c } : x))) : null,
		);

	useEffect(() => {
		api.categories
			.list()
			.then(setCategories)
			.catch((err) => setError(messageOf(err)));
	}, []);

	async function create(event: FormEvent) {
		event.preventDefault();
		if (!name.trim()) return;
		setBusy(true);
		try {
			const created = await api.categories.create(name.trim());
			setCategories((list) => [...(list ?? []), { ...created, article_count: 0 }]);
			setName("");
		} catch (err) {
			fail(err);
		} finally {
			setBusy(false);
		}
	}

	async function rename(event: FormEvent) {
		event.preventDefault();
		if (!editing) return;
		try {
			replace(await api.categories.update(editing.id, { name: editing.name.trim() }));
			setEditing(null);
		} catch (err) {
			fail(err);
		}
	}

	async function togglePrimary(category: AdminCategory) {
		try {
			replace(await api.categories.update(category.id, { is_primary: !category.is_primary }));
		} catch (err) {
			fail(err);
		}
	}

	/** Swap with the neighbour in the current view (filtered list), keeping the rest in place. */
	async function move(category: AdminCategory, delta: -1 | 1) {
		if (!categories) return;
		const neighbour = filtered[filtered.indexOf(category) + delta];
		if (!neighbour) return;
		const list = [...categories];
		const a = list.indexOf(category);
		const b = list.indexOf(neighbour);
		list[a] = neighbour;
		list[b] = category;
		setCategories(list);
		try {
			await api.categories.reorder(list.map((c) => c.id));
		} catch (err) {
			fail(err);
		}
	}

	async function remove() {
		if (!toDelete) return;
		setBusy(true);
		try {
			await api.categories.remove(toDelete.id);
			setCategories((list) => list?.filter((c) => c.id !== toDelete.id) ?? null);
			setToDelete(null);
		} catch (err) {
			fail(err);
		} finally {
			setBusy(false);
		}
	}

	const filtered = (categories ?? []).filter(
		(c) => filter === "all" || c.is_primary === (filter === "primary"),
	);
	const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const currentPage = Math.min(page, pageCount);
	const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
	const counts: Record<Filter, number> = {
		all: categories?.length ?? 0,
		primary: categories?.filter((c) => c.is_primary).length ?? 0,
		secondary: categories?.filter((c) => !c.is_primary).length ?? 0,
	};

	return (
		<>
			<PageHeader title="Catégories" />
			<p className="mb-6 max-w-2xl text-sm text-gray-600">
				Les catégories{" "}
				<Star className="inline h-3.5 w-3.5 fill-primary text-primary" aria-label="principales" />{" "}
				principales sont proposées comme filtres principaux sur la page Publications ; les autres
				restent accessibles sous « Plus de catégories ».
			</p>

			{error && (
				<div className="mb-4">
					<Alert>{error}</Alert>
				</div>
			)}

			<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
				<form onSubmit={create} className="flex w-full max-w-md gap-2">
					<label htmlFor="new-category" className="sr-only">
						Nouvelle catégorie
					</label>
					<TextInput
						id="new-category"
						placeholder="Nouvelle catégorie"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<BoButton type="submit" busy={busy} disabled={!name.trim()}>
						Ajouter
					</BoButton>
				</form>
				<fieldset className="flex gap-1 rounded-lg bg-white p-1 shadow-sm">
					<legend className="sr-only">Filtrer les catégories</legend>
					{FILTERS.map(({ id, label }) => (
						<button
							key={id}
							type="button"
							aria-pressed={filter === id}
							onClick={() => {
								setFilter(id);
								setPage(1);
							}}
							className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-500 ${filter === id ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
						>
							{id === "primary" && (
								<Star
									className={`h-3.5 w-3.5 ${filter === id ? "fill-white" : "fill-primary text-primary"}`}
									aria-hidden="true"
								/>
							)}
							{label}
							<span className={`text-xs ${filter === id ? "text-white/80" : "text-gray-400"}`}>
								{counts[id]}
							</span>
						</button>
					))}
				</fieldset>
			</div>

			{categories === null ? (
				<ListSkeleton rows={6} />
			) : filtered.length === 0 ? (
				<p className="rounded-lg bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
					{categories.length === 0
						? "Aucune catégorie pour le moment."
						: filter === "primary"
							? "Aucune catégorie principale : cliquez sur l'étoile d'une catégorie pour la mettre en avant."
							: "Toutes les catégories sont principales."}
				</p>
			) : (
				<ul className="divide-y divide-gray-100 rounded-lg bg-white shadow-sm">
					{visible.map((category) => (
						<li key={category.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
							<button
								type="button"
								onClick={() => togglePrimary(category)}
								disabled={!canManage}
								aria-pressed={category.is_primary}
								aria-label={
									category.is_primary
										? `Retirer ${category.name} des catégories principales`
										: `Définir ${category.name} comme catégorie principale`
								}
								className="rounded p-1 text-primary hover:bg-primary-light/10 disabled:cursor-default disabled:hover:bg-transparent"
							>
								<Star
									className={`h-4 w-4 ${category.is_primary ? "fill-primary" : ""}`}
									aria-hidden="true"
								/>
							</button>

							{editing?.id === category.id ? (
								<form onSubmit={rename} className="flex flex-1 items-center gap-2">
									<label htmlFor={`rename-${category.id}`} className="sr-only">
										Nouveau nom
									</label>
									<TextInput
										id={`rename-${category.id}`}
										autoFocus
										value={editing.name}
										onChange={(e) => setEditing({ id: category.id, name: e.target.value })}
									/>
									<button
										type="submit"
										className="rounded p-2 text-primary hover:bg-primary-light/10"
										aria-label="Valider"
									>
										<Check className="h-4 w-4" aria-hidden="true" />
									</button>
									<button
										type="button"
										onClick={() => setEditing(null)}
										className="rounded p-2 text-gray-500 hover:bg-gray-100"
										aria-label="Annuler"
									>
										<X className="h-4 w-4" aria-hidden="true" />
									</button>
								</form>
							) : (
								<span className="flex-1 text-sm font-500">
									{category.name}
									<span className="ml-2 text-xs font-300 text-gray-500">
										{category.article_count ?? 0} article
										{(category.article_count ?? 0) > 1 ? "s" : ""}
									</span>
								</span>
							)}

							{canManage && editing?.id !== category.id && (
								<div className="flex gap-1">
									<button
										type="button"
										disabled={filtered[0] === category}
										onClick={() => move(category, -1)}
										className="rounded p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
										aria-label={`Monter ${category.name}`}
									>
										<ArrowUp className="h-4 w-4" aria-hidden="true" />
									</button>
									<button
										type="button"
										disabled={filtered.at(-1) === category}
										onClick={() => move(category, 1)}
										className="rounded p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
										aria-label={`Descendre ${category.name}`}
									>
										<ArrowDown className="h-4 w-4" aria-hidden="true" />
									</button>
									<button
										type="button"
										onClick={() => setEditing({ id: category.id, name: category.name })}
										className="rounded p-2 text-gray-500 hover:bg-gray-100"
										aria-label={`Renommer ${category.name}`}
									>
										<Pencil className="h-4 w-4" aria-hidden="true" />
									</button>
									<button
										type="button"
										onClick={() => setToDelete(category)}
										className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-700"
										aria-label={`Supprimer ${category.name}`}
									>
										<Trash2 className="h-4 w-4" aria-hidden="true" />
									</button>
								</div>
							)}
						</li>
					))}
				</ul>
			)}
			{pageCount > 1 && (
				<div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
					<p>
						{filtered.length} catégories · page {currentPage} sur {pageCount}
					</p>
					<Pager page={currentPage} pageCount={pageCount} onPage={setPage} />
				</div>
			)}

			<ConfirmModal
				open={toDelete !== null}
				title="Supprimer la catégorie"
				message={
					<>« {toDelete?.name} » sera retirée de tous ses articles (les articles sont conservés).</>
				}
				confirmLabel="Supprimer"
				busy={busy}
				onConfirm={remove}
				onClose={() => setToDelete(null)}
			/>
		</>
	);
}
