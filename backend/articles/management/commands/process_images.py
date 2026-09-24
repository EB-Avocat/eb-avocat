from typing import Any

from django.core.management.base import BaseCommand, CommandParser

from accounts.models import User
from accounts.services import recrop_avatar
from articles.models import Article
from articles.services import recrop_cover


class Command(BaseCommand):
    help = (
        "Convert covers and avatars stored before image processing existed: keep the file as the "
        "original and render the WebP rendition with a centered crop. Idempotent. Article body "
        "images are left as-is, since their URLs are embedded in the articles' Markdown."
    )

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--dry-run", action="store_true", help="Only list what would be converted.")

    def handle(self, *args: Any, **options: Any) -> None:
        articles = Article.objects.exclude(cover="").filter(cover_original="")
        users = User.objects.exclude(avatar="").filter(avatar_original="")
        self.stdout.write(f"{articles.count()} cover(s) and {users.count()} avatar(s) to convert.")
        if options["dry_run"]:
            return
        for article in articles:
            recrop_cover(article, None)
        for user in users:
            recrop_avatar(user, None)
        self.stdout.write(self.style.SUCCESS("Done."))
