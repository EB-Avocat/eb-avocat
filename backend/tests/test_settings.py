import importlib
from collections.abc import Iterator
from types import ModuleType

import pytest

from config import settings as settings_module


@pytest.fixture
def reload_settings(monkeypatch: pytest.MonkeyPatch) -> Iterator[ModuleType]:
    for name in ("ALLOWED_HOSTS", "CSRF_TRUSTED_ORIGINS", "SITE_URL", "VERCEL_URL", "VERCEL_BRANCH_URL"):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("SECRET_KEY", "test-secret")
    yield settings_module
    monkeypatch.undo()
    importlib.reload(settings_module)


def test_vercel_preview_hosts_are_trusted(reload_settings: ModuleType, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VERCEL_URL", "eb-avocat-abc123-team.vercel.app")
    monkeypatch.setenv("VERCEL_BRANCH_URL", "eb-avocat-git-feat-x-team.vercel.app")
    settings = importlib.reload(reload_settings)

    assert "eb-avocat-abc123-team.vercel.app" in settings.ALLOWED_HOSTS
    assert "eb-avocat-git-feat-x-team.vercel.app" in settings.ALLOWED_HOSTS
    assert "https://eb-avocat-abc123-team.vercel.app" in settings.CSRF_TRUSTED_ORIGINS
    assert settings.SITE_URL == "https://eb-avocat-git-feat-x-team.vercel.app"


def test_explicit_site_url_wins_over_branch_url(reload_settings: ModuleType, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VERCEL_BRANCH_URL", "eb-avocat-git-main-team.vercel.app")
    monkeypatch.setenv("SITE_URL", "https://www.biezunski-avocat.fr")
    settings = importlib.reload(reload_settings)

    assert settings.SITE_URL == "https://www.biezunski-avocat.fr"


def test_local_defaults_without_vercel(reload_settings: ModuleType) -> None:
    settings = importlib.reload(reload_settings)

    assert settings.ALLOWED_HOSTS == ["localhost", "127.0.0.1", "backend"]
    assert settings.CSRF_TRUSTED_ORIGINS == ["http://localhost:3000"]
    assert settings.SITE_URL == "http://localhost:3000"
