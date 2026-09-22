"use client";

import { ExternalLink, FileText, KeyRound, LogOut, Menu, Tags, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import {
	SessionProvider,
	useBackofficeBase,
	useBackofficeHref,
} from "@/components/backoffice/BackofficeContext";
import { FullPageSpinner } from "@/components/backoffice/ui";
import { Main } from "@/components/ui/Main";
import { ApiError, api } from "@/lib/backoffice/api";
import { relativePath } from "@/lib/backoffice/routes";
import type { Profile } from "@/lib/backoffice/types";
import { Avatar } from "./Avatar";

/** Authenticated back-office frame: loads the session, then renders nav + page. */
export function Shell({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const base = useBackofficeBase();
	const href = useBackofficeHref();
	const [user, setUser] = useState<Profile | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		api.me
			.get()
			.then(setUser)
			.catch((error: unknown) => {
				if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
					const next = relativePath(base, pathname);
					router.replace(`${href("/connexion")}?suite=${encodeURIComponent(next)}`);
				}
			});
	}, [base, href, pathname, router]);

	// Close the mobile menu on navigation.
	// biome-ignore lint/correctness/useExhaustiveDependencies: runs on route change
	useEffect(() => setMenuOpen(false), [pathname]);

	if (!user) return <FullPageSpinner label="Ouverture de l'espace de gestion…" />;

	const links = [
		{ path: "/articles", label: "Articles", icon: FileText },
		{ path: "/categories", label: "Catégories", icon: Tags },
		{ path: "/profil", label: "Mon profil", icon: KeyRound },
		...(user.role === "admin"
			? [{ path: "/utilisateurs", label: "Utilisateurs", icon: Users }]
			: []),
	];
	const current = relativePath(base, pathname);
	const isActive = (path: string) => current === path || current.startsWith(`${path}/`);

	async function logout() {
		await api.auth.logout().catch(() => undefined);
		router.replace(href("/connexion"));
	}

	const nav = (
		<nav aria-label="Espace de gestion" className="flex flex-col gap-1">
			{links.map(({ path, label, icon: Icon }) => (
				<Link
					key={path}
					href={href(path)}
					aria-current={isActive(path) ? "page" : undefined}
					className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-500 transition-colors ${
						isActive(path)
							? "bg-primary text-white"
							: "text-near-black/80 hover:bg-primary-light/10"
					}`}
				>
					<Icon className="h-4 w-4" aria-hidden="true" />
					{label}
				</Link>
			))}
			<a
				href="/publications"
				target="_blank"
				rel="noopener"
				className="flex items-center gap-3 rounded px-3 py-2 text-sm font-500 text-near-black/80 hover:bg-primary-light/10"
			>
				<ExternalLink className="h-4 w-4" aria-hidden="true" />
				Voir le site
			</a>
		</nav>
	);

	return (
		<SessionProvider value={{ user, setUser }}>
			<div className="flex min-h-screen">
				<aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-gray-200 bg-white p-4 md:flex">
					<div>
						<p className="mb-6 px-3 font-700 text-primary">Eva Biezunski · Gestion</p>
						{nav}
					</div>
					<UserBox user={user} onLogout={logout} />
				</aside>

				<div className="flex min-w-0 flex-1 flex-col">
					<header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
						<span className="font-700 text-primary">Gestion</span>
						<button
							type="button"
							onClick={() => setMenuOpen((o) => !o)}
							aria-expanded={menuOpen}
							aria-controls="bo-mobile-nav"
							aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
							className="rounded p-2 hover:bg-gray-100"
						>
							{menuOpen ? (
								<X className="h-5 w-5" aria-hidden="true" />
							) : (
								<Menu className="h-5 w-5" aria-hidden="true" />
							)}
						</button>
					</header>
					{menuOpen && (
						<div id="bo-mobile-nav" className="border-b border-gray-200 bg-white p-4 md:hidden">
							{nav}
							<div className="mt-4">
								<UserBox user={user} onLogout={logout} />
							</div>
						</div>
					)}
					<Main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">{children}</Main>
				</div>
			</div>
		</SessionProvider>
	);
}

function UserBox({ user, onLogout }: { user: Profile; onLogout: () => void }) {
	const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
	return (
		<div className="flex items-center gap-3 border-t border-gray-200 pt-4">
			<Avatar src={user.avatar} name={name} size={36} />
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-500">{name}</p>
				<button
					type="button"
					onClick={onLogout}
					className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary"
				>
					<LogOut className="h-3 w-3" aria-hidden="true" />
					Se déconnecter
				</button>
			</div>
		</div>
	);
}
