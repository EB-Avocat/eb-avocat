from io import StringIO
from typing import Any

import pytest
from django.core.management import CommandError, call_command

from accounts.models import User

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _debug(settings: Any) -> None:
    settings.DEBUG = True  # pytest-django forces DEBUG off; the command is dev-only


def seed(*args: str) -> str:
    out = StringIO()
    call_command("seed_accounts", *args, stdout=out)
    return out.getvalue()


def test_refused_outside_development(settings: Any) -> None:
    settings.DEBUG = False
    with pytest.raises(CommandError, match="development"):
        seed()
    assert not User.objects.exists()


def test_creates_one_account_per_role() -> None:
    output = seed()

    roles = dict(User.objects.values_list("email", "role"))
    assert roles == {
        "admin@example.com": "admin",
        "editeur@example.com": "editor",
        "auteur@example.com": "author",
        "ancien@example.com": "author",
    }
    admin = User.objects.get(email="admin@example.com")
    assert admin.is_staff
    assert admin.is_superuser
    assert admin.check_password("dev-password-123")
    assert not User.objects.get(email="ancien@example.com").is_active
    assert all(user.avatar and user.avatar_original for user in User.objects.all())
    assert "4 comptes" in output
    assert "(désactivé)" in output


def test_is_idempotent_and_keeps_existing_accounts() -> None:
    User.objects.create_user("editeur@example.com", "my-own-password", role=User.Role.AUTHOR)

    output = seed()
    seed()

    assert User.objects.count() == 4
    editor = User.objects.get(email="editeur@example.com")
    assert editor.role == User.Role.AUTHOR  # untouched without --reset
    assert editor.check_password("my-own-password")
    assert "existant" in output


def test_reset_restores_roles_and_password() -> None:
    seed("--no-avatars")
    User.objects.filter(email="editeur@example.com").update(role=User.Role.AUTHOR, is_active=False)

    seed("--reset", "--password", "another-password", "--no-avatars")

    editor = User.objects.get(email="editeur@example.com")
    assert editor.role == User.Role.EDITOR
    assert editor.is_active
    assert editor.check_password("another-password")
    assert not editor.avatar
