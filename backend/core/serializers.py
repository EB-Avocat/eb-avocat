from typing import Any

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import serializers

from core.images import validate_uploaded_image
from core.imaging import Crop
from core.remote import fetch_remote_image


class ImageSourceSerializer(serializers.Serializer[None]):
    """An image from the computer (``file``) or from the web (``url``, downloaded by the server)."""

    file = serializers.ImageField(required=False)
    url = serializers.URLField(required=False)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        if bool(attrs.get("file")) == bool(attrs.get("url")):
            raise serializers.ValidationError("Fournissez soit un fichier, soit une URL.")
        return attrs

    def load(self) -> tuple[SimpleUploadedFile, str]:
        """The validated image, and the address it came from (empty for a file)."""
        if file := self.validated_data.get("file"):
            return validate_uploaded_image(file), ""
        url: str = self.validated_data["url"]
        return fetch_remote_image(url), url


# Rounding slack when the client's fractions add up to a hair over 1.
EPSILON = 1e-4


class CropSerializer(serializers.Serializer[None]):
    """Crop rectangle as fractions (0-1) of the original image."""

    x = serializers.FloatField(min_value=0, max_value=1)
    y = serializers.FloatField(min_value=0, max_value=1)
    width = serializers.FloatField(min_value=0.01, max_value=1)
    height = serializers.FloatField(min_value=0.01, max_value=1)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        if attrs["x"] + attrs["width"] > 1 + EPSILON or attrs["y"] + attrs["height"] > 1 + EPSILON:
            raise serializers.ValidationError("Le recadrage dépasse de l'image.")
        return attrs

    def to_crop(self) -> Crop:
        return Crop.from_dict(self.validated_data)
