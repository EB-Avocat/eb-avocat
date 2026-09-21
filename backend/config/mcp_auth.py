"""Reject unauthenticated MCP requests with a proper 401 before they reach the server."""

from asgiref.sync import sync_to_async
from starlette.datastructures import Headers
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send

from accounts.authentication import user_from_authorization


def require_api_token(app: ASGIApp) -> ASGIApp:
    async def wrapped(scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            header = Headers(scope=scope).get("authorization", "")
            user = await sync_to_async(user_from_authorization)(header)
            if user is None:
                response = JSONResponse(
                    {"error": "invalid_token", "error_description": "Jeton d'API manquant, invalide ou révoqué."},
                    status_code=401,
                    headers={"www-authenticate": "Bearer"},
                )
                await response(scope, receive, send)
                return
        await app(scope, receive, send)

    return wrapped
