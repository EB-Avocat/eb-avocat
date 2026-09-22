from io import StringIO

import pytest
from django.core.management import CommandError, call_command

from accounts.models import User
from articles.models import Article, Category

pytestmark = pytest.mark.django_db


def run(*args: str, **env: str) -> str:
    out = StringIO()
    call_command(*args, stdout=out, stderr=out)
    return out.getvalue()


def test_createadmin_is_idempotent() -> None:
    assert "created" in run("createadmin", "--email", "eva@example.com", "--password", "a-long-password")
    admin = User.objects.get(email="eva@example.com")
    assert admin.role == User.Role.ADMIN
    assert admin.is_staff
    assert admin.check_password("a-long-password")
    assert "already exists" in run("createadmin", "--email", "EVA@example.com", "--password", "x")


def test_createadmin_requires_credentials(monkeypatch: pytest.MonkeyPatch) -> None:
    with pytest.raises(CommandError):
        call_command("createadmin", "--email", "", "--password", "")


def test_seed_demo_needs_an_admin() -> None:
    run("seed_demo")
    assert Article.objects.count() == 0


def test_seed_demo_loads_content_once() -> None:
    run("createadmin", "--email", "eva@example.com", "--password", "a-long-password")
    run("seed_demo")
    run("seed_demo")
    assert Article.objects.count() == 4
    assert Article.objects.filter(status=Article.Status.DRAFT).count() == 1
    assert set(Category.objects.filter(is_primary=True).values_list("name", flat=True)) == {
        "Professionnels de santé",
        "Sociétés",
    }


def test_process_images_converts_legacy_covers_and_avatars() -> None:
    from django.core.files.uploadedfile import SimpleUploadedFile

    from tests.conftest import ArticleFactory, UserFactory, png_bytes

    article = ArticleFactory.create()
    article.cover.save("old.png", SimpleUploadedFile("old.png", png_bytes((1600, 1600))), save=True)
    user = UserFactory.create()
    user.avatar.save("me.png", SimpleUploadedFile("me.png", png_bytes((300, 200))), save=True)

    assert "1 cover(s) and 1 avatar(s)" in run("process_images", "--dry-run")
    article.refresh_from_db()
    assert not article.cover_original

    run("process_images")
    article.refresh_from_db()
    user.refresh_from_db()
    assert (article.cover.name or "").endswith(".webp")
    assert (article.cover_original.name or "").endswith("old.png")
    assert article.cover_crop is not None
    assert (user.avatar.name or "").endswith(".webp")
    assert "0 cover(s) and 0 avatar(s)" in run("process_images")
