import logging
from typing import Any

from django.contrib.auth import authenticate, login, logout, password_validation, update_session_auth_hash
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import QuerySet
from django.middleware.csrf import get_token
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from drf_spectacular.utils import extend_schema
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from accounts import emails, services
from accounts.models import ApiToken, User
from accounts.permissions import IsAdminRole
from accounts.serializers import (
    ApiTokenCreatedSerializer,
    ApiTokenSerializer,
    LoginSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileSerializer,
    UserCreateSerializer,
    UserSerializer,
)
from articles.models import Article
from core.auth import request_user
from core.serializers import CropSerializer, ImageSourceSerializer

logger = logging.getLogger(__name__)


class EmailNotSent(APIException):
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = "L'e-mail n'a pas pu être envoyé. Réessayez dans quelques minutes."


def send_password_link_or_raise(user: User) -> None:
    """For the back-office: a sending failure is reported (details in the logs), not a bare 500."""
    try:
        emails.send_password_link(user)
    except Exception as exc:
        logger.exception("Password link for user %s could not be sent.", user.pk)
        raise EmailNotSent from exc


class CsrfView(APIView):
    """Sets the csrftoken cookie so the back-office can send X-CSRFToken."""

    permission_classes = (AllowAny,)

    @extend_schema(responses={204: None})
    def get(self, request: Request) -> Response:
        get_token(request._request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class LoginView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "auth"

    @extend_schema(request=LoginSerializer, responses=ProfileSerializer)
    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request._request,
            email=serializer.validated_data["email"].lower(),
            password=serializer.validated_data["password"],
        )
        if not isinstance(user, User):
            raise ValidationError({"detail": "Identifiants incorrects."})
        login(request._request, user)
        return Response(ProfileSerializer(user, context={"request": request}).data)


