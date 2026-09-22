import pytest
from django.urls import reverse
from rest_framework.response import Response
from rest_framework.test import APIClient

from identities.domain.users import Role
from tests.identity_helpers import TEST_CREDENTIAL, create_superuser, create_user


@pytest.fixture
def api_client() -> APIClient:
    return APIClient(enforce_csrf_checks=True)


def credentials(username: str, password: str = TEST_CREDENTIAL) -> dict[str, str]:
    return {"username": username, "password": password}


def open_session(
    api_client: APIClient,
    username: str,
    password: str = TEST_CREDENTIAL,
) -> Response:
    api_client.get(reverse("session-current"))
    csrf_token = api_client.cookies["csrftoken"].value
    return api_client.post(
        reverse("session-login"),
        credentials(username, password),
        HTTP_X_CSRFTOKEN=csrf_token,
    )


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize("role", list(Role))
def test_valid_business_user_opens_and_reads_session(
    api_client: APIClient,
    role: Role,
) -> None:
    create_user("member", role)

    login_response = open_session(api_client, "member")
    current_response = api_client.get(reverse("session-current"))

    assert login_response.status_code == 200
    assert login_response.json() == {
        "username": "member",
        "role": role.value,
        "is_superuser": False,
    }
    assert current_response.json() == login_response.json()


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_superadmin_uses_admin_product_role(api_client: APIClient) -> None:
    create_superuser()

    response = open_session(api_client, "root")

    assert response.json() == {
        "username": "root",
        "role": Role.ADMIN.value,
        "is_superuser": True,
    }


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize("password", ["wrong-password", ""])
def test_invalid_credentials_are_rejected(api_client: APIClient, password: str) -> None:
    create_user("member", Role.VIEWER)

    response = open_session(api_client, "member", password)

    assert response.status_code in {400, 401}
    assert "sessionid" not in response.cookies
    assert api_client.get(reverse("session-current")).status_code == 403


@pytest.mark.django_db
@pytest.mark.integration
@pytest.mark.api
def test_anonymous_user_cannot_read_a_protected_session(api_client: APIClient) -> None:
    response = api_client.get(reverse("session-current"))

    assert response.status_code == 403


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_authenticated_user_can_logout_with_csrf(api_client: APIClient) -> None:
    create_user("member", Role.COACH)
    open_session(api_client, "member")
    api_client.get(reverse("session-current"))
    csrf_token = api_client.cookies["csrftoken"].value

    response = api_client.post(reverse("session-logout"), HTTP_X_CSRFTOKEN=csrf_token)

    assert response.status_code == 204
    assert api_client.get(reverse("session-current")).status_code == 403


@pytest.mark.django_db
@pytest.mark.api
def test_logout_rejects_missing_csrf_token(api_client: APIClient) -> None:
    create_user("member", Role.COACH)
    open_session(api_client, "member")

    response = api_client.post(reverse("session-logout"))

    assert response.status_code == 403


@pytest.mark.django_db
@pytest.mark.api
def test_login_rejects_missing_csrf_token(api_client: APIClient) -> None:
    create_user("member", Role.VIEWER)

    response = api_client.post(reverse("session-login"), credentials("member"))

    assert response.status_code == 403
