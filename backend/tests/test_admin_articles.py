from unittest import mock

import pytest
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient

from accounts.models import User
from articles.models import Article, Category
from tests.conftest import ArticleFactory, CategoryFactory, client_for, png_upload

pytestmark = pytest.mark.django_db


def test_anonymous_cannot_access_admin_api(api: APIClient) -> None:
    assert api.get("/api/v1/admin/articles/").status_code == 401


def test_create_draft_with_category_names(author: User) -> None:
    CategoryFactory.create(name="Sociétés")
    response = client_for(author).post(
        "/api/v1/admin/articles/",
        {"title": "Mon article", "body_markdown": "Bonjour", "category_names": ["sociétés", "Nouvelle"]},
        format="json",
    )

    assert response.status_code == 201, response.json()
    article = Article.objects.get(pk=response.json()["id"])
    assert article.status == Article.Status.DRAFT
    assert article.published_at is None
    assert article.author == author
    assert article.slug == "mon-article"
    assert sorted(c.name for c in article.categories.all()) == ["Nouvelle", "Sociétés"]
    assert Category.objects.count() == 2


def test_publishing_sets_published_at(author: User) -> None:
    article = ArticleFactory.create(author=author, status=Article.Status.DRAFT)
    response = client_for(author).patch(f"/api/v1/admin/articles/{article.pk}/", {"status": "published"}, format="json")
    assert response.status_code == 200
    article.refresh_from_db()
    assert article.published_at is not None


@pytest.mark.parametrize(("role", "can_edit_others"), [("admin", True), ("editor", True), ("author", False)])
def test_role_matrix_on_other_users_articles(role: str, can_edit_others: bool) -> None:
    from tests.conftest import UserFactory

    user = UserFactory.create(role=role)
    other = ArticleFactory.create()
    client = client_for(user)

    listed = [a["id"] for a in client.get("/api/v1/admin/articles/").json()["results"]]
    patch = client.patch(f"/api/v1/admin/articles/{other.pk}/", {"title": "x"}, format="json")

    assert (str(other.pk) in listed) is can_edit_others
    assert patch.status_code == (200 if can_edit_others else 404)


def test_markdown_is_sanitised(author: User) -> None:
    response = client_for(author).post(
        "/api/v1/admin/articles/",
        {
            "title": "XSS",
            "body_markdown": '<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n<img src=x onerror="alert(1)">',
        },
        format="json",
    )
    html = response.json()["body_html"]
    assert "<script" not in html
    assert 'href="javascript' not in html
    assert "onerror" not in html


def test_preview_renders_markdown(author: User) -> None:
    response = client_for(author).post("/api/v1/admin/preview/", {"markdown": "# Titre"}, format="json")
    assert response.json() == {"html": "<h1>Titre</h1>\n"}


def test_cover_upload_file(author: User) -> None:
    article = ArticleFactory.create(author=author)
    response = client_for(author).post(
        f"/api/v1/admin/articles/{article.pk}/cover/", {"file": png_upload(), "alt": "Un cabinet"}, format="multipart"
    )
    assert response.status_code == 200, response.json()
    article.refresh_from_db()
    assert (article.cover.name or "").endswith(".png")
    assert article.cover_alt == "Un cabinet"
    assert response.json()["cover"].startswith("/api/v1/media/covers/")


def test_cover_rejects_non_images(author: User) -> None:
    from django.core.files.uploadedfile import SimpleUploadedFile

    article = ArticleFactory.create(author=author)
    fake = SimpleUploadedFile("evil.png", b"not an image", content_type="image/png")
    response = client_for(author).post(
        f"/api/v1/admin/articles/{article.pk}/cover/", {"file": fake}, format="multipart"
    )
    assert response.status_code == 400


def test_cover_from_url_uses_safe_fetcher(author: User) -> None:
    article = ArticleFactory.create(author=author)
    with mock.patch("articles.services.fetch_remote_image", return_value=png_upload("remote.png")) as fetch:
        response = client_for(author).post(
            f"/api/v1/admin/articles/{article.pk}/cover/", {"url": "https://example.com/a.png"}, format="json"
        )
    fetch.assert_called_once_with("https://example.com/a.png")
    assert response.status_code == 200


def test_cover_from_url_error_is_400(author: User) -> None:
    article = ArticleFactory.create(author=author)
    with mock.patch("articles.services.fetch_remote_image", side_effect=ValidationError("Adresse interdite")):
        response = client_for(author).post(
            f"/api/v1/admin/articles/{article.pk}/cover/", {"url": "http://127.0.0.1/x.png"}, format="json"
        )
    assert response.status_code == 400


def test_primary_category_toggle_is_editor_only(author: User, editor: User) -> None:
    category = CategoryFactory.create()
    url = f"/api/v1/admin/categories/{category.pk}/"
    assert client_for(author).patch(url, {"is_primary": True}, format="json").status_code == 403
    assert client_for(editor).patch(url, {"is_primary": True}, format="json").status_code == 200
    category.refresh_from_db()
    assert category.is_primary


def test_revalidation_is_triggered_on_commit(author: User, settings, django_capture_on_commit_callbacks) -> None:
    settings.FRONTEND_INTERNAL_URL = "http://frontend:3000"
    settings.REVALIDATE_SECRET = "s3cret"
    with (
        mock.patch("articles.services.httpx.post") as post,
        django_capture_on_commit_callbacks(execute=True),
    ):
        ArticleFactory.create(author=author)
    post.assert_called_with(
        "http://frontend:3000/api/revalidate",
        headers={"authorization": "Bearer s3cret"},
        json={"tag": "articles"},
        timeout=5,
    )


def test_cover_from_url_is_copied_to_storage_and_source_kept(author: User) -> None:
    article = ArticleFactory.create(author=author)
    client = client_for(author)
    source = "https://images.example.com/photos/cabinet.png"
    url = f"/api/v1/admin/articles/{article.pk}/cover/"
    with mock.patch("articles.services.fetch_remote_image", return_value=png_upload("cabinet.png")):
        data = client.post(url, {"url": source}, format="json").json()

    # Served from our own storage (Vercel Blob in production), not hotlinked; the origin is kept.
    assert data["cover"].startswith("/api/v1/media/covers/")
    assert data["cover_source_url"] == source
    article.refresh_from_db()
    assert article.cover.name and article.cover.storage.exists(article.cover.name)
    assert article.cover_source_url == source

    # A file upload replaces the source; removing the cover clears it.
    assert client.post(url, {"file": png_upload()}, format="multipart").json()["cover_source_url"] == ""
    with mock.patch("articles.services.fetch_remote_image", return_value=png_upload("again.png")):
        client.post(url, {"url": source}, format="json")
    data = client.delete(url).json()
    assert data["cover"] is None
    assert data["cover_source_url"] == ""


def test_cover_source_url_is_read_only(author: User) -> None:
    article = ArticleFactory.create(author=author)
    response = client_for(author).patch(
        f"/api/v1/admin/articles/{article.pk}/", {"cover_source_url": "https://other.example.com/x.png"}, format="json"
    )
    assert response.status_code == 200
    assert response.json()["cover_source_url"] == ""
