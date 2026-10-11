import pytest
from django.test import override_settings
from django.urls import path
from rest_framework.response import Response
from rest_framework.test import APIClient
from rest_framework.views import APIView

from identities.domain.users import Role
from identities.models import Organization
from tests.identity_helpers import create_user


class UndeclaredPermissionView(APIView):
    """A future business endpoint that deliberately omits permission_classes."""

    def get(self, request):
        return Response(
            {"organizations": list(Organization.objects.values_list("name", flat=True))}
        )

    def post(self, request):
        Organization.objects.create(name="New organization")
        return Response({"created": True}, status=201)


urlpatterns = [path("api/new-feature/", UndeclaredPermissionView.as_view())]
pytestmark = [pytest.mark.django_db, pytest.mark.api, pytest.mark.functional]


@override_settings(ROOT_URLCONF=__name__)
@pytest.mark.parametrize("method", ["get", "post", "put", "patch", "delete", "head", "options"])
def test_undeclared_endpoint_denies_anonymous_requests_before_business_code(method):
    Organization.objects.create(name="Confidential organization")

    response = getattr(APIClient(), method)("/api/new-feature/")

    assert response.status_code == 403
    assert "WWW-Authenticate" not in response
    assert Organization.objects.count() == 1
    if method != "head":
        assert set(response.json()) == {"detail"}
        assert "Confidential organization" not in response.content.decode()


@override_settings(ROOT_URLCONF=__name__)
@pytest.mark.parametrize("role", list(Role))
def test_undeclared_endpoint_accepts_an_authenticated_session(role):
    Organization.objects.create(name="Authorized organization")
    client = APIClient()
    client.force_login(create_user("member", role))

    response = client.get("/api/new-feature/")

    assert response.status_code == 200
    assert response.json() == {"organizations": ["Authorized organization"]}


@override_settings(ROOT_URLCONF=__name__)
def test_undeclared_endpoint_preserves_authenticated_write_and_csrf_checks():
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(create_user("member", Role.ADMIN))

    refused = client.post("/api/new-feature/")

    assert refused.status_code == 403
    assert Organization.objects.count() == 0
    client.cookies["csrftoken"] = "a" * 32
    accepted = client.post("/api/new-feature/", HTTP_X_CSRFTOKEN="a" * 32)
    assert accepted.status_code == 201
    assert Organization.objects.get().name == "New organization"


@override_settings(ROOT_URLCONF=__name__)
def test_undeclared_endpoint_rejects_an_inactive_session():
    member = create_user("member", Role.VIEWER)
    client = APIClient()
    client.force_login(member)
    member.is_active = False
    member.save(update_fields=["is_active"])

    response = client.get("/api/new-feature/")

    assert response.status_code == 403
    assert set(response.json()) == {"detail"}
