import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from assessments.models import ScheduleMode


@pytest.mark.api
@pytest.mark.contract
def test_openapi_documents_evaluation_planning() -> None:
    response = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json")
    schema = response.json()
    collection = schema["paths"]["/api/admin/planning/"]
    detail = schema["paths"]["/api/admin/planning/{schedule_id}/"]
    request_schema = collection["post"]["requestBody"]["content"]["application/json"]["schema"]
    component = schema["components"]["schemas"][request_schema["$ref"].split("/")[-1]]
    mode_schema = component["properties"]["mode"]
    mode_component = schema["components"]["schemas"][mode_schema["$ref"].split("/")[-1]]

    assert response.status_code == 200
    assert {"cookieAuth": []} in collection["get"]["security"]
    assert set(collection["get"]["responses"]) == {"200", "400", "403", "404"}
    assert set(collection["post"]["responses"]) == {"201", "400", "403", "404"}
    assert set(detail["put"]["responses"]) == {"200", "400", "403", "404"}
    assert set(detail["delete"]["responses"]) == {"204", "400", "403", "404"}
    assert set(component["required"]) == {
        "organization_id",
        "team_id",
        "evaluation_id",
        "assignee_id",
        "mode",
    }
    assert mode_component["enum"] == list(ScheduleMode.values)
    assert "assignee_id" in component["properties"]
    assert "historique conservé" in collection["post"]["description"]
    assert "doublons (400)" in collection["post"]["description"]
    assert "ponctuelle complétée ne bloque pas" in detail["put"]["description"]
