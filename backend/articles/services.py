"""Article operations shared by the DRF API and the MCP tools."""

import logging

import httpx
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile, UploadedFile

from accounts.models import User
from articles.models import Article, ArticleImage, Category
from core.images import validate_uploaded_image
from core.remote import fetch_remote_image

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


def _store_cover(article: Article, image: SimpleUploadedFile, source_url: str = "") -> Article:
    """Store the image in the media storage (Vercel Blob in production), never hotlinked.

    ``source_url`` records where an imported image came from (kept for history).
    """
    if article.cover:
        article.cover.delete(save=False)
    article.cover_source_url = source_url
    article.cover.save(image.name or "cover", image, save=True)
    return article


def set_cover_from_upload(article: Article, upload: UploadedFile) -> Article:
    return _store_cover(article, validate_uploaded_image(upload))


def set_cover_from_url(article: Article, url: str) -> Article:
    return _store_cover(article, fetch_remote_image(url), source_url=url)


def set_cover_from_bytes(article: Article, data: bytes, filename: str) -> Article:
    from core.images import validate_image_bytes

    return _store_cover(article, validate_image_bytes(data, filename))


def remove_cover(article: Article) -> Article:
    if article.cover:
        article.cover.delete(save=False)
        article.cover_source_url = ""
        article.save(update_fields=["cover", "cover_source_url"])
    return article


def store_inline_image(upload: UploadedFile, user: "User") -> ArticleImage:
    image = validate_uploaded_image(upload)
    record = ArticleImage(uploaded_by=user)
    record.image.save(image.name or "image", image, save=True)
    return record


def revalidate_frontend() -> None:
    """Ask Next.js to drop its cached article pages (tag "articles")."""
    if not settings.FRONTEND_INTERNAL_URL or not settings.REVALIDATE_SECRET:
        return
    try:
        httpx.post(
            f"{settings.FRONTEND_INTERNAL_URL.rstrip('/')}/api/revalidate",
            headers={"authorization": f"Bearer {settings.REVALIDATE_SECRET}"},
            json={"tag": "articles"},
            timeout=5,
        ).raise_for_status()
    except httpx.HTTPError:
        logger.warning("Frontend revalidation failed", exc_info=True)
