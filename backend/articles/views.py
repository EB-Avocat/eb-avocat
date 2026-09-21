from typing import Any

import django_filters
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Count, Q, QuerySet
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer
from rest_framework.views import APIView

from accounts.permissions import CanEditArticle
from articles import services
from articles.models import Article, Category, published_articles
from articles.rendering import render_markdown
from articles.serializers import (
    ArticleImageSerializer,
    ArticleSerializer,
    CategoryWithCountSerializer,
    CoverUploadSerializer,
    PreviewResultSerializer,
    PreviewSerializer,
    PublicArticleDetailSerializer,
    PublicArticleSerializer,
    ReorderSerializer,
)
from core.auth import optional_user, request_user


class ArticleFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="categories__slug")

    class Meta:
        model = Article
        fields = ("category",)


class PublicArticleViewSet(viewsets.ReadOnlyModelViewSet[Article]):
    """Published articles only. ``?category=<slug>`` filters."""

    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    lookup_field = "slug"
    filterset_class = ArticleFilter

    def get_queryset(self) -> QuerySet[Article]:
        return (
            published_articles()
            .select_related("author")
            .prefetch_related("categories")
            .distinct()
            .order_by("-published_at")
        )

    def get_serializer_class(self) -> type[PublicArticleSerializer]:
        return PublicArticleDetailSerializer if self.action == "retrieve" else PublicArticleSerializer


class PublicCategoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet[Category]):
    """Categories that have at least one published article."""

    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    serializer_class = CategoryWithCountSerializer
    pagination_class = None

    def get_queryset(self) -> QuerySet[Category]:
        published = published_articles().values("pk")
        return Category.objects.annotate(
            article_count=Count("articles", filter=Q(articles__in=published), distinct=True)
        ).filter(article_count__gt=0)


class AdminArticleFilter(ArticleFilter):
    class Meta:
        model = Article
        fields = ("category", "status", "author")


class ArticleViewSet(viewsets.ModelViewSet[Article]):
    serializer_class = ArticleSerializer
    permission_classes = (CanEditArticle,)
    filterset_class = AdminArticleFilter
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, SearchFilter, OrderingFilter)
    search_fields = ("title", "summary")
    ordering_fields = ("updated_at", "published_at", "title")
    ordering = ("-updated_at",)

    def get_queryset(self) -> QuerySet[Article]:
        queryset = Article.objects.select_related("author").prefetch_related("categories").distinct()
        if getattr(self, "swagger_fake_view", False):  # schema generation
            return queryset.none()
        user = request_user(self.request)
        if not user.can_edit_all_articles:
            queryset = queryset.filter(author=user)
        return queryset

    def perform_create(self, serializer: BaseSerializer[Article]) -> None:
        serializer.save(author=request_user(self.request))

    @extend_schema(methods=["POST"], request=CoverUploadSerializer, responses=ArticleSerializer)
    @extend_schema(methods=["DELETE"], request=None, responses=ArticleSerializer)
    @action(detail=True, methods=["post", "delete"], parser_classes=(MultiPartParser, FormParser, JSONParser))
    def cover(self, request: Request, pk: str | None = None) -> Response:
        article = self.get_object()
        if request.method == "DELETE":
            services.remove_cover(article)
            return Response(self.get_serializer(article).data)
        serializer = CoverUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            if file := data.get("file"):
                services.set_cover_from_upload(article, file)
            else:
                services.set_cover_from_url(article, data["url"])
        except DjangoValidationError as exc:
            raise ValidationError({"detail": exc.messages}) from exc
        if "alt" in data:
            article.cover_alt = data["alt"]
            article.save(update_fields=["cover_alt"])
        return Response(self.get_serializer(article).data)


class IsEditorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:
        user = optional_user(request)
        if user is None:
            return False
        return request.method in permissions.SAFE_METHODS or user.can_edit_all_articles


class CategoryViewSet(viewsets.ModelViewSet[Category]):
    """Authors may create categories (from the editor); editors and admins manage them."""

    serializer_class = CategoryWithCountSerializer
    pagination_class = None

    def get_permissions(self) -> list[Any]:
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        return [IsEditorOrReadOnly()]

    def get_queryset(self) -> QuerySet[Category]:
        return Category.objects.annotate(article_count=Count("articles", distinct=True))

    @extend_schema(request=ReorderSerializer, responses={204: None})
    @action(detail=False, methods=["post"])
    def reorder(self, request: Request) -> Response:
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        for index, pk in enumerate(serializer.validated_data["ids"]):
            Category.objects.filter(pk=pk).update(order=index)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ArticleImageUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    @extend_schema(request=ArticleImageSerializer, responses={201: ArticleImageSerializer})
    def post(self, request: Request) -> Response:
        serializer = ArticleImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            record = services.store_inline_image(serializer.validated_data["file"], request_user(request))
        except DjangoValidationError as exc:
            raise ValidationError({"detail": exc.messages}) from exc
        return Response(ArticleImageSerializer(record).data, status=status.HTTP_201_CREATED)


class PreviewView(APIView):
    """Render Markdown exactly as the public page will (same sanitiser)."""

    @extend_schema(request=PreviewSerializer, responses=PreviewResultSerializer)
    def post(self, request: Request) -> Response:
        serializer = PreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"html": render_markdown(serializer.validated_data["markdown"])})
