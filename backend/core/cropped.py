"""Cropped image fields: an original, its processed rendition and the crop between them.

A model using this has three fields for a name ``<field>``: ``<field>`` (the WebP
rendition served on the site), ``<field>_original`` (the upload, kept for
re-cropping) and ``<field>_crop`` (JSON fractions, see ``core.imaging.Crop``).
"""

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import models

from core.imaging import Crop, Rendition, render


def _delete(instance: models.Model, name: str) -> None:
    file = getattr(instance, name)
    if file:
        file.delete(save=False)


def set_image(
    instance: models.Model, field: str, upload: SimpleUploadedFile, rendition: Rendition, crop: Crop | None = None
) -> None:
    """Store ``upload`` as the new original and render it (centered crop by default)."""
    data = upload.read()
    rendered, applied = render(data, rendition, crop, stem=field)  # fails before touching storage
    _delete(instance, f"{field}_original")
    _delete(instance, field)
    getattr(instance, f"{field}_original").save(upload.name or field, ContentFile(data), save=False)
    getattr(instance, field).save(rendered.name, rendered, save=False)
    setattr(instance, f"{field}_crop", applied.as_dict() if applied else None)
    instance.save()


def recrop(instance: models.Model, field: str, crop: Crop | None, rendition: Rendition) -> None:
    """Re-render ``field`` from its original with a new crop (``None``: centered)."""
    source = getattr(instance, f"{field}_original") or getattr(instance, field)  # legacy: no original kept
    if not source:
        raise ValidationError("Aucune image à recadrer.")
    with source.open("rb") as file:
        data = file.read()
    rendered, applied = render(data, rendition, crop, stem=field)
    if not getattr(instance, f"{field}_original"):
        getattr(instance, f"{field}_original").save(source.name.rsplit("/", 1)[-1], ContentFile(data), save=False)
    _delete(instance, field)
    getattr(instance, field).save(rendered.name, rendered, save=False)
    setattr(instance, f"{field}_crop", applied.as_dict() if applied else None)
    instance.save()


def clear(instance: models.Model, field: str) -> None:
    _delete(instance, f"{field}_original")
    _delete(instance, field)
    setattr(instance, f"{field}_crop", None)
    instance.save()
