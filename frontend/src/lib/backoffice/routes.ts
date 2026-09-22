/** Internal route where the back-office screens live (never linked directly). */
export const BACKOFFICE_INTERNAL_PREFIX = "/backoffice";

/** Back-office pages reachable without a session. */
export const PUBLIC_BACKOFFICE_PAGES = ["/connexion", "/mot-de-passe"] as const;

/** `pathname` is `prefix` itself or a path below it (not "/admin-xyzabc" for "/admin-xyz"). */
export function isWithin(pathname: string, prefix: string): boolean {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Build a back-office URL under the secret public prefix (`base` is e.g. "/admin-xyz"). */
export function backofficeHref(base: string, path = ""): string {
	if (!path || path === "/") return base;
	return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Path relative to the back-office root. `usePathname()` may report either the
 * public secret URL or the internal rewritten one, so both prefixes are stripped.
 */
export function relativePath(base: string, pathname: string): string {
	for (const prefix of [base, BACKOFFICE_INTERNAL_PREFIX]) {
		if (isWithin(pathname, prefix)) return pathname.slice(prefix.length) || "/";
	}
	return pathname;
}

/** Only allow redirect targets inside the back-office (prevents open redirects). */
export function safeNext(base: string, next: string | null): string {
	if (!next?.startsWith("/") || next.startsWith("//")) return backofficeHref(base, "/articles");
	return backofficeHref(base, next);
}
