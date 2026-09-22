"""End-to-end MCP tests through the real ASGI app (auth wrapper + streamable HTTP)."""

import json
from collections.abc import Iterator
from typing import Any

import pytest
from starlette.testclient import TestClient

from accounts.models import ApiToken, User
from articles.models import Article
from tests.conftest import ArticleFactory, UserFactory

# The MCP app runs in other threads, so rows must be committed to be visible.
pytestmark = pytest.mark.django_db(transaction=True)

HEADERS = {"accept": "application/json, text/event-stream", "content-type": "application/json"}


@pytest.fixture
def client() -> Iterator[TestClient]:
    from config.asgi import create_application

    with TestClient(create_application()) as test_client:
        yield test_client


def rpc(client: TestClient, token: str | None, method: str, params: dict[str, Any] | None = None) -> Any:
    headers = dict(HEADERS)
    if token:
        headers["authorization"] = f"Bearer {token}"
    body = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}
    return client.post("/mcp", headers=headers, content=json.dumps(body))


def call(client: TestClient, token: str, tool: str, **arguments: Any) -> dict[str, Any]:
    response = rpc(client, token, "tools/call", {"name": tool, "arguments": arguments})
    assert response.status_code == 200, response.text
    return response.json()["result"]


def payload(result: dict[str, Any]) -> Any:
    if "structuredContent" in result and result["structuredContent"] is not None:
        content = result["structuredContent"]
        return content.get("result", content)
    return json.loads(result["content"][0]["text"])


def test_requires_a_valid_token(client: TestClient) -> None:
    assert rpc(client, None, "tools/list").status_code == 401
    assert rpc(client, "eba_nope", "tools/list").status_code == 401


def test_lists_tools(client: TestClient) -> None:
    _, raw = ApiToken.issue(UserFactory.create(), "claude")
    response = rpc(client, raw, "tools/list")
    assert response.status_code == 200, response.text
    names = {tool["name"] for tool in response.json()["result"]["tools"]}
    assert {"create_article", "publish_article", "set_article_cover", "list_categories"} <= names


def test_create_then_publish_article(client: TestClient) -> None:
    author = UserFactory.create(role=User.Role.AUTHOR)
    _, raw = ApiToken.issue(author, "claude")

    created = payload(
        call(client, raw, "create_article", title="Via Claude", markdown="## Bonjour", categories=["Santé"])
    )
    article = Article.objects.get(pk=created["id"])
    assert article.status == Article.Status.DRAFT
    assert article.author == author
    assert [c.name for c in article.categories.all()] == ["Santé"]

    call(client, raw, "publish_article", article_id=article.slug)
    article.refresh_from_db()
    assert article.status == Article.Status.PUBLISHED


def test_author_cannot_touch_others_articles(client: TestClient) -> None:
    other = ArticleFactory.create()
    _, raw = ApiToken.issue(UserFactory.create(role=User.Role.AUTHOR), "claude")

    result = call(client, raw, "delete_article", article_id=str(other.pk))

    assert result["isError"] is True
    assert "Article introuvable" in result["content"][0]["text"]
    assert Article.objects.filter(pk=other.pk).exists()


@pytest.fixture
def editor_token() -> tuple[User, str]:
    user = UserFactory.create(role=User.Role.EDITOR)
    return user, ApiToken.issue(user, "claude")[1]


def test_list_articles_filters(client: TestClient, editor_token: tuple[User, str]) -> None:
    _, raw = editor_token
    draft = ArticleFactory.create(title="Brouillon fiscal", status=Article.Status.DRAFT)
    published = ArticleFactory.create(title="Publié social")
    published.categories.set(services_categories(["Social"]))

    def titles(**filters: Any) -> list[str]:
        return [a["title"] for a in payload(call(client, raw, "list_articles", **filters))]

    assert set(titles()) == {draft.title, published.title}
    assert titles(status="draft") == [draft.title]
    assert titles(category="social") == [published.title]
    assert titles(search="fiscal") == [draft.title]


