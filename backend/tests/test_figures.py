"""Images in article bodies: figures, captions, widths and uploads from a web address."""

from unittest import mock

import httpx
import pytest

from accounts.models import User
from articles.models import ArticleImage
from articles.rendering import render_markdown, split_width
from tests.conftest import client_for, png_bytes
from tests.test_remote_images import _transport


def test_lone_image_becomes_a_figure_with_caption_and_width() -> None:
    html = render_markdown('![Une salle d\'audience](https://cdn.test/a.webp#w=50 "Palais de <b>justice</b>")')
    assert html.strip() == (
        '<figure class="figure-w50"><img src="https://cdn.test/a.webp" alt="Une salle d\'audience">'
        "<figcaption>Palais de &lt;b&gt;justice&lt;/b&gt;</figcaption></figure>"
    )


def test_full_width_figure_without_caption() -> None:
    assert render_markdown("![x](https://cdn.test/a.webp)").strip() == (
        '<figure><img src="https://cdn.test/a.webp" alt="x"></figure>'
    )


def test_image_inside_text_stays_inline_without_fragment() -> None:
    html = render_markdown('Voir ![x](https://cdn.test/a.webp#w=33 "t") ici')
    assert html.strip() == '<p>Voir <img src="https://cdn.test/a.webp" alt="x" title="t"> ici</p>'


@pytest.mark.parametrize(
    ("src", "expected"),
    [
        ("a.webp#w=75", ("a.webp", 75)),
        ("a.webp#w=12", ("a.webp", None)),  # unknown width: dropped
        ("a.webp#top", ("a.webp#top", None)),
        ("a.webp", ("a.webp", None)),
    ],
)
def test_split_width(src: str, expected: tuple[str, int | None]) -> None:
    assert split_width(src) == expected


def test_only_width_classes_survive_on_figures() -> None:
    html = render_markdown('<figure class="figure-w75 evil" onclick="x()">t</figure>')
    assert html.strip() == '<figure class="figure-w75">t</figure>'


@pytest.mark.django_db
def test_inline_image_from_url_keeps_the_source(author: User) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, headers={"content-type": "image/png"}, content=png_bytes())

    public = [(2, 1, 6, "", ("93.184.216.34", 0))]
    with _transport(handler), mock.patch("core.remote.socket.getaddrinfo", return_value=public):
        response = client_for(author).post(
            "/api/v1/admin/uploads/", {"url": "https://example.com/photo.png"}, format="multipart"
        )

    assert response.status_code == 201
    body = response.json()
    assert body["url"].startswith("/api/v1/media/articles/")
    assert body["url"].endswith(".webp")
    assert body["source_url"] == "https://example.com/photo.png"
    assert ArticleImage.objects.get().source_url == "https://example.com/photo.png"


@pytest.mark.django_db
def test_inline_upload_needs_exactly_one_source(author: User) -> None:
    client = client_for(author)
    assert client.post("/api/v1/admin/uploads/", {}, format="multipart").status_code == 400


@pytest.mark.django_db
def test_inline_image_from_private_url_is_refused(author: User) -> None:
    private = [(2, 1, 6, "", ("10.0.0.1", 0))]
    with mock.patch("core.remote.socket.getaddrinfo", return_value=private):
        response = client_for(author).post(
            "/api/v1/admin/uploads/", {"url": "https://intranet.example/a.png"}, format="multipart"
        )
    assert response.status_code == 400
    assert not ArticleImage.objects.exists()
