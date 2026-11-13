import pytest
from django.urls import reverse

from identities.domain.users import Role
from identities.models import Organization
from journals.models import ActivityEntry, LogEntry
from teams.models import Team
from tests.identity_helpers import create_user
from tests.taking_helpers import client_for, complete, taking_context

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.fixture
def context():
    organization = Organization.objects.create(name="Own")
    coach = create_user("coach", Role.COACH)
    organization.users.add(coach)
    team = Team.objects.create(name="Assigned", organization=organization)
    team.coaches.add(coach)
    return organization, coach, team, client_for(coach)


def detail(team_id):
    return reverse("team-detail", kwargs={"team_id": team_id})


def collection(organization_id):
    return reverse("team-list", kwargs={"organization_id": organization_id})


def projection(team):
    return {
        "id": team.pk,
        "name": team.name,
        "organization_id": team.organization_id,
        "is_active": team.is_active,
    }


@pytest.mark.parametrize("active", [True, False])
def test_coach_reads_only_minimal_current_assigned_team(context, active):
    organization, _, team, client = context
    team.is_active = active
    team.save(update_fields=["is_active"])
    before = ActivityEntry.objects.count()

    response = client.get(detail(team.pk))

    assert response.status_code == 200
    assert response.json() == projection(team)
    assert ActivityEntry.objects.count() == before
    entry = LogEntry.objects.get(correlation_id=response["X-Correlation-ID"])
    assert entry.organization == organization
    assert entry.team == team


@pytest.mark.parametrize("paginated", [True, False])
@pytest.mark.parametrize("include_archived", [True, False])
def test_coach_list_contains_only_current_assigned_active_teams(
    context, paginated, include_archived
):
    organization, coach, team, client = context
    team.coaches.add(create_user("other-coach", Role.COACH))
    Team.objects.create(name="Unassigned", organization=organization)
    archive = Team.objects.create(name="Archived", organization=organization, is_active=False)
    foreign = Team.objects.create(
        name="Foreign", organization=Organization.objects.create(name="Foreign")
    )
    archive.coaches.add(coach)
    foreign.coaches.add(coach)
    query = {"include_archived": str(include_archived).lower()}
    if paginated:
        query["page"] = 1

    response = client.get(collection(organization.pk), query)

    assert response.status_code == 200
    data = response.json()
    assert (data["results"] if paginated else data) == [projection(team)]
    if paginated:
        assert data["count"] == 1
        assert data["next"] is data["previous"] is None


@pytest.mark.parametrize("loss", ["assignment", "membership"])
@pytest.mark.parametrize("active", [True, False])
def test_existing_session_rechecks_assignment_and_membership(context, loss, active):
    organization, coach, team, client = context
    team.is_active = active
    team.save(update_fields=["is_active"])
    assert client.get(detail(team.pk)).status_code == 200
    if loss == "assignment":
        team.coaches.remove(coach)
    else:
        organization.users.remove(coach)

    hidden = client.get(detail(team.pk))
    missing = client.get(detail(team.pk + 100))
    listed = client.get(collection(organization.pk))

    assert hidden.status_code == missing.status_code == 404
    assert hidden.json() == missing.json() == {"detail": "Équipe introuvable."}
    assert listed.status_code == (200 if loss == "assignment" else 404)
    if loss == "assignment":
        assert listed.json() == []
    for response in (hidden, missing):
        assert LogEntry.objects.get(correlation_id=response["X-Correlation-ID"]).team is None


@pytest.mark.parametrize("assigned", [True, False])
@pytest.mark.parametrize("active", [True, False])
def test_hidden_team_and_collection_match_nonexistent_refusal(context, assigned, active):
    organization, coach, _, client = context
    foreign = Organization.objects.create(name="Secret organization")
    team = Team.objects.create(
        name="Secret team", organization=foreign if assigned else organization, is_active=active
    )
    if assigned:
        team.coaches.add(coach)
    hidden = client.get(detail(team.pk))
    missing = client.get(detail(10**40))
    assert hidden.status_code == missing.status_code == 404
    assert hidden.json() == missing.json() == {"detail": "Équipe introuvable."}
    hidden_list = client.get(collection(foreign.pk))
    missing_list = client.get(collection(foreign.pk + 100))
    assert hidden_list.status_code == missing_list.status_code == 404
    assert hidden_list.json() == missing_list.json()
    for response in (hidden, missing, hidden_list, missing_list):
        entry = LogEntry.objects.get(correlation_id=response["X-Correlation-ID"])
        assert entry.team is None
        assert "Secret" not in str(entry.__dict__)


@pytest.mark.parametrize("completed", [True, False])
def test_run_assignment_never_grants_team_consultation(completed):
    organization, coach, _, run = taking_context()
    client = client_for(coach)
    if completed:
        assert complete(client, run).status_code == 200
    assert not run.team.coaches.filter(pk=coach.pk).exists()
    assert client.get(detail(run.team_id)).status_code == 404
    assert client.get(collection(organization.pk)).json() == []


@pytest.mark.parametrize("loss", ["inactive", "viewer", "no-membership"])
def test_existing_session_loses_team_access_when_identity_changes(context, loss):
    organization, coach, team, client = context
    if loss == "inactive":
        coach.is_active = False
        coach.save(update_fields=["is_active"])
    elif loss == "viewer":
        coach.role = Role.VIEWER
        coach.save(update_fields=["role"])
    else:
        organization.users.clear()
    expected = 404 if loss == "no-membership" else 403
    assert client.get(detail(team.pk)).status_code == expected
    assert client.get(collection(organization.pk)).status_code == expected


def test_coach_still_cannot_mutate_teams_or_consult_organizations(context):
    organization, _, team, client = context
    before = projection(team)
    csrf = {"HTTP_X_CSRFTOKEN": client.cookies["csrftoken"].value}
    payload = {"name": "Forbidden", "coach_ids": []}
    assert (
        client.post(collection(organization.pk), payload, format="json", **csrf).status_code == 403
    )
    assert client.put(detail(team.pk), payload, format="json", **csrf).status_code == 403
    assert client.delete(detail(team.pk), **csrf).status_code == 403
    assert client.get("/api/admin/organizations/").status_code == 403
    assert client.get(f"/api/admin/organizations/{organization.pk}/").status_code == 403
    team.refresh_from_db()
    assert projection(team) == before
    assert Team.objects.count() == 1
    assert not ActivityEntry.objects.exists()
