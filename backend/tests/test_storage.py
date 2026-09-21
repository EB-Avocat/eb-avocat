from typing import Any
from unittest import mock

import httpx
from django.core.files.base import ContentFile

from core.storage import BLOB_API_URL, VercelBlobStorage

BLOB_URL = "https://abc.public.blob.vercel-storage.com/covers/x/cover-Ab12.png"


def response(method: str, status: int = 200, **kwargs: Any) -> httpx.Response:
    return httpx.Response(status, request=httpx.Request(method, "https://blob.test"), **kwargs)


def test_save_uploads_and_returns_the_blob_url() -> None:
    storage = VercelBlobStorage(token="tok")
    with mock.patch("core.storage.httpx.put", return_value=response("PUT", json={"url": BLOB_URL})) as put:
        name = storage.save("covers/x/cover.png", ContentFile(b"png-bytes", name="cover.png"))

    assert name == BLOB_URL
    url = put.call_args.args[0]
    headers = put.call_args.kwargs["headers"]
    assert url == f"{BLOB_API_URL}/covers/x/cover.png"
    assert headers["authorization"] == "Bearer tok"
    assert headers["x-content-type"] == "image/png"
    assert put.call_args.kwargs["content"] == b"png-bytes"


def test_url_is_a_passthrough() -> None:
    storage = VercelBlobStorage(token="tok")
    assert storage.url(BLOB_URL) == BLOB_URL
    assert storage.url(None) == ""
    assert storage.exists(BLOB_URL) is False
    assert storage.get_available_name("a.png") == "a.png"


def test_delete_calls_the_delete_endpoint() -> None:
    storage = VercelBlobStorage(token="tok")
    with mock.patch("core.storage.httpx.post", return_value=response("POST")) as post:
        storage.delete(BLOB_URL)
        storage.delete("")
    post.assert_called_once()
    assert post.call_args.args[0] == f"{BLOB_API_URL}/delete"
    assert post.call_args.kwargs["json"] == {"urls": [BLOB_URL]}


def test_open_and_size() -> None:
    storage = VercelBlobStorage(token="tok")
    with mock.patch("core.storage.httpx.get", return_value=response("GET", content=b"data")):
        assert storage.open(BLOB_URL).read() == b"data"
    with mock.patch("core.storage.httpx.head", return_value=response("HEAD", headers={"content-length": "42"})):
        assert storage.size(BLOB_URL) == 42
