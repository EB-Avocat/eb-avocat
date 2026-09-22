"use client";

import { Copy, KeyRound, Trash2 } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { useSession } from "@/components/backoffice/BackofficeContext";
import type { ImageSource } from "@/components/backoffice/ImageDialog";
import { AvatarField, type StoredImage } from "@/components/backoffice/ImageFields";
import {
	Alert,
	BoButton,
	ConfirmModal,
	Field,
	ListSkeleton,
	PageHeader,
	TextInput,
} from "@/components/backoffice/ui";
import type { CropRequest } from "@/lib/api/schema";
import { api } from "@/lib/backoffice/api";
import { type ApiToken, type Profile, ROLE_LABELS } from "@/lib/backoffice/types";
import { formatPublicationDate } from "@/lib/publications-parse";

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="rounded-lg bg-white p-6 shadow-sm">
			<h2 className="mb-4 text-lg font-700">{title}</h2>
			{children}
		</section>
	);
}

type Feedback = { tone: "error" | "success"; text: string } | null;

function useFeedback() {
	const [feedback, setFeedback] = useState<Feedback>(null);
	const actions = useMemo(
		() => ({
			ok: (text: string) => setFeedback({ tone: "success", text }),
			fail: (err: unknown) =>
				setFeedback({
					tone: "error",
					text: err instanceof Error ? err.message : "Action impossible.",
				}),
			clear: () => setFeedback(null),
		}),
		[],
	);
	return { feedback, ...actions };
}

export default function ProfilePage() {
	return (
		<>
			<PageHeader title="Mon profil" />
			<div className="grid max-w-3xl gap-6">
				<IdentitySection />
				<PasswordSection />
				<TokensSection />
			</div>
		</>
	);
}

function IdentitySection() {
	const { user, setUser } = useSession();
	const [form, setForm] = useState({
		first_name: user.first_name,
		last_name: user.last_name,
		email: user.email,
	});
	const [busy, setBusy] = useState(false);
	const { feedback, ok, fail, clear } = useFeedback();
	const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;

	async function save(event: FormEvent) {
		event.preventDefault();
		setBusy(true);
		clear();
		try {
			setUser(await api.me.update(form));
			ok("Profil mis à jour.");
		} catch (err) {
			fail(err);
		} finally {
			setBusy(false);
		}
	}

	const avatarOf = (profile: Pick<Profile, "avatar" | "avatar_original" | "avatar_crop">) => ({
		url: profile.avatar,
		original: profile.avatar_original,
		crop: profile.avatar_crop,
	});

	/** Copy the avatar fields returned by the API into the session user. */
	function keepAvatar(updated: Pick<Profile, "avatar" | "avatar_original" | "avatar_crop">) {
		const { avatar, avatar_original, avatar_crop } = updated;
		setUser({ ...user, avatar, avatar_original, avatar_crop });
	}

	async function uploadAvatar(source: ImageSource): Promise<StoredImage> {
		clear();
		const updated = await api.me.setAvatar(source);
		keepAvatar(updated);
		return avatarOf(updated);
	}

	async function cropAvatar(crop: CropRequest) {
		keepAvatar(await api.me.cropAvatar(crop));
	}

	async function removeAvatar() {
		await api.me.removeAvatar();
		setUser({ ...user, avatar: null, avatar_original: null, avatar_crop: null });
	}

	return (
		<Section title="Informations">
			{feedback && (
				<div className="mb-4">
					<Alert tone={feedback.tone}>{feedback.text}</Alert>
				</div>
			)}
			<div className="mb-6 flex flex-wrap items-center gap-6">
				<AvatarField
					image={avatarOf(user)}
					name={name}
					onUpload={uploadAvatar}
					onCrop={cropAvatar}
					onRemove={removeAvatar}
					onError={(message) => fail(new Error(message))}
				/>
				<div className="text-sm text-gray-600">
					<p className="font-500 text-near-black">Photo de profil</p>
					<p>
						Cliquez sur la photo pour en importer une nouvelle, depuis votre ordinateur ou un lien.
					</p>
					<p className="text-xs text-gray-500">Affichée à côté de votre nom sur vos articles.</p>
				</div>
			</div>

			<form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
				<Field label="Prénom">
					{(props) => (
						<TextInput
							{...props}
							autoComplete="given-name"
							value={form.first_name}
							onChange={(e) => setForm({ ...form, first_name: e.target.value })}
						/>
					)}
				</Field>
				<Field label="Nom">
					{(props) => (
						<TextInput
							{...props}
							autoComplete="family-name"
							value={form.last_name}
							onChange={(e) => setForm({ ...form, last_name: e.target.value })}
						/>
					)}
				</Field>
				<div className="sm:col-span-2">
					<Field label="Adresse e-mail" hint="Sert d'identifiant de connexion.">
						{(props) => (
							<TextInput
								{...props}
								type="email"
								autoComplete="email"
								required
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
							/>
						)}
					</Field>
				</div>
				<p className="text-sm text-gray-600 sm:col-span-2">
					Rôle : <strong className="font-500">{ROLE_LABELS[user.role]}</strong>
				</p>
				<div>
					<BoButton type="submit" busy={busy}>
						Enregistrer
					</BoButton>
				</div>
			</form>
		</Section>
	);
}

