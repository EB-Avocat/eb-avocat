"""Django settings, driven entirely by environment variables."""

import os
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent


def env_bool(name: str, default: bool = False) -> bool:
    return os.environ.get(name, str(default)).lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in os.environ.get(name, default).split(",") if item.strip()]


DEBUG = env_bool("DJANGO_DEBUG")
SECRET_KEY = os.environ.get("SECRET_KEY", "")
if not SECRET_KEY:
    if not DEBUG:
        raise RuntimeError("SECRET_KEY must be set when DJANGO_DEBUG is off")
    SECRET_KEY = "dev-insecure-secret-key"  # noqa: S105 - local development only

# Vercel sets the deployment and branch hosts on every deploy, so preview URLs
# (random *.vercel.app subdomains) are trusted without a wildcard.
VERCEL_HOSTS = [host for host in (os.environ.get("VERCEL_URL"), os.environ.get("VERCEL_BRANCH_URL")) if host]
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1,backend") + VERCEL_HOSTS
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "http://localhost:3000") + [
    f"https://{host}" for host in VERCEL_HOSTS
]

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.staticfiles",
    "rest_framework",
    "django_filters",
    "drf_spectacular",
    "core",
    "accounts",
    "articles",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
# Vercel serves this app: it routes /mcp to the MCP server (the WSGI app is plain Django).
ASGI_APPLICATION = "config.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": ["django.template.context_processors.request"]},
    },
]

DATABASES = {
    "default": dj_database_url.config(
        default="postgres://postgres:postgres@localhost:5432/eb_avocat",
        conn_max_age=int(os.environ.get("DB_CONN_MAX_AGE", "0")),
        conn_health_checks=True,
    )
}

# Every model uses core.models.UUIDModel; this only covers third-party apps.
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 10}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Europe/Paris"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/api/v1/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Media: local filesystem in dev, Vercel Blob in production.
MEDIA_URL = os.environ.get("MEDIA_URL", "/api/v1/media/")
MEDIA_ROOT = BASE_DIR / "media"
STORAGE_BACKEND = os.environ.get("STORAGE_BACKEND", "filesystem")
STORAGES = {
    "default": {
        "BACKEND": (
            "core.storage.VercelBlobStorage"
            if STORAGE_BACKEND == "vercel_blob"
            else "django.core.files.storage.FileSystemStorage"
        ),
    },
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedStaticFilesStorage"},
}
BLOB_READ_WRITE_TOKEN = os.environ.get("BLOB_READ_WRITE_TOKEN", "")
MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024

# Public origin of the site, used in password-reset links. Set it for Production only:
# previews fall back to their stable branch URL.
_branch_url = os.environ.get("VERCEL_BRANCH_URL")
SITE_URL = os.environ.get("SITE_URL") or (f"https://{_branch_url}" if _branch_url else "http://localhost:3000")
# Frontend on-demand revalidation (Next.js /api/revalidate). On Vercel a backend -> frontend
# service binding would be circular, so the call goes through the public site URL instead.
FRONTEND_INTERNAL_URL = os.environ.get("FRONTEND_INTERNAL_URL") or (SITE_URL if os.environ.get("VERCEL") else "")
REVALIDATE_SECRET = os.environ.get("REVALIDATE_SECRET", "")
# Set by Vercel when "Protection Bypass for Automation" is on: lets that call through
# Deployment Protection on preview URLs.
VERCEL_AUTOMATION_BYPASS_SECRET = os.environ.get("VERCEL_AUTOMATION_BYPASS_SECRET", "")
# Secret back-office path, used to build links in emails (password reset).
BACKOFFICE_PATH = os.environ.get("BACKOFFICE_PATH", "admin-dev")

# Email (invitations, password reset) via the Brevo transactional API when a key is set
# (same key as the frontend contact form), printed to the console otherwise.
if os.environ.get("BREVO_API_KEY"):
    MAILERS = {
        "default": {"BACKEND": "core.mail.BrevoEmailBackend", "OPTIONS": {"api_key": os.environ["BREVO_API_KEY"]}}
    }
else:
    MAILERS = {"default": {"BACKEND": "django.core.mail.backends.console.EmailBackend"}}
DEFAULT_FROM_EMAIL = os.environ.get("BREVO_SENDER_EMAIL", "no-reply@localhost")

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        # Token first so a bad/revoked token answers 401 (with WWW-Authenticate), not 403.
        "accounts.authentication.ApiTokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
    "DEFAULT_PAGINATION_CLASS": "core.pagination.PageNumberWithSizePagination",
    "DEFAULT_THROTTLE_RATES": {"auth": "10/min"},
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "core.exceptions.exception_handler",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "EB Avocat API",
    "VERSION": "1.0.0",
    "COMPONENT_SPLIT_REQUEST": True,
    "SCHEMA_PATH_PREFIX": "/api/v1",
    "POSTPROCESSING_HOOKS": [
        "drf_spectacular.hooks.postprocess_schema_enums",
        "core.openapi.require_response_fields",
    ],
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
