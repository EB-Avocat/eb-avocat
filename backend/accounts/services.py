"""Avatar operations: square WebP rendition of a kept original (see core.cropped)."""

from django.core.files.uploadedfile import SimpleUploadedFile

from accounts.models import User
from core import cropped
from core.imaging import AVATAR, Crop


def set_avatar(user: User, image: SimpleUploadedFile) -> User:
    cropped.set_image(user, "avatar", image, AVATAR)
    return user


def recrop_avatar(user: User, crop: Crop | None) -> User:
    cropped.recrop(user, "avatar", crop, AVATAR)
    return user


def remove_avatar(user: User) -> User:
    if user.avatar or user.avatar_original:
        cropped.clear(user, "avatar")
    return user
