import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.palettes import InterfacePalette

pytestmark = [pytest.mark.api, pytest.mark.contract]


def component(schema, reference):
    if "$ref" in reference:
        return schema["components"]["schemas"][reference["$ref"].split("/")[-1]]
    return reference


def test_palette_contract_documents_session_read_login_and_write():
    response = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json")
    assert response.status_code == 200
    schema = response.json()
    patch = schema["paths"]["/api/session/"]["patch"]
    assert {"cookieAuth": []} in patch["security"]
    assert set(patch["responses"]) == {"200", "400", "403"}
    request = component(schema, patch["requestBody"]["content"]["application/json"]["schema"])
    assert set(request["required"]) == {"interface_palette"}
    assert set(request["properties"]) == {"interface_palette"}
    assert request["additionalProperties"] is False
    assert patch["parameters"][0]["name"] == "X-CSRFToken"
    assert patch["parameters"][0]["required"]
    field = request["properties"]["interface_palette"]
    assert component(schema, field)["enum"] == list(InterfacePalette.values())
    operations = [
        schema["paths"]["/api/session/"]["get"],
        schema["paths"]["/api/session/login/"]["post"],
        patch,
    ]
    for operation in operations:
        user = component(
            schema, operation["responses"]["200"]["content"]["application/json"]["schema"]
        )
        assert "interface_palette" in user["required"]
        field = user["properties"]["interface_palette"]
        assert field["readOnly"]
        assert component(schema, field["allOf"][0])["enum"] == list(InterfacePalette.values())
