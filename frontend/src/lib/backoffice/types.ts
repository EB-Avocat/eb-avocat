// Shapes of the authenticated back-office API (backend/*/serializers.py).

export type Role = "admin" | "editor" | "author";
export type ArticleStatus = "draft" | "published";

export interface Profile {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	role: Role;
	avatar: string | null;
}

export interface ManagedUser extends Profile {
	is_active: boolean;
	date_joined: string;
}

export interface AdminCategory {
	id: string;
	name: string;
	slug: string;
	is_primary: boolean;
	order: number;
	article_count?: number;
}

export interface AdminArticle {
	id: string;
	title: string;
	slug: string;
	summary: string;
	body_markdown: string;
	body_html: string;
	cover: string | null;
	cover_alt: string;
	status: ArticleStatus;
	published_at: string | null;
	author: { id: string; name: string; avatar: string | null };
	categories: AdminCategory[];
	created_at: string;
	updated_at: string;
}

export interface ArticleInput {
	title: string;
	slug?: string;
	summary: string;
	body_markdown: string;
	cover_alt: string;
	status: ArticleStatus;
	published_at: string | null;
	category_ids: string[];
}

export interface ApiToken {
	id: string;
	name: string;
	prefix: string;
	created_at: string;
	last_used_at: string | null;
}

export interface Paginated<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

export const ROLE_LABELS: Record<Role, string> = {
	admin: "Administrateur",
	editor: "Éditeur",
	author: "Auteur",
};

export const STATUS_LABELS: Record<ArticleStatus, string> = {
	draft: "Brouillon",
	published: "Publié",
};
