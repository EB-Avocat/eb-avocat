from typing import Any

from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request

from accounts.models import ApiToken, User


def user_from_authorization(header: str) -> User | None:
    """Resolve ``Authorization: Bearer <token>`` to an active user, or None."""
    scheme, _, raw = header.partition(" ")
    if scheme.lower() != "bearer" or not raw:
        return None
    return ApiToken.authenticate(raw.strip())


class ApiTokenAuthentication(BaseAuthentication):
    def authenticate(self, request: Request) -> tuple[User, Any] | None:
        header = get_authorization_header(request).decode()
        if not header:
            return None
        user = user_from_authorization(header)
        if user is None:
            raise AuthenticationFailed("Jeton d'API invalide ou révoqué.")
        return user, None

    def authenticate_header(self, request: Request) -> str:
        return "Bearer"
