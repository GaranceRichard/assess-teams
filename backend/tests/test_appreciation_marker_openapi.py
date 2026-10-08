import pytest
from django.urls import reverse
from rest_framework.test import APIClient

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_openapi_exposes_optional_unique_markers_and_readonly_snapshots():
    response = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json")
    assert response.status_code == 200
    schema = response.json()
    components = schema["components"]["schemas"]
    for name in ["QuestionInput", "Question", "EvaluationRunQuestion"]:
        markers = components[name]["properties"]["appreciation_markers"]
        assert markers["type"] == "array"
        assert "AppreciationMarker" in markers["items"]["$ref"]
    assert "appreciation_markers" not in components["QuestionInput"]["required"]
    assert components["Question"]["properties"]["appreciation_markers"]["readOnly"]
    assert components["EvaluationRunQuestion"]["properties"]["appreciation_markers"]["readOnly"]
    marker = components["AppreciationMarker"]
    assert set(marker["required"]) == {"score", "text"}
    assert marker["properties"]["score"]["type"] == "integer"
    assert marker["properties"]["score"]["minimum"] == 0
    assert marker["properties"]["score"]["maximum"] == 10
    operation = schema["paths"]["/api/admin/questions/{question_id}/"]["put"]
    assert "Omettre" in operation["description"]
    assert set(operation["responses"]) == {"200", "400", "403", "404"}
    assert {"cookieAuth": []} in operation["security"]
