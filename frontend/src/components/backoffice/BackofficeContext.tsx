"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";
import { backofficeHref } from "@/lib/backoffice/routes";
import type { Profile } from "@/lib/backoffice/types";

interface BackofficeBase {
	/** Secret public prefix, e.g. "/admin-xyz". */
	base: string;
}

const BaseContext = createContext<BackofficeBase | null>(null);

export function BackofficeBaseProvider({ base, children }: { base: string; children: ReactNode }) {
	const value = useMemo(() => ({ base }), [base]);
	return <BaseContext.Provider value={value}>{children}</BaseContext.Provider>;
}

/** `href("/articles")` → "/admin-xyz/articles". */
export function useBackofficeHref(): (path?: string) => string {
	const base = useBackofficeBase();
	// Stable identity: callers list it in effect dependencies (e.g. the Shell's /me/ fetch).
	return useCallback((path = "") => backofficeHref(base, path), [base]);
}

export function useBackofficeBase(): string {
	const ctx = useContext(BaseContext);
	if (!ctx) throw new Error("useBackofficeBase must be used inside BackofficeBaseProvider");
	return ctx.base;
}

interface SessionValue {
	user: Profile;
	setUser: (user: Profile) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export const SessionProvider = SessionContext.Provider;

/** The signed-in user (only inside the authenticated shell). */
export function useSession(): SessionValue {
	const ctx = useContext(SessionContext);
	if (!ctx) throw new Error("useSession must be used inside the back-office shell");
	return ctx;
}
