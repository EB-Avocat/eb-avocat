"""Email backend posting to the Brevo transactional API (same service as the contact form)."""

import logging
from collections.abc import Sequence
from email.utils import parseaddr
from typing import Any

import httpx
from django.core.mail import EmailMessage
from django.core.mail.backends.base import BaseEmailBackend

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
TIMEOUT_SECONDS = 10


def _contact(address: str) -> dict[str, str]:
    name, email = parseaddr(address)
    return {"email": email, "name": name} if name else {"email": email}


def brevo_payload(message: EmailMessage) -> dict[str, Any]:
    # Refuse what isn't mapped rather than silently sending a partial message.
    if message.attachments or message.extra_headers or len(message.reply_to) > 1:
        raise ValueError("BrevoEmailBackend supports neither attachments, extra headers nor several Reply-To.")
    payload: dict[str, Any] = {
        "sender": _contact(message.from_email),
        "to": [_contact(address) for address in message.to],
        "subject": message.subject,
        "textContent": message.body,
    }
    if message.cc:
        payload["cc"] = [_contact(address) for address in message.cc]
    if message.bcc:
        payload["bcc"] = [_contact(address) for address in message.bcc]
    if message.reply_to:
        payload["replyTo"] = _contact(message.reply_to[0])
    for content, mimetype in getattr(message, "alternatives", []):
        if mimetype == "text/html":
            payload["htmlContent"] = content
    return payload


class BrevoEmailBackend(BaseEmailBackend):
    def __init__(self, api_key: str = "", fail_silently: bool = False, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self.api_key = api_key
        self.fail_silently = fail_silently

    def send_messages(self, email_messages: Sequence[EmailMessage]) -> int:
        sent = 0
        for message in email_messages:
            if not message.recipients():
                continue
            try:
                response = httpx.post(
                    BREVO_API_URL,
                    json=brevo_payload(message),
                    headers={"api-key": self.api_key, "accept": "application/json"},
                    timeout=TIMEOUT_SECONDS,
                )
                response.raise_for_status()
            except httpx.HTTPError as exc:
                # Brevo explains refusals in the body (unknown key, unauthorised IP, unverified sender...).
                reason = exc.response.text[:500] if isinstance(exc, httpx.HTTPStatusError) else repr(exc)
                logger.error("Sending %r through Brevo failed: %s", message.subject, reason)
                if not self.fail_silently:
                    raise
            else:
                sent += 1
        return sent
