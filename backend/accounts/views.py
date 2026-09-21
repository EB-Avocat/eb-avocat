from typing import Any

from django.conf import settings
from django.contrib.auth import authenticate, login, logout, password_validation, update_session_auth_hash
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.db.models import QuerySet
from django.middleware.csrf import get_token
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from drf_spectacular.utils import extend_schema
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from accounts.models import ApiToken, User
from accounts.permissions import IsAdminRole
from accounts.serializers import (
    ApiTokenCreatedSerializer,
    ApiTokenSerializer,
    ImageUploadSerializer,
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
from core.images import validate_uploaded_image
from core.remote import fetch_remote_image


def django_errors(exc: DjangoValidationError) -> ValidationError:
    return ValidationError({"detail": exc.messages})


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
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"{settings.SITE_URL}/{settings.BACKOFFICE_PATH}/mot-de-passe/nouveau?uid={uid}&token={token}"
            send_mail(
                "Réinitialisation de votre mot de passe",
                f"Bonjour,\n\nPour choisir un nouveau mot de passe, ouvrez ce lien :\n{link}\n\n"
                "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.",
                None,
                [user.email],
            )
        # Same answer whether or not the account exists (no user enumeration).
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


def store_avatar(user: User, request: Request) -> Response:
    serializer = ImageUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        if file := serializer.validated_data.get("file"):
            image = validate_uploaded_image(file)
        else:
            image = fetch_remote_image(serializer.validated_data["url"])
    except DjangoValidationError as exc:
        raise django_errors(exc) from exc
    if user.avatar:
        user.avatar.delete(save=False)
    user.avatar.save(image.name or "avatar", image, save=True)
    return Response(UserSerializer(user, context={"request": request}).data)


class MeAvatarView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @extend_schema(request=ImageUploadSerializer, responses=UserSerializer)
    def post(self, request: Request) -> Response:
        return store_avatar(request_user(request), request)

    @extend_schema(responses={204: None})
    def delete(self, request: Request) -> Response:
        user = request_user(request)
        if user.avatar:
            user.avatar.delete(save=True)
        return Response(status=status.HTTP_204_NO_CONTENT)


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

    @extend_schema(methods=["POST"], request=ImageUploadSerializer, responses=UserSerializer)
    @extend_schema(methods=["DELETE"], request=None, responses={204: None})
    @action(detail=True, methods=["post", "delete"], parser_classes=(MultiPartParser, FormParser, JSONParser))
    def avatar(self, request: Request, pk: str | None = None) -> Response:
        user = self.get_object()
        if request.method == "DELETE":
            if user.avatar:
                user.avatar.delete(save=True)
            return Response(status=status.HTTP_204_NO_CONTENT)
        return store_avatar(user, request)
