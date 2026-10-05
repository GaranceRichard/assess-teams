import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from assessments.models import EvaluationStatus


@pytest.mark.api
@pytest.mark.contract
def test_schema_documents_readonly_status_and_explicit_lifecycle_actions():
    schema = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    components = schema["components"]["schemas"]
    status = components["Evaluation"]["properties"]["status"]
    enum = components[status["allOf"][0]["$ref"].split("/")[-1]]
    assert enum["enum"] == list(EvaluationStatus.values)
    assert status["readOnly"]
    assert "status" not in components["CreateEvaluationInput"]["properties"]
    for action in ["validate", "archive"]:
        operation = schema["paths"][f"/api/admin/evaluations/{{evaluation_id}}/{action}/"]["post"]
        assert {"cookieAuth": []} in operation["security"]
        assert "requestBody" not in operation
        assert set(operation["responses"]) == {"200", "400", "403", "404"}
