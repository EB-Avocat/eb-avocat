import os
from typing import Any

from django.core.management.base import BaseCommand, CommandError, CommandParser

from accounts.models import User


class Command(BaseCommand):
    help = "Create the first administrator (idempotent). Reads ADMIN_EMAIL / ADMIN_PASSWORD when not passed."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--email", default=os.environ.get("ADMIN_EMAIL"))
        parser.add_argument("--password", default=os.environ.get("ADMIN_PASSWORD"))
        parser.add_argument("--first-name", default="")
        parser.add_argument("--last-name", default="")

    def handle(self, *args: Any, **options: Any) -> None:
        email, password = options["email"], options["password"]
        if not email or not password:
            raise CommandError("Provide --email and --password (or ADMIN_EMAIL / ADMIN_PASSWORD).")
        if User.objects.filter(email__iexact=email).exists():
            self.stdout.write(f"{email} already exists, nothing to do.")
            return
        User.objects.create_superuser(email, password, first_name=options["first_name"], last_name=options["last_name"])
        self.stdout.write(self.style.SUCCESS(f"Administrator {email} created."))
