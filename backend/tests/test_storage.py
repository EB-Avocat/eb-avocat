from typing import Any
from unittest import mock

import httpx
import pytest
from django.core.files.base import ContentFile

from core.storage import BLOB_API_URL, VercelBlobStorage

TOKEN = "vercel_blob_rw_AbC123_secret"
PATHNAME = "covers/x/cover-Ab12.png"
BLOB_URL = f"https://abc123.private.blob.vercel-storage.com/{PATHNAME}"


def response(method: str, status: int = 200, **kwargs: Any) -> httpx.Response:
    return httpx.Response(status, request=httpx.Request(method, "https://blob.test"), **kwargs)


def test_save_uploads_privately_and_returns_the_pathname() -> None:
    storage = VercelBlobStorage(token=TOKEN)
    body = {"url": BLOB_URL, "pathname": PATHNAME}
    with mock.patch("core.storage.httpx.put", return_value=response("PUT", json=body)) as put:
        name = storage.save("covers/x/cover.png", ContentFile(b"png-bytes", name="cover.png"))

    assert name == PATHNAME
    assert put.call_args.args[0] == f"{BLOB_API_URL}/"
    assert put.call_args.kwargs["params"] == {"pathname": "covers/x/cover.png"}
    headers = put.call_args.kwargs["headers"]
    assert headers["authorization"] == f"Bearer {TOKEN}"
    assert headers["x-vercel-blob-access"] == "private"
    assert headers["x-content-type"] == "image/png"
    assert put.call_args.kwargs["content"] == b"png-bytes"


@pytest.mark.parametrize(
    ("media_url", "expected"),
    [("/media/", f"/media/{PATHNAME}"), ("https://cdn.example.fr/media/", f"https://cdn.example.fr/media/{PATHNAME}")],
)
def test_url_is_served_from_media_url(settings: Any, media_url: str, expected: str) -> None:
    settings.MEDIA_URL = media_url
    storage = VercelBlobStorage(token=TOKEN)
    assert storage.url(PATHNAME) == expected
    assert storage.url(None) == ""
    assert storage.exists(PATHNAME) is False
    assert storage.get_available_name("a.png") == "a.png"


def test_delete_calls_the_delete_endpoint() -> None:
    storage = VercelBlobStorage(token=TOKEN)
    with mock.patch("core.storage.httpx.post", return_value=response("POST")) as post:
        storage.delete(PATHNAME)
        storage.delete("")
    post.assert_called_once()
    assert post.call_args.args[0] == f"{BLOB_API_URL}/delete"
    assert post.call_args.kwargs["json"] == {"urls": [BLOB_URL]}


def test_open_and_size_read_the_private_blob_with_the_token() -> None:
    storage = VercelBlobStorage(token=TOKEN)
    with mock.patch("core.storage.httpx.get", return_value=response("GET", content=b"data")) as get:
        assert storage.open(PATHNAME).read() == b"data"
    assert get.call_args.args[0] == BLOB_URL
    assert get.call_args.kwargs["headers"]["authorization"] == f"Bearer {TOKEN}"
    with mock.patch("core.storage.httpx.head", return_value=response("HEAD", headers={"content-length": "42"})) as head:
        assert storage.size(PATHNAME) == 42
    assert head.call_args.args[0] == BLOB_URL
