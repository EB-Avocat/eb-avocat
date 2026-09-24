from typing import Any

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

from core.auth import optional_user


class IsAdminRole(BasePermission):
    message = "Réservé aux administrateurs."

    def has_permission(self, request: Request, view: APIView) -> bool:
        user = optional_user(request)
        return user is not None and user.is_admin


class CanEditArticle(BasePermission):
    """Admins and editors edit every article; authors only their own."""

    message = "Vous ne pouvez modifier que vos propres articles."

    def has_permission(self, request: Request, view: APIView) -> bool:
        return optional_user(request) is not None

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        user = optional_user(request)
        return user is not None and (user.can_edit_all_articles or obj.author_id == user.pk)
