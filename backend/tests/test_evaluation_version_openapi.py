import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.api
@pytest.mark.contract
def test_openapi_documents_versions_and_historical_references():
    client = APIClient()
    schema = client.get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    operation = schema["paths"]["/api/admin/evaluations/{evaluation_id}/versions/"]["post"]
    assert set(operation["responses"]) == {"201", "403", "404"}
    assert "requestBody" not in operation
    assert {"cookieAuth": []} in operation["security"]
    models = schema["components"]["schemas"]
    for name, fields in {
        "Evaluation": ["family_id", "family_name", "version"],
        "EvaluationSchedule": ["family_id", "family_name", "evaluation_version"],
        "EvaluationRunList": ["family_id", "family_name", "evaluation_version"],
    }.items():
        for field in fields:
            assert models[name]["properties"][field]["readOnly"]
    assert "version" not in models["CreateEvaluationInput"]["properties"]
    assert client.get(reverse("swagger-ui")).status_code == 200
