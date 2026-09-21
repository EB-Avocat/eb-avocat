import { type NextRequest, NextResponse } from "next/server";
import { BACKOFFICE_INTERNAL_PREFIX, PUBLIC_BACKOFFICE_PAGES } from "@/lib/backoffice/routes";

/**
 * Back-office routing. The screens live under the internal `/backoffice/*` route
 * but are only reachable through the secret `/${BACKOFFICE_PATH}/*` prefix (e.g.
 * `/admin-<uuid>`), which is rewritten here. Direct hits on `/backoffice` get the
 * 404 page. Without a Django session cookie, users are sent to the login page —
 * an optimistic check only: the API enforces authentication on every call.
 */
export function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const secret = process.env.BACKOFFICE_PATH;

	if (
		pathname === BACKOFFICE_INTERNAL_PREFIX ||
		pathname.startsWith(`${BACKOFFICE_INTERNAL_PREFIX}/`)
	) {
		return NextResponse.rewrite(new URL("/__introuvable", request.url));
	}

	const prefix = secret ? `/${secret}` : null;
	if (!prefix || (pathname !== prefix && !pathname.startsWith(`${prefix}/`))) {
		return NextResponse.next();
	}

	const subpath = pathname.slice(prefix.length) || "/";
	const isPublicPage = PUBLIC_BACKOFFICE_PAGES.some(
		(p) => subpath === p || subpath.startsWith(`${p}/`),
	);
	if (!isPublicPage && !request.cookies.has("sessionid")) {
		const login = new URL(`${prefix}/connexion`, request.url);
		if (subpath !== "/") login.searchParams.set("suite", subpath + search);
		return NextResponse.redirect(login);
	}

	const response = NextResponse.rewrite(
		new URL(`${BACKOFFICE_INTERNAL_PREFIX}${subpath === "/" ? "" : subpath}${search}`, request.url),
	);
	response.headers.set("X-Robots-Tag", "noindex, nofollow");
	response.headers.set("Cache-Control", "no-store");
	return response;
}

export const config = {
	// Everything except Next internals, static files and the API proxies.
	matcher: [
		"/((?!_next/|api/|mcp|images/|fonts/|favicon|icon|apple-icon|manifest|robots|sitemap).*)",
	],
};
