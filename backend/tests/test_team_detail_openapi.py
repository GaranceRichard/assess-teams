import pytest
from django.urls import reverse
from jsonschema import Draft4Validator, ValidationError
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


def test_schema_documents_coach_and_admin_collection_projections():
    schema = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    operation = schema["paths"]["/api/admin/organizations/{organization_id}/teams/"]["get"]
    assert "C04" in operation["description"]
    assert "requestBody" not in operation
    assert {"cookieAuth": []} in operation["security"]
    components = schema["components"]["schemas"]
    reference = operation["responses"]["200"]["content"]["application/json"]["schema"]["$ref"]
    variants = components[reference.split("/")[-1]]["anyOf"]
    assert {variant["$ref"].split("/")[-1] for variant in variants} == {
        "TeamCollection",
        "TeamDetailCollection",
    }
    for name in ("Team", "TeamDetail"):
        collection = components[f"{name}Collection"]["oneOf"]
        assert collection[0] == {"type": "array", "items": {"$ref": f"#/components/schemas/{name}"}}
        page = components[f"{name}Page"]
        assert page["properties"]["results"]["items"] == {"$ref": f"#/components/schemas/{name}"}


@pytest.mark.parametrize("kind", ["empty", "coach", "admin"])
def test_collection_schema_accepts_real_overlapping_projections(kind):
    schema = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    response = schema["paths"]["/api/admin/organizations/{organization_id}/teams/"]["get"][
        "responses"
    ]["200"]["content"]["application/json"]["schema"]
    validator = Draft4Validator({**response, "components": schema["components"]})
    team = {"id": 1, "name": "Assigned", "organization_id": 2, "is_active": True}
    if kind == "admin":
        team["coaches"] = [{"id": 3, "identifier": "coach", "is_active": True}]
    validator.validate([] if kind == "empty" else [team])
    with pytest.raises(ValidationError):
        validator.validate([{"name": "Missing mandatory identity"}])
