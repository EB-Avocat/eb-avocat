import type { ReactNode } from "react";
import { Main } from "@/components/ui/Main";

/** Centered card used by the login and password-reset screens. */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
	return (
		<Main className="flex min-h-screen items-center justify-center px-4 py-12">
			<div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
				<p className="mb-1 text-center text-sm font-500 text-primary">Eva Biezunski · Gestion</p>
				<h1 className="mb-6 text-center text-xl font-700 text-near-black">{title}</h1>
				{children}
			</div>
		</Main>
	);
}
