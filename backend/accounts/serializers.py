from typing import Any

from django.contrib.auth import password_validation
from rest_framework import serializers

from accounts.models import ApiToken, User
from core.fields import MediaUrlField
from core.serializers import CropSerializer


class NormalizedEmailMixin:
    # Emails are stored lowercase (login and password reset look them up that way).

    instance: Any

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        others = User.objects.filter(email__iexact=email)
        if isinstance(self.instance, User):
            others = others.exclude(pk=self.instance.pk)
        if others.exists():
            raise serializers.ValidationError("Un utilisateur utilise déjà cette adresse e-mail.")
        return email


class AvatarFieldsMixin(serializers.Serializer[User]):
    # Square WebP rendition, the kept original and the crop between them (re-cropping).
    avatar = MediaUrlField()
    avatar_original = MediaUrlField()
    avatar_crop = CropSerializer(read_only=True, allow_null=True)


AVATAR_FIELDS = ("avatar", "avatar_original", "avatar_crop")


class UserSerializer(NormalizedEmailMixin, AvatarFieldsMixin, serializers.ModelSerializer[User]):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "role", *AVATAR_FIELDS, "is_active", "date_joined")
        read_only_fields = ("id", *AVATAR_FIELDS, "date_joined")


class ProfileSerializer(NormalizedEmailMixin, AvatarFieldsMixin, serializers.ModelSerializer[User]):
    """The current user's own profile; role and activation are not self-editable."""

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "role", *AVATAR_FIELDS)
        read_only_fields = ("id", "role", *AVATAR_FIELDS)


class UserCreateSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta(UserSerializer.Meta):
        fields = (*UserSerializer.Meta.fields, "password")

    def validate_password(self, value: str) -> str:
        if value:
            password_validation.validate_password(value)
        return value

    def create(self, validated_data: dict[str, Any]) -> User:
        password = validated_data.pop("password", "") or None
        user = User.objects.create_user(password=password, **validated_data)
        if password is None:
            # No password yet: the user sets one through the reset link.
            user.set_unusable_password()
            user.save(update_fields=["password"])
        return user


class PasswordChangeSerializer(serializers.Serializer[None]):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value: str) -> str:
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return value

    def validate_new_password(self, value: str) -> str:
        password_validation.validate_password(value, self.context["request"].user)
        return value


class LoginSerializer(serializers.Serializer[None]):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class PasswordResetRequestSerializer(serializers.Serializer[None]):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer[None]):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)


class ApiTokenSerializer(serializers.ModelSerializer[ApiToken]):
    class Meta:
        model = ApiToken
        fields = ("id", "name", "prefix", "created_at", "last_used_at")
        read_only_fields = ("id", "prefix", "created_at", "last_used_at")


class ImageUploadSerializer(serializers.Serializer[None]):
    file = serializers.ImageField(required=False)
    url = serializers.URLField(required=False)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        if bool(attrs.get("file")) == bool(attrs.get("url")):
            raise serializers.ValidationError("Fournissez soit un fichier, soit une URL.")
        return attrs


class ApiTokenCreatedSerializer(ApiTokenSerializer):
    """Returned once, at creation: includes the raw token."""

    token = serializers.CharField(read_only=True)

    class Meta(ApiTokenSerializer.Meta):
        fields = (*ApiTokenSerializer.Meta.fields, "token")
