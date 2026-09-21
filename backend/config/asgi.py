"""ASGI entrypoint: ``/mcp`` goes to the MCP server, everything else to Django."""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django_app = get_asgi_application()

# Imported after Django is set up: the MCP tools use the ORM.
from mcp.server.transport_security import TransportSecuritySettings  # noqa: E402
from starlette.types import ASGIApp, Receive, Scope, Send  # noqa: E402

from articles.mcp import server as mcp_server  # noqa: E402
from config.mcp_auth import require_api_token  # noqa: E402


def create_application() -> ASGIApp:
    """Build the combined app. Each call gets its own MCP session manager (it runs once)."""
    mcp_app = require_api_token(
        mcp_server.streamable_http_app(
            streamable_http_path="/mcp",
            stateless_http=True,
            json_response=True,
            # Auth is a bearer token a browser can't forge, so Host/Origin pinning adds nothing.
            transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=False),
        )
    )

    async def app(scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "lifespan":
            # Django has no lifespan support; the MCP session manager needs it.
            await mcp_app(scope, receive, send)
        elif scope["type"] == "http" and (scope["path"] == "/mcp" or scope["path"].startswith("/mcp/")):
            await mcp_app(scope, receive, send)
        else:
            await django_app(scope, receive, send)  # ty: ignore[invalid-argument-type]  # stubs want dict, ASGI gives MutableMapping

    return app


application = create_application()
