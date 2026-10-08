import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.contract
@pytest.mark.api
def test_score_guides_share_typed_input_response_and_snapshot_contract():
    schema = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    components = schema["components"]["schemas"]
    guide = components["ScoreGuide"]
    assert set(guide["required"]) == {"score", "text"}
    assert guide["properties"]["score"] == {"type": "integer", "maximum": 10, "minimum": 0}
    assert guide["properties"]["text"]["type"] == "string"
    assert guide["properties"]["text"]["minLength"] == 1
    for name in ["QuestionInput", "Question", "EvaluationRunQuestion"]:
        field = components[name]["properties"]["score_guides"]
        assert field["type"] == "array"
        assert field["items"]["$ref"].endswith("/ScoreGuide")
    assert "score_guides" not in components["QuestionInput"]["required"]
    assert components["EvaluationRunQuestion"]["properties"]["score_guides"]["readOnly"] is True
    path = schema["paths"]["/api/admin/questions/{question_id}/"]["put"]
    assert "omission conserve" in path["description"]
    assert set(path["responses"]) == {"200", "400", "403", "404"}
