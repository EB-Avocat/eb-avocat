"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";
import { AuthCard } from "@/components/backoffice/AuthCard";
import { useBackofficeBase, useBackofficeHref } from "@/components/backoffice/BackofficeContext";
import { Alert, BoButton, Field, TextInput } from "@/components/backoffice/ui";
import { api } from "@/lib/backoffice/api";
import { safeNext } from "@/lib/backoffice/routes";

function LoginForm() {
	const router = useRouter();
	const params = useSearchParams();
	const base = useBackofficeBase();
	const href = useBackofficeHref();
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		setBusy(true);
		setError(null);
		try {
			await api.auth.login(String(form.get("email")), String(form.get("password")));
			router.replace(safeNext(base, params.get("suite")));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Connexion impossible.");
			setBusy(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-4">
			{error && <Alert>{error}</Alert>}
			<Field label="Adresse e-mail">
				{(props) => (
					<TextInput {...props} name="email" type="email" autoComplete="username" required />
				)}
			</Field>
			<Field label="Mot de passe">
				{(props) => (
					<TextInput
						{...props}
						name="password"
						type="password"
						autoComplete="current-password"
						required
					/>
				)}
			</Field>
			<BoButton type="submit" busy={busy} className="mt-2 w-full">
				Se connecter
			</BoButton>
			<Link
				href={href("/mot-de-passe")}
				className="text-center text-sm text-primary hover:underline"
			>
				Mot de passe oublié ?
			</Link>
		</form>
	);
}

export default function LoginPage() {
	return (
		<AuthCard title="Connexion">
			<Suspense>
				<LoginForm />
			</Suspense>
		</AuthCard>
	);
}
