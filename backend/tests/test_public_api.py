from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from articles.models import Article
from tests.conftest import ArticleFactory, CategoryFactory

pytestmark = pytest.mark.django_db


def test_list_only_shows_published_articles(api: APIClient) -> None:
    published = ArticleFactory.create()
    ArticleFactory.create(status=Article.Status.DRAFT)
    ArticleFactory.create(published_at=timezone.now() + timedelta(days=3))  # scheduled

    response = api.get("/api/v1/articles/")

    assert response.status_code == 200
    assert [a["slug"] for a in response.json()["results"]] == [published.slug]


def test_draft_detail_is_404(api: APIClient) -> None:
    draft = ArticleFactory.create(status=Article.Status.DRAFT)
    assert api.get(f"/api/v1/articles/{draft.slug}/").status_code == 404


def test_detail_exposes_rendered_html_and_primary_categories(api: APIClient) -> None:
    primary = CategoryFactory.create(is_primary=True)
    article = ArticleFactory.create()
    article.categories.set([primary])

    data = api.get(f"/api/v1/articles/{article.slug}/").json()

    assert "<strong>gras</strong>" in data["body_html"]
    assert [(c["id"], c["is_primary"]) for c in data["categories"]] == [(str(primary.pk), True)]


def test_filter_by_category(api: APIClient) -> None:
    tax, other = CategoryFactory.create(), CategoryFactory.create()
    in_tax = ArticleFactory.create()
    in_tax.categories.set([tax])
    ArticleFactory.create().categories.set([other])

    results = api.get("/api/v1/articles/", {"category": tax.slug}).json()["results"]

    assert [a["id"] for a in results] == [str(in_tax.pk)]


def test_public_categories_hide_empty_and_draft_only(api: APIClient) -> None:
    used, draft_only, _unused = CategoryFactory.create(), CategoryFactory.create(), CategoryFactory.create()
    ArticleFactory.create().categories.set([used])
    ArticleFactory.create(status=Article.Status.DRAFT).categories.set([draft_only])

    names = [c["name"] for c in api.get("/api/v1/categories/").json()]

    assert names == [used.name]


def test_ids_are_uuids(api: APIClient) -> None:
    article = ArticleFactory.create()
    assert len(str(article.pk)) == 36
    assert api.get(f"/api/v1/articles/{article.slug}/").json()["id"] == str(article.pk)
