"""Back-office account emails: both carry a link to choose a password."""

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from accounts.models import User


def password_page_url() -> str:
    return f"{settings.SITE_URL}/{settings.BACKOFFICE_PATH}/mot-de-passe"


def password_link(user: User) -> str:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{password_page_url()}/nouveau?uid={uid}&token={token}"


def send_password_link(user: User) -> None:
    """An account that never had a password is still waiting for its invitation; others get a reset."""
    if user.has_usable_password():
        template, subject = "password_reset", "Réinitialisation de votre mot de passe"
    else:
        template, subject = "invitation", "Votre accès au back-office du site d'Eva Biezunski"
    context = {
        "subject": subject,
        "user": user,
        "link": password_link(user),
        "days": settings.PASSWORD_RESET_TIMEOUT // 86400,
        "password_page_url": password_page_url(),
        "site_url": settings.SITE_URL,
    }
    message = EmailMultiAlternatives(
        subject,
        render_to_string(f"accounts/emails/{template}.txt", context),
        to=[user.email],
        reply_to=settings.BACKOFFICE_REPLY_TO,
    )
    message.attach_alternative(render_to_string(f"accounts/emails/{template}.html", context), "text/html")
    message.send()
