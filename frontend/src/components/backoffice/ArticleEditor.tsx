"use client";

import { ArrowLeft, Eye, FileCode2, PenLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useBackofficeHref, useSession } from "@/components/backoffice/BackofficeContext";
import { CategoryPicker } from "@/components/backoffice/CategoryPicker";
import { RichEditor } from "@/components/backoffice/editor/RichEditor";
import type { ImageSource } from "@/components/backoffice/ImageDialog";
import { CoverField, type StoredImage } from "@/components/backoffice/ImageFields";
import {
	Alert,
	BoButton,
	ConfirmModal,
	Field,
	Select,
	Skeleton,
	SkeletonGroup,
	TextArea,
	TextInput,
} from "@/components/backoffice/ui";
import { ArticleView } from "@/components/publications/ArticleView";
import type { CropRequest } from "@/lib/api/schema";
import { api, messageOf } from "@/lib/backoffice/api";
import {
	type AdminArticle,
	type AdminCategory,
	type ArticleInput,
	type ArticleStatus,
	STATUS_LABELS,
} from "@/lib/backoffice/types";

type Mode = "visual" | "markdown" | "preview";

const MODES: { id: Mode; label: string; icon: typeof Eye }[] = [
	{ id: "visual", label: "Visuel", icon: PenLine },
	{ id: "markdown", label: "Markdown", icon: FileCode2 },
	{ id: "preview", label: "Aperçu", icon: Eye },
];

const EMPTY: ArticleInput = {
	title: "",
	slug: "",
	summary: "",
	body_markdown: "",
	cover_alt: "",
	status: "draft",
	published_at: null,
	category_ids: [],
};

function toInput(article: AdminArticle): ArticleInput {
	return {
		title: article.title,
		slug: article.slug,
		summary: article.summary,
		body_markdown: article.body_markdown,
		cover_alt: article.cover_alt,
		status: article.status,
		published_at: article.published_at,
		category_ids: article.categories.map((c) => c.id),
	};
}

function coverOf(article: AdminArticle | null): StoredImage {
	return {
		url: article?.cover ?? null,
		original: article?.cover_original ?? null,
		crop: article?.cover_crop ?? null,
	};
}

