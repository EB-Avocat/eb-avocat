"""drf-spectacular post-processing for accurate generated client types."""

from typing import Any


def require_response_fields(result: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    """Mark every property of response components as required.

    DRF serializers always output all their declared fields, but drf-spectacular
    reuses the input-side ``required`` flags for responses, which would make every
    optional input field optional (``field?:``) in the generated TypeScript too.
    Request components (``*Request``) keep their real input requirements.
    """
    for name, schema in result.get("components", {}).get("schemas", {}).items():
        if name.endswith("Request") or "properties" not in schema:
            continue
        schema["required"] = list(schema["properties"])
    return result
