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
    assert Article.objects.filter(pk=other.pk).exists()
