from tests.identity_helpers import create_superuser
from tests.isolation_helpers import business_snapshot
from tests.test_organization_delete import csrf_delete, logged_in_client


def delete(client, organization):
    return csrf_delete(client, f"/api/admin/organizations/{organization.pk}/")


def assert_refused(organization, category, root=None):
    client = logged_in_client(root or create_superuser())
    before = business_snapshot()
    response = delete(client, organization)
    assert response.status_code == 400, response.content
    assert category in response.json()["detail"], response.json()
    assert business_snapshot() == before
    return response
