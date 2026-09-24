"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { AuthCard } from "@/components/backoffice/AuthCard";
import { useBackofficeHref } from "@/components/backoffice/BackofficeContext";
import { Alert, BoButton, Field, TextInput } from "@/components/backoffice/ui";
import { api, messageOf } from "@/lib/backoffice/api";

export default function PasswordResetRequestPage() {
	const href = useBackofficeHref();
	const [sent, setSent] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		setError(null);
		try {
			await api.auth.requestReset(String(new FormData(event.currentTarget).get("email")));
			setSent(true);
		} catch (err) {
			setError(messageOf(err, "Envoi impossible."));
		} finally {
			setBusy(false);
		}
	}

	return (
		<AuthCard title="Mot de passe oublié">
			{sent ? (
				<Alert tone="success">
					Si un compte correspond à cette adresse, un e-mail contenant un lien de réinitialisation
					vient d'être envoyé.
				</Alert>
			) : (
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					{error && <Alert>{error}</Alert>}
					<Field label="Adresse e-mail">
						{(props) => (
							<TextInput {...props} name="email" type="email" autoComplete="email" required />
						)}
					</Field>
					<BoButton type="submit" busy={busy} className="w-full">
						Recevoir un lien
					</BoButton>
				</form>
			)}
			<Link
				href={href("/connexion")}
				className="mt-4 block text-center text-sm text-primary hover:underline"
			>
				Retour à la connexion
			</Link>
		</AuthCard>
	);
}
