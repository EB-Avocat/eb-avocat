"""ASGI entrypoint: ``/mcp`` goes to the MCP server, everything else to Django."""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django_app = get_asgi_application()

# Imported after Django is set up: the MCP tools use the ORM.
from mcp.server.transport_security import TransportSecuritySettings  # noqa: E402
from starlette.applications import Starlette  # noqa: E402
from starlette.types import ASGIApp, Receive, Scope, Send  # noqa: E402

from articles.mcp import server as mcp_server  # noqa: E402
from config.mcp_auth import require_api_token  # noqa: E402


def build_mcp_app() -> Starlette:
    """The MCP server as a Starlette app, with a fresh session manager (it runs once)."""
    return mcp_server.streamable_http_app(
        streamable_http_path="/mcp",
        stateless_http=True,
        json_response=True,
        # Auth is a bearer token a browser can't forge, so Host/Origin pinning adds nothing.
        transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=False),
    )


async def serve_mcp(scope: Scope, receive: Receive, send: Send) -> None:
    """Serve one MCP request with its own session manager.

    The session manager needs ASGI lifespan events, which serverless runtimes such
    as Vercel don't send. The server is stateless, so running one per request
    costs little and works everywhere.
    """
    mcp_app = build_mcp_app()
    async with mcp_app.router.lifespan_context(mcp_app):
        await mcp_app(scope, receive, send)


async def acknowledge_lifespan(receive: Receive, send: Send) -> None:
    """Django has no lifespan support and the MCP app runs its own per request."""
    while True:
        message = await receive()
        if message["type"] == "lifespan.startup":
            await send({"type": "lifespan.startup.complete"})
        elif message["type"] == "lifespan.shutdown":
            await send({"type": "lifespan.shutdown.complete"})
            return


def create_application() -> ASGIApp:
    """Build the combined app: ``/mcp`` to the MCP server, everything else to Django."""
    mcp_app = require_api_token(serve_mcp)

    async def app(scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "lifespan":
            await acknowledge_lifespan(receive, send)
        elif scope["type"] == "http" and (scope["path"] == "/mcp" or scope["path"].startswith("/mcp/")):
            await mcp_app(scope, receive, send)
        else:
            await django_app(scope, receive, send)  # ty: ignore[invalid-argument-type]  # stubs want dict, ASGI gives MutableMapping

    return app


application = create_application()
