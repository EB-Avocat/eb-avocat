"""MCP server exposing article tools to Claude Code (streamable HTTP at ``/mcp``).

Authentication: a personal API token (``Authorization: Bearer eba_…``) generated
from the back-office profile page. Every tool resolves the calling user from that
header and applies the same role rules as the REST API, reusing its serializers.
"""

import base64
import binascii
from typing import Any

from asgiref.sync import sync_to_async
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import QuerySet
from mcp.server.mcpserver import Context, MCPServer
from mcp.server.mcpserver.exceptions import ToolError as SDKToolError
from rest_framework.exceptions import ValidationError as DRFValidationError

from accounts.authentication import user_from_authorization
from accounts.models import User
from articles import services
from articles.models import Article, Category
from articles.serializers import ArticleSerializer, CategorySerializer

INSTRUCTIONS = """\
Outils pour gérer les articles (publications) du site d'Eva Biezunski, avocate.
Le contenu des articles s'écrit en Markdown (titres, listes, liens, tableaux, citations).
Les nouveaux articles sont créés en brouillon par défaut : ne publiez que si l'utilisateur le demande.
Les catégories se passent par nom ; celles qui n'existent pas sont créées."""

server = MCPServer(name="eb-avocat", title="EB Avocat — Publications", instructions=INSTRUCTIONS)


class ToolError(SDKToolError):
    """Anticipated failure: the message reaches the model (other exceptions are masked)."""


def _user(ctx: Context) -> User:
    headers = ctx.headers or {}
    user = user_from_authorization(headers.get("authorization", ""))
    if user is None:
        raise ToolError("Jeton d'API invalide ou révoqué.")
    return user


def _articles_for(user: User) -> QuerySet[Article]:
    queryset = Article.objects.select_related("author").prefetch_related("categories")
    return queryset if user.can_edit_all_articles else queryset.filter(author=user)


def _get_article(user: User, article_id: str) -> Article:
    """Look an article up by UUID or slug, within what ``user`` may edit."""
    queryset = _articles_for(user)
    try:
        return queryset.get(pk=article_id)
    except (Article.DoesNotExist, DjangoValidationError, ValueError):
        pass
    try:
        return queryset.get(slug=article_id)
    except Article.DoesNotExist as exc:
        raise ToolError(f"Article introuvable : {article_id}") from exc


def _summary(article: Article) -> dict[str, Any]:
    return {
        "id": str(article.pk),
        "slug": article.slug,
        "title": article.title,
        "status": article.status,
        "published_at": article.published_at.isoformat() if article.published_at else None,
        "categories": [c.name for c in article.categories.all()],
        "author": str(article.author),
    }


def _save(user: User, data: dict[str, Any], instance: Article | None = None) -> dict[str, Any]:
    serializer = ArticleSerializer(instance, data=data, partial=instance is not None)
    try:
        serializer.is_valid(raise_exception=True)
    except DRFValidationError as exc:
        raise ToolError(f"Données invalides : {exc.detail}") from exc
    article = serializer.save(**({} if instance else {"author": user}))
    return dict(ArticleSerializer(article).data)


def _clean(**fields: Any) -> dict[str, Any]:
    return {key: value for key, value in fields.items() if value is not None}


# --- sync implementations (ORM) -------------------------------------------------


def _list_articles(user: User, status: str | None, category: str | None, search: str | None) -> list[dict[str, Any]]:
    queryset = _articles_for(user).order_by("-updated_at")
    if status:
        queryset = queryset.filter(status=status)
    if category:
        queryset = queryset.filter(categories__name__iexact=category)
    if search:
        queryset = queryset.filter(title__icontains=search)
    return [_summary(a) for a in queryset.distinct()[:100]]


def _set_cover(user: User, article_id: str, url: str | None, data: str | None, filename: str, alt: str | None) -> dict:
    article = _get_article(user, article_id)
    try:
        if url:
            services.set_cover_from_url(article, url)
        elif data:
            services.set_cover_from_bytes(article, base64.b64decode(data, validate=True), filename)
        else:
            raise ToolError("Fournissez `url` ou `base64_data`.")
    except (DjangoValidationError, binascii.Error) as exc:
        raise ToolError(f"Image refusée : {exc}") from exc
    if alt is not None:
        article.cover_alt = alt
        article.save(update_fields=["cover_alt"])
    return dict(ArticleSerializer(article).data)


def _create_category(user: User, name: str, is_primary: bool) -> dict[str, Any]:
    created = services.categories_from_names([name])
    if not created:
        raise ToolError("Le nom de la catégorie est obligatoire.")
    category = created[0]
    if is_primary and user.can_edit_all_articles and not category.is_primary:
        category.is_primary = True
        category.save(update_fields=["is_primary"])
    return dict(CategorySerializer(category).data)


def _delete(user: User, article_id: str) -> str:
    article = _get_article(user, article_id)
    title = article.title
    article.delete()
    return f"Article « {title} » supprimé."


# --- tools ------------------------------------------------------------------------


