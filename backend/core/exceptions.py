from typing import Any

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def exception_handler(exc: Exception, context: dict[str, Any]) -> Response | None:
    """DRF's handler, plus Django ``ValidationError`` (raised by services) as a 400 ``{"detail": [...]}``."""
    if isinstance(exc, DjangoValidationError):
        exc = ValidationError({"detail": exc.messages})
    return drf_exception_handler(exc, context)
