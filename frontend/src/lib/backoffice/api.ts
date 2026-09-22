// Browser client for the authenticated back-office API. Same-origin requests
// (proxied to Django) with the session cookie and Django's CSRF header.

import type {
	ApiTokenCreated,
	ApiTokenRequest,
	Article,
	ArticleImage,
	CategoryWithCount,
	CategoryWithCountRequest,
	CropRequest,
	LoginRequest,
	PaginatedApiTokenList,
	PaginatedArticleRowList,
	PaginatedUserList,
	PasswordChangeRequest,
	PasswordResetConfirmRequest,
	PasswordResetRequestRequest,
	PatchedArticleRequest,
	PatchedCategoryWithCountRequest,
	PatchedProfileRequest,
	PatchedUserRequest,
	PreviewRequest,
	PreviewResult,
	Profile,
	ReorderRequest,
	User,
	UserCreate,
	UserCreateRequest,
} from "@/lib/api/schema";

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
function errorMessage(body: unknown): string | null {
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

/** An image from the computer, or a web address the server downloads. */
export type ImageSource = { file: File } | { url: string };

function imageForm(source: ImageSource, extra: Record<string, string> = {}) {
	const form = new FormData();
	if ("file" in source) form.append("file", source.file);
	else form.append("url", source.url);
	for (const [key, value] of Object.entries(extra)) form.append(key, value);
	return form;
}

export const api = {
	auth: {
		login: (email: string, password: string) =>
			post<Profile>("/auth/login/", { email, password } satisfies LoginRequest),
		logout: () => post<void>("/auth/logout/"),
		requestReset: (email: string) =>
			post<void>("/auth/password-reset/", { email } satisfies PasswordResetRequestRequest),
		confirmReset: (uid: string, token: string, new_password: string) =>
			post<void>("/auth/password-reset/confirm/", {
				uid,
				token,
				new_password,
			} satisfies PasswordResetConfirmRequest),
	},
	me: {
		get: () => get<Profile>("/me/"),
		update: (data: PatchedProfileRequest) => patch<Profile>("/me/", data),
		changePassword: (current_password: string, new_password: string) =>
			post<void>("/me/password/", {
				current_password,
				new_password,
			} satisfies PasswordChangeRequest),
		// The avatar endpoints answer with the whole profile, ready for the session.
		setAvatar: (source: ImageSource) => post<Profile>("/me/avatar/", imageForm(source)),
		cropAvatar: (crop: CropRequest) => post<Profile>("/me/avatar/crop/", crop),
		removeAvatar: () => request<Profile>("DELETE", "/me/avatar/"),
		tokens: () => get<PaginatedApiTokenList>("/me/tokens/"),
		createToken: (name: string) =>
			post<ApiTokenCreated>("/me/tokens/", { name } satisfies ApiTokenRequest),
		revokeToken: (id: string) => del(`/me/tokens/${id}/`),
	},
	articles: {
		list: (params: Record<string, string> = {}) =>
			get<PaginatedArticleRowList>(`/admin/articles/?${new URLSearchParams(params)}`),
		get: (id: string) => get<Article>(`/admin/articles/${id}/`),
		create: (data: PatchedArticleRequest) => post<Article>("/admin/articles/", data),
		update: (id: string, data: PatchedArticleRequest) =>
			patch<Article>(`/admin/articles/${id}/`, data),
		remove: (id: string) => del(`/admin/articles/${id}/`),
		setCover: (id: string, source: ImageSource, alt: string) =>
			post<Article>(`/admin/articles/${id}/cover/`, imageForm(source, { alt })),
		cropCover: (id: string, crop: CropRequest) =>
			post<Article>(`/admin/articles/${id}/cover/crop/`, crop),
		removeCover: (id: string) => request<Article>("DELETE", `/admin/articles/${id}/cover/`),
		preview: (markdown: string) =>
			post<PreviewResult>("/admin/preview/", { markdown } satisfies PreviewRequest),
		uploadImage: (source: ImageSource) => post<ArticleImage>("/admin/uploads/", imageForm(source)),
	},
	categories: {
		list: () => get<CategoryWithCount[]>("/admin/categories/"),
		create: (name: string) =>
			post<CategoryWithCount>("/admin/categories/", { name } satisfies CategoryWithCountRequest),
		update: (id: string, data: PatchedCategoryWithCountRequest) =>
			patch<CategoryWithCount>(`/admin/categories/${id}/`, data),
		remove: (id: string) => del(`/admin/categories/${id}/`),
		reorder: (ids: string[]) =>
			post<void>("/admin/categories/reorder/", { ids } satisfies ReorderRequest),
	},
	users: {
		list: () => get<PaginatedUserList>("/admin/users/?page_size=100"),
		create: (data: UserCreateRequest) => post<UserCreate>("/admin/users/", data),
		update: (id: string, data: PatchedUserRequest) => patch<User>(`/admin/users/${id}/`, data),
		remove: (id: string) => del(`/admin/users/${id}/`),
		setAvatar: (id: string, source: ImageSource) =>
			post<User>(`/admin/users/${id}/avatar/`, imageForm(source)),
		cropAvatar: (id: string, crop: CropRequest) =>
			post<User>(`/admin/users/${id}/avatar/crop/`, crop),
	},
};
