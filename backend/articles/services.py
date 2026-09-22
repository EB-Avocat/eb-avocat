"""Article operations shared by the DRF API and the MCP tools."""

import logging

import httpx
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile, UploadedFile

from accounts.models import User
from articles.models import Article, ArticleImage, Category
from core import cropped
from core.images import validate_image_bytes, validate_uploaded_image
from core.imaging import COVER, INLINE, Crop, render
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


def _store_cover(
    article: Article, image: SimpleUploadedFile, source_url: str = "", crop: Crop | None = None
) -> Article:
    """Keep the upload as the original and serve a cropped 16:9 WebP rendition.

    Both live in the media storage (Vercel Blob in production): imported images are
    never hotlinked. ``source_url`` records where an imported image came from.
    """
    article.cover_source_url = source_url
    cropped.set_image(article, "cover", image, COVER, crop, extra_fields=("cover_source_url",))
    return article


def set_cover_from_upload(article: Article, upload: UploadedFile, crop: Crop | None = None) -> Article:
    return _store_cover(article, validate_uploaded_image(upload), crop=crop)


def set_cover_from_url(article: Article, url: str, crop: Crop | None = None) -> Article:
    return _store_cover(article, fetch_remote_image(url), source_url=url, crop=crop)


def set_cover_from_bytes(article: Article, data: bytes, filename: str) -> Article:
    return _store_cover(article, validate_image_bytes(data, filename))


def recrop_cover(article: Article, crop: Crop | None) -> Article:
    cropped.recrop(article, "cover", crop, COVER)
    return article


def remove_cover(article: Article) -> Article:
    if article.cover or article.cover_original:
        article.cover_source_url = ""
        cropped.clear(article, "cover", extra_fields=("cover_source_url",))
    return article


def store_inline_image(upload: UploadedFile, user: "User", *, source_url: str = "") -> ArticleImage:
    """Article body images: capped at 1600 px wide and re-encoded as WebP (no crop)."""
    image = validate_uploaded_image(upload)
    rendered, _ = render(image.read(), INLINE, None, stem=(image.name or "image").rsplit(".", 1)[0])
    record = ArticleImage(uploaded_by=user, source_url=source_url)
    record.image.save(rendered.name or "image.webp", rendered, save=True)
    return record


def store_inline_image_from_url(url: str, user: "User") -> ArticleImage:
    """Download an image from the web (SSRF-safe) and store it like an upload."""
    return store_inline_image(fetch_remote_image(url), user, source_url=url)


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
