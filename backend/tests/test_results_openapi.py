import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.api
@pytest.mark.contract
def test_results_schema_is_read_only_scoped_and_documents_scores():
    client = APIClient()
    schema = client.get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    paths = schema["paths"]
    collection = paths["/api/results/versions/"]
    detail = paths["/api/results/versions/{evaluation_id}/"]
    assert set(collection) == {"get"}
    assert set(detail) == {"get"}
    assert set(collection["get"]["responses"]) == {"200", "403"}
    assert set(detail["get"]["responses"]) == {"200", "403", "404"}
    for operation in (collection["get"], detail["get"]):
        assert {"cookieAuth": []} in operation["security"]
        assert "Viewer sans résultats" in operation["description"]
    assert "completed_at" in detail["get"]["description"]
    components = schema["components"]["schemas"]
    assert set(components["ResultComparison"]["required"]) == {"axes", "teams"}
    assert components["ResultTeam"]["properties"]["scores"]["items"] == {
        "type": "integer",
        "minimum": 0,
        "maximum": 10,
    }
    assert client.get(reverse("swagger-ui")).status_code == 200
