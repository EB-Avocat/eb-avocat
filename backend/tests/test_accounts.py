from typing import Any

import pytest
from django.core import mail
from rest_framework.test import APIClient

from accounts.models import ApiToken, User
from tests.conftest import ArticleFactory, UserFactory, client_for, png_upload

pytestmark = pytest.mark.django_db


def reset_query(body: object) -> dict[str, str]:
    link = next(line for line in str(body).splitlines() if "uid=" in line)
    return dict(part.split("=", 1) for part in link.split("?", 1)[1].split("&"))


def test_login_and_me(api: APIClient) -> None:
    user = UserFactory.create(email="eva@example.com")
    response = api.post(
        "/api/v1/auth/login/", {"email": "EVA@example.com", "password": "correct-horse-battery"}, format="json"
    )
    assert response.status_code == 200
    assert api.get("/api/v1/me/").json()["email"] == user.email


def test_login_wrong_password(api: APIClient) -> None:
    UserFactory.create(email="eva@example.com")
    response = api.post("/api/v1/auth/login/", {"email": "eva@example.com", "password": "nope"}, format="json")
    assert response.status_code == 400


def test_profile_update_cannot_change_role(author: User) -> None:
    response = client_for(author).patch("/api/v1/me/", {"first_name": "Eva", "role": "admin"}, format="json")
    assert response.status_code == 200
    author.refresh_from_db()
    assert author.first_name == "Eva"
    assert author.role == User.Role.AUTHOR


def test_password_change_requires_current_password(author: User) -> None:
    client = client_for(author)
    bad = client.post(
        "/api/v1/me/password/", {"current_password": "x", "new_password": "a-much-better-pass"}, format="json"
    )
    good = client.post(
        "/api/v1/me/password/",
        {"current_password": "correct-horse-battery", "new_password": "a-much-better-pass"},
        format="json",
    )
    assert bad.status_code == 400
    assert good.status_code == 204
    author.refresh_from_db()
    assert author.check_password("a-much-better-pass")


def test_avatar_upload(author: User) -> None:
    response = client_for(author).post("/api/v1/me/avatar/", {"file": png_upload("me.png")}, format="multipart")
    assert response.status_code == 200
    author.refresh_from_db()
    assert (author.avatar.name or "").startswith(f"avatars/{author.pk}/")


def test_password_reset_flow(api: APIClient) -> None:
    user = UserFactory.create(email="eva@example.com")
    assert api.post("/api/v1/auth/password-reset/", {"email": "eva@example.com"}, format="json").status_code == 204
    assert api.post("/api/v1/auth/password-reset/", {"email": "nobody@example.com"}, format="json").status_code == 204
    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "Réinitialisation de votre mot de passe"
    query = reset_query(mail.outbox[0].body)

    response = api.post(
        "/api/v1/auth/password-reset/confirm/",
        {"uid": query["uid"], "token": query["token"], "new_password": "brand-new-password"},
        format="json",
    )

    assert response.status_code == 204
    user.refresh_from_db()
    assert user.check_password("brand-new-password")


@pytest.mark.parametrize("role", ["editor", "author"])
def test_user_management_is_admin_only(role: str) -> None:
    assert client_for(UserFactory.create(role=role)).get("/api/v1/admin/users/").status_code == 403


def test_user_created_without_password_receives_an_invitation(admin: User, api: APIClient) -> None:
    response = client_for(admin).post(
        "/api/v1/admin/users/", {"email": "lea@example.com", "first_name": "Léa", "role": "author"}, format="json"
    )

    assert response.status_code == 201, response.json()
    assert len(mail.outbox) == 1
    invitation = mail.outbox[0]
    assert invitation.to == ["lea@example.com"]
    assert "back-office" in invitation.subject
    assert invitation.body.startswith("Bonjour Léa,")
    query = reset_query(invitation.body)
    [(html, mimetype)] = getattr(invitation, "alternatives", [])
    assert mimetype == "text/html"
    assert "Choisir mon mot de passe" in str(html)
    assert f'href="http://localhost:3000/admin-dev/mot-de-passe/nouveau?uid={query["uid"]}&amp;token=' in str(html)
    confirm = api.post(
        "/api/v1/auth/password-reset/confirm/",
        {"uid": query["uid"], "token": query["token"], "new_password": "brand-new-password"},
        format="json",
    )
    assert confirm.status_code == 204
    assert User.objects.get(email="lea@example.com").check_password("brand-new-password")


def test_account_emails_reply_to_the_configured_address(api: APIClient, settings: Any) -> None:
    UserFactory.create(email="eva@example.com")

    settings.BACKOFFICE_REPLY_TO = []
    api.post("/api/v1/auth/password-reset/", {"email": "eva@example.com"}, format="json")
    settings.BACKOFFICE_REPLY_TO = ["eva@biezunski-avocat.fr"]
    api.post("/api/v1/auth/password-reset/", {"email": "eva@example.com"}, format="json")

    assert [message.reply_to for message in mail.outbox] == [[], ["eva@biezunski-avocat.fr"]]


