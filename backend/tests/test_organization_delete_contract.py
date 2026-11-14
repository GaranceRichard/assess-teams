import pytest
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization
from teams.models import Team
from tests.identity_helpers import create_superuser, create_user
from tests.isolation_helpers import business_snapshot
from tests.organization_delete_helpers import delete
from tests.test_organization_delete import logged_in_client

pytestmark = [pytest.mark.django_db, pytest.mark.api, pytest.mark.functional]


@pytest.mark.parametrize("role", [Role.ADMIN, Role.COACH, Role.VIEWER, None])
def test_forbidden_actor_gets_no_dependency_details_and_changes_nothing(role):
    organization = Organization.objects.create(name="Confidential")
    Team.objects.create(organization=organization, name="Secret team")
    if role:
        actor = create_user("actor", role)
        organization.users.add(actor)
        client = logged_in_client(actor)
    else:
        client = APIClient()
        client.get("/api/session/")
    before = business_snapshot()
    response = delete(client, organization)
    assert response.status_code == 403
    assert "Secret team" not in str(response.content)
    assert "équipes" not in str(response.content)
    assert business_snapshot() == before


def test_superadmin_without_csrf_is_refused_and_schema_describes_approved_contract():
    organization = Organization.objects.create(name="Empty")
    client = logged_in_client(create_superuser())
    assert client.delete(f"/api/admin/organizations/{organization.pk}/").status_code == 403
    assert Organization.objects.filter(pk=organization.pk).exists()
    schema = client.get("/api/schema/", HTTP_ACCEPT="application/json").json()
    operation = schema["paths"]["/api/admin/organizations/{organization_id}/"]["delete"]
    assert set(operation["responses"]) == {"204", "400", "403", "404", "500"}
    error = operation["responses"]["400"]["content"]["application/json"]["schema"]
    component = schema["components"]["schemas"][error["$ref"].split("/")[-1]]
    assert set(component["required"]) == {"detail"}
    for name in ("ActivityEntry", "LogEntry"):
        field = schema["components"]["schemas"][name]["properties"]["organization_origin_id"]
        assert field["type"] == "integer" and field["nullable"] and field["readOnly"]
    assert client.get("/api/docs/").status_code == 200
