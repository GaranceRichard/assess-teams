import pytest
from django.http import Http404
from django.urls import reverse
from rest_framework.test import APIClient

from assessments.application.versioning import create_next_version
from assessments.models import Evaluation
from identities.domain.users import Role
from identities.models import Organization
from tests.identity_helpers import create_superuser, create_user
from tests.test_evaluation_lifecycle import context
from tests.test_evaluation_versions import new_version
from tests.test_evaluations import logged_in_client

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_new_version_refuses_non_admins(role):
    _, source, _ = context()
    actor = create_user("unauthorized", role)
    source.organization.users.add(actor)
    assert new_version(logged_in_client(actor), source).status_code == 403
    assert source.family.versions.count() == 1


def test_new_version_requires_authentication_and_csrf():
    client, source, _ = context()
    url = reverse("evaluation-new-version", kwargs={"evaluation_id": source.pk})
    assert APIClient().post(url).status_code == 403
    assert client.post(url, {}, format="json").status_code == 403
    assert source.family.versions.count() == 1


def test_forged_ids_cannot_read_or_copy_another_tenant():
    _, source, _ = context()
    organization = Organization.objects.create(name="Other")
    outsider = create_user("outsider", Role.ADMIN)
    organization.users.add(outsider)
    client = logged_in_client(outsider)
    assert client.get(reverse("evaluation-list")).json() == []
    assert new_version(client, source, {"family_id": source.family_id}).status_code == 404
    assert new_version(client, Evaluation(pk=987654)).status_code == 404
    with pytest.raises(Http404):
        create_next_version(source.pk, outsider)
    assert source.family.versions.count() == 1


def test_superadmin_can_copy_any_organization():
    _, source, _ = context()
    response = new_version(logged_in_client(create_superuser()), source)
    assert response.status_code == 201
    assert response.json()["organization_id"] == source.organization_id
