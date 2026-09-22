"""Error paths and smaller behaviours of the API, services and helpers."""

import socket
from io import BytesIO
from unittest import mock

import httpx
import pytest
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from PIL import Image
from rest_framework.test import APIClient

from accounts.models import ApiToken, User
from articles import services
from articles.models import Article, ArticleImage, Category, unique_slug
from core.images import validate_image_bytes, validate_uploaded_image
from core.remote import fetch_remote_image
from tests.conftest import ArticleFactory, CategoryFactory, UserFactory, client_for, png_bytes, png_upload

pytestmark = pytest.mark.django_db


# --- accounts ---------------------------------------------------------------------


def test_csrf_endpoint_sets_cookie(api: APIClient) -> None:
    response = api.get("/api/v1/auth/csrf/")
    assert response.status_code == 204
    assert "csrftoken" in response.cookies


def test_logout(author: User) -> None:
    client = client_for(author)
    assert client.post("/api/v1/auth/logout/").status_code == 204


def test_inactive_user_cannot_log_in(api: APIClient) -> None:
    UserFactory.create(email="off@example.com", is_active=False)
    response = api.post(
        "/api/v1/auth/login/", {"email": "off@example.com", "password": "correct-horse-battery"}, format="json"
    )
    assert response.status_code == 400


@pytest.mark.parametrize("uid", ["not-base64", urlsafe_base64_encode(b"not-a-uuid")])
def test_password_reset_confirm_rejects_bad_uid(api: APIClient, uid: str) -> None:
    response = api.post(
        "/api/v1/auth/password-reset/confirm/",
        {"uid": uid, "token": "x", "new_password": "brand-new-password"},
        format="json",
    )
    assert response.status_code == 400


def test_password_reset_confirm_rejects_bad_token_and_weak_password(api: APIClient) -> None:
    user = UserFactory.create()
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    url = "/api/v1/auth/password-reset/confirm/"
    bad = api.post(url, {"uid": uid, "token": "nope", "new_password": "brand-new-password"}, format="json")
    weak = api.post(
        url, {"uid": uid, "token": default_token_generator.make_token(user), "new_password": "123"}, format="json"
    )
    assert bad.status_code == 400
    assert weak.status_code == 400
    assert "new_password" in weak.json()


def test_avatar_from_url_and_errors(author: User) -> None:
    client = client_for(author)
    with mock.patch("core.serializers.fetch_remote_image", return_value=png_upload("web.png")):
        assert client.post("/api/v1/me/avatar/", {"url": "https://example.com/a.png"}, format="json").status_code == 200
    with mock.patch("core.serializers.fetch_remote_image", side_effect=ValidationError("Refusée")):
        assert client.post("/api/v1/me/avatar/", {"url": "https://example.com/a.png"}, format="json").status_code == 400
    assert client.post("/api/v1/me/avatar/", {}, format="json").status_code == 400

    # Replacing an avatar deletes the previous file; DELETE clears it.
    client.post("/api/v1/me/avatar/", {"file": png_upload()}, format="multipart")
    assert client.delete("/api/v1/me/avatar/").status_code == 200
    author.refresh_from_db()
    assert not author.avatar


def test_admin_manages_other_users_avatar(admin: User) -> None:
    other = UserFactory.create()
    client = client_for(admin)
    url = f"/api/v1/admin/users/{other.pk}/avatar/"
    assert client.post(url, {"file": png_upload()}, format="multipart").status_code == 200
    assert client.delete(url).status_code == 204
    other.refresh_from_db()
    assert not other.avatar


def test_admin_cannot_delete_self_but_can_delete_others(admin: User) -> None:
    client = client_for(admin)
    assert client.delete(f"/api/v1/admin/users/{admin.pk}/").status_code == 400
    other = UserFactory.create()
    assert client.delete(f"/api/v1/admin/users/{other.pk}/").status_code == 204


