from django.apps import AppConfig


class ArticlesConfig(AppConfig):
    name = "articles"

    def ready(self) -> None:
        from articles import signals  # noqa: F401 - registers receivers
