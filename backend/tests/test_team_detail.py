import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization
from journals.models import ActivityEntry, LogEntry, LogSource
from teams.models import Team
from tests.identity_helpers import create_superuser, create_user
from tests.taking_helpers import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("superadmin", [False, True])
@pytest.mark.parametrize("active", [False, True])
def test_detail_returns_only_identity_and_state(superadmin, active):
    actor = create_superuser() if superadmin else create_user("admin", Role.ADMIN)
    organization = Organization.objects.create(name="Own")
    if not superadmin:
        organization.users.add(actor)
    coach = create_user("private-coach", Role.COACH)
    organization.users.add(coach)
    team = Team.objects.create(name="Alpha", organization=organization, is_active=active)
    team.coaches.add(coach)

    response = client_for(actor).get(reverse("team-detail", kwargs={"team_id": team.pk}))

    assert response.status_code == 200
    assert response.json() == {
        "id": team.pk,
        "name": "Alpha",
        "organization_id": organization.pk,
        "is_active": active,
    }
    entry = LogEntry.objects.get(correlation_id=response["X-Correlation-ID"])
    assert entry.organization == organization
    assert entry.team == team
    assert entry.actor == actor
    assert entry.source == LogSource.TEAMS
    assert entry.operation == "team-detail"


@pytest.mark.parametrize("active", [False, True])
@pytest.mark.parametrize("attached", [False, True])
def test_foreign_and_missing_teams_have_identical_safe_refusals(active, attached):
    actor = create_user("admin", Role.ADMIN)
    own = Organization.objects.create(name="Own")
    if attached:
        own.users.add(actor)
    foreign = Organization.objects.create(name="Secret organization")
    team = Team.objects.create(name="Secret team", organization=foreign, is_active=active)
    client = client_for(actor)
    before = ActivityEntry.objects.count()

    hidden = client.get(reverse("team-detail", kwargs={"team_id": team.pk}))
    missing = client.get(reverse("team-detail", kwargs={"team_id": team.pk + 100}))

    assert hidden.status_code == missing.status_code == 404
    assert hidden.json() == missing.json() == {"detail": "Équipe introuvable."}
    assert ActivityEntry.objects.count() == before
    for response in (hidden, missing):
        entry = LogEntry.objects.get(correlation_id=response["X-Correlation-ID"])
        assert entry.organization == (own if attached else None)
        assert entry.team is None
        assert entry.team_name == ""
        assert "Secret" not in str(entry.__dict__)


@pytest.mark.parametrize("actor_kind", ["coach", "assigned-coach", "viewer", "inactive", "anon"])
@pytest.mark.parametrize("active", [False, True])
def test_detail_refuses_unauthorized_actors_without_disclosing_existence(actor_kind, active):
    organization = Organization.objects.create(name="Own")
    team = Team.objects.create(name="Alpha", organization=organization, is_active=active)
    client = APIClient(enforce_csrf_checks=True)
    if actor_kind != "anon":
        role = Role.COACH if "coach" in actor_kind else Role.VIEWER
        if actor_kind == "inactive":
            role = Role.ADMIN
        actor = create_user("actor", role, is_active=actor_kind != "inactive")
        organization.users.add(actor)
        if actor_kind == "assigned-coach":
            team.coaches.add(actor)
        client.force_login(actor)
    before = ActivityEntry.objects.count()

    existing = client.get(reverse("team-detail", kwargs={"team_id": team.pk}))
    missing = client.get(reverse("team-detail", kwargs={"team_id": team.pk + 100}))

    assert existing.status_code == missing.status_code == 403
    assert existing.json() == missing.json()
    assert set(existing.json()) == {"detail"}
    assert ActivityEntry.objects.count() == before
    assert not LogEntry.objects.exclude(team=None).exists()


@pytest.mark.parametrize("team_id", [0, 999999, 10**40])
def test_unknown_integer_ids_are_controlled_not_found(team_id):
    response = client_for(create_superuser()).get(
        reverse("team-detail", kwargs={"team_id": team_id})
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Équipe introuvable."}


def test_detail_rechecks_admin_membership_on_an_existing_session():
    actor = create_user("admin", Role.ADMIN)
    organization = Organization.objects.create(name="Own")
    organization.users.add(actor)
    team = Team.objects.create(name="Alpha", organization=organization)
    client = client_for(actor)
    detail = reverse("team-detail", kwargs={"team_id": team.pk})
    assert client.get(detail).status_code == 200

    organization.users.remove(actor)

    response = client.get(detail)
    assert response.status_code == 404
    assert response.json() == {"detail": "Équipe introuvable."}


@pytest.mark.parametrize("suffix", ["", "/", "abc/", "-1/", "1.5/"])
def test_missing_or_malformed_ids_remain_router_not_found(suffix):
    response = client_for(create_superuser()).get(f"/api/admin/teams/{suffix}")

    assert response.status_code == 404
    assert not Team.objects.exists()
    assert not ActivityEntry.objects.exists()
