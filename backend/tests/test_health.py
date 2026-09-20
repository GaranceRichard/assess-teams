import pytest
from django.db import connection
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_health_check_reports_application_and_database_ready(api_client: APIClient) -> None:
    response = api_client.get(reverse("health"))

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_health_check_rejects_unsupported_methods(api_client: APIClient) -> None:
    response = api_client.post(reverse("health"), data={})

    assert response.status_code == 405
    assert response.data["detail"].code == "method_not_allowed"


@pytest.mark.django_db
@pytest.mark.integration
def test_sqlite_connection_executes_a_query() -> None:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        result = cursor.fetchone()

    assert connection.vendor == "sqlite"
    assert result == (1,)


@pytest.mark.django_db
@pytest.mark.contract
@pytest.mark.api
def test_health_contract_has_stable_string_fields(api_client: APIClient) -> None:
    payload = api_client.get(reverse("health")).json()

    assert set(payload) == {"status", "database"}
    assert all(isinstance(value, str) for value in payload.values())
