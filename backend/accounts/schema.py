"""OpenAPI description of the personal API token authentication (drf-spectacular)."""

from typing import Any

from drf_spectacular.extensions import OpenApiAuthenticationExtension


class ApiTokenScheme(OpenApiAuthenticationExtension):
    target_class = "accounts.authentication.ApiTokenAuthentication"
    name = "apiToken"

    def get_security_definition(self, auto_schema: Any) -> dict[str, str]:
        return {
            "type": "http",
            "scheme": "bearer",
            "description": "Jeton personnel (eba_…) créé depuis la page profil du back-office.",
        }