@server.tool()
async def list_articles(
    ctx: Context, status: str | None = None, category: str | None = None, search: str | None = None
) -> list[dict[str, Any]]:
    """Liste les articles (brouillons et publiés) que vous pouvez modifier.

    status: "draft" ou "published". category: nom de catégorie. search: texte dans le titre.
    """
    user = await sync_to_async(_user)(ctx)
    return await sync_to_async(_list_articles)(user, status, category, search)


@server.tool()
async def get_article(ctx: Context, article_id: str) -> dict[str, Any]:
    """Renvoie un article complet (dont son contenu Markdown) par identifiant UUID ou slug."""

    def run() -> dict[str, Any]:
        return dict(ArticleSerializer(_get_article(_user(ctx), article_id)).data)

    return await sync_to_async(run)()


@server.tool()
async def create_article(
    ctx: Context,
    title: str,
    markdown: str,
    summary: str = "",
    categories: list[str] | None = None,
    status: str = "draft",
    cover_url: str | None = None,
    cover_alt: str = "",
) -> dict[str, Any]:
    """Crée un article. Brouillon par défaut (status="draft"), "published" pour publier.

    markdown: le corps de l'article en Markdown (ne pas répéter le titre en H1).
    categories: noms de catégories (créées si besoin). cover_url: image de couverture sur le web.
    """

    def run() -> dict[str, Any]:
        user = _user(ctx)
        data = _clean(
            title=title, body_markdown=markdown, summary=summary, status=status,
            category_names=categories, cover_alt=cover_alt,
        )  # fmt: skip
        article = _save(user, data)
        if cover_url:
            try:
                return _set_cover(user, article["id"], cover_url, None, "cover", None)
            except ToolError as exc:
                # The article exists already: say so, or the model retries and creates a duplicate.
                raise ToolError(
                    f"Article créé (id {article['id']}, slug {article['slug']}) sans couverture : {exc}. "
                    "Utilisez set_article_cover pour réessayer."
                ) from exc
        return article

    return await sync_to_async(run)()


@server.tool()
async def update_article(
    ctx: Context,
    article_id: str,
    title: str | None = None,
    markdown: str | None = None,
    summary: str | None = None,
    categories: list[str] | None = None,
    slug: str | None = None,
    cover_alt: str | None = None,
) -> dict[str, Any]:
    """Modifie un article (UUID ou slug). Seuls les champs fournis sont changés.

    categories remplace la liste complète des catégories de l'article.
    """

    def run() -> dict[str, Any]:
        user = _user(ctx)
        data = _clean(
            title=title, body_markdown=markdown, summary=summary, category_names=categories,
            slug=slug, cover_alt=cover_alt,
        )  # fmt: skip
        return _save(user, data, _get_article(user, article_id))

    return await sync_to_async(run)()


@server.tool()
async def publish_article(ctx: Context, article_id: str) -> dict[str, Any]:
    """Publie un article (il devient visible sur /publications)."""

    def run() -> dict[str, Any]:
        user = _user(ctx)
        return _save(user, {"status": Article.Status.PUBLISHED}, _get_article(user, article_id))

    return await sync_to_async(run)()


@server.tool()
async def unpublish_article(ctx: Context, article_id: str) -> dict[str, Any]:
    """Repasse un article en brouillon (il disparaît du site)."""

    def run() -> dict[str, Any]:
        user = _user(ctx)
        return _save(user, {"status": Article.Status.DRAFT}, _get_article(user, article_id))

    return await sync_to_async(run)()


@server.tool()
async def delete_article(ctx: Context, article_id: str) -> str:
    """Supprime définitivement un article. Demandez confirmation à l'utilisateur avant."""

    def run() -> str:
        return _delete(_user(ctx), article_id)

    return await sync_to_async(run)()


@server.tool()
async def set_article_cover(
    ctx: Context,
    article_id: str,
    url: str | None = None,
    base64_data: str | None = None,
    filename: str = "cover",
    alt: str | None = None,
) -> dict[str, Any]:
    """Définit l'image de couverture depuis une URL web, ou depuis un fichier local encodé en base64."""

    def run() -> dict[str, Any]:
        return _set_cover(_user(ctx), article_id, url, base64_data, filename, alt)

    return await sync_to_async(run)()


@server.tool()
async def list_categories(ctx: Context) -> list[dict[str, Any]]:
    """Liste les catégories. is_primary=true : affichée comme filtre principal sur le site."""

    def run() -> list[dict[str, Any]]:
        _user(ctx)
        return [dict(CategorySerializer(c).data) for c in Category.objects.all()]

    return await sync_to_async(run)()


@server.tool()
async def create_category(ctx: Context, name: str, is_primary: bool = False) -> dict[str, Any]:
    """Crée une catégorie (ou renvoie celle qui existe déjà sous ce nom).

    is_primary n'est appliqué que pour les éditeurs et administrateurs.
    """
    user = await sync_to_async(_user)(ctx)
    return await sync_to_async(_create_category)(user, name, is_primary)