/** `datetime-local` value (local time) ↔ ISO string. */
function toLocalInput(iso: string | null): string {
	if (!iso) return "";
	const date = new Date(iso);
	const offset = date.getTimezoneOffset() * 60_000;
	return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

/** Placeholder with the editor's layout while the article loads. */
export function ArticleEditorSkeleton() {
	return (
		<SkeletonGroup label="Chargement de l'article…">
			<div className="mb-6 flex items-center justify-between">
				<Skeleton className="h-4 w-32" />
				<div className="flex gap-2">
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-28" />
				</div>
			</div>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<div className="flex flex-col gap-4">
					<Skeleton className="h-10 w-3/4" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-20 w-full" />
					<Skeleton className="aspect-[16/9] w-full !rounded-lg" />
					<Skeleton className="h-9 w-64" />
					<Skeleton className="h-96 w-full !rounded-lg" />
				</div>
				<div className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-sm lg:self-start">
					{[0, 1, 2].map((key) => (
						<div key={key} className="flex flex-col gap-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-9 w-full" />
						</div>
					))}
				</div>
			</div>
		</SkeletonGroup>
	);
}

export function ArticleEditor({ id }: { id: string | null }) {
	const router = useRouter();
	const href = useBackofficeHref();
	const { user } = useSession();
	const titleId = useId();
	const bodyLabelId = useId();

	const [article, setArticle] = useState<AdminArticle | null>(null);
	const [form, setForm] = useState<ArticleInput>(EMPTY);
	const [saved, setSaved] = useState<ArticleInput>(EMPTY);
	const [categories, setCategories] = useState<AdminCategory[]>([]);
	const [loading, setLoading] = useState(id !== null);
	const [mode, setMode] = useState<Mode>("visual");
	const [previewHtml, setPreviewHtml] = useState("");
	const [busy, setBusy] = useState<null | "save" | "delete">(null);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const dirty = JSON.stringify(form) !== JSON.stringify(saved);
	const update = (patch: Partial<ArticleInput>) => setForm((f) => ({ ...f, ...patch }));

	useEffect(() => {
		api.categories
			.list()
			.then(setCategories)
			.catch(() => undefined);
		if (!id) return;
		api.articles
			.get(id)
			.then((a) => {
				setArticle(a);
				setForm(toInput(a));
				setSaved(toInput(a));
			})
			.catch((err) => setError(messageOf(err, "Article introuvable.")))
			.finally(() => setLoading(false));
	}, [id]);

	// Warn before leaving with unsaved changes.
	useEffect(() => {
		if (!dirty) return;
		const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => window.removeEventListener("beforeunload", onBeforeUnload);
	}, [dirty]);

	// Guards against concurrent saves (e.g. Ctrl+S pressed twice on a new article would
	// otherwise POST twice and create a duplicate).
	const saving = useRef(false);
	// A new article lives at ".../articles/nouveau" until it is saved; moving to its
	// own URL remounts the editor (keyed by id), so it happens once, when nothing is pending.
	const needsRoute = useRef(id === null);
	const goToSavedArticle = useCallback(
		(articleId: string) => {
			needsRoute.current = false;
			router.replace(href(`/articles/${articleId}`));
		},
		[href, router],
	);

	const save = useCallback(
		async (
			overrides: Partial<ArticleInput> = {},
			{ navigate = true }: { navigate?: boolean } = {},
		): Promise<AdminArticle | null> => {
			if (saving.current) return null;
			const sent = form;
			const data = { ...sent, ...overrides };
			if (!data.title.trim()) {
				setError("Le titre est obligatoire.");
				return null;
			}
			saving.current = true;
			setBusy("save");
			setError(null);
			try {
				const result = article
					? await api.articles.update(article.id, data)
					: await api.articles.create(data);
				const stored = toInput(result);
				setArticle(result);
				// Keep anything typed while the request was in flight (it stays "unsaved").
				setForm((current) =>
					current === sent
						? stored
						: {
								...current,
								status: result.status,
								published_at: current.published_at ?? result.published_at,
								slug: current.slug || result.slug,
							},
				);
				setSaved(stored);
				setNotice(
					result.status === "published" ? "Article enregistré et publié." : "Brouillon enregistré.",
				);
				if (navigate && needsRoute.current) goToSavedArticle(result.id);
				return result;
			} catch (err) {
				setError(messageOf(err, "Enregistrement impossible."));
				return null;
			} finally {
				saving.current = false;
				setBusy(null);
			}
		},
		[article, form, goToSavedArticle],
	);

	// Ctrl/Cmd + S saves.
	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
				event.preventDefault();
				void save();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [save]);

	useEffect(() => {
		if (!notice) return;
		const timer = setTimeout(() => setNotice(null), 4000);
		return () => clearTimeout(timer);
	}, [notice]);

	// Preview renders the Markdown with the backend's own renderer + sanitiser.
	const previewRequest = useRef(0);
	useEffect(() => {
		if (mode !== "preview") return;
		const request = ++previewRequest.current;
		api.articles
			.preview(form.body_markdown)
			.then(({ html }) => request === previewRequest.current && setPreviewHtml(html))
			.catch((err) => setError(messageOf(err, "Aperçu indisponible.")));
	}, [mode, form.body_markdown]);

	async function uploadInlineImage(source: ImageSource): Promise<string> {
		const { url } = await api.articles.uploadImage(source);
		if (!url) throw new Error("Import de l'image impossible.");
		return url;
	}

	async function uploadCover(source: ImageSource): Promise<StoredImage> {
		// A cover needs an article id: save the draft first if needed. The move to the
		// new article's URL waits until the image dialog is closed (it remounts the editor).
		const target = article ?? (await save({}, { navigate: false }));
		if (!target) throw new Error("Donnez un titre à l'article avant d'ajouter une image.");
		const result = await api.articles.setCover(target.id, source, form.cover_alt);
		setArticle(result);
		return coverOf(result);
	}

	async function cropCover(crop: CropRequest) {
		if (!article) return;
		setArticle(await api.articles.cropCover(article.id, crop));
	}

	async function removeCover() {
		if (!article) return;
		setArticle(await api.articles.removeCover(article.id));
	}

	async function remove() {
		if (!article) return;
		setBusy("delete");
		try {
			await api.articles.remove(article.id);
			setSaved(form); // no "unsaved changes" prompt
			router.replace(href("/articles"));
		} catch (err) {
			setError(messageOf(err, "Suppression impossible."));
			setBusy(null);
		}
	}

	if (loading) return <ArticleEditorSkeleton />;
	if (id && !article) return <Alert>{error ?? "Article introuvable."}</Alert>;

	const selectedCategories = form.category_ids
		.map((cid) => categories.find((c) => c.id === cid))
		.filter((c): c is AdminCategory => !!c);
	const authorName =
		article?.author.name ??
		([user.first_name, user.last_name].filter(Boolean).join(" ") || user.email);

	return (
		<>
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
				<Link
					href={href("/articles")}
					className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Tous les articles
				</Link>
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-xs text-gray-500" aria-live="polite">
						{dirty ? "Modifications non enregistrées" : article ? "Enregistré" : ""}
					</span>
					{form.status === "published" ? (
						<BoButton
							variant="secondary"
							busy={busy === "save"}
							onClick={() => save({ status: "draft" })}
						>
							Repasser en brouillon
						</BoButton>
					) : (
						<BoButton
							variant="secondary"
							busy={busy === "save"}
							onClick={() => save({ status: "published" })}
						>
							Publier
						</BoButton>
					)}
					<BoButton busy={busy === "save"} onClick={() => save()} title="Ctrl/⌘ + S">
						Enregistrer
					</BoButton>
				</div>
			</div>

			<div className="mb-4 flex flex-col gap-3" aria-live="polite">
				{error && <Alert>{error}</Alert>}
				{notice && <Alert tone="success">{notice}</Alert>}
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
				{/* Same order as the published page: title, categories, summary, cover, body. */}
				<div className="flex min-w-0 flex-col gap-5">
					<div>
						<label className="sr-only" htmlFor={titleId}>
							Titre
						</label>
						<input
							id={titleId}
							value={form.title}
							onChange={(e) => update({ title: e.target.value })}
							placeholder="Titre de l'article"
							className="w-full border-0 bg-transparent text-3xl font-700 text-near-black placeholder:text-gray-300 focus:outline-none"
						/>
					</div>

					<CategoryPicker
						all={categories}
						selectedIds={form.category_ids}
						onChange={(category_ids) => update({ category_ids })}
						onCreated={(c) => setCategories((list) => [...list, c])}
						onError={setError}
					/>

					<Field label="Résumé" hint="Affiché sur les cartes et en tête d'article.">
						{(props) => (
							<TextArea
								{...props}
								rows={3}
								value={form.summary}
								placeholder="Quelques phrases pour donner envie de lire l'article…"
								onChange={(e) => update({ summary: e.target.value })}
							/>
						)}
					</Field>

					<section aria-label="Image de couverture" className="flex flex-col gap-2">
						<CoverField
							image={coverOf(article)}
							onUpload={uploadCover}
							onCrop={cropCover}
							onRemove={removeCover}
							onError={setError}
							onDialogClosed={() => {
								if (needsRoute.current && article) goToSavedArticle(article.id);
							}}
						/>
						{article?.cover && (
							<>
								<Field
									label="Texte alternatif de la couverture"
									hint="Décrit l'image pour les personnes qui ne la voient pas."
								>
									{(props) => (
										<TextInput
											{...props}
											value={form.cover_alt}
											onChange={(e) => update({ cover_alt: e.target.value })}
										/>
									)}
								</Field>
								{article.cover_source_url && (
									<p className="break-all text-xs text-gray-500">
										Copie de{" "}
										<a
											href={article.cover_source_url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											{article.cover_source_url}
										</a>
									</p>
								)}
							</>
						)}
					</section>

					<div
						role="tablist"
						aria-label="Mode d'édition"
						className="flex gap-1 self-start rounded-lg bg-white p-1 shadow-sm"
					>
						{MODES.map(({ id: modeId, label, icon: Icon }) => (
							<button
								key={modeId}
								type="button"
								role="tab"
								aria-selected={mode === modeId}
								onClick={() => setMode(modeId)}
								className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-500 ${mode === modeId ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
							>
								<Icon className="h-4 w-4" aria-hidden="true" />
								{label}
							</button>
						))}
					</div>

					<span id={bodyLabelId} className="sr-only">
						Contenu de l'article
					</span>
					<div role="tabpanel">
						{mode === "visual" && (
							<RichEditor
								value={form.body_markdown}
								onChange={(body_markdown) => update({ body_markdown })}
								uploadImage={uploadInlineImage}
								onError={setError}
								labelledBy={bodyLabelId}
							/>
						)}
						{mode === "markdown" && (
							<TextArea
								aria-labelledby={bodyLabelId}
								value={form.body_markdown}
								onChange={(e) => update({ body_markdown: e.target.value })}
								spellCheck
								className="min-h-[28rem] font-mono text-sm leading-relaxed"
							/>
						)}
						{mode === "preview" && (
							<div className="rounded-lg border border-gray-200 bg-white px-6 py-10 md:px-12">
								<div className="mx-auto max-w-3xl">
									<ArticleView
										publication={{
											title: form.title || "Sans titre",
											summary: form.summary,
											categories: selectedCategories.map((c) => ({
												id: c.id,
												name: c.name,
												slug: c.slug,
												isPrimary: c.is_primary,
											})),
											date: form.published_at ?? new Date().toISOString(),
											cover: article?.cover ?? null,
											coverAlt: form.cover_alt,
											author: {
												name: authorName,
												avatarUrl: article?.author.avatar ?? user.avatar,
											},
											html: previewHtml,
										}}
									/>
								</div>
							</div>
						)}
					</div>
				</div>

				<aside className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:self-start">
					<Field label="Statut">
						{(props) => (
							<Select
								{...props}
								value={form.status}
								onChange={(e) => update({ status: e.target.value as ArticleStatus })}
							>
								{Object.entries(STATUS_LABELS).map(([value, label]) => (
									<option key={value} value={value}>
										{label}
									</option>
								))}
							</Select>
						)}
					</Field>

					<Field
						label="Date de publication"
						hint="Vide : date du passage en « Publié ». Une date future programme la parution."
					>
						{(props) => (
							<TextInput
								{...props}
								type="datetime-local"
								value={toLocalInput(form.published_at)}
								onChange={(e) =>
									update({
										published_at: e.target.value ? new Date(e.target.value).toISOString() : null,
									})
								}
							/>
						)}
					</Field>

					<Field label="Adresse (slug)" hint={`/publications/${form.slug || "…"}`}>
						{(props) => (
							<TextInput
								{...props}
								value={form.slug ?? ""}
								placeholder="généré depuis le titre"
								onChange={(e) => update({ slug: e.target.value })}
							/>
						)}
					</Field>

					{article && (
						<div className="border-t border-gray-200 pt-4">
							{article.status === "published" && (
								<a
									href={`/publications/${article.slug}`}
									target="_blank"
									rel="noopener"
									className="mb-3 block text-sm text-primary hover:underline"
								>
									Voir l'article en ligne
								</a>
							)}
							<BoButton
								variant="ghost"
								className="!px-0 text-red-700 hover:!bg-transparent"
								onClick={() => setConfirmDelete(true)}
							>
								<Trash2 className="h-4 w-4" aria-hidden="true" />
								Supprimer l'article
							</BoButton>
						</div>
					)}
				</aside>
			</div>

			<ConfirmModal
				open={confirmDelete}
				title="Supprimer l'article"
				message={<>« {form.title} » sera définitivement supprimé.</>}
				confirmLabel="Supprimer"
				busy={busy === "delete"}
				onConfirm={remove}
				onClose={() => setConfirmDelete(false)}
			/>
		</>
	);
}
