import re

import pytest
from django.urls import URLResolver, get_resolver
from rest_framework.permissions import AllowAny
from rest_framework.test import APIClient
from rest_framework.views import APIView

from identities.domain.users import Role
from identities.models import Organization
from tests.identity_helpers import create_user

PUBLIC_ROUTES = {
    "health",
    "session-login",
    "password-recovery",
    "password-reset",
    "invitation-accept",
    "schema",
    "swagger-ui",
}


def api_routes(patterns=None, prefix=""):
    for pattern in patterns or get_resolver().url_patterns:
        route = prefix + str(pattern.pattern)
        if isinstance(pattern, URLResolver):
            yield from api_routes(pattern.url_patterns, route)
        elif issubclass(getattr(pattern.callback, "cls", object), APIView):
            url = re.sub(r"<uuid:[^>]+>", "00000000-0000-0000-0000-000000000001", route)
            url = re.sub(r"<int:[^>]+>", "1", url)
            url = re.sub(r"<str:[^>]+>", "invalid", url)
            yield pattern.name, "/" + url, pattern.callback.cls


ROUTES = list(api_routes())
PRIVATE_REQUESTS = [
    pytest.param(name, url, method, id=f"{name}-{method}")
    for name, url, view in ROUTES
    if name not in PUBLIC_ROUTES
    for method in view.http_method_names
    if hasattr(view, method) or method == "head" and hasattr(view, "get")
]
pytestmark = [pytest.mark.api, pytest.mark.functional]


def test_only_deliberately_public_routes_allow_anonymous_access():
    public = set()
    for name, _, view in ROUTES:
        permissions = view().get_permissions()
        assert permissions, f"{name} must not silently bypass all permissions"
        if any(isinstance(permission, AllowAny) for permission in permissions):
            public.add(name)
    assert public == PUBLIC_ROUTES


@pytest.mark.django_db
@pytest.mark.parametrize("name,url,method", PRIVATE_REQUESTS)
def test_every_business_route_refuses_anonymous_access_without_data(name, url, method):
    Organization.objects.create(name="Confidential organization")

    response = getattr(APIClient(), method)(url)

    assert response.status_code == (401 if name == "user-create" else 403)
    assert Organization.objects.count() == 1
    if method != "head":
        assert set(response.json()) == {"detail"}
        assert "Confidential organization" not in response.content.decode()


@pytest.mark.django_db
@pytest.mark.parametrize("role,expected", [(Role.ADMIN, 200), (Role.VIEWER, 403)])
def test_business_roles_still_control_organization_access(role, expected):
    member = create_user("member", role)
    organization = Organization.objects.create(name="Confidential organization")
    organization.users.add(member)
    client = APIClient()
    client.force_login(member)

    response = client.get("/api/admin/organizations/")

    assert response.status_code == expected
    if expected == 200:
        assert response.json()[0]["name"] == organization.name
    else:
        assert set(response.json()) == {"detail"}


@pytest.mark.django_db
@pytest.mark.parametrize("route", ["/api/health/", "/api/schema/", "/api/docs/"])
def test_public_operational_routes_remain_accessible(route):
    assert APIClient().get(route).status_code == 200
