"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";
import { AuthCard } from "@/components/backoffice/AuthCard";
import { useBackofficeHref } from "@/components/backoffice/BackofficeContext";
import { Alert, BoButton, Field, TextInput } from "@/components/backoffice/ui";
import { api } from "@/lib/backoffice/api";

function NewPasswordForm() {
	const params = useSearchParams();
	const href = useBackofficeHref();
	const [done, setDone] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const password = String(form.get("password"));
		if (password !== String(form.get("confirm"))) {
			setError("Les deux mots de passe ne correspondent pas.");
			return;
		}
		setBusy(true);
		setError(null);
		try {
			await api.auth.confirmReset(params.get("uid") ?? "", params.get("token") ?? "", password);
			setDone(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Réinitialisation impossible.");
		} finally {
			setBusy(false);
		}
	}

	if (done) {
		return (
			<>
				<Alert tone="success">Votre mot de passe a été modifié.</Alert>
				<Link
					href={href("/connexion")}
					className="mt-4 block text-center text-sm text-primary hover:underline"
				>
					Se connecter
				</Link>
			</>
		);
	}

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-4">
			{error && <Alert>{error}</Alert>}
			<Field label="Nouveau mot de passe" hint="10 caractères minimum.">
				{(props) => (
					<TextInput
						{...props}
						name="password"
						type="password"
						autoComplete="new-password"
						minLength={10}
						required
					/>
				)}
			</Field>
			<Field label="Confirmer le mot de passe">
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
			<BoButton type="submit" busy={busy} className="w-full">
				Enregistrer
			</BoButton>
		</form>
	);
}

export default function NewPasswordPage() {
	return (
		<AuthCard title="Nouveau mot de passe">
			<Suspense>
				<NewPasswordForm />
			</Suspense>
		</AuthCard>
	);
}
