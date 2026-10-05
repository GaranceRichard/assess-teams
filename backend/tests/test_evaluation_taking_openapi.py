import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.api
@pytest.mark.contract
def test_schema_documents_taking_endpoints_and_notes_contract():
    schema = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    paths = schema["paths"]
    collection = paths["/api/evaluations/"]["get"]
    detail = paths["/api/evaluations/{run_id}/"]
    score = paths["/api/evaluations/{run_id}/responses/{question_id}/"]["put"]
    finalize = paths["/api/evaluations/{run_id}/finalize/"]["post"]
    revision = paths["/api/evaluations/{run_id}/revision/"]["put"]
    assert {"cookieAuth": []} in collection["security"]
    assert set(collection["responses"]) == {"200", "403"}
    assert set(detail["get"]["responses"]) == {"200", "403", "404"}
    for operation in [detail["post"], finalize, revision]:
        assert {"cookieAuth": []} in operation["security"]
        assert set(operation["responses"]) == {"200", "400", "403", "404"}
    assert set(score["responses"]) == {"204", "400", "403", "404"}
    reference = score["requestBody"]["content"]["application/json"]["schema"]["$ref"]
    component = schema["components"]["schemas"][reference.split("/")[-1]]
    assert component["required"] == ["score"]
    assert component["properties"]["score"] == {
        "type": "integer",
        "minimum": 0,
        "maximum": 10,
    }
    row_schema = collection["responses"]["200"]["content"]["application/json"]["schema"]["items"]
    row = schema["components"]["schemas"][row_schema["$ref"].split("/")[-1]]
    assert {"assigned_to", "filled_by", "completed_at", "revised_by", "revised_at"} <= set(
        row["properties"]
    )
