// Back-office API types, generated from the backend OpenAPI schema
// (`bun run api:types`, see src/lib/api/schema.ts). Only aliases and UI labels live here.

import type {
	Article,
	ArticleRow,
	CategoryWithCount,
	PatchedArticleRequest,
	RoleEnum,
	StatusEnum,
	User,
} from "@/lib/api/schema";

export type { ApiToken, Profile } from "@/lib/api/schema";

export type Role = RoleEnum;
export type ArticleStatus = StatusEnum;
export type AdminArticle = Article;
/** A row of the articles list (no bodies). */
export type AdminArticleRow = ArticleRow;
export type AdminCategory = CategoryWithCount;
export type ManagedUser = User;
/** Editable article fields, as sent by the editor. */
export type ArticleInput = Required<
	Pick<
		PatchedArticleRequest,
		"title" | "summary" | "body_markdown" | "cover_alt" | "status" | "published_at" | "category_ids"
	>
> &
	Pick<PatchedArticleRequest, "slug">;

/** "Prénom Nom", or the e-mail address when both names are empty. */
export function displayName(user: Pick<User, "first_name" | "last_name" | "email">): string {
	return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
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
