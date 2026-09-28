import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.api
@pytest.mark.contract
def test_openapi_documents_read_only_journals() -> None:
    api_client = APIClient()
    schema = api_client.get(reverse("schema"), HTTP_ACCEPT="application/json").json()

    activity = schema["paths"]["/api/admin/activity-journal/"]
    errors = schema["paths"]["/api/admin/error-journal/"]
    activity_get = activity["get"]
    error_get = errors["get"]

    assert set(activity) == {"get"}
    assert set(errors) == {"get"}
    assert set(activity_get["responses"]) == {"200", "400", "403"}
    assert set(error_get["responses"]) == {"200", "400", "403"}
    assert {parameter["name"] for parameter in activity_get["parameters"]} == {
        "date",
        "organization_id",
        "page",
        "player",
        "team",
    }