class LogoutView(APIView):
    @extend_schema(request=None, responses={204: None})
    def post(self, request: Request) -> Response:
        logout(request._request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetRequestView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "auth"

    @extend_schema(request=PasswordResetRequestSerializer, responses={204: None})
    def post(self, request: Request) -> Response:
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data["email"], is_active=True).first()
        if user is not None:
            try:
                emails.send_password_link(user)
            except Exception:
                # Swallowed: failing only for existing accounts would reveal them.
                logger.exception("Password link for a reset request could not be sent.")
        # Same answer whether or not the account exists, or the email went out (no user enumeration).
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=PasswordResetConfirmSerializer, responses={204: None})
    def post(self, request: Request) -> Response:
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(data["uid"])), is_active=True)
        except (User.DoesNotExist, ValueError, DjangoValidationError):
            user = None
        if user is None or not default_token_generator.check_token(user, data["token"]):
            raise ValidationError({"detail": "Lien invalide ou expiré."})
        try:
            password_validation.validate_password(data["new_password"], user)
        except DjangoValidationError as exc:
            raise ValidationError({"new_password": exc.messages}) from exc
        user.set_password(data["new_password"])
        user.save(update_fields=["password"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(generics.RetrieveUpdateAPIView[User]):
    serializer_class = ProfileSerializer

    def get_object(self) -> User:
        return request_user(self.request)


class MePasswordView(APIView):
    @extend_schema(request=PasswordChangeSerializer, responses={204: None})
    def post(self, request: Request) -> Response:
        user = request_user(request)
        serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        update_session_auth_hash(request._request, user)
        return Response(status=status.HTTP_204_NO_CONTENT)


AvatarOwnerSerializer = type[ProfileSerializer] | type[UserSerializer]


def store_avatar(user: User, request: Request, serializer_class: AvatarOwnerSerializer) -> Response:
    source = ImageSourceSerializer(data=request.data)
    source.is_valid(raise_exception=True)
    image, _ = source.load()
    services.set_avatar(user, image)
    return Response(serializer_class(user, context={"request": request}).data)


def crop_avatar(user: User, request: Request, serializer_class: AvatarOwnerSerializer) -> Response:
    serializer = CropSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    services.recrop_avatar(user, serializer.to_crop())
    return Response(serializer_class(user, context={"request": request}).data)


class MeAvatarView(APIView):
    """The signed-in user's photo. Answers with the whole profile, ready to replace the session copy."""

    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @extend_schema(request=ImageSourceSerializer, responses=ProfileSerializer)
    def post(self, request: Request) -> Response:
        return store_avatar(request_user(request), request, ProfileSerializer)

    @extend_schema(responses=ProfileSerializer)
    def delete(self, request: Request) -> Response:
        user = request_user(request)
        services.remove_avatar(user)
        return Response(ProfileSerializer(user, context={"request": request}).data)


class MeAvatarCropView(APIView):
    @extend_schema(request=CropSerializer, responses=ProfileSerializer)
    def post(self, request: Request) -> Response:
        return crop_avatar(request_user(request), request, ProfileSerializer)


class ApiTokenViewSet(
    mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet[ApiToken]
):
    serializer_class = ApiTokenSerializer

    def get_queryset(self) -> QuerySet[ApiToken]:
        if getattr(self, "swagger_fake_view", False):  # schema generation
            return ApiToken.objects.none()
        return ApiToken.objects.filter(user=request_user(self.request))

    @extend_schema(responses={201: ApiTokenCreatedSerializer})
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token, raw = ApiToken.issue(request_user(request), serializer.validated_data["name"])
        # Same shape as ApiTokenCreatedSerializer (documented response); the raw value is shown once.
        return Response({**ApiTokenSerializer(token).data, "token": raw}, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ModelViewSet[User]):
    """User management, admin only. The last active admin cannot be demoted or disabled."""

    queryset = User.objects.all()
    permission_classes = (IsAuthenticated, IsAdminRole)
    filterset_fields = ("role", "is_active")

    def get_serializer_class(self) -> type[UserSerializer]:
        return UserCreateSerializer if self.action == "create" else UserSerializer

    # Atomic, so an invitation that can't be sent doesn't leave an unreachable account.
    @transaction.atomic
    def perform_create(self, serializer: BaseSerializer[User]) -> None:
        user = serializer.save()
        if not user.has_usable_password():
            # Created without a password: the new user chooses one from the invitation link.
            send_password_link_or_raise(user)

    @extend_schema(request=None, responses={204: None})
    @action(detail=True, methods=["post"], url_path="send-link")
    def send_link(self, request: Request, pk: str | None = None) -> Response:
        """Emails the invitation (account without a password yet) or a password reset link."""
        user = self.get_object()
        if not user.is_active:
            raise ValidationError({"detail": "Ce compte est désactivé : réactivez-le avant d'envoyer un lien."})
        send_password_link_or_raise(user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _is_last_admin(self, user: User) -> bool:
        other_admins = User.objects.filter(role=User.Role.ADMIN, is_active=True).exclude(pk=user.pk)
        return user.is_admin and not other_admins.exists()

    def perform_update(self, serializer: BaseSerializer[User]) -> None:
        user = self.get_object()
        data = serializer.validated_data
        demoted = data.get("role", user.role) != User.Role.ADMIN or data.get("is_active", user.is_active) is False
        if demoted and self._is_last_admin(user):
            raise ValidationError({"detail": "Il doit rester au moins un administrateur actif."})
        serializer.save()

    def perform_destroy(self, instance: User) -> None:
        if instance.pk == self.request.user.pk:
            raise ValidationError({"detail": "Vous ne pouvez pas supprimer votre propre compte."})
        if self._is_last_admin(instance):
            raise ValidationError({"detail": "Il doit rester au moins un administrateur actif."})
        if Article.objects.filter(author=instance).exists():
            raise ValidationError(
                {"detail": "Cet utilisateur a rédigé des articles : désactivez son compte plutôt que de le supprimer."}
            )
        instance.delete()

    @extend_schema(methods=["POST"], request=ImageSourceSerializer, responses=UserSerializer)
    @extend_schema(methods=["DELETE"], request=None, responses={204: None})
    @action(detail=True, methods=["post", "delete"], parser_classes=(MultiPartParser, FormParser, JSONParser))
    def avatar(self, request: Request, pk: str | None = None) -> Response:
        user = self.get_object()
        if request.method == "DELETE":
            services.remove_avatar(user)
            return Response(status=status.HTTP_204_NO_CONTENT)
        return store_avatar(user, request, UserSerializer)

    @extend_schema(request=CropSerializer, responses=UserSerializer)
    @action(detail=True, methods=["post"], url_path="avatar/crop")
    def avatar_crop(self, request: Request, pk: str | None = None) -> Response:
        return crop_avatar(self.get_object(), request, UserSerializer)