def services_categories(names: list[str]) -> list[Any]:
    from articles.services import categories_from_names

    return categories_from_names(names)


def test_get_update_unpublish_delete(client: TestClient, editor_token: tuple[User, str]) -> None:
    _, raw = editor_token
    article = ArticleFactory.create(title="Avant")

    assert payload(call(client, raw, "get_article", article_id=str(article.pk)))["title"] == "Avant"
    assert payload(call(client, raw, "get_article", article_id=article.slug))["id"] == str(article.pk)
    assert call(client, raw, "get_article", article_id="inconnu")["isError"] is True

    updated = payload(
        call(client, raw, "update_article", article_id=article.slug, title="Après", markdown="Texte", categories=["X"])
    )
    assert updated["title"] == "Après"
    assert [c["name"] for c in updated["categories"]] == ["X"]

    call(client, raw, "unpublish_article", article_id=str(article.pk))
    article.refresh_from_db()
    assert article.status == Article.Status.DRAFT

    result = call(client, raw, "delete_article", article_id=str(article.pk))
    assert "supprimé" in result["content"][0]["text"]
    assert not Article.objects.filter(pk=article.pk).exists()


def test_invalid_data_is_a_tool_error(client: TestClient, editor_token: tuple[User, str]) -> None:
    _, raw = editor_token
    result = call(client, raw, "create_article", title="X", markdown="", status="bogus")
    assert result["isError"] is True
    assert "Données invalides" in result["content"][0]["text"]


def test_set_cover_from_base64_and_url(client: TestClient, editor_token: tuple[User, str]) -> None:
    import base64
    from unittest import mock

    from tests.conftest import png_bytes, png_upload

    _, raw = editor_token
    article = ArticleFactory.create()

    data = base64.b64encode(png_bytes()).decode()
    result = payload(
        call(client, raw, "set_article_cover", article_id=article.slug, base64_data=data, filename="c.png", alt="Alt")
    )
    assert result["cover"].endswith(".webp")
    assert result["cover_original"].endswith(".png")
    assert result["cover_alt"] == "Alt"

    with mock.patch("articles.services.fetch_remote_image", return_value=png_upload("web.png")) as fetch:
        result = payload(
            call(client, raw, "set_article_cover", article_id=article.slug, url="https://example.com/web.png")
        )
    fetch.assert_called_once_with("https://example.com/web.png")
    assert result["cover"].startswith("/api/v1/media/covers/")
    assert result["cover_source_url"] == "https://example.com/web.png"

    assert call(client, raw, "set_article_cover", article_id=article.slug)["isError"] is True
    assert call(client, raw, "set_article_cover", article_id=article.slug, base64_data="%%%")["isError"] is True


def test_create_article_with_cover_url(client: TestClient, editor_token: tuple[User, str]) -> None:
    from unittest import mock

    from tests.conftest import png_upload

    _, raw = editor_token
    with mock.patch("articles.services.fetch_remote_image", return_value=png_upload("web.png")):
        created = payload(
            call(client, raw, "create_article", title="Avec image", markdown="x", cover_url="https://example.com/a.png")
        )
    assert created["cover"]


def test_categories_tools(client: TestClient, editor_token: tuple[User, str]) -> None:
    _, editor_raw = editor_token
    _, author_raw = ApiToken.issue(UserFactory.create(role=User.Role.AUTHOR), "claude")

    assert payload(call(client, author_raw, "create_category", name="Santé", is_primary=True))["is_primary"] is False
    assert payload(call(client, editor_raw, "create_category", name="santé", is_primary=True))["is_primary"] is True
    names = [c["name"] for c in payload(call(client, editor_raw, "list_categories"))]
    assert names == ["Santé"]


def test_non_mcp_paths_reach_django(client: TestClient) -> None:
    assert client.get("/api/v1/articles/").status_code == 200
