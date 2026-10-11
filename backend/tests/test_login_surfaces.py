import pytest
from django.contrib import admin
from django.test import RequestFactory
from drf_spectacular.generators import SchemaGenerator
from drf_spectacular.validation import validate_schema
from rest_framework.test import APIClient

from identities.adapters.api.login_security import LimitedAdminAuthenticationForm
from identities.domain.users import Role
from tests.identity_helpers import TEST_CREDENTIAL, authenticate, create_superuser, create_user
from tests.test_login_limits import attempt

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_basic_and_product_login_share_limits_and_preserve_permissions(settings):
    settings.LOGIN_ACCOUNT_LIMIT = 2
    create_superuser()
    client = APIClient()
    authenticate(client, "root", "wrong")
    assert client.post("/api/users/", {}).status_code == 401
    assert attempt(username="root").status_code == 429
    authenticate(client, "root")
    assert client.post("/api/users/", {}).status_code == 429
    # A different valid account still faces existing authorization rules.
    create_user("viewer", Role.VIEWER)
    authenticate(client, "viewer")
    assert client.post("/api/users/", {}).status_code == 403


def test_admin_login_shares_limits_without_changing_staff_requirements(settings):
    settings.LOGIN_ACCOUNT_LIMIT = 2
    root = create_superuser()
    request = RequestFactory().post("/admin/login/")
    form = admin.site.login_form(request, data={"username": "root", "password": TEST_CREDENTIAL})
    assert isinstance(form, LimitedAdminAuthenticationForm)
    assert form.is_valid()
    assert form.get_user() == root
    create_user("viewer", Role.VIEWER)
    nonstaff = admin.site.login_form(
        request, data={"username": "viewer", "password": TEST_CREDENTIAL}
    )
    assert not nonstaff.is_valid()
    assert attempt(username="root").status_code == 401
    form = admin.site.login_form(request, data={"username": "root", "password": "wrong"})
    assert not form.is_valid()
    assert "Trop de tentatives" in str(form.errors)
    form = admin.site.login_form(request, data={"username": "root", "password": TEST_CREDENTIAL})
    assert not form.is_valid()
    assert "Trop de tentatives" in str(form.errors)
    assert not admin.site.login_form(request, data={}).is_valid()


@pytest.mark.contract
def test_login_openapi_and_docs_include_restriction():
    schema = SchemaGenerator().get_schema(request=None, public=True)
    validate_schema(schema)
    login = schema["paths"]["/api/session/login/"]["post"]
    assert set(login["responses"]) == {"200", "400", "401", "403", "429", "500"}
    assert "security" not in login
    assert "Retry-After" in login["responses"]["429"]["headers"]
    assert {"basicAuth": []} in schema["paths"]["/api/users/"]["post"]["security"]
    assert APIClient().get("/api/docs/").status_code == 200
