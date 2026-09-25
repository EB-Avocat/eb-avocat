from typing import Any

import httpx
import pytest
from django.core.mail import EmailMultiAlternatives

from core.mail import BREVO_API_URL, BrevoEmailBackend


class FakeBrevo:
    def __init__(self, status: int = 201) -> None:
        self.status = status
        self.calls: list[dict[str, Any]] = []

    def __call__(self, url: str, **kwargs: Any) -> httpx.Response:
        self.calls.append({"url": url, **kwargs})
        return httpx.Response(self.status, request=httpx.Request("POST", url))


@pytest.fixture
def brevo(monkeypatch: pytest.MonkeyPatch) -> FakeBrevo:
    fake = FakeBrevo()
    monkeypatch.setattr("core.mail.httpx.post", fake)
    return fake


def message(**kwargs: Any) -> EmailMultiAlternatives:
    return EmailMultiAlternatives(
        subject="Bienvenue",
        body="Bonjour,\nvoici votre lien.",
        from_email="Cabinet <noreply@biezunski-avocat.fr>",
        to=["lea@example.com"],
        **kwargs,
    )


def test_posts_the_message_to_brevo(brevo: FakeBrevo) -> None:
    email = message(cc=["eva@example.com"], bcc=["archive@example.com"], reply_to=["Eva <eva@example.com>"])
    email.attach_alternative("<p>Bonjour</p>", "text/html")

    assert BrevoEmailBackend(api_key="xkeysib-test").send_messages([email]) == 1

    [call] = brevo.calls
    assert call["url"] == BREVO_API_URL
    assert call["headers"]["api-key"] == "xkeysib-test"
    assert call["json"] == {
        "sender": {"email": "noreply@biezunski-avocat.fr", "name": "Cabinet"},
        "to": [{"email": "lea@example.com"}],
        "cc": [{"email": "eva@example.com"}],
        "bcc": [{"email": "archive@example.com"}],
        "replyTo": {"email": "eva@example.com", "name": "Eva"},
        "subject": "Bienvenue",
        "textContent": "Bonjour,\nvoici votre lien.",
        "htmlContent": "<p>Bonjour</p>",
    }


def test_skips_messages_without_recipients(brevo: FakeBrevo) -> None:
    assert BrevoEmailBackend(api_key="k").send_messages([EmailMultiAlternatives(subject="Vide")]) == 0
    assert brevo.calls == []


def test_raises_when_brevo_refuses(brevo: FakeBrevo) -> None:
    brevo.status = 401

    with pytest.raises(httpx.HTTPStatusError):
        BrevoEmailBackend(api_key="bad").send_messages([message()])


def test_fail_silently_counts_only_sent_messages(brevo: FakeBrevo) -> None:
    brevo.status = 500

    assert BrevoEmailBackend(api_key="k", fail_silently=True).send_messages([message()]) == 0
