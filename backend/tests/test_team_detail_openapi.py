import pytest
from django.urls import reverse
from rest_framework.test import APIClient

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_schema_documents_minimal_readonly_team_detail_and_existing_mutations():
    response = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json")
    assert response.status_code == 200
    schema = response.json()
    detail = schema["paths"]["/api/admin/teams/{team_id}/"]
    operation = detail["get"]
    assert {"cookieAuth": []} in operation["security"]
    assert "requestBody" not in operation
    assert set(operation["responses"]) == {"200", "403", "404", "500"}
    assert operation["parameters"] == [
        {"in": "path", "name": "team_id", "schema": {"type": "integer"}, "required": True}
    ]
    reference = operation["responses"]["200"]["content"]["application/json"]["schema"]["$ref"]
    component = schema["components"]["schemas"][reference.split("/")[-1]]
    expected = {
        "id": "integer",
        "name": "string",
        "organization_id": "integer",
        "is_active": "boolean",
    }
    assert set(component["properties"]) == set(component["required"]) == set(expected)
    for field, field_type in expected.items():
        assert component["properties"][field]["type"] == field_type
        assert component["properties"][field]["readOnly"]
    for code in ("403", "404"):
        error = operation["responses"][code]["content"]["application/json"]["schema"]
        error = schema["components"]["schemas"][error["$ref"].split("/")[-1]]
        assert error["properties"] == {"detail": {"type": "string"}}
        assert error["required"] == ["detail"]
    assert set(detail["put"]["responses"]) == {"200", "400", "403", "404", "500"}
    assert set(detail["delete"]["responses"]) == {"204", "400", "403", "404", "500"}
    mutation_ref = detail["put"]["responses"]["200"]["content"]["application/json"]["schema"][
        "$ref"
    ]
    assert "coaches" in schema["components"]["schemas"][mutation_ref.split("/")[-1]]["properties"]
