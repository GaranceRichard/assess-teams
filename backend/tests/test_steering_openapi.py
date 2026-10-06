import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.api
@pytest.mark.contract
def test_steering_schema_documents_read_only_scope_definitions_and_nulls():
    client = APIClient()
    schema = client.get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    projection = schema["paths"]["/api/steering/"]
    organizations = schema["paths"]["/api/steering/organizations/"]
    assert set(projection) == set(organizations) == {"get"}
    operation = projection["get"]
    assert set(operation["responses"]) == {"200", "400", "403", "404"}
    assert {"cookieAuth": []} in operation["security"]
    assert operation["parameters"][0]["name"] == "organization_id"
    assert not operation["parameters"][0].get("required", False)
    for term in ["COMPLETED", "timezone.localdate()", "Coach/Viewer", "pk DESC"]:
        assert term in operation["description"]
    components = schema["components"]["schemas"]
    assert set(components["Steering"]["required"]) == {
        "organization",
        "as_of_date",
        "summary",
        "teams",
    }
    assert components["SteeringSummary"]["properties"]["last_completed_at"]["nullable"]
    assert components["SteeringTeam"]["properties"]["next_due_date"]["nullable"]
    assert client.get(reverse("swagger-ui")).status_code == 200
