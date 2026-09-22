"""Image processing: normalise uploads into light WebP renditions.

Every processed image is re-encoded, which also drops EXIF metadata (camera,
GPS…). Phone photos are first rotated upright from their EXIF orientation.
Crops are expressed as fractions of the (upright) original, so they survive any
resizing and can be re-applied to the kept original at any time.
"""

from __future__ import annotations  # ContentFile[...] is a stub-only generic

import warnings
from dataclasses import asdict, dataclass
from io import BytesIO
from typing import Any

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError

WEBP_QUALITY = 82
# Refuse absurd dimensions (decompression bombs) well before Pillow's own limit.
MAX_PIXELS = 50_000_000


@dataclass(frozen=True)
class Rendition:
    """Target output: exact ``width`` x ``height`` when cropped, else a max width."""

    width: int
    height: int | None = None

    @property
    def aspect(self) -> float | None:
        return self.width / self.height if self.height else None


COVER = Rendition(1920, 1080)  # 16:9, the ratio of the cards and the article header
AVATAR = Rendition(512, 512)
INLINE = Rendition(1600)  # article body images: width cap only, no crop


@dataclass(frozen=True)
class Crop:
    """Crop rectangle as fractions (0-1) of the upright original image."""

    x: float
    y: float
    width: float
    height: float

    def as_dict(self) -> dict[str, float]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Crop:
        return cls(float(data["x"]), float(data["y"]), float(data["width"]), float(data["height"]))

    def box(self, size: tuple[int, int]) -> tuple[int, int, int, int]:
        width, height = size
        left, top = round(self.x * width), round(self.y * height)
        right = min(width, round((self.x + self.width) * width))
        bottom = min(height, round((self.y + self.height) * height))
        return left, top, max(right, left + 1), max(bottom, top + 1)


def open_upright(data: bytes) -> Image.Image:
    """Decode an image, applying its EXIF orientation. First frame only for animations."""
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            image = Image.open(BytesIO(data))
            if image.width * image.height > MAX_PIXELS:
                raise ValidationError("L'image est trop grande (dimensions).")
            image.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
        raise ValidationError("Le fichier n'est pas une image valide.") from exc
    upright = ImageOps.exif_transpose(image)
    has_alpha = upright.mode in {"RGBA", "LA"} or (upright.mode == "P" and "transparency" in upright.info)
    return upright.convert("RGBA" if has_alpha else "RGB")


def centered_crop(size: tuple[int, int], aspect: float) -> Crop:
    """The largest centered crop of ``aspect`` (width / height) inside ``size``."""
    width, height = size
    if width / height > aspect:  # too wide: trim the sides
        fraction = (height * aspect) / width
        return Crop((1 - fraction) / 2, 0.0, fraction, 1.0)
    fraction = (width / aspect) / height  # too tall: trim top and bottom
    return Crop(0.0, (1 - fraction) / 2, 1.0, fraction)


def encode_webp(image: Image.Image, stem: str) -> ContentFile[bytes]:
    buffer = BytesIO()
    image.save(buffer, format="WEBP", quality=WEBP_QUALITY, method=6)
    return ContentFile(buffer.getvalue(), name=f"{stem}.webp")


def render(data: bytes, rendition: Rendition, crop: Crop | None, stem: str) -> tuple[ContentFile[bytes], Crop | None]:
    """Produce the WebP rendition of ``data``; returns it with the crop actually applied.

    With a fixed-ratio rendition, the image is cropped (``crop``, or the centered
    default) then resized down to the rendition size — never upscaled. Otherwise it
    is only scaled down to the rendition width.
    """
    image = open_upright(data)
    aspect = rendition.aspect
    if aspect is None:
        if image.width > rendition.width:
            image = image.resize(
                (rendition.width, round(image.height * rendition.width / image.width)), Image.Resampling.LANCZOS
            )
        return encode_webp(image, stem), None

    applied = crop or centered_crop(image.size, aspect)
    cropped = image.crop(applied.box(image.size))
    width = min(rendition.width, cropped.width)
    # ImageOps.fit absorbs the last pixel of rounding so the output ratio is exact.
    output = ImageOps.fit(cropped, (width, max(1, round(width / aspect))), Image.Resampling.LANCZOS)
    return encode_webp(output, stem), applied
