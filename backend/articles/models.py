from typing import Any, ClassVar

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from articles.rendering import render_markdown
from core.models import TimestampedModel


def unique_slug(model: type[models.Model], value: str, instance_pk: Any = None, max_length: int = 200) -> str:
    base = (slugify(value) or "article")[: max_length - 8]
    slug, n = base, 2
    while model._default_manager.filter(slug=slug).exclude(pk=instance_pk).exists():
        slug, n = f"{base}-{n}", n + 1
    return slug


class Category(TimestampedModel):
    name = models.CharField("nom", max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    is_primary = models.BooleanField(
        "catégorie principale", default=False, help_text="Affichée comme filtre principal sur la liste des articles."
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering: ClassVar[list[str]] = ["-is_primary", "order", "name"]
        verbose_name = "catégorie"

    def __str__(self) -> str:
        return self.name

    def save(self, *args: Any, **kwargs: Any) -> None:
        if not self.slug:
            self.slug = unique_slug(Category, self.name, self.pk, max_length=100)
        super().save(*args, **kwargs)


def cover_upload_to(instance: "Article", filename: str) -> str:
    return f"covers/{instance.pk}/{filename}"


def cover_original_upload_to(instance: "Article", filename: str) -> str:
    return f"covers/{instance.pk}/original/{filename}"


def inline_upload_to(instance: "ArticleImage", filename: str) -> str:
    return f"articles/{instance.pk}/{filename}"


class Article(TimestampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Brouillon"
        PUBLISHED = "published", "Publié"

    title = models.CharField("titre", max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    summary = models.TextField("résumé", blank=True)
    body_markdown = models.TextField("contenu (Markdown)", blank=True)
    body_html = models.TextField(editable=False, blank=True)
    # Processed 16:9 WebP served on the site; the upload is kept to allow re-cropping.
    cover = models.ImageField(upload_to=cover_upload_to, max_length=500, blank=True)
    cover_original = models.ImageField(upload_to=cover_original_upload_to, max_length=500, blank=True)
    cover_crop = models.JSONField("recadrage de la couverture", null=True, blank=True)
    cover_alt = models.CharField("texte alternatif de la couverture", max_length=200, blank=True)
    cover_source_url = models.URLField(
        "URL d'origine de la couverture",
        max_length=2000,
        blank=True,
        help_text="Adresse d'où l'image a été importée ; l'image elle-même est copiée dans le stockage.",
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    published_at = models.DateTimeField("date de publication", null=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="articles")
    categories = models.ManyToManyField(Category, related_name="articles", blank=True)

    class Meta:
        ordering: ClassVar[list[str]] = ["-published_at", "-created_at"]
        indexes: ClassVar[list[models.Index]] = [models.Index(fields=["status", "-published_at"])]

    def __str__(self) -> str:
        return self.title

    def save(self, *args: Any, **kwargs: Any) -> None:
        if not self.slug:
            self.slug = unique_slug(Article, self.title, self.pk)
        self.body_html = render_markdown(self.body_markdown)
        if self.status == self.Status.PUBLISHED and self.published_at is None:
            self.published_at = timezone.now()
        update_fields = kwargs.get("update_fields")
        if update_fields is not None:
            # Only write derived columns whose sources are written too: the in-memory
            # values of the other fields may be stale (e.g. a long cover upload).
            fields = set(update_fields)
            if "body_markdown" in fields:
                fields.add("body_html")
            if "status" in fields:
                fields.add("published_at")
            if "title" in fields:
                fields.add("slug")
            kwargs["update_fields"] = fields
        super().save(*args, **kwargs)


def published_articles() -> models.QuerySet[Article]:
    """Articles visible on the public site (published, publication date reached)."""
    return Article.objects.filter(status=Article.Status.PUBLISHED, published_at__lte=timezone.now())


class ArticleImage(TimestampedModel):
    """Image inserted inside an article body from the editor."""

    image = models.ImageField(upload_to=inline_upload_to, max_length=500)
    source_url = models.URLField("adresse d'origine", max_length=2000, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self) -> str:
        return self.image.name or ""
