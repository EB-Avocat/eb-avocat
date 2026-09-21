from typing import Any

from rest_framework import serializers


class MediaUrlField(serializers.ReadOnlyField):
    """Return the storage URL as-is: absolute for Vercel Blob, same-origin
    ``/api/v1/media/...`` locally (the frontend proxies that path to Django)."""

    def to_representation(self, value: Any) -> str | None:
        return value.url if value else None
