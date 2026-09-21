"""Vercel Blob storage backend.

Talks to the Vercel Blob REST API with ``BLOB_READ_WRITE_TOKEN``. The stored file
name is the blob's full public URL, so ``url()`` is a passthrough and no extra
lookup is needed at read time.
"""

import mimetypes
from typing import IO, Any

import httpx
from django.conf import settings
from django.core.files.base import File
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible

BLOB_API_URL = "https://blob.vercel-storage.com"
BLOB_API_VERSION = "7"


@deconstructible
class VercelBlobStorage(Storage):
    def __init__(self, token: str | None = None) -> None:
        self.token = token or settings.BLOB_READ_WRITE_TOKEN

    def _headers(self, **extra: str) -> dict[str, str]:
        return {"authorization": f"Bearer {self.token}", "x-api-version": BLOB_API_VERSION, **extra}

    def _save(self, name: str, content: File) -> str:
        content_type = getattr(content, "content_type", None) or mimetypes.guess_type(name)[0]
        content.seek(0)
        response = httpx.put(
            f"{BLOB_API_URL}/{name}",
            content=content.read(),
            headers=self._headers(
                **{"x-content-type": content_type or "application/octet-stream", "x-add-random-suffix": "1"}
            ),
            timeout=30,
        )
        response.raise_for_status()
        return response.json()["url"]

    def _open(self, name: str, mode: str = "rb") -> File[Any]:
        from io import BytesIO

        response = httpx.get(self.url(name), timeout=30, follow_redirects=True)
        response.raise_for_status()
        buffer: IO[bytes] = BytesIO(response.content)
        return File(buffer, name=name)

    def delete(self, name: str) -> None:
        if not name:
            return
        httpx.post(
            f"{BLOB_API_URL}/delete",
            json={"urls": [self.url(name)]},
            headers=self._headers(),
            timeout=30,
        ).raise_for_status()

    def exists(self, name: str) -> bool:
        # A random suffix is added on upload, so names never collide.
        return False

    def url(self, name: str | None) -> str:
        return name or ""

    def size(self, name: str) -> int:
        response = httpx.head(self.url(name), timeout=30, follow_redirects=True)
        response.raise_for_status()
        return int(response.headers.get("content-length", 0))

    def get_available_name(self, name: str, max_length: int | None = None) -> str:
        return name
