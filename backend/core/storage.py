"""Vercel Blob storage backend.

Talks to the Vercel Blob REST API with ``BLOB_READ_WRITE_TOKEN``. The store is
private: blobs can only be read with the token, so the site serves them through
its own ``/media/<pathname>`` route (see ``frontend/src/app/media``), exposed on
``MEDIA_URL`` (``https://cdn.biezunski-avocat.fr/media/`` in production). The
stored file name is the blob pathname.
"""

import mimetypes
from typing import IO, Any

import httpx
from django.conf import settings
from django.core.files.base import File
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible
from django.utils.encoding import filepath_to_uri
from django.utils.functional import cached_property

BLOB_API_URL = "https://blob.vercel-storage.com"
BLOB_API_VERSION = "12"


@deconstructible
class VercelBlobStorage(Storage):
    def __init__(self, token: str | None = None) -> None:
        self.token = token or settings.BLOB_READ_WRITE_TOKEN

    @cached_property
    def store_url(self) -> str:
        # Read-write tokens look like ``vercel_blob_rw_<storeId>_<secret>``.
        store_id = self.token.split("_")[3].lower()
        return f"https://{store_id}.private.blob.vercel-storage.com"

    def _headers(self, **extra: str) -> dict[str, str]:
        return {"authorization": f"Bearer {self.token}", "x-api-version": BLOB_API_VERSION, **extra}

    def _blob_url(self, name: str) -> str:
        return f"{self.store_url}/{filepath_to_uri(name)}"

    def _save(self, name: str, content: File) -> str:
        content_type = getattr(content, "content_type", None) or mimetypes.guess_type(name)[0]
        content.seek(0)
        response = httpx.put(
            f"{BLOB_API_URL}/",
            params={"pathname": name},
            content=content.read(),
            headers=self._headers(
                **{
                    "x-vercel-blob-access": "private",
                    "x-content-type": content_type or "application/octet-stream",
                    "x-add-random-suffix": "1",
                }
            ),
            timeout=30,
        )
        response.raise_for_status()
        return response.json()["pathname"]

    def _open(self, name: str, mode: str = "rb") -> "File[Any]":
        from io import BytesIO

        response = httpx.get(self._blob_url(name), headers=self._headers(), timeout=30, follow_redirects=True)
        response.raise_for_status()
        buffer: IO[bytes] = BytesIO(response.content)
        return File(buffer, name=name)

    def delete(self, name: str) -> None:
        if not name:
            return
        httpx.post(
            f"{BLOB_API_URL}/delete",
            json={"urls": [self._blob_url(name)]},
            headers=self._headers(),
            timeout=30,
        ).raise_for_status()

    def exists(self, name: str) -> bool:
        # A random suffix is added on upload, so names never collide.
        return False

    def url(self, name: str | None) -> str:
        return f"{settings.MEDIA_URL}{filepath_to_uri(name)}" if name else ""

    def size(self, name: str) -> int:
        response = httpx.head(self._blob_url(name), headers=self._headers(), timeout=30, follow_redirects=True)
        response.raise_for_status()
        return int(response.headers.get("content-length", 0))

    def get_available_name(self, name: str, max_length: int | None = None) -> str:
        return name
