from typing import TYPE_CHECKING, Any, ClassVar, Self

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from articles.rendering import render_markdown
from core.models import TimestampedModel

if TYPE_CHECKING:
    from accounts.models import User


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

    @classmethod
    def from_db(cls, *args: Any, **kwargs: Any) -> Self:
        article = super().from_db(*args, **kwargs)
        article.was_published = article.__dict__.get("status") == cls.Status.PUBLISHED
        return article

    @property
    def is_or_was_published(self) -> bool:
        """Whether a change to this article can show on the public site."""
        return self.status == self.Status.PUBLISHED or getattr(self, "was_published", False)

    def save(self, *args: Any, **kwargs: Any) -> None:
        update_fields = kwargs.get("update_fields")

        # A partial save writes only the derived columns whose sources it writes: the
        # other in-memory values may be stale (e.g. during a long cover upload).
        def writes(name: str) -> bool:
            return update_fields is None or name in update_fields

        derived = set()
        if writes("title") and not self.slug:
            self.slug = unique_slug(Article, self.title, self.pk)
            derived.add("slug")
        if writes("body_markdown"):
            self.body_html = render_markdown(self.body_markdown)
            derived.add("body_html")
        if writes("status") and self.status == self.Status.PUBLISHED and self.published_at is None:
            self.published_at = timezone.now()
            derived.add("published_at")
        if update_fields is not None:
            kwargs["update_fields"] = {*update_fields, *derived}
        super().save(*args, **kwargs)  # post_save handlers still see the previous `was_published`
        self.was_published = self.status == self.Status.PUBLISHED


def editable_articles(user: "User") -> models.QuerySet["Article"]:
    """Articles ``user`` may edit: all of them for editors and admins, their own for authors."""
    queryset = Article.objects.select_related("author").prefetch_related("categories")
    return queryset if user.can_edit_all_articles else queryset.filter(author=user)


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
