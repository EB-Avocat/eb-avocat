from dataclasses import dataclass
from io import BytesIO
from typing import Any

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management.base import BaseCommand, CommandError, CommandParser
from django.db import transaction
from PIL import Image

from accounts.models import User
from accounts.services import set_avatar

DEV_PASSWORD = "dev-password-123"  # noqa: S105 - local development only, refused when DEBUG is off


@dataclass(frozen=True)
class SeedAccount:
    email: str
    first_name: str
    last_name: str
    role: str
    color: tuple[int, int, int]
    is_active: bool = True


ACCOUNTS = [
    SeedAccount("admin@example.com", "Eva", "Biezunski", User.Role.ADMIN, (63, 91, 87)),
    SeedAccount("editeur@example.com", "Léa", "Martin", User.Role.EDITOR, (74, 122, 111)),
    SeedAccount("auteur@example.com", "Hugo", "Bernard", User.Role.AUTHOR, (47, 72, 88)),
    SeedAccount("ancien@example.com", "Paul", "Durand", User.Role.AUTHOR, (120, 120, 120), is_active=False),
]


def _avatar(color: tuple[int, int, int]) -> SimpleUploadedFile:
    buffer = BytesIO()
    Image.new("RGB", (600, 600), color).save(buffer, format="PNG")
    return SimpleUploadedFile("avatar.png", buffer.getvalue(), content_type="image/png")


class Command(BaseCommand):
    help = (
        "Create development accounts, one per role (admin, editor, author) plus a deactivated author. "
        "Idempotent. Refused unless DJANGO_DEBUG is on."
    )

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--password", default=DEV_PASSWORD, help=f"Password for every account ({DEV_PASSWORD}).")
        parser.add_argument(
            "--reset", action="store_true", help="Also reset the role, names and password of existing accounts."
        )
        parser.add_argument("--no-avatars", action="store_true", help="Skip generating avatars.")

    @transaction.atomic
    def handle(self, *args: Any, **options: Any) -> None:
        if not settings.DEBUG:
            raise CommandError("seed_accounts is for local development only (set DJANGO_DEBUG=1).")

        password: str = options["password"]
        rows = []
        for seed in ACCOUNTS:
            user = User.objects.filter(email__iexact=seed.email).first()
            created = user is None
            if user is None:
                user = User.objects.create_user(seed.email, password, first_name=seed.first_name)
            if created or options["reset"]:
                user.first_name, user.last_name = seed.first_name, seed.last_name
                user.role, user.is_active = seed.role, seed.is_active
                user.is_superuser = seed.role == User.Role.ADMIN
                user.set_password(password)
                user.save()
            if not options["no_avatars"] and not user.avatar:
                set_avatar(user, _avatar(seed.color))
            rows.append((seed.email, User.Role(user.role).label, "créé" if created else "existant", user.is_active))

        self.stdout.write(f"Mot de passe des comptes créés ou réinitialisés : {password}")
        for email, role, state, active in rows:
            suffix = "" if active else " (désactivé)"
            self.stdout.write(f"  {email:<24} {role:<15} {state}{suffix}")
        self.stdout.write(self.style.SUCCESS(f"{len(rows)} comptes de développement prêts."))
