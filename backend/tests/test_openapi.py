from pathlib import Path

from django.conf import settings
from django.core.management import call_command

from core.openapi import require_response_fields

SCHEMA = Path(settings.BASE_DIR) / "openapi.yaml"


def test_committed_schema_is_up_to_date(tmp_path: Path) -> None:
    """backend/openapi.yaml feeds the frontend's generated types: it must match the code.

    Regenerate with `tox -e api-types` when this fails.
    """
    generated = tmp_path / "openapi.yaml"
    call_command("spectacular", "--validate", "--fail-on-warn", "--file", str(generated))
    assert generated.read_text() == SCHEMA.read_text(), "Stale openapi.yaml: run `tox -e api-types`."


def test_response_components_require_all_fields() -> None:
    result = {
        "components": {
            "schemas": {
                "Article": {"properties": {"id": {}, "slug": {}}, "required": ["id"]},
                "ArticleRequest": {"properties": {"slug": {}}, "required": []},
                "StatusEnum": {"enum": ["draft"]},
            }
        }
    }
    schemas = require_response_fields(result)["components"]["schemas"]
    assert schemas["Article"]["required"] == ["id", "slug"]
    assert schemas["ArticleRequest"]["required"] == []
    assert "required" not in schemas["StatusEnum"]