function PasswordSection() {
	const [busy, setBusy] = useState(false);
	const { feedback, ok, fail, clear } = useFeedback();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formElement = event.currentTarget;
		const form = new FormData(formElement);
		if (form.get("new") !== form.get("confirm")) {
			fail(new Error("Les deux nouveaux mots de passe ne correspondent pas."));
			return;
		}
		setBusy(true);
		clear();
		try {
			await api.me.changePassword(String(form.get("current")), String(form.get("new")));
			formElement.reset();
			ok("Mot de passe modifié.");
		} catch (err) {
			fail(err);
		} finally {
			setBusy(false);
		}
	}

	return (
		<Section title="Mot de passe">
			{feedback && (
				<div className="mb-4">
					<Alert tone={feedback.tone}>{feedback.text}</Alert>
				</div>
			)}
			<form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
				<div className="sm:col-span-2">
					<Field label="Mot de passe actuel">
						{(props) => (
							<TextInput
								{...props}
								name="current"
								type="password"
								autoComplete="current-password"
								required
							/>
						)}
					</Field>
				</div>
				<Field label="Nouveau mot de passe" hint="10 caractères minimum.">
					{(props) => (
						<TextInput
							{...props}
							name="new"
							type="password"
							autoComplete="new-password"
							minLength={10}
							required
						/>
					)}
				</Field>
				<Field label="Confirmation">
					{(props) => (
						<TextInput
							{...props}
							name="confirm"
							type="password"
							autoComplete="new-password"
							required
						/>
					)}
				</Field>
				<div>
					<BoButton type="submit" busy={busy}>
						Changer le mot de passe
					</BoButton>
				</div>
			</form>
		</Section>
	);
}

function TokensSection() {
	const [tokens, setTokens] = useState<ApiToken[] | null>(null);
	const [name, setName] = useState("Claude Code");
	const [created, setCreated] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [toRevoke, setToRevoke] = useState<ApiToken | null>(null);
	const [busy, setBusy] = useState(false);
	const { feedback, fail, clear } = useFeedback();

	useEffect(() => {
		api.me
			.tokens()
			.then((page) => setTokens(page.results))
			.catch(fail);
	}, [fail]);

	const origin = typeof window === "undefined" ? "" : window.location.origin;
	const command = created
		? `claude mcp add --transport http eb-avocat ${origin}/mcp --header "Authorization: Bearer ${created}"`
		: "";

	async function create(event: FormEvent) {
		event.preventDefault();
		setBusy(true);
		clear();
		try {
			const { token, ...meta } = await api.me.createToken(name.trim() || "Jeton");
			setTokens((list) => [meta, ...(list ?? [])]);
			setCreated(token);
			setCopied(false);
		} catch (err) {
			fail(err);
		} finally {
			setBusy(false);
		}
	}

	async function revoke() {
		if (!toRevoke) return;
		setBusy(true);
		try {
			await api.me.revokeToken(toRevoke.id);
			setTokens((list) => list?.filter((t) => t.id !== toRevoke.id) ?? null);
			setToRevoke(null);
		} catch (err) {
			fail(err);
		} finally {
			setBusy(false);
		}
	}

	async function copy() {
		await navigator.clipboard.writeText(command);
		setCopied(true);
	}

	return (
		<Section title="Claude Code (MCP) et jetons d'API">
			<p className="mb-4 text-sm text-gray-600">
				Un jeton permet à Claude Code de lister, rédiger et publier des articles en votre nom, avec
				les mêmes droits que votre compte. Créez-en un par ordinateur ; révoquez-le à tout moment.
			</p>
			{feedback && (
				<div className="mb-4">
					<Alert tone={feedback.tone}>{feedback.text}</Alert>
				</div>
			)}

			<form onSubmit={create} className="mb-4 flex max-w-md gap-2">
				<label htmlFor="token-name" className="sr-only">
					Nom du jeton
				</label>
				<TextInput
					id="token-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Nom (ex. : MacBook)"
				/>
				<BoButton type="submit" busy={busy}>
					<KeyRound className="h-4 w-4" aria-hidden="true" />
					Créer un jeton
				</BoButton>
			</form>

			{created && (
				<div className="mb-6 rounded border border-primary/30 bg-primary-light/5 p-4">
					<p className="mb-2 text-sm font-500">
						Copiez cette commande dans votre terminal : le jeton ne sera plus jamais affiché.
					</p>
					<pre className="mb-3 overflow-x-auto whitespace-pre-wrap break-all rounded bg-near-black p-3 text-xs text-white">
						<code>{command}</code>
					</pre>
					<BoButton variant="secondary" onClick={copy}>
						<Copy className="h-4 w-4" aria-hidden="true" />
						{copied ? "Copié !" : "Copier la commande"}
					</BoButton>
				</div>
			)}

			{tokens === null && <ListSkeleton rows={2} />}
			{tokens && tokens.length > 0 && (
				<ul className="divide-y divide-gray-100 rounded border border-gray-200">
					{tokens.map((token) => (
						<li
							key={token.id}
							className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
						>
							<div>
								<p className="font-500">{token.name}</p>
								<p className="text-xs text-gray-500">
									<code>{token.prefix}…</code> · créé le {formatPublicationDate(token.created_at)}
									{token.last_used_at
										? ` · utilisé le ${formatPublicationDate(token.last_used_at)}`
										: " · jamais utilisé"}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setToRevoke(token)}
								className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-700"
								aria-label={`Révoquer ${token.name}`}
							>
								<Trash2 className="h-4 w-4" aria-hidden="true" />
							</button>
						</li>
					))}
				</ul>
			)}

			<ConfirmModal
				open={toRevoke !== null}
				title="Révoquer le jeton"
				message={<>Les outils utilisant « {toRevoke?.name} » perdront immédiatement l'accès.</>}
				confirmLabel="Révoquer"
				busy={busy}
				onConfirm={revoke}
				onClose={() => setToRevoke(null)}
			/>
		</Section>
	);
}