def test_last_admin_cannot_be_deactivated_but_others_can(admin: User) -> None:
    client = client_for(admin)
    assert client.patch(f"/api/v1/admin/users/{admin.pk}/", {"is_active": False}, format="json").status_code == 400
    second = UserFactory.create(role=User.Role.ADMIN)
    assert client.patch(f"/api/v1/admin/users/{second.pk}/", {"role": "author"}, format="json").status_code == 200


def test_create_user_with_password_and_weak_password(admin: User) -> None:
    client = client_for(admin)
    ok = client.post("/api/v1/admin/users/", {"email": "a@example.com", "password": "a-strong-password"}, format="json")
    weak = client.post("/api/v1/admin/users/", {"email": "b@example.com", "password": "123"}, format="json")
    assert ok.status_code == 201
    assert User.objects.get(email="a@example.com").check_password("a-strong-password")
    assert weak.status_code == 400


def test_user_manager_requires_email() -> None:
    with pytest.raises(ValueError, match="obligatoire"):
        User.objects.create_user("")


def test_model_string_representations() -> None:
    user = UserFactory.create(first_name="Eva", last_name="Biezunski")
    token, _ = ApiToken.issue(user, "Claude")
    article = ArticleFactory.create(title="Titre", author=user)
    category = CategoryFactory.create(name="Santé")
    image = ArticleImage(image="articles/x/a.png")
    assert str(user) == "Eva Biezunski"
    assert str(token).startswith("Claude (eba_")
    assert str(article) == "Titre"
    assert str(category) == "Santé"
    assert str(image) == "articles/x/a.png"


def test_token_of_inactive_user_is_rejected(api: APIClient) -> None:
    user = UserFactory.create()
    _, raw = ApiToken.issue(user, "x")
    user.is_active = False
    user.save()
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {raw}")
    assert api.get("/api/v1/me/").status_code == 401
    assert ApiToken.authenticate("not-a-token") is None


def test_non_bearer_authorization_is_ignored(api: APIClient) -> None:
    api.credentials(HTTP_AUTHORIZATION="Basic abc")
    assert api.get("/api/v1/me/").status_code == 401


# --- articles ---------------------------------------------------------------------


def test_unique_slug_suffixes() -> None:
    ArticleFactory.create(title="Même titre")
    second = ArticleFactory.create(title="Même titre")
    assert second.slug == "meme-titre-2"
    assert unique_slug(Article, "") == "article"
    assert CategoryFactory.create(name="Droit & santé").slug == "droit-sante"


def test_slug_conflict_is_rejected(author: User) -> None:
    ArticleFactory.create(slug="pris")
    mine = ArticleFactory.create(author=author)
    response = client_for(author).patch(f"/api/v1/admin/articles/{mine.pk}/", {"slug": "pris"}, format="json")
    assert response.status_code == 400
    # An empty slug keeps the current one.
    response = client_for(author).patch(f"/api/v1/admin/articles/{mine.pk}/", {"slug": ""}, format="json")
    assert response.json()["slug"] == mine.slug


def test_category_ids_and_names_are_merged(author: User) -> None:
    existing = CategoryFactory.create(name="Sociétés")
    response = client_for(author).post(
        "/api/v1/admin/articles/",
        {"title": "T", "category_ids": [str(existing.pk)], "category_names": ["sociétés", "Neuve"]},
        format="json",
    )
    names = sorted(c["name"] for c in response.json()["categories"])
    assert names == ["Neuve", "Sociétés"]


def test_cover_delete(author: User) -> None:
    article = ArticleFactory.create(author=author)
    client = client_for(author)
    client.post(f"/api/v1/admin/articles/{article.pk}/cover/", {"file": png_upload()}, format="multipart")
    response = client.delete(f"/api/v1/admin/articles/{article.pk}/cover/")
    assert response.status_code == 200
    assert response.json()["cover"] is None


def test_inline_upload(author: User) -> None:
    client = client_for(author)
    ok = client.post("/api/v1/admin/uploads/", {"file": png_upload()}, format="multipart")
    assert ok.status_code == 201
    assert ok.json()["url"].startswith("/api/v1/media/articles/")
    gif = BytesIO()
    Image.new("RGB", (2, 2)).save(gif, format="BMP")
    bad = client.post(
        "/api/v1/admin/uploads/", {"file": SimpleUploadedFile("a.bmp", gif.getvalue())}, format="multipart"
    )
    assert bad.status_code == 400


