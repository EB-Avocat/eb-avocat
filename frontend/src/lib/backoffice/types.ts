// Back-office API types, generated from the backend OpenAPI schema
// (`bun run api:types`, see src/lib/api/schema.ts). Only aliases and UI labels live here.

import type {
	Article,
	CategoryWithCount,
	PatchedArticleRequest,
	RoleEnum,
	StatusEnum,
	User,
} from "@/lib/api/schema";

export type {
	ApiToken,
	ApiTokenCreated,
	Category,
	PaginatedApiTokenList,
	PaginatedArticleList,
	PaginatedUserList,
	PatchedProfileRequest,
	PatchedUserRequest,
	Profile,
	UserCreateRequest,
} from "@/lib/api/schema";

export type Role = RoleEnum;
export type ArticleStatus = StatusEnum;
export type AdminArticle = Article;
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

export const ROLE_LABELS: Record<Role, string> = {
	admin: "Administrateur",
	editor: "Éditeur",
	author: "Auteur",
};

export const STATUS_LABELS: Record<ArticleStatus, string> = {
	draft: "Brouillon",
	published: "Publié",
};
