from typing import Any

from rest_framework import serializers

from accounts.models import User
from articles.models import Article, ArticleImage, Category, unique_slug
from articles.services import categories_from_names
from core.fields import MediaUrlField


class CategorySerializer(serializers.ModelSerializer[Category]):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "is_primary", "order")
        read_only_fields = ("id",)
        extra_kwargs = {"slug": {"required": False}}  # noqa: RUF012


class CategoryWithCountSerializer(CategorySerializer):
    """Category lists: adds how many articles use it (the view's annotation when present)."""

    article_count = serializers.SerializerMethodField()

    class Meta(CategorySerializer.Meta):
        fields = (*CategorySerializer.Meta.fields, "article_count")

    def get_article_count(self, category: Category) -> int:
        annotated = getattr(category, "article_count", None)
        return annotated if annotated is not None else Article.objects.filter(categories=category).count()


class AuthorSerializer(serializers.ModelSerializer[User]):
    name = serializers.SerializerMethodField()
    avatar = MediaUrlField()

    class Meta:
        model = User
        fields = ("id", "name", "avatar")

    def get_name(self, user: User) -> str:
        return user.get_full_name() or user.email.split("@")[0]


class PublicArticleSerializer(serializers.ModelSerializer[Article]):
    categories = CategorySerializer(many=True, read_only=True)
    author = AuthorSerializer(read_only=True)
    cover = MediaUrlField()

    class Meta:
        model = Article
        fields = ("id", "slug", "title", "summary", "categories", "published_at", "cover", "cover_alt", "author")


class PublicArticleDetailSerializer(PublicArticleSerializer):
    class Meta(PublicArticleSerializer.Meta):
        fields = (*PublicArticleSerializer.Meta.fields, "body_html", "updated_at")


class ArticleSerializer(serializers.ModelSerializer[Article]):
    """Back-office / MCP read-write representation."""

    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        source="categories", queryset=Category.objects.all(), many=True, write_only=True, required=False
    )
    category_names = serializers.ListField(
        child=serializers.CharField(max_length=80), write_only=True, required=False,
        help_text="Catégories par nom ; les catégories absentes sont créées.",
    )  # fmt: skip
    author = AuthorSerializer(read_only=True)
    cover = MediaUrlField()

    class Meta:
        model = Article
        fields = (
            "id", "title", "slug", "summary", "body_markdown", "body_html", "cover", "cover_alt",
            "status", "published_at", "author", "categories", "category_ids", "category_names",
            "created_at", "updated_at",
        )  # fmt: skip
        read_only_fields = ("id", "body_html", "cover", "author", "created_at", "updated_at")
        extra_kwargs = {"slug": {"required": False, "allow_blank": True}}  # noqa: RUF012

    def validate_slug(self, value: str) -> str:
        if not value:
            return value
        instance_pk = self.instance.pk if isinstance(self.instance, Article) else None
        if Article.objects.filter(slug=value).exclude(pk=instance_pk).exists():
            raise serializers.ValidationError("Ce slug est déjà utilisé.")
        return value

    def _apply_categories(self, article: Article, categories: list[Category] | None, names: list[str] | None) -> None:
        if categories is None and names is None:
            return
        combined = list(categories or []) + categories_from_names(names or [])
        article.categories.set({c.pk: c for c in combined}.values())

    def create(self, validated_data: dict[str, Any]) -> Article:
        categories = validated_data.pop("categories", None)
        names = validated_data.pop("category_names", None)
        if not validated_data.get("slug"):
            validated_data["slug"] = unique_slug(Article, validated_data["title"])
        article = Article.objects.create(**validated_data)
        self._apply_categories(article, categories, names)
        return article

    def update(self, instance: Article, validated_data: dict[str, Any]) -> Article:
        categories = validated_data.pop("categories", None)
        names = validated_data.pop("category_names", None)
        if validated_data.get("slug") == "":
            validated_data.pop("slug")
        article = super().update(instance, validated_data)
        self._apply_categories(article, categories, names)
        return article


class CoverUploadSerializer(serializers.Serializer[None]):
    file = serializers.ImageField(required=False)
    url = serializers.URLField(required=False)
    alt = serializers.CharField(required=False, allow_blank=True, max_length=200)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        if bool(attrs.get("file")) == bool(attrs.get("url")):
            raise serializers.ValidationError("Fournissez soit un fichier, soit une URL.")
        return attrs


class ArticleImageSerializer(serializers.ModelSerializer[ArticleImage]):
    url = MediaUrlField(source="image")
    file = serializers.ImageField(write_only=True)

    class Meta:
        model = ArticleImage
        fields = ("id", "url", "file")


class PreviewSerializer(serializers.Serializer[None]):
    markdown = serializers.CharField(allow_blank=True, trim_whitespace=False)


class PreviewResultSerializer(serializers.Serializer[None]):
    html = serializers.CharField()


class ReorderSerializer(serializers.Serializer[None]):
    ids = serializers.ListField(child=serializers.UUIDField())
