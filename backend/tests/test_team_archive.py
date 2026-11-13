import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization
from journals.models import ActivityAction, ActivityEntry, LogEntry
from teams.models import Team
from tests.identity_helpers import create_superuser, create_user
from tests.taking_helpers import client_for, complete, taking_context
from tests.test_team_detail_integrity import business_state

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def archive(client, team_id, *, csrf=True):
    headers = {}
    if csrf and "csrftoken" in client.cookies:
        headers["HTTP_X_CSRFTOKEN"] = client.cookies["csrftoken"].value
    return client.delete(reverse("team-detail", kwargs={"team_id": team_id}), **headers)


@pytest.mark.parametrize("superadmin", [False, True])
def test_archive_is_unique_and_preserves_all_business_history(superadmin):
    organization, coach, admin, run = taking_context()
    team = run.team
    team.coaches.add(coach)
    assert complete(client_for(coach), run).status_code == 200
    client = client_for(create_superuser() if superadmin else admin)
    before = business_state()
    identity = {"id": team.pk, "name": team.name, "organization_id": organization.pk}

    first = archive(client, team.pk)

    assert first.status_code == 204
    assert first.content == b""
    expected = before
    expected["teams.Team"][0]["is_active"] = False
    after = business_state()
    assert after.pop("journals.ActivityEntry")[:-1] == expected.pop("journals.ActivityEntry")
    assert after == expected
    assert ActivityEntry.objects.filter(team=team, action=ActivityAction.TEAM_ARCHIVED).count() == 1
    detail = reverse("team-detail", kwargs={"team_id": team.pk})
    assert client.get(detail).json() == {**identity, "is_active": False}
    collection = reverse("team-list", kwargs={"organization_id": organization.pk})
    assert client.get(collection).json() == []
    before = business_state()
    logs_before = list(LogEntry.objects.order_by("pk").values())

    with CaptureQueriesContext(connection) as queries:
        second = archive(client, team.pk)

    assert second.status_code == 400
    assert second.json() == ["Équipe déjà archivée."]
    assert business_state() == before
    assert list(LogEntry.objects.order_by("pk").values())[:-1] == logs_before
    entry = LogEntry.objects.get(correlation_id=second["X-Correlation-ID"])
    assert entry.status_code == 400
    assert entry.team == team
    assert entry.organization == organization
    writes = [
        query["sql"]
        for query in queries.captured_queries
        if query["sql"].split()[0].upper() in {"INSERT", "UPDATE", "DELETE", "REPLACE"}
    ]
    assert len(writes) == 1
    assert writes[0].startswith('INSERT INTO "journals_logentry"')
    assert ActivityEntry.objects.filter(team=team, action=ActivityAction.TEAM_ARCHIVED).count() == 1


@pytest.mark.parametrize("active", [False, True])
@pytest.mark.parametrize("attached", [False, True])
def test_archive_foreign_and_missing_are_identical_without_business_effects(active, attached):
    actor = create_user("admin", Role.ADMIN)
    own = Organization.objects.create(name="Own")
    if attached:
        own.users.add(actor)
    foreign = Organization.objects.create(name="Foreign")
    team = Team.objects.create(name="Secret", organization=foreign, is_active=active)
    client = client_for(actor)
    before = business_state()

    hidden = archive(client, team.pk)
    missing = archive(client, 999999)

    assert hidden.status_code == missing.status_code == 404
    assert hidden.json() == missing.json() == {"detail": "No Team matches the given query."}
    assert business_state() == before
    for response in (hidden, missing):
        entry = LogEntry.objects.get(correlation_id=response["X-Correlation-ID"])
        assert entry.team is None
        assert entry.team_name == ""
        assert entry.organization == (own if attached else None)
        assert "Secret" not in str(entry.__dict__)
        assert "Foreign" not in str(entry.__dict__)


@pytest.mark.parametrize("active", [False, True])
@pytest.mark.parametrize("actor_kind", ["coach", "viewer", "inactive", "anonymous"])
def test_archive_refuses_unauthorized_actors_before_disclosing_state(active, actor_kind):
    organization = Organization.objects.create(name="Own")
    team = Team.objects.create(name="Secret", organization=organization, is_active=active)
    client = APIClient(enforce_csrf_checks=True)
    if actor_kind != "anonymous":
        role = {"coach": Role.COACH, "viewer": Role.VIEWER, "inactive": Role.ADMIN}[actor_kind]
        actor = create_user("actor", role, is_active=actor_kind != "inactive")
        organization.users.add(actor)
        if actor_kind == "coach":
            team.coaches.add(actor)
        client = client_for(actor)
    before = business_state()

    existing = archive(client, team.pk)
    missing = archive(client, 999999)

    assert existing.status_code == missing.status_code == 403
    assert existing.json() == missing.json()
    assert set(existing.json()) == {"detail"}
    assert business_state() == before
    assert not LogEntry.objects.exclude(team=None).exists()


@pytest.mark.parametrize("active", [False, True])
def test_archive_requires_csrf_without_any_business_write(active):
    organization, _, admin, run = taking_context()
    Team.objects.filter(pk=run.team_id).update(is_active=active)
    client = client_for(admin)
    before = business_state()

    response = archive(client, run.team_id, csrf=False)

    assert response.status_code == 403
    assert "CSRF" in response.json()["detail"]
    assert business_state() == before


@pytest.mark.parametrize("team_id", [0, 999999, 10**40])
def test_archive_missing_integer_ids_are_controlled(team_id):
    client = client_for(create_superuser())
    before = business_state()

    response = archive(client, team_id)

    assert response.status_code == 404
    assert response.json() == {"detail": "No Team matches the given query."}
    assert business_state() == before
