"""Download a remote image safely (used for "cover from a URL").

Guards against SSRF: only http(s), every hop's host must resolve to public IPs,
redirects are followed manually and re-checked, and the body is size-capped.
"""

import ipaddress
import socket
from urllib.parse import urljoin, urlsplit

import httpx
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile

from core.images import validate_image_bytes

MAX_REDIRECTS = 3
TIMEOUT = httpx.Timeout(10.0)


def _assert_public_host(url: str) -> None:
    parts = urlsplit(url)
    if parts.scheme not in {"http", "https"} or not parts.hostname:
        raise ValidationError("Seules les URL http(s) sont acceptées.")
    try:
        infos = socket.getaddrinfo(parts.hostname, parts.port or (443 if parts.scheme == "https" else 80))
    except socket.gaierror as exc:
        raise ValidationError("Nom de domaine introuvable.") from exc
    for info in infos:
        address = ipaddress.ip_address(info[4][0])
        if not address.is_global:
            raise ValidationError("Cette adresse n'est pas autorisée.")


def fetch_remote_image(url: str) -> SimpleUploadedFile:
    limit = settings.MAX_IMAGE_UPLOAD_BYTES
    with httpx.Client(timeout=TIMEOUT, follow_redirects=False) as client:
        for _ in range(MAX_REDIRECTS + 1):
            _assert_public_host(url)
            with client.stream("GET", url, headers={"accept": "image/*"}) as response:
                if response.is_redirect:
                    url = urljoin(url, response.headers["location"])
                    continue
                if response.status_code != 200:
                    raise ValidationError(f"Téléchargement impossible (HTTP {response.status_code}).")
                if not response.headers.get("content-type", "").startswith("image/"):
                    raise ValidationError("L'URL ne pointe pas vers une image.")
                data = bytearray()
                for chunk in response.iter_bytes():
                    data.extend(chunk)
                    if len(data) > limit:
                        raise ValidationError("L'image dépasse la taille maximale (8 Mo).")
                filename = urlsplit(url).path.rsplit("/", 1)[-1] or "image"
                return validate_image_bytes(bytes(data), filename)
        raise ValidationError("Trop de redirections.")
