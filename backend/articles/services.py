"""Article operations shared by the DRF API and the MCP tools."""

import logging

import httpx
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import transaction

from accounts.models import User
from articles.models import Article, ArticleImage, Category
from core import cropped
from core.imaging import COVER, INLINE, Crop, render

logger = logging.getLogger(__name__)


def categories_from_names(names: list[str]) -> list[Category]:
    """Return categories matching ``names`` (case-insensitive), creating missing ones."""
    categories = []
    for raw in names:
        name = raw.strip()
        if not name:
            continue
        category = Category.objects.filter(name__iexact=name).first() or Category.objects.create(name=name)
        categories.append(category)
    return categories


def set_cover(article: Article, image: SimpleUploadedFile, *, source_url: str = "", alt: str | None = None) -> Article:
    """Keep the image as the original and serve a centered 16:9 WebP rendition.

    Both live in the media storage (Vercel Blob in production): imported images are
    never hotlinked. ``source_url`` records where an imported image came from.
    """
    article.cover_source_url = source_url
    extra_fields = ["cover_source_url"]
    if alt is not None:
        article.cover_alt = alt
        extra_fields.append("cover_alt")
    cropped.set_image(article, "cover", image, COVER, extra_fields=tuple(extra_fields))
    return article


def recrop_cover(article: Article, crop: Crop | None) -> Article:
    cropped.recrop(article, "cover", crop, COVER)
    return article


def remove_cover(article: Article) -> Article:
    if article.cover or article.cover_original:
        article.cover_source_url = ""
        cropped.clear(article, "cover", extra_fields=("cover_source_url",))
    return article


def store_inline_image(image: SimpleUploadedFile, user: "User", *, source_url: str = "") -> ArticleImage:
    """Article body images: capped at 1600 px wide and re-encoded as WebP (no crop)."""
    rendered, _ = render(image.read(), INLINE, None, stem=(image.name or "image").rsplit(".", 1)[0])
    record = ArticleImage(uploaded_by=user, source_url=source_url)
    record.image.save(rendered.name or "image.webp", rendered, save=True)
    return record


def schedule_revalidation() -> None:
    """Revalidate the public pages once the transaction commits, once per transaction.

    Saving an article fires several signals (the row, then each category change):
    they collapse into a single call when they happen in the same transaction.
    """
    connection = transaction.get_connection()
    pending = (callback for _, callback, *_ in getattr(connection, "run_on_commit", []))
    if connection.in_atomic_block and revalidate_frontend in pending:
        return
    transaction.on_commit(revalidate_frontend)


def revalidate_frontend() -> None:
    """Ask Next.js to drop its cached article pages (tag "articles")."""
    if not settings.FRONTEND_INTERNAL_URL or not settings.REVALIDATE_SECRET:
        return
    headers = {"authorization": f"Bearer {settings.REVALIDATE_SECRET}"}
    if settings.VERCEL_AUTOMATION_BYPASS_SECRET:
        headers["x-vercel-protection-bypass"] = settings.VERCEL_AUTOMATION_BYPASS_SECRET
    try:
        httpx.post(
            f"{settings.FRONTEND_INTERNAL_URL.rstrip('/')}/api/revalidate",
            headers=headers,
            json={"tag": "articles"},
            timeout=2,  # runs in the request: never hold it up for long
        ).raise_for_status()
    except httpx.HTTPError:
        logger.warning("Frontend revalidation failed", exc_info=True)
