from typing import TYPE_CHECKING

from django.http import HttpRequest
from rest_framework.exceptions import NotAuthenticated
from rest_framework.request import Request

if TYPE_CHECKING:
    from accounts.models import User


def request_user(request: Request | HttpRequest) -> "User":
    """The authenticated project ``User`` (typed), or 401."""
    from accounts.models import User

    user = request.user
    if not isinstance(user, User) or not user.is_active:
        raise NotAuthenticated
    return user


def optional_user(request: Request | HttpRequest) -> "User | None":
    from accounts.models import User

    user = getattr(request, "user", None)
    return user if isinstance(user, User) and user.is_active else None
