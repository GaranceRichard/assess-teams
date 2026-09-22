from io import StringIO

import pytest
from django.core.management import call_command
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role


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
@pytest.mark.contract
def test_openapi_documents_authenticated_user_creation(api_client: APIClient) -> None:
    response = api_client.get(reverse("schema"), HTTP_ACCEPT="application/json")

    schema = response.json()
    operation = schema["paths"]["/api/users/"]["post"]
    request_schema = operation["requestBody"]["content"]["application/json"]["schema"]
    request_component = schema["components"]["schemas"][request_schema["$ref"].split("/")[-1]]
    role_schema = request_component["properties"]["role"]
    role_component = schema["components"]["schemas"][role_schema["$ref"].split("/")[-1]]

    assert response.status_code == 200
    assert {"basicAuth": []} in operation["security"]
    assert set(operation["responses"]) == {"201", "400", "401", "403"}
    assert set(request_component["required"]) == {"username", "password", "role"}
    assert role_component["enum"] == list(Role.values())
    assert "is_superuser" not in request_component["properties"]


@pytest.mark.api
@pytest.mark.contract
def test_openapi_documents_product_session_contract(api_client: APIClient) -> None:
    response = api_client.get(reverse("schema"), HTTP_ACCEPT="application/json")

    schema = response.json()
    login = schema["paths"]["/api/session/login/"]["post"]
    current = schema["paths"]["/api/session/"]["get"]
    logout = schema["paths"]["/api/session/logout/"]["post"]
    request_schema = login["requestBody"]["content"]["application/json"]["schema"]
    request_component = schema["components"]["schemas"][request_schema["$ref"].split("/")[-1]]

    assert response.status_code == 200
    assert "security" not in login
    assert set(login["responses"]) == {"200", "400", "401", "403"}
    assert set(request_component["required"]) == {"username", "password"}
    assert {"cookieAuth": []} in current["security"]
    assert set(current["responses"]) == {"200", "403"}
    assert {"cookieAuth": []} in logout["security"]
    assert set(logout["responses"]) == {"204", "403"}


@pytest.mark.api
@pytest.mark.contract
def test_openapi_documents_superadmin_user_management(api_client: APIClient) -> None:
    response = api_client.get(reverse("schema"), HTTP_ACCEPT="application/json")

    schema = response.json()
    collection = schema["paths"]["/api/admin/users/"]
    detail = schema["paths"]["/api/admin/users/{user_id}/"]
    invitation = schema["paths"]["/api/invitations/{uid}/{token}/"]["post"]
    create_schema = collection["post"]["requestBody"]["content"]["application/json"]["schema"]
    create_component = schema["components"]["schemas"][create_schema["$ref"].split("/")[-1]]

    assert response.status_code == 200
    assert {"cookieAuth": []} in collection["get"]["security"]
    assert set(collection["post"]["responses"]) == {"201", "400", "403"}
    assert set(create_component["required"]) == {"identifier", "email", "role"}
    assert "name" not in create_component["properties"]
    assert set(detail["put"]["responses"]) == {"200", "400", "403", "404"}
    assert set(detail["delete"]["responses"]) == {"204", "400", "403", "404"}
    assert "security" not in invitation
    assert set(invitation["responses"]) == {"204", "400", "403"}


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
