// Browser client for the authenticated back-office API. Same-origin requests
// (proxied to Django) with the session cookie and Django's CSRF header.

import type {
	AdminArticle,
	AdminCategory,
	ApiToken,
	ArticleInput,
	ManagedUser,
	Paginated,
	Profile,
	Role,
} from "@/lib/backoffice/types";

const BASE = "/api/v1";

export class ApiError extends Error {
	constructor(
		readonly status: number,
		readonly body: unknown,
	) {
		super(errorMessage(body) ?? `Erreur ${status}`);
	}
}

/** User-facing message for any thrown value. */
export function messageOf(err: unknown, fallback = "Action impossible."): string {
	return err instanceof Error ? err.message : fallback;
}

/** Flatten a DRF error payload into a readable French message. */
export function errorMessage(body: unknown): string | null {
	if (!body || typeof body !== "object") return null;
	const messages: string[] = [];
	for (const [field, value] of Object.entries(body as Record<string, unknown>)) {
		const text = Array.isArray(value) ? value.join(" ") : typeof value === "string" ? value : null;
		if (!text) continue;
		messages.push(field === "detail" || field === "non_field_errors" ? text : `${field} : ${text}`);
	}
	return messages.length > 0 ? messages.join("\n") : null;
}

function csrfToken(): string {
	const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
	return match?.[1] ? decodeURIComponent(match[1]) : "";
}

async function ensureCsrf(): Promise<void> {
	if (!csrfToken()) await fetch(`${BASE}/auth/csrf/`, { credentials: "same-origin" });
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
	const headers: Record<string, string> = { accept: "application/json" };
	let payload: BodyInit | undefined;
	if (method !== "GET") {
		await ensureCsrf();
		headers["X-CSRFToken"] = csrfToken();
	}
	if (body instanceof FormData) {
		payload = body;
	} else if (body !== undefined) {
		headers["content-type"] = "application/json";
		payload = JSON.stringify(body);
	}

	const response = await fetch(`${BASE}${path}`, {
		method,
		headers,
		body: payload,
		credentials: "same-origin",
	});
	if (response.status === 204) return undefined as T;
	const data = await response.json().catch(() => null);
	if (!response.ok) throw new ApiError(response.status, data);
	return data as T;
}

const get = <T>(path: string) => request<T>("GET", path);
const post = <T>(path: string, body?: unknown) => request<T>("POST", path, body);
const patch = <T>(path: string, body: unknown) => request<T>("PATCH", path, body);
const del = (path: string) => request<void>("DELETE", path);

function imageForm(source: { file: File } | { url: string }, extra: Record<string, string> = {}) {
	const form = new FormData();
	if ("file" in source) form.append("file", source.file);
	else form.append("url", source.url);
	for (const [key, value] of Object.entries(extra)) form.append(key, value);
	return form;
}

export const api = {
	auth: {
		login: (email: string, password: string) => post<Profile>("/auth/login/", { email, password }),
		logout: () => post<void>("/auth/logout/"),
		requestReset: (email: string) => post<void>("/auth/password-reset/", { email }),
		confirmReset: (uid: string, token: string, new_password: string) =>
			post<void>("/auth/password-reset/confirm/", { uid, token, new_password }),
	},
	me: {
		get: () => get<Profile>("/me/"),
		update: (data: Partial<Pick<Profile, "email" | "first_name" | "last_name">>) =>
			patch<Profile>("/me/", data),
		changePassword: (current_password: string, new_password: string) =>
			post<void>("/me/password/", { current_password, new_password }),
		setAvatar: (source: { file: File } | { url: string }) =>
			post<Profile>("/me/avatar/", imageForm(source)),
		removeAvatar: () => del("/me/avatar/"),
		tokens: () => get<Paginated<ApiToken>>("/me/tokens/"),
		createToken: (name: string) => post<ApiToken & { token: string }>("/me/tokens/", { name }),
		revokeToken: (id: string) => del(`/me/tokens/${id}/`),
	},
	articles: {
		list: (params: Record<string, string> = {}) =>
			get<Paginated<AdminArticle>>(`/admin/articles/?${new URLSearchParams(params)}`),
		get: (id: string) => get<AdminArticle>(`/admin/articles/${id}/`),
		create: (data: Partial<ArticleInput>) => post<AdminArticle>("/admin/articles/", data),
		update: (id: string, data: Partial<ArticleInput>) =>
			patch<AdminArticle>(`/admin/articles/${id}/`, data),
		remove: (id: string) => del(`/admin/articles/${id}/`),
		setCover: (id: string, source: { file: File } | { url: string }, alt: string) =>
			post<AdminArticle>(`/admin/articles/${id}/cover/`, imageForm(source, { alt })),
		removeCover: (id: string) => request<AdminArticle>("DELETE", `/admin/articles/${id}/cover/`),
		preview: (markdown: string) => post<{ html: string }>("/admin/preview/", { markdown }),
		uploadImage: (file: File) => {
			const form = new FormData();
			form.append("file", file);
			return post<{ id: string; url: string }>("/admin/uploads/", form);
		},
	},
	categories: {
		list: () => get<AdminCategory[]>("/admin/categories/"),
		create: (name: string) => post<AdminCategory>("/admin/categories/", { name }),
		update: (id: string, data: Partial<Pick<AdminCategory, "name" | "is_primary">>) =>
			patch<AdminCategory>(`/admin/categories/${id}/`, data),
		remove: (id: string) => del(`/admin/categories/${id}/`),
		reorder: (ids: string[]) => post<void>("/admin/categories/reorder/", { ids }),
	},
	users: {
		list: () => get<Paginated<ManagedUser>>("/admin/users/"),
		create: (data: {
			email: string;
			first_name: string;
			last_name: string;
			role: Role;
			password?: string;
		}) => post<ManagedUser>("/admin/users/", data),
		update: (
			id: string,
			data: Partial<Pick<ManagedUser, "role" | "is_active" | "first_name" | "last_name" | "email">>,
		) => patch<ManagedUser>(`/admin/users/${id}/`, data),
		remove: (id: string) => del(`/admin/users/${id}/`),
		setAvatar: (id: string, source: { file: File } | { url: string }) =>
			post<ManagedUser>(`/admin/users/${id}/avatar/`, imageForm(source)),
		sendReset: (email: string) => post<void>("/auth/password-reset/", { email }),
	},
};