def test_category_management(author: User, editor: User) -> None:
    created = client_for(author).post("/api/v1/admin/categories/", {"name": "Nouvelle"}, format="json")
    assert created.status_code == 201
    first, second = CategoryFactory.create(), CategoryFactory.create()
    client = client_for(editor)
    ids = [str(second.pk), created.json()["id"], str(first.pk)]
    assert client.post("/api/v1/admin/categories/reorder/", {"ids": ids}, format="json").status_code == 204
    assert Category.objects.get(pk=second.pk).order == 0
    assert client.post("/api/v1/admin/categories/reorder/", {"ids": "x"}, format="json").status_code == 400
    assert client_for(author).post("/api/v1/admin/categories/reorder/", {"ids": []}, format="json").status_code == 403
    assert client.delete(f"/api/v1/admin/categories/{first.pk}/").status_code == 204


def test_schema_endpoint(api: APIClient) -> None:
    response = api.get("/api/v1/schema/")
    assert response.status_code == 200


def test_revalidation_failure_is_logged(settings, caplog: pytest.LogCaptureFixture) -> None:
    settings.FRONTEND_INTERNAL_URL = "http://frontend:3000"
    settings.REVALIDATE_SECRET = "s"
    with mock.patch("articles.services.httpx.post", side_effect=httpx.ConnectError("down")):
        services.revalidate_frontend()
    assert "revalidation failed" in caplog.text


def test_remove_cover_without_cover_is_noop() -> None:
    article = ArticleFactory.create()
    assert services.remove_cover(article) is article


# --- core -------------------------------------------------------------------------


def test_image_validation(settings) -> None:
    assert validate_image_bytes(png_bytes(), "photo.jpeg").name == "photo.png"  # real format wins
    with pytest.raises(ValidationError):
        validate_image_bytes(b"not an image")
    settings.MAX_IMAGE_UPLOAD_BYTES = 10
    with pytest.raises(ValidationError):
        validate_image_bytes(png_bytes())
    with pytest.raises(ValidationError):
        validate_uploaded_image(png_upload())


def _remote(handler):
    real_client = httpx.Client
    return mock.patch(
        "core.remote.httpx.Client",
        side_effect=lambda **kw: real_client(transport=httpx.MockTransport(handler), **kw),
    )


def _public_dns():
    return mock.patch("core.remote.socket.getaddrinfo", return_value=[(socket.AF_INET, 0, 0, "", ("93.184.216.34", 0))])


def test_remote_fetch_errors(settings) -> None:
    with (
        mock.patch("core.remote.socket.getaddrinfo", side_effect=socket.gaierror),
        pytest.raises(ValidationError, match="introuvable"),
    ):
        fetch_remote_image("https://nowhere.invalid/a.png")

    with (
        _remote(lambda r: httpx.Response(404)),
        _public_dns(),
        pytest.raises(ValidationError, match="HTTP 404"),
    ):
        fetch_remote_image("https://example.com/a.png")

    with (
        _remote(lambda r: httpx.Response(302, headers={"location": "/again"})),
        _public_dns(),
        pytest.raises(ValidationError, match="redirections"),
    ):
        fetch_remote_image("https://example.com/a.png")

    settings.MAX_IMAGE_UPLOAD_BYTES = 10
    with (
        _remote(lambda r: httpx.Response(200, headers={"content-type": "image/png"}, content=png_bytes())),
        _public_dns(),
        pytest.raises(ValidationError, match="taille"),
    ):
        fetch_remote_image("https://example.com/a.png")


def test_remote_fetch_follows_public_redirect() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/old.png":
            return httpx.Response(301, headers={"location": "/new.png"})
        return httpx.Response(200, headers={"content-type": "image/png"}, content=png_bytes())

    with _remote(handler), _public_dns():
        assert fetch_remote_image("https://example.com/old.png").name == "new.png"
