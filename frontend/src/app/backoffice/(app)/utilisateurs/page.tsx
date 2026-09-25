"use client";

import { Mail, Trash2, UserPlus } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Avatar } from "@/components/backoffice/Avatar";
import { useSession } from "@/components/backoffice/BackofficeContext";
import {
	Alert,
	Badge,
	BoButton,
	ConfirmModal,
	FeedbackAlert,
	Field,
	ListSkeleton,
	Modal,
	PageHeader,
	Select,
	TextInput,
	useFeedback,
} from "@/components/backoffice/ui";
import { api, messageOf } from "@/lib/backoffice/api";
import { displayName, type ManagedUser, ROLE_LABELS, type Role } from "@/lib/backoffice/types";

const ROLE_HELP: Record<Role, string> = {
	admin: "Gère les utilisateurs, les rôles, les catégories et tous les articles.",
	editor: "Gère les catégories et tous les articles.",
	author: "Rédige et publie ses propres articles.",
};

export default function UsersPage() {
	const { user: me } = useSession();
	const [users, setUsers] = useState<ManagedUser[] | null>(null);
	const [inviting, setInviting] = useState(false);
	const [toDelete, setToDelete] = useState<ManagedUser | null>(null);
	const [busy, setBusy] = useState(false);
	const { feedback, ok, fail, clear } = useFeedback();
	const replace = (u: ManagedUser) =>
		setUsers((list) => list?.map((x) => (x.id === u.id ? u : x)) ?? null);

	useEffect(() => {
		api.users
			.list()
			.then((page) => setUsers(page.results))
			.catch(fail);
	}, [fail]);

	if (me.role !== "admin") return <Alert>Cette page est réservée aux administrateurs.</Alert>;

	async function change(user: ManagedUser, data: Partial<Pick<ManagedUser, "role" | "is_active">>) {
		clear();
		try {
			replace(await api.users.update(user.id, data));
		} catch (err) {
			fail(err);
		}
	}

	async function sendReset(user: ManagedUser) {
		try {
			await api.auth.requestReset(user.email);
			ok(`Lien de choix du mot de passe envoyé à ${user.email}.`);
		} catch (err) {
			fail(err);
		}
	}

	async function remove() {
		if (!toDelete) return;
		setBusy(true);
		try {
			await api.users.remove(toDelete.id);
			setUsers((list) => list?.filter((u) => u.id !== toDelete.id) ?? null);
			setToDelete(null);
		} catch (err) {
			fail(err);
			setToDelete(null);
		} finally {
			setBusy(false);
		}
	}

	return (
		<>
			<PageHeader
				title="Utilisateurs"
				actions={
					<BoButton onClick={() => setInviting(true)}>
						<UserPlus className="h-4 w-4" aria-hidden="true" />
						Ajouter un utilisateur
					</BoButton>
				}
			/>

			<FeedbackAlert feedback={feedback} />

			{users === null ? (
				<ListSkeleton rows={4} avatar />
			) : (
				<ul className="divide-y divide-gray-100 rounded-lg bg-white shadow-sm">
					{users.map((user) => {
						const name = displayName(user);
						const isMe = user.id === me.id;
						return (
							<li key={user.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
								<Avatar src={user.avatar} name={name} size={40} />
								<div className="min-w-48 flex-1">
									<p className="text-sm font-500">
										{name} {isMe && <Badge tone="primary">vous</Badge>}{" "}
										{!user.is_active && <Badge>désactivé</Badge>}
									</p>
									<p className="text-xs text-gray-500">{user.email}</p>
								</div>
								<label className="sr-only" htmlFor={`role-${user.id}`}>
									Rôle de {name}
								</label>
								<Select
									id={`role-${user.id}`}
									value={user.role}
									disabled={isMe}
									onChange={(e) => change(user, { role: e.target.value as Role })}
									className="!w-40"
								>
									{Object.entries(ROLE_LABELS).map(([value, label]) => (
										<option key={value} value={value}>
											{label}
										</option>
									))}
								</Select>
								<div className="flex gap-1">
									<button
										type="button"
										onClick={() => sendReset(user)}
										className="rounded p-2 text-gray-500 hover:bg-gray-100"
										aria-label={`Envoyer un lien de mot de passe à ${name}`}
										title="Envoyer un lien de mot de passe"
									>
										<Mail className="h-4 w-4" aria-hidden="true" />
									</button>
									{!isMe && (
										<>
											<BoButton
												variant="ghost"
												onClick={() => change(user, { is_active: !user.is_active })}
											>
												{user.is_active ? "Désactiver" : "Réactiver"}
											</BoButton>
											<button
												type="button"
												onClick={() => setToDelete(user)}
												className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-700"
												aria-label={`Supprimer ${name}`}
											>
												<Trash2 className="h-4 w-4" aria-hidden="true" />
											</button>
										</>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			)}

			<InviteModal
				open={inviting}
				onClose={() => setInviting(false)}
				onCreated={(user, invited) => {
					setUsers((list) => [...(list ?? []), user]);
					setInviting(false);
					ok(
						invited
							? `${user.email} a été créé et a reçu un lien pour choisir son mot de passe.`
							: `${user.email} a été créé.`,
					);
				}}
			/>

			<ConfirmModal
				open={toDelete !== null}
				title="Supprimer l'utilisateur"
				message={
					<>
						{toDelete?.email} sera définitivement supprimé. Un utilisateur ayant rédigé des articles
						ne peut pas être supprimé : désactivez-le plutôt.
					</>
				}
				confirmLabel="Supprimer"
				busy={busy}
				onConfirm={remove}
				onClose={() => setToDelete(null)}
			/>
		</>
	);
}

function InviteModal({
	open,
	onClose,
	onCreated,
}: {
	open: boolean;
	onClose: () => void;
	onCreated: (user: ManagedUser, invited: boolean) => void;
}) {
	const [role, setRole] = useState<Role>("author");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formElement = event.currentTarget;
		const form = new FormData(formElement);
		const password = String(form.get("password") ?? "");
		setBusy(true);
		setError(null);
		try {
			const user = await api.users.create({
				email: String(form.get("email")),
				first_name: String(form.get("first_name")),
				last_name: String(form.get("last_name")),
				role,
				password: password || undefined,
			});
			// Without a password, the backend emails an invitation to choose one.
			formElement.reset();
			onCreated(user, !password);
		} catch (err) {
			setError(messageOf(err, "Création impossible."));
		} finally {
			setBusy(false);
		}
	}

	return (
		<Modal open={open} title="Ajouter un utilisateur" onClose={onClose}>
			<form onSubmit={submit} className="flex flex-col gap-4">
				{error && <Alert>{error}</Alert>}
				<div className="grid grid-cols-2 gap-3">
					<Field label="Prénom">{(props) => <TextInput {...props} name="first_name" />}</Field>
					<Field label="Nom">{(props) => <TextInput {...props} name="last_name" />}</Field>
				</div>
				<Field label="Adresse e-mail">
					{(props) => <TextInput {...props} name="email" type="email" required />}
				</Field>
				<Field label="Rôle" hint={ROLE_HELP[role]}>
					{(props) => (
						<Select {...props} value={role} onChange={(e) => setRole(e.target.value as Role)}>
							{Object.entries(ROLE_LABELS).map(([value, label]) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</Select>
					)}
				</Field>
				<Field
					label="Mot de passe (facultatif)"
					hint="Laissez vide pour envoyer un lien permettant à l'utilisateur de le choisir."
				>
					{(props) => (
						<TextInput
							{...props}
							name="password"
							type="password"
							autoComplete="new-password"
							minLength={10}
						/>
					)}
				</Field>
				<div className="flex justify-end gap-2">
					<BoButton variant="secondary" onClick={onClose}>
						Annuler
					</BoButton>
					<BoButton type="submit" busy={busy}>
						Créer
					</BoButton>
				</div>
			</form>
		</Modal>
	);
}
