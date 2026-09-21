from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = "accounts"
    verbose_name = "Comptes"

    def ready(self) -> None:
        from accounts import schema  # noqa: F401 - registers the OpenAPI auth extension
