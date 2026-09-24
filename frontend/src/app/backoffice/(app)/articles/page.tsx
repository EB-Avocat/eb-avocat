"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useId, useMemo, useState } from "react";
import { useBackofficeHref } from "@/components/backoffice/BackofficeContext";
import {
	Alert,
	Badge,
	ConfirmModal,
	PageHeader,
	Pager,
	Select,
	Skeleton,
	SkeletonGroup,
	TextInput,
} from "@/components/backoffice/ui";
import { ApiError, api, messageOf } from "@/lib/backoffice/api";
import { type AdminArticleRow, type AdminCategory, STATUS_LABELS } from "@/lib/backoffice/types";
import { formatPublicationDate } from "@/lib/publications-parse";

const PAGE_SIZES = [20, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 50;

/** List state lives in the URL (`?statut=&categorie=&q=&page=&par=`): shareable, back-button friendly. */
function useListParams() {
	const params = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const state = useMemo(() => {
		const perPage = Number(params.get("par"));
		return {
			status: params.get("statut") ?? "",
			category: params.get("categorie") ?? "",
			search: params.get("q") ?? "",
			page: Math.max(1, Number(params.get("page")) || 1),
			pageSize: (PAGE_SIZES as readonly number[]).includes(perPage) ? perPage : DEFAULT_PAGE_SIZE,
		};
	}, [params]);
	const set = useCallback(
		(patch: Partial<typeof state>) => {
			const next = { ...state, ...patch };
			// Any change other than the page itself starts again from page 1.
			if (!("page" in patch)) next.page = 1;
			const query = new URLSearchParams();
			if (next.status) query.set("statut", next.status);
			if (next.category) query.set("categorie", next.category);
			if (next.search) query.set("q", next.search);
			if (next.page > 1) query.set("page", String(next.page));
			if (next.pageSize !== DEFAULT_PAGE_SIZE) query.set("par", String(next.pageSize));
			const qs = query.toString();
			router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: "page" in patch });
		},
		[state, pathname, router],
	);
	return [state, set] as const;
}

function TableSkeleton({ rows }: { rows: number }) {
	return (
		<SkeletonGroup
			label="Chargement des articles…"
			className="overflow-hidden rounded-lg bg-white shadow-sm"
		>
			<div className="flex gap-4 border-b border-gray-200 px-4 py-3">
				<Skeleton className="h-3 w-16" />
				<Skeleton className="ml-auto h-3 w-12" />
			</div>
			{Array.from({ length: rows }, (_, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
				<div key={index} className="flex items-center gap-4 border-b border-gray-100 px-4 py-4">
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className={`h-4 ${index % 3 === 0 ? "w-2/3" : "w-1/2"}`} />
						<Skeleton className="h-3 w-24" />
					</div>
					<Skeleton className="h-5 w-16 !rounded-full" />
					<Skeleton className="hidden h-5 w-24 !rounded-full md:block" />
					<Skeleton className="hidden h-4 w-24 sm:block" />
					<Skeleton className="h-8 w-16" />
				</div>
			))}
		</SkeletonGroup>
	);
}

function ArticlesList() {
	const href = useBackofficeHref();
	const [params, setParams] = useListParams();
	const [search, setSearch] = useState(params.search);
	const [data, setData] = useState<{ articles: AdminArticleRow[]; count: number } | null>(null);
	const [loading, setLoading] = useState(true);
	const [categories, setCategories] = useState<AdminCategory[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [toDelete, setToDelete] = useState<AdminArticleRow | null>(null);
	const [deleting, setDeleting] = useState(false);
	const { status, category, page, pageSize } = params;
	const pageSizeId = useId();

	const load = useCallback(async () => {
		const query: Record<string, string> = { page: String(page), page_size: String(pageSize) };
		if (status) query.status = status;
		if (category) query.category = category;
		if (params.search) query.search = params.search;
		setLoading(true);
		try {
			const result = await api.articles.list(query);
			setData({ articles: result.results, count: result.count });
			setError(null);
		} catch (err) {
			// A stale "?page=" past the end (e.g. after deletions): back to the first page.
			if (err instanceof ApiError && err.status === 404 && page > 1) setParams({ page: 1 });
			else setError(messageOf(err, "Chargement impossible."));
		} finally {
			setLoading(false);
		}
	}, [status, category, params.search, page, pageSize, setParams]);

	useEffect(() => {
		void load();
	}, [load]);

	// Debounce the search box into the URL.
	useEffect(() => {
		if (search === params.search) return;
		const timer = setTimeout(() => setParams({ search }), 300);
		return () => clearTimeout(timer);
	}, [search, params.search, setParams]);

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
			setToDelete(null);
			// Reload so the page stays full (or step back if it is now empty).
			if (data?.articles.length === 1 && page > 1) setParams({ page: page - 1 });
			else await load();
		} catch (err) {
			setError(messageOf(err, "Suppression impossible."));
		} finally {
			setDeleting(false);
		}
	}

	const pageCount = data ? Math.max(1, Math.ceil(data.count / pageSize)) : 1;
	const first = (page - 1) * pageSize + 1;
	const filtered = Boolean(status || category || params.search);

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
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<Select
					aria-label="Filtrer par statut"
					value={status}
					onChange={(e) => setParams({ status: e.target.value })}
				>
					<option value="">Tous les statuts</option>
					<option value="draft">Brouillons</option>
					<option value="published">Publiés</option>
				</Select>
				<Select
					aria-label="Filtrer par catégorie"
					value={category}
					onChange={(e) => setParams({ category: e.target.value })}
				>
					<option value="">Toutes les catégories</option>
					{categories.map((c) => (
						<option key={c.id} value={c.slug}>
							{c.name}
						</option>
					))}
				</Select>
			</div>

			{error && (
				<div className="mb-4">
					<Alert>{error}</Alert>
				</div>
			)}
			{data === null ? (
				<TableSkeleton rows={8} />
			) : data.articles.length === 0 ? (
				<p className="rounded-lg bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
					{filtered
						? "Aucun article ne correspond à ces filtres."
						: "Aucun article. Créez le premier avec « Nouvel article »."}
				</p>
			) : (
				<div
					className={`overflow-x-auto rounded-lg bg-white shadow-sm transition-opacity ${loading ? "opacity-60" : ""}`}
					aria-busy={loading}
				>
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
							{data.articles.map((article) => (
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

			{data && data.count > 0 && (
				<div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
					<p aria-live="polite">
						{first}–{first + data.articles.length - 1} sur {data.count} article
						{data.count > 1 ? "s" : ""}
					</p>
					<Pager page={page} pageCount={pageCount} onPage={(p) => setParams({ page: p })} />
					<div className="flex items-center gap-2">
						<label htmlFor={pageSizeId}>Par page</label>
						<Select
							id={pageSizeId}
							value={pageSize}
							onChange={(e) => setParams({ pageSize: Number(e.target.value) })}
							className="!w-20 !py-1"
						>
							{PAGE_SIZES.map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</Select>
					</div>
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

export default function ArticlesPage() {
	return (
		<Suspense fallback={<TableSkeleton rows={8} />}>
			<ArticlesList />
		</Suspense>
	);
}
