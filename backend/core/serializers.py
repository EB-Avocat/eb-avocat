from typing import Any

from rest_framework import serializers

from core.imaging import Crop

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
