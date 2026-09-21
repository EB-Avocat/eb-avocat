"""Image validation shared by avatars, article covers and inline uploads."""

from io import BytesIO

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile, UploadedFile
from PIL import Image, UnidentifiedImageError

ALLOWED_FORMATS = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp", "GIF": "gif"}


def validate_image_bytes(data: bytes, filename: str = "image") -> SimpleUploadedFile:
    """Check size and real format (not the client-sent content type); return a clean upload."""
    if len(data) > settings.MAX_IMAGE_UPLOAD_BYTES:
        raise ValidationError("L'image dépasse la taille maximale (8 Mo).")
    try:
        with Image.open(BytesIO(data)) as image:
            image.verify()
            image_format = image.format or ""
    except (UnidentifiedImageError, OSError, SyntaxError) as exc:
        raise ValidationError("Le fichier n'est pas une image valide.") from exc
    extension = ALLOWED_FORMATS.get(image_format)
    if extension is None:
        raise ValidationError("Formats acceptés : JPEG, PNG, WebP, GIF.")
    stem = filename.rsplit(".", 1)[0][:60] or "image"
    return SimpleUploadedFile(
        f"{stem}.{extension}", data, content_type=f"image/{'jpeg' if extension == 'jpg' else extension}"
    )


def validate_uploaded_image(upload: UploadedFile) -> SimpleUploadedFile:
    if upload.size and upload.size > settings.MAX_IMAGE_UPLOAD_BYTES:
        raise ValidationError("L'image dépasse la taille maximale (8 Mo).")
    return validate_image_bytes(upload.read(), upload.name or "image")
