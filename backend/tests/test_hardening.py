"""Regression tests for the code-review hardening: SSRF pinning, bombs, storage failures, MCP."""

import socket
from typing import Any
from unittest import mock

import httpx
import pytest
from django.core.exceptions import ValidationError
from PIL import Image
from starlette.testclient import TestClient

from accounts.models import ApiToken, User
from articles.models import Article
from core.remote import fetch_remote_image
from tests.conftest import ArticleFactory, UserFactory, client_for, png_bytes
from tests.test_imaging import upload
from tests.test_mcp import call
from tests.test_remote_images import _transport

# --- SSRF: the connection reuses the address that was checked --------------------------


def _capture() -> tuple[list[httpx.Request], Any]:
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(200, headers={"content-type": "image/png"}, content=png_bytes())

    return seen, handler


def test_connection_is_pinned_against_dns_rebinding() -> None:
    """A second DNS answer could be private: the request must go to the address already checked."""
    seen, handler = _capture()
    answers = iter([("93.184.216.34", 0), ("127.0.0.1", 0)])

    def rebinding_dns(host: str, *args: object) -> list[Any]:
        return [(socket.AF_INET, 0, 0, "", next(answers))]

    with _transport(handler), mock.patch("core.remote.socket.getaddrinfo", side_effect=rebinding_dns):
        fetch_remote_image("https://example.com:8443/img.png")

    (request,) = seen
    assert request.url.host == "93.184.216.34"
    assert request.url.port == 8443
    assert request.headers["host"] == "example.com:8443"  # virtual hosting still works
    assert request.extensions["sni_hostname"] == "example.com"  # TLS verified against the name


def test_ipv6_pinning_and_plain_http() -> None:
    seen, handler = _capture()
    ipv6 = [(socket.AF_INET6, 0, 0, "", ("2606:2800:220:1::1", 0, 0, 0))]
    with _transport(handler), mock.patch("core.remote.socket.getaddrinfo", return_value=ipv6):
        fetch_remote_image("http://example.com/img.png")
    assert seen[0].url.host == "2606:2800:220:1::1"
    assert "sni_hostname" not in seen[0].extensions


def test_any_private_answer_refuses_the_host() -> None:
    answers = [(socket.AF_INET, 0, 0, "", ("93.184.216.34", 0)), (socket.AF_INET, 0, 0, "", ("10.0.0.1", 0))]
    with mock.patch("core.remote.socket.getaddrinfo", return_value=answers), pytest.raises(ValidationError):
        fetch_remote_image("https://example.com/img.png")


# --- images -------------------------------------------------------------------------


@pytest.mark.django_db
def test_decompression_bomb_is_a_validation_error(author: User, monkeypatch: pytest.MonkeyPatch) -> None:
    article = ArticleFactory.create(author=author)
    monkeypatch.setattr(Image, "MAX_IMAGE_PIXELS", 10)  # any real image now counts as a bomb
    response = client_for(author).post(
        f"/api/v1/admin/articles/{article.pk}/cover/", {"file": upload((100, 100))}, format="multipart"
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_failed_storage_keeps_the_previous_cover(author: User) -> None:
    """New files are stored and the row saved before the replaced ones are deleted."""
    article = ArticleFactory.create(author=author)
    client = client_for(author)
    url = f"/api/v1/admin/articles/{article.pk}/cover/"
    client.post(url, {"file": upload((1920, 1080))}, format="multipart")
    article.refresh_from_db()
    before = (article.cover.name, article.cover_original.name)
    storage = article.cover.storage
    real_save = storage.save
    calls = {"n": 0}

    def flaky_save(name: str, content: Any, max_length: int | None = None) -> str:
        calls["n"] += 1
        if calls["n"] == 2:  # the rendition upload fails after the new original was stored
            raise OSError("blob unavailable")
        return real_save(name, content, max_length=max_length)

    with mock.patch.object(storage, "save", side_effect=flaky_save), pytest.raises(OSError):
        client.post(url, {"file": upload((1920, 1080))}, format="multipart")

    article.refresh_from_db()
    assert (article.cover.name, article.cover_original.name) == before
    assert all(name and storage.exists(name) for name in before)


# --- MCP ----------------------------------------------------------------------------


@pytest.mark.django_db(transaction=True)
def test_create_article_reports_the_article_when_the_cover_is_refused() -> None:
    from config.asgi import create_application

    _, raw = ApiToken.issue(UserFactory.create(role=User.Role.EDITOR), "claude")
    with (
        TestClient(create_application()) as client,
        mock.patch("articles.mcp.fetch_remote_image", side_effect=ValidationError("Adresse interdite")),
    ):
        result = call(client, raw, "create_article", title="Sans image", markdown="x", cover_url="https://e.com/a")

    text = result["content"][0]["text"]
    assert result["isError"] is True
    assert "Article créé" in text
    assert "set_article_cover" in text
    assert Article.objects.filter(title="Sans image").count() == 1
