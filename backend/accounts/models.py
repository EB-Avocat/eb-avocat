import hashlib
import secrets
import uuid
from typing import Any, ClassVar

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone

from core.models import UUIDModel


class UserManager(BaseUserManager["User"]):
    use_in_migrations = True

    def create_user(self, email: str, password: str | None = None, **extra: Any) -> "User":
        if not email:
            raise ValueError("L'adresse e-mail est obligatoire.")
        user = self.model(email=self.normalize_email(email).lower(), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str | None = None, **extra: Any) -> "User":
        extra.setdefault("role", User.Role.ADMIN)
        extra.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra)


def avatar_upload_to(instance: "User", filename: str) -> str:
    return f"avatars/{instance.pk}/{filename}"


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Administrateur"
        EDITOR = "editor", "Éditeur"
        AUTHOR = "author", "Auteur"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField("adresse e-mail", unique=True)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.AUTHOR)
    avatar = models.ImageField(upload_to=avatar_upload_to, max_length=500, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: ClassVar[list[str]] = []

    objects = UserManager()  # type: ignore[assignment]

    class Meta:
        ordering: ClassVar[list[str]] = ["last_name", "first_name", "email"]

    def __str__(self) -> str:
        return self.get_full_name() or self.email

    def save(self, *args: Any, **kwargs: Any) -> None:
        # is_staff mirrors the admin role so staff-only checks stay consistent.
        self.is_staff = self.role == self.Role.ADMIN
        super().save(*args, **kwargs)

    @property
    def is_admin(self) -> bool:
        return self.is_active and self.role == self.Role.ADMIN

    @property
    def can_edit_all_articles(self) -> bool:
        return self.is_active and self.role in {self.Role.ADMIN, self.Role.EDITOR}


TOKEN_PREFIX = "eba_"  # noqa: S105 - public prefix, not a secret


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


class ApiToken(UUIDModel):
    """Personal access token, used by the MCP endpoint and scripts. Stored hashed."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_tokens")
    name = models.CharField(max_length=100)
    prefix = models.CharField(max_length=16, editable=False)
    key_hash = models.CharField(max_length=64, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering: ClassVar[list[str]] = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.prefix}…)"

    @classmethod
    def issue(cls, user: User, name: str) -> tuple["ApiToken", str]:
        """Create a token and return it with its raw value (shown to the user only once)."""
        raw = TOKEN_PREFIX + secrets.token_urlsafe(32)
        token = cls.objects.create(user=user, name=name, prefix=raw[:12], key_hash=hash_token(raw))
        return token, raw

    @classmethod
    def authenticate(cls, raw: str) -> User | None:
        if not raw.startswith(TOKEN_PREFIX):
            return None
        token = cls.objects.select_related("user").filter(key_hash=hash_token(raw)).first()
        if token is None or not token.user.is_active:
            return None
        cls.objects.filter(pk=token.pk).update(last_used_at=timezone.now())
        return token.user
