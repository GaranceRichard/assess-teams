from io import StringIO

import pytest
from django.core.management import call_command
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.mark.api
@pytest.mark.contract
def test_openapi_schema_is_generated_and_documents_health_contract(
    api_client: APIClient,
) -> None:
    response = api_client.get(reverse("schema"), HTTP_ACCEPT="application/json")

    assert response.status_code == 200
    schema = response.json()
    operation = schema["paths"]["/api/health/"]["get"]
    assert schema["openapi"].startswith("3.")
    assert "security" not in operation
    assert set(operation["responses"]) == {"200"}


@pytest.mark.api
def test_swagger_ui_is_exposed(api_client: APIClient) -> None:
    response = api_client.get(reverse("swagger-ui"))

    assert response.status_code == 200
    assert b"swagger-ui" in response.content


@pytest.mark.contract
def test_openapi_schema_passes_spectacular_validation() -> None:
    output = StringIO()

    call_command("spectacular", validate=True, fail_on_warn=True, stdout=output)

    assert "openapi: 3.0.3" in output.getvalue()


@pytest.mark.api
def test_schema_rejects_unsupported_method(api_client: APIClient) -> None:
    response = api_client.post(reverse("schema"), data={})

    assert response.status_code == 405
