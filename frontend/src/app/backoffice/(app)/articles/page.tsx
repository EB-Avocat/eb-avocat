"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useBackofficeHref } from "@/components/backoffice/BackofficeContext";
import {
	Alert,
	Badge,
	ConfirmModal,
	PageHeader,
	Select,
	Spinner,
	TextInput,
} from "@/components/backoffice/ui";
import { api } from "@/lib/backoffice/api";
import { type AdminArticle, type AdminCategory, STATUS_LABELS } from "@/lib/backoffice/types";
import { formatPublicationDate } from "@/lib/publications-parse";

export default function ArticlesPage() {
	const href = useBackofficeHref();
	const [articles, setArticles] = useState<AdminArticle[] | null>(null);
	const [categories, setCategories] = useState<AdminCategory[]>([]);
	const [filters, setFilters] = useState({ status: "", category: "", search: "" });
	const [error, setError] = useState<string | null>(null);
	const [toDelete, setToDelete] = useState<AdminArticle | null>(null);
	const [deleting, setDeleting] = useState(false);

	const load = useCallback(async () => {
		const params: Record<string, string> = { page_size: "100" };
		for (const [key, value] of Object.entries(filters)) if (value) params[key] = value;
		try {
			setArticles((await api.articles.list(params)).results);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Chargement impossible.");
		}
	}, [filters]);

	useEffect(() => {
		const timer = setTimeout(load, filters.search ? 250 : 0);
		return () => clearTimeout(timer);
	}, [load, filters.search]);

	useEffect(() => {
		api.categories
			.list()
			.then(setCategories)
			.catch(() => undefined);
	}, []);

	async function confirmDelete() {
		if (!toDelete) return;
		setDeleting(true);
		try {
			await api.articles.remove(toDelete.id);
			setArticles((list) => list?.filter((a) => a.id !== toDelete.id) ?? null);
			setToDelete(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Suppression impossible.");
		} finally {
			setDeleting(false);
		}
	}

	return (
		<>
			<PageHeader
				title="Articles"
				actions={
					<Link
						href={href("/articles/nouveau")}
						className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-500 text-white hover:bg-primary-light"
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Nouvel article
					</Link>
				}
			/>

			<div className="mb-6 grid gap-3 sm:grid-cols-3">
				<TextInput
					type="search"
					placeholder="Rechercher un titre…"
					aria-label="Rechercher un article"
					value={filters.search}
					onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
				/>
				<Select
					aria-label="Filtrer par statut"
					value={filters.status}
					onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
				>
					<option value="">Tous les statuts</option>
					<option value="draft">Brouillons</option>
					<option value="published">Publiés</option>
				</Select>
				<Select
					aria-label="Filtrer par catégorie"
					value={filters.category}
					onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
				>
					<option value="">Toutes les catégories</option>
					{categories.map((c) => (
						<option key={c.id} value={c.slug}>
							{c.name}
						</option>
					))}
				</Select>
			</div>

			{error && <Alert>{error}</Alert>}
			{articles === null ? (
				<Spinner />
			) : articles.length === 0 ? (
				<p className="rounded-lg bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
					Aucun article. Créez le premier avec « Nouvel article ».
				</p>
			) : (
				<div className="overflow-x-auto rounded-lg bg-white shadow-sm">
					<table className="w-full text-left text-sm">
						<thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
							<tr>
								<th scope="col" className="px-4 py-3 font-500">
									Titre
								</th>
								<th scope="col" className="px-4 py-3 font-500">
									Statut
								</th>
								<th scope="col" className="hidden px-4 py-3 font-500 md:table-cell">
									Catégories
								</th>
								<th scope="col" className="hidden px-4 py-3 font-500 sm:table-cell">
									Modifié le
								</th>
								<th scope="col" className="px-4 py-3">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{articles.map((article) => (
								<tr key={article.id} className="hover:bg-gray-50">
									<td className="px-4 py-3">
										<Link
											href={href(`/articles/${article.id}`)}
											className="font-500 text-near-black hover:text-primary"
										>
											{article.title}
										</Link>
										<p className="text-xs text-gray-500">{article.author.name}</p>
									</td>
									<td className="px-4 py-3">
										<Badge tone={article.status === "published" ? "success" : "neutral"}>
											{STATUS_LABELS[article.status]}
										</Badge>
									</td>
									<td className="hidden px-4 py-3 md:table-cell">
										<div className="flex flex-wrap gap-1">
											{article.categories.map((c) => (
												<Badge key={c.id} tone={c.is_primary ? "primary" : "neutral"}>
													{c.name}
												</Badge>
											))}
										</div>
									</td>
									<td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
										{formatPublicationDate(article.updated_at)}
									</td>
									<td className="px-4 py-3">
										<div className="flex justify-end gap-1">
											<Link
												href={href(`/articles/${article.id}`)}
												className="rounded p-2 text-gray-600 hover:bg-primary-light/10 hover:text-primary"
												aria-label={`Modifier « ${article.title} »`}
											>
												<Pencil className="h-4 w-4" aria-hidden="true" />
											</Link>
											<button
												type="button"
												onClick={() => setToDelete(article)}
												className="rounded p-2 text-gray-600 hover:bg-red-50 hover:text-red-700"
												aria-label={`Supprimer « ${article.title} »`}
											>
												<Trash2 className="h-4 w-4" aria-hidden="true" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<ConfirmModal
				open={toDelete !== null}
				title="Supprimer l'article"
				message={
					<>
						« {toDelete?.title} » sera définitivement supprimé
						{toDelete?.status === "published" && " et retiré du site"}.
					</>
				}
				confirmLabel="Supprimer"
				busy={deleting}
				onConfirm={confirmDelete}
				onClose={() => setToDelete(null)}
			/>
		</>
	);
}
