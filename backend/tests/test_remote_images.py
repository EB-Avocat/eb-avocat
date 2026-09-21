import socket
from unittest import mock

import httpx
import pytest
from django.core.exceptions import ValidationError

from core.remote import fetch_remote_image
from tests.conftest import png_bytes


def resolve_to(address: str):
    return mock.patch("core.remote.socket.getaddrinfo", return_value=[(socket.AF_INET, 0, 0, "", (address, 0))])


@pytest.mark.parametrize("address", ["127.0.0.1", "10.0.0.5", "169.254.169.254", "192.168.1.1", "::1"])
def test_private_addresses_are_refused(address: str) -> None:
    with resolve_to(address), pytest.raises(ValidationError):
        fetch_remote_image("http://internal.example/img.png")


@pytest.mark.parametrize("url", ["file:///etc/passwd", "ftp://example.com/a.png", "gopher://x"])
def test_non_http_schemes_are_refused(url: str) -> None:
    with pytest.raises(ValidationError):
        fetch_remote_image(url)


def _transport(handler):
    real_client = httpx.Client

    def factory(**kwargs):
        return real_client(transport=httpx.MockTransport(handler), **kwargs)

    return mock.patch("core.remote.httpx.Client", side_effect=factory)


def test_redirect_to_private_address_is_refused() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(302, headers={"location": "http://metadata.internal/latest"})

    def fake_resolve(host: str, *args: object) -> list:
        address = "93.184.216.34" if host == "example.com" else "169.254.169.254"
        return [(socket.AF_INET, 0, 0, "", (address, 0))]

    with (
        _transport(handler),
        mock.patch("core.remote.socket.getaddrinfo", side_effect=fake_resolve),
        pytest.raises(ValidationError),
    ):
        fetch_remote_image("https://example.com/img.png")


def test_downloads_a_public_image() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, headers={"content-type": "image/png"}, content=png_bytes())

    with _transport(handler), resolve_to("93.184.216.34"):
        upload = fetch_remote_image("https://example.com/photos/cabinet.png")
    assert upload.name == "cabinet.png"


def test_non_image_content_is_refused() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, headers={"content-type": "text/html"}, content=b"<html>")

    with _transport(handler), resolve_to("93.184.216.34"), pytest.raises(ValidationError):
        fetch_remote_image("https://example.com/page")
