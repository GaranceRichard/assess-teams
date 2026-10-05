from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from assessments.models import Evaluation, EvaluationSchedule, EvaluationStatus, ScheduleMode
from identities.domain.users import Role
from identities.models import Organization, User
from journals.models import ActivityAction, ActivityEntry
from teams.models import Team
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post


def logged_in_client(user: User) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


def planning_context(name: str = "North") -> tuple[Organization, Team, Evaluation]:
    organization = Organization.objects.create(name=name)
    team = Team.objects.create(organization=organization, name=f"{name} Team")
    coach = create_user(f"{name}-coach", Role.COACH)
    coach.email = f"{coach.username}@example.com"
    coach.save(update_fields=["email"])
    organization.users.add(coach)
    team.coaches.add(coach)
    evaluation = Evaluation.objects.create(
        organization=organization,
        index=1,
        name=f"{name} Evaluation",
        status=EvaluationStatus.VALIDATED,
    )
    return organization, team, evaluation


def payload(
    organization: Organization,
    team: Team,
    evaluation: Evaluation,
    mode: str,
) -> dict:
    data = {
        "organization_id": organization.pk,
        "team_id": team.pk,
        "evaluation_id": evaluation.pk,
        "assignee_id": team.coaches.get().pk,
        "mode": mode,
    }
    if mode != ScheduleMode.IMMEDIATE:
        data["first_due_date"] = str(timezone.localdate() + timedelta(days=7))
    return data


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_superadmin_plans_every_supported_schedule_mode() -> None:
    client = logged_in_client(create_superuser())
    route = reverse("evaluation-schedule-list")

    for index, mode in enumerate(ScheduleMode.values, start=1):
        organization, team, evaluation = planning_context(f"Org {index}")
        response = csrf_post(client, route, payload(organization, team, evaluation, mode))
        assert response.status_code == 201
        assert response.json()["mode"] == mode
        assert response.json()["organization_id"] == organization.pk

    assert EvaluationSchedule.objects.count() == 4
    assert EvaluationSchedule.objects.get(mode=ScheduleMode.IMMEDIATE).first_due_date == (
        timezone.localdate()
    )
    assert ActivityEntry.objects.filter(action=ActivityAction.EVALUATION_SCHEDULED).count() == 4


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_admin_sees_and_plans_only_inside_its_organization() -> None:
    admin = create_user("admin", Role.ADMIN)
    organization, team, evaluation = planning_context()
    hidden_organization, hidden_team, hidden_evaluation = planning_context("South")
    organization.users.add(admin)
    hidden = EvaluationSchedule.objects.create(
        team=hidden_team,
        evaluation=hidden_evaluation,
        mode=ScheduleMode.IMMEDIATE,
        first_due_date=timezone.localdate(),
    )
    client = logged_in_client(admin)
    route = reverse("evaluation-schedule-list")

    created = csrf_post(
        client,
        route,
        payload(organization, team, evaluation, ScheduleMode.MONTHLY),
    )
    injected = csrf_post(
        client,
        route,
        payload(hidden_organization, hidden_team, hidden_evaluation, ScheduleMode.FIXED),
    )

    assert created.status_code == 201
    assert injected.status_code == 404
    assert [item["id"] for item in client.get(route).json()] == [created.json()["id"]]
    assert EvaluationSchedule.objects.filter(pk=hidden.pk).exists()


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_planning_refuses_unauthorized_roles(role: Role) -> None:
    client = logged_in_client(create_user("actor", role))
    assert client.get(reverse("evaluation-schedule-list")).status_code == 403


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.parametrize("case", ["missing_date", "past_date", "immediate_date", "duplicate"])
def test_planning_rejects_incoherent_configuration(case: str) -> None:
    client = logged_in_client(create_superuser())
    organization, team, evaluation = planning_context()
    route = reverse("evaluation-schedule-list")
    data = payload(organization, team, evaluation, ScheduleMode.MONTHLY)
    if case == "missing_date":
        data.pop("first_due_date")
    elif case == "past_date":
        data["first_due_date"] = str(timezone.localdate() - timedelta(days=1))
    elif case == "immediate_date":
        data["mode"] = ScheduleMode.IMMEDIATE
    else:
        assert csrf_post(client, route, data).status_code == 201

    response = csrf_post(client, route, data)

    assert response.status_code == 400
    assert EvaluationSchedule.objects.count() == (1 if case == "duplicate" else 0)


@pytest.mark.django_db
@pytest.mark.api
def test_planning_refuses_inactive_team_and_cross_organization_evaluation() -> None:
    client = logged_in_client(create_superuser())
    organization, team, evaluation = planning_context()
    _, _, other_evaluation = planning_context("South")
    route = reverse("evaluation-schedule-list")
    team.is_active = False
    team.save(update_fields=["is_active"])

    inactive = csrf_post(
        client,
        route,
        payload(organization, team, evaluation, ScheduleMode.FIXED),
    )
    team.is_active = True
    team.save(update_fields=["is_active"])
    crossed = csrf_post(
        client,
        route,
        payload(organization, team, other_evaluation, ScheduleMode.FIXED),
    )

    assert inactive.status_code == 404
    assert crossed.status_code == 404
    assert not EvaluationSchedule.objects.exists()
