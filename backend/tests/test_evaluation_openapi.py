import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.api
@pytest.mark.contract
def test_openapi_documents_evaluation_and_question_management() -> None:
    response = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json")
    schema = response.json()
    evaluations = schema["paths"]["/api/admin/evaluations/"]
    evaluation = schema["paths"]["/api/admin/evaluations/{evaluation_id}/"]
    questions = schema["paths"]["/api/admin/evaluations/{evaluation_id}/questions/"]
    question = schema["paths"]["/api/admin/questions/{question_id}/"]
    request_schema = evaluations["post"]["requestBody"]["content"]["application/json"]["schema"]
    component = schema["components"]["schemas"][request_schema["$ref"].split("/")[-1]]

    assert response.status_code == 200
    assert {"cookieAuth": []} in evaluations["get"]["security"]
    assert set(evaluations["get"]["responses"]) == {"200", "403"}
    assert set(evaluations["post"]["responses"]) == {"201", "400", "403"}
    assert set(component["required"]) == {"index", "name"}
    assert set(evaluation["put"]["responses"]) == {"200", "400", "403", "404"}
    assert set(evaluation["delete"]["responses"]) == {"204", "403", "404"}
    assert set(questions["get"]["responses"]) == {"200", "403", "404"}
    assert set(questions["post"]["responses"]) == {"201", "400", "403", "404"}
    assert set(question["put"]["responses"]) == {"200", "400", "403", "404"}
    assert set(question["delete"]["responses"]) == {"204", "403", "404"}
