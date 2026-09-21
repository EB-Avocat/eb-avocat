from django.conf import settings
from django.urls import URLPattern, URLResolver, include, path, re_path
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView
from rest_framework.routers import DefaultRouter

from accounts import views as accounts
from articles import views as articles

public = DefaultRouter()
public.register("articles", articles.PublicArticleViewSet, basename="public-article")
public.register("categories", articles.PublicCategoryViewSet, basename="public-category")

admin = DefaultRouter()
admin.register("articles", articles.ArticleViewSet, basename="article")
admin.register("categories", articles.CategoryViewSet, basename="category")
admin.register("users", accounts.UserViewSet, basename="user")

me = DefaultRouter()
me.register("tokens", accounts.ApiTokenViewSet, basename="token")

api = [
    path("", include(public.urls)),
    path("admin/uploads/", articles.ArticleImageUploadView.as_view(), name="upload"),
    path("admin/preview/", articles.PreviewView.as_view(), name="preview"),
    path("admin/", include(admin.urls)),
    path("auth/csrf/", accounts.CsrfView.as_view(), name="csrf"),
    path("auth/login/", accounts.LoginView.as_view(), name="login"),
    path("auth/logout/", accounts.LogoutView.as_view(), name="logout"),
    path("auth/password-reset/", accounts.PasswordResetRequestView.as_view(), name="password-reset"),
    path("auth/password-reset/confirm/", accounts.PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("me/", accounts.MeView.as_view(), name="me"),
    path("me/password/", accounts.MePasswordView.as_view(), name="me-password"),
    path("me/avatar/", accounts.MeAvatarView.as_view(), name="me-avatar"),
    path("me/", include(me.urls)),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
]

urlpatterns: list[URLPattern | URLResolver] = [path("api/v1/", include(api))]

if settings.STORAGE_BACKEND == "filesystem":
    # Local media only; production media lives on Vercel Blob.
    urlpatterns += [re_path(r"^api/v1/media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT})]
