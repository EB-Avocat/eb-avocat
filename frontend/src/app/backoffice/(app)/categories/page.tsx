"use client";

import { ArrowDown, ArrowUp, Check, Pencil, Star, Trash2, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useSession } from "@/components/backoffice/BackofficeContext";
import {
	Alert,
	BoButton,
	ConfirmModal,
	PageHeader,
	Spinner,
	TextInput,
} from "@/components/backoffice/ui";
import { api, messageOf } from "@/lib/backoffice/api";
import type { AdminCategory } from "@/lib/backoffice/types";

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

	async function move(index: number, delta: -1 | 1) {
		if (!categories) return;
		const list = [...categories];
		const [item] = list.splice(index, 1);
		if (!item) return;
		list.splice(index + delta, 0, item);
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

	const sorted = categories;

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

			<form onSubmit={create} className="mb-6 flex max-w-md gap-2">
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

			{sorted === null ? (
				<Spinner />
			) : sorted.length === 0 ? (
				<p className="text-sm text-gray-600">Aucune catégorie pour le moment.</p>
			) : (
				<ul className="divide-y divide-gray-100 rounded-lg bg-white shadow-sm">
					{sorted.map((category, index) => (
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
										disabled={index === 0}
										onClick={() => move(index, -1)}
										className="rounded p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
										aria-label={`Monter ${category.name}`}
									>
										<ArrowUp className="h-4 w-4" aria-hidden="true" />
									</button>
									<button
										type="button"
										disabled={index === sorted.length - 1}
										onClick={() => move(index, 1)}
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