def test_user_created_with_password_gets_no_email(admin: User) -> None:
    response = client_for(admin).post(
        "/api/v1/admin/users/",
        {"email": "lea@example.com", "role": "author", "password": "a-strong-password-42"},
        format="json",
    )

    assert response.status_code == 201, response.json()
    assert mail.outbox == []


@pytest.fixture
def mail_down(monkeypatch: pytest.MonkeyPatch) -> None:
    def fail(user: User) -> None:
        raise ConnectionError("Brevo is down")

    monkeypatch.setattr("accounts.emails.send_password_link", fail)


@pytest.mark.usefixtures("mail_down")
def test_user_is_not_created_when_the_invitation_fails(admin: User) -> None:
    response = client_for(admin).post(
        "/api/v1/admin/users/", {"email": "lea@example.com", "role": "author"}, format="json"
    )

    assert response.status_code == 502
    assert "n'a pas pu être envoyé" in response.json()["detail"]
    assert not User.objects.filter(email="lea@example.com").exists()


@pytest.mark.usefixtures("mail_down")
def test_reset_request_answers_the_same_when_sending_fails(api: APIClient) -> None:
    UserFactory.create(email="eva@example.com")

    assert api.post("/api/v1/auth/password-reset/", {"email": "eva@example.com"}, format="json").status_code == 204


def test_admin_sends_the_password_link(admin: User) -> None:
    user = UserFactory.create(email="lea@example.com")

    assert client_for(admin).post(f"/api/v1/admin/users/{user.pk}/send-link/").status_code == 204

    assert [message.to for message in mail.outbox] == [["lea@example.com"]]


def test_admin_send_link_refuses_disabled_accounts(admin: User) -> None:
    user = UserFactory.create(is_active=False)

    assert client_for(admin).post(f"/api/v1/admin/users/{user.pk}/send-link/").status_code == 400
    assert mail.outbox == []


@pytest.mark.usefixtures("mail_down")
def test_admin_send_link_reports_a_sending_failure(admin: User) -> None:
    user = UserFactory.create()

    assert client_for(admin).post(f"/api/v1/admin/users/{user.pk}/send-link/").status_code == 502


@pytest.mark.parametrize("role", ["editor", "author"])
def test_send_link_is_admin_only(role: str) -> None:
    user, member = UserFactory.create(), UserFactory.create(role=role)

    assert client_for(member).post(f"/api/v1/admin/users/{user.pk}/send-link/").status_code == 403


def test_reset_request_resends_the_invitation_to_a_pending_account(api: APIClient) -> None:
    user = UserFactory.create(email="lea@example.com")
    user.set_unusable_password()
    user.save(update_fields=["password"])

    assert api.post("/api/v1/auth/password-reset/", {"email": "lea@example.com"}, format="json").status_code == 204

    assert len(mail.outbox) == 1
    assert "back-office" in mail.outbox[0].subject


def test_admin_creates_user_and_assigns_role(admin: User) -> None:
    response = client_for(admin).post(
        "/api/v1/admin/users/", {"email": "new@example.com", "first_name": "Léa", "role": "editor"}, format="json"
    )
    assert response.status_code == 201, response.json()
    created = User.objects.get(email="new@example.com")
    assert created.role == User.Role.EDITOR
    assert not created.has_usable_password()


def test_last_admin_cannot_be_demoted(admin: User) -> None:
    response = client_for(admin).patch(f"/api/v1/admin/users/{admin.pk}/", {"role": "editor"}, format="json")
    assert response.status_code == 400
    admin.refresh_from_db()
    assert admin.role == User.Role.ADMIN


def test_admin_role_sets_is_staff(admin: User) -> None:
    other = UserFactory.create()
    client_for(admin).patch(f"/api/v1/admin/users/{other.pk}/", {"role": "admin"}, format="json")
    other.refresh_from_db()
    assert other.is_staff


def test_user_with_articles_cannot_be_deleted(admin: User) -> None:
    writer = UserFactory.create()
    ArticleFactory.create(author=writer)
    assert client_for(admin).delete(f"/api/v1/admin/users/{writer.pk}/").status_code == 400


def test_api_token_lifecycle(author: User, api: APIClient) -> None:
    created = client_for(author).post("/api/v1/me/tokens/", {"name": "Claude Code"}, format="json").json()
    raw = created["token"]
    assert raw.startswith("eba_")
    token = ApiToken.objects.get(pk=created["id"])
    assert token.key_hash != raw  # stored hashed

    api.credentials(HTTP_AUTHORIZATION=f"Bearer {raw}")
    assert api.get("/api/v1/me/").json()["email"] == author.email
    token.refresh_from_db()
    assert token.last_used_at is not None

    client_for(author).delete(f"/api/v1/me/tokens/{token.pk}/")
    assert api.get("/api/v1/me/").status_code == 401


def test_listed_tokens_never_expose_the_secret(author: User) -> None:
    ApiToken.issue(author, "x")
    listed = client_for(author).get("/api/v1/me/tokens/").json()["results"]
    assert "token" not in listed[0]
    assert "key_hash" not in listed[0]
