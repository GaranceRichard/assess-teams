import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.api
@pytest.mark.contract
def test_openapi_documents_read_only_journals() -> None:
    api_client = APIClient()
    schema = api_client.get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    activity = schema["paths"]["/api/admin/activity-journal/"]
    logs = schema["paths"]["/api/admin/logs/"]
    activity_get = activity["get"]
    logs_get = logs["get"]
    assert set(activity) == {"get"}
    assert set(logs) == {"get"}
    assert set(activity_get["responses"]) == {"200", "400", "403"}
    assert set(logs_get["responses"]) == {"200", "400", "403", "404"}
    assert {parameter["name"] for parameter in activity_get["parameters"]} == {
        "date",
        "organization_id",
        "page",
        "player",
        "team",
    }
    assert {parameter["name"] for parameter in logs_get["parameters"]} == {
        "organization",
        "organization_id",
        "actor",
        "team",
        "evaluation",
        "from",
        "to",
        "method",
        "status_code",
        "level",
        "source",
        "page",
    }
    fields = schema["components"]["schemas"]["LogEntry"]["properties"]
    assert {"method", "status_code", "evaluation_id", "evaluation_name"} <= fields.keys()

    assert "X-Correlation-ID" in logs_get["responses"]["200"]["headers"]
