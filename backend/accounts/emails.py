"""Back-office account emails: both carry a link to choose a password."""

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
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
        subject = "Réinitialisation de votre mot de passe"
        body = (
            f"Bonjour,\n\nPour choisir un nouveau mot de passe, ouvrez ce lien :\n{password_link(user)}\n\n"
            "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message."
        )
    else:
        subject = "Votre accès au back-office du site d'Eva Biezunski"
        greeting = f"Bonjour {user.first_name}," if user.first_name else "Bonjour,"
        days = settings.PASSWORD_RESET_TIMEOUT // 86400
        body = (
            f"{greeting}\n\nUn compte vient d'être créé pour vous sur le back-office du site d'Eva Biezunski.\n\n"
            f"Pour l'activer, choisissez votre mot de passe en ouvrant ce lien :\n{password_link(user)}\n\n"
            f"Ce lien est valable {days} jours. Passé ce délai, demandez-en un nouveau à un administrateur "
            f"ou depuis la page « Mot de passe oublié » ({password_page_url()})."
        )
    reply_to = [settings.EMAIL_REPLY_TO] if settings.EMAIL_REPLY_TO else []
    EmailMessage(subject, body, to=[user.email], reply_to=reply_to).send()
