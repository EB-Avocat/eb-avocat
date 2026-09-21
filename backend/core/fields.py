from typing import Any

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers


@extend_schema_field({"type": "string", "format": "uri-reference", "nullable": True, "readOnly": True})
class MediaUrlField(serializers.ReadOnlyField):
    """Return the storage URL as-is: absolute for Vercel Blob, same-origin
    ``/api/v1/media/...`` locally (the frontend proxies that path to Django)."""

    def to_representation(self, value: Any) -> str | None:
        return value.url if value else None
