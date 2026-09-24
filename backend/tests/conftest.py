from io import BytesIO
from pathlib import Path
from typing import Any

import factory
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from accounts.models import User
from articles.models import Article, Category


class UserFactory(factory.django.DjangoModelFactory[User]):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    first_name = "Jeanne"
    last_name = factory.Sequence(lambda n: f"Doe{n}")
    role = User.Role.AUTHOR
    password = factory.django.Password("correct-horse-battery")


class CategoryFactory(factory.django.DjangoModelFactory[Category]):
    class Meta:
        model = Category

    name = factory.Sequence(lambda n: f"Catégorie {n}")


class ArticleFactory(factory.django.DjangoModelFactory[Article]):
    class Meta:
        model = Article

    title = factory.Sequence(lambda n: f"Article {n}")
    summary = "Résumé"
    body_markdown = "## Titre\n\nTexte **gras**."
    author = factory.SubFactory(UserFactory)
    status = Article.Status.PUBLISHED


@pytest.fixture(autouse=True)
def _media_root(settings: Any, tmp_path: Path) -> None:
    settings.MEDIA_ROOT = tmp_path
    settings.FRONTEND_INTERNAL_URL = ""


@pytest.fixture
def admin() -> User:
    return UserFactory.create(role=User.Role.ADMIN)


@pytest.fixture
def editor() -> User:
    return UserFactory.create(role=User.Role.EDITOR)


@pytest.fixture
def author() -> User:
    return UserFactory.create(role=User.Role.AUTHOR)


@pytest.fixture
def api() -> APIClient:
    return APIClient()


def client_for(user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user)
    return client


def png_bytes(size: tuple[int, int] = (4, 4)) -> bytes:
    buffer = BytesIO()
    Image.new("RGB", size, "teal").save(buffer, format="PNG")
    return buffer.getvalue()


def png_upload(name: str = "cover.png") -> SimpleUploadedFile:
    return SimpleUploadedFile(name, png_bytes(), content_type="image/png")
