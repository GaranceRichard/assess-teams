import pytest
from django.urls import reverse
from rest_framework.test import APIClient

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_openapi_documents_organization_family_and_explicit_criterion_history():
    client = APIClient()
    schema = client.get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    paths = schema["paths"]
    expected = {
        "/api/results/organizations/": {"200", "403"},
        "/api/results/families/": {"200", "400", "403", "404"},
        "/api/results/families/{family_id}/": {"200", "403", "404"},
        "/api/results/families/{family_id}/criteria/{lineage_id}/": {"200", "400", "403", "404"},
    }
    for path, codes in expected.items():
        assert set(paths[path]) == {"get"}
        get = paths[path]["get"]
        assert set(get["responses"]) == codes
        assert {"cookieAuth": []} in get["security"]
        assert "Viewer sans résultats" in get["description"]
    family = paths["/api/results/families/"]["get"]
    organization = next(p for p in family["parameters"] if p["name"] == "organization_id")
    assert organization["required"] is True
    history = paths["/api/results/families/{family_id}/criteria/{lineage_id}/"]["get"]
    lineage = next(p for p in history["parameters"] if p["name"] == "lineage_id")
    assert lineage["schema"]["format"] == "uuid"
    team_ids = next(p for p in history["parameters"] if p["name"] == "team_ids")
    assert team_ids["schema"]["type"] == "array"
    assert team_ids["explode"] is True
    assert "lignée UUID explicite" in history["description"]
    components = schema["components"]["schemas"]
    assert components["ResultCriterion"]["properties"]["lineage_id"]["format"] == "uuid"
    assert components["ResultObservation"]["properties"]["score"]["maximum"] == 10
    assert "completed_at" in components["ResultObservation"]["required"]
    assert client.get(reverse("swagger-ui")).status_code == 200
