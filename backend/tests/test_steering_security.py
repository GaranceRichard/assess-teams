import pytest
from rest_framework.test import APIClient

from assessments.models import EvaluationRun
from identities.domain.users import Role
from identities.models import Organization
from tests.identity_helpers import create_user
from tests.results_helpers import results_context
from tests.taking_helpers import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]
URLS = ["/api/steering/", "/api/steering/organizations/"]


@pytest.mark.parametrize("url", URLS)
def test_anonymous_inactive_coach_and_viewer_are_denied(url):
    org, coach, admin, _ = results_context()
    viewer = create_user("viewer", Role.VIEWER)
    org.users.add(viewer)
    assert APIClient().get(url).status_code == 403
    for actor in [coach, viewer]:
        assert client_for(actor).get(url).status_code == 403
    client = client_for(admin)
    admin.is_active = False
    admin.save()
    assert client.get(url).status_code == 403


def test_admin_organization_is_imposed_forged_ids_and_interorganization_data_are_refused():
    org, _, admin, run = results_context("Own")
    other, other_coach, other_admin, foreign = results_context("Other")
    client = client_for(admin)
    assert client.get(URLS[1]).json() == [{"id": org.pk, "name": org.name}]
    for forged in [other.pk, 999999]:
        assert client.get(URLS[0], {"organization_id": forged}).status_code == 404
    assert client_for(other_admin).get(URLS[0], {"organization_id": org.pk}).status_code == 404
    # Defensive scope remains safe even with inconsistent legacy relations.
    run.team.coaches.add(other_coach)
    EvaluationRun.objects.filter(pk=foreign.pk).update(team=run.team)
    data = client.get(URLS[0], {"organization_id": org.pk}).json()
    assert len(data["teams"]) == 1
    assert data["teams"][0]["last_result"]["run_id"] == run.pk
    assert data["teams"][0]["coaches"] == []
    assert other.name not in str(data)


def test_superadmin_requires_one_organization_and_switches_without_aggregation():
    org, _, admin, _ = results_context("One")
    other, _, _, _ = results_context("Two")
    admin.organizations.clear()
    admin.is_superuser = True
    admin.role = None
    admin.save()
    client = client_for(admin)
    assert {o["id"] for o in client.get(URLS[1]).json()} == {org.pk, other.pk}
    assert client.get(URLS[0]).status_code == 400
    assert client.get(URLS[0], {"organization_id": 999999}).status_code == 404
    for selected in [org, other]:
        data = client.get(URLS[0], {"organization_id": selected.pk}).json()
        assert data["organization"]["id"] == selected.pk
        assert data["summary"]["active_teams"] == 1
        assert data["teams"][0]["team_name"] == f"{selected.name} Team"
    assert (
        client.get(f"{URLS[0]}?organization_id={org.pk}&organization_id={other.pk}").status_code
        == 400
    )


@pytest.mark.parametrize("value", ["", "abc", "0", "-1", "1.2"])
def test_invalid_organization_ids(value):
    _, _, admin, _ = results_context()
    assert client_for(admin).get(URLS[0], {"organization_id": value}).status_code == 400


@pytest.mark.parametrize("url", URLS)
def test_admin_without_unique_organization_is_denied_and_api_has_no_writes(url):
    org, _, admin, _ = results_context()
    client = client_for(admin)
    assert client.post(url, {}).status_code in [403, 405]
    org.users.remove(admin)
    assert client.get(url).status_code == 403
    org.users.add(admin)
    Organization.objects.create(name="Additional").users.add(admin)
    assert client.get(url).status_code == 403
