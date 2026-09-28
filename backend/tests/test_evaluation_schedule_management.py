from datetime import timedelta

import pytest
from django.core import mail
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from assessments.models import Evaluation, EvaluationSchedule, ScheduleMode
from identities.domain.users import Role
from identities.models import Organization
from journals.models import ActivityAction, ActivityEntry
from teams.models import Team
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post, csrf_put


def client_for(user) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


def member(name: str, role: Role):
    user = create_user(name, role)
    user.email = f"{name}@example.com"
    user.save(update_fields=["email"])
    return user


def schedule_payload(organization, team, evaluation, assignee, mode=ScheduleMode.MONTHLY):
    data = {
        "organization_id": organization.pk,
        "team_id": team.pk,
        "evaluation_id": evaluation.pk,
        "assignee_id": assignee.pk,
        "mode": mode,
    }
    if mode != ScheduleMode.IMMEDIATE:
        data["first_due_date"] = str(timezone.localdate() + timedelta(days=7))
    return data


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_admin_assigns_planning_to_admin_while_team_has_coach(
    django_capture_on_commit_callbacks,
) -> None:
    organization = Organization.objects.create(name="North")
    actor = member("actor", Role.ADMIN)
    assignee = member("responsible", Role.ADMIN)
    coach = member("coach", Role.COACH)
    organization.users.add(actor, assignee, coach)
    team = Team.objects.create(organization=organization, name="Alpha")
    team.coaches.add(coach)
    evaluation = Evaluation.objects.create(
        organization=organization,
        index=1,
        name="Maturité",
    )

    with django_capture_on_commit_callbacks(execute=True):
        response = csrf_post(
            client_for(actor),
            reverse("evaluation-schedule-list"),
            schedule_payload(organization, team, evaluation, assignee),
        )

    assert response.status_code == 201
    assert response.json()["assignee_identifier"] == "responsible"
    assert response.json()["organization_name"] == "North"
    assert list(team.coaches.values_list("pk", flat=True)) == [coach.pk]
    assert [message.to for message in mail.outbox] == [["responsible@example.com"]]


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize("actor_kind", ["admin", "superadmin"])
def test_admin_or_superadmin_updates_and_deletes_every_planning_parameter(
    actor_kind: str,
) -> None:
    organization = Organization.objects.create(name="North")
    coach = member("coach", Role.COACH)
    admin = member("admin", Role.ADMIN)
    organization.users.add(coach, admin)
    first_team = Team.objects.create(organization=organization, name="Alpha")
    second_team = Team.objects.create(organization=organization, name="Beta")
    first_evaluation = Evaluation.objects.create(
        organization=organization,
        index=1,
        name="Initiale",
    )
    second_evaluation = Evaluation.objects.create(
        organization=organization,
        index=2,
        name="Cible",
    )
    schedule = EvaluationSchedule.objects.create(
        team=first_team,
        evaluation=first_evaluation,
        assignee=coach,
        mode=ScheduleMode.IMMEDIATE,
        first_due_date=timezone.localdate(),
    )
    client = client_for(admin if actor_kind == "admin" else create_superuser())
    route = reverse("evaluation-schedule-detail", kwargs={"schedule_id": schedule.pk})
    update = schedule_payload(
        organization,
        second_team,
        second_evaluation,
        admin,
        ScheduleMode.QUARTERLY,
    )

    response = csrf_put(client, route, update)

    assert response.status_code == 200
    assert response.json()["team_name"] == "Beta"
    assert response.json()["evaluation_name"] == "Cible"
    assert response.json()["assignee_identifier"] == "admin"
    assert response.json()["mode"] == ScheduleMode.QUARTERLY
    assert ActivityEntry.objects.filter(action=ActivityAction.EVALUATION_SCHEDULE_UPDATED).exists()

    deleted = client.delete(route, HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value)

    assert deleted.status_code == 204
    assert not EvaluationSchedule.objects.exists()
    assert ActivityEntry.objects.filter(action=ActivityAction.EVALUATION_SCHEDULE_DELETED).exists()


@pytest.mark.django_db
@pytest.mark.api
def test_update_refuses_assignee_from_another_organization() -> None:
    organization = Organization.objects.create(name="North")
    other = Organization.objects.create(name="South")
    actor = member("actor", Role.ADMIN)
    coach = member("coach", Role.COACH)
    outsider = member("outsider", Role.ADMIN)
    organization.users.add(actor, coach)
    other.users.add(outsider)
    team = Team.objects.create(organization=organization, name="Alpha")
    evaluation = Evaluation.objects.create(organization=organization, index=1, name="Eval")
    schedule = EvaluationSchedule.objects.create(
        team=team,
        evaluation=evaluation,
        assignee=coach,
        mode=ScheduleMode.IMMEDIATE,
        first_due_date=timezone.localdate(),
    )

    response = csrf_put(
        client_for(actor),
        reverse("evaluation-schedule-detail", kwargs={"schedule_id": schedule.pk}),
        schedule_payload(organization, team, evaluation, outsider),
    )

    schedule.refresh_from_db()
    assert response.status_code == 404
    assert schedule.assignee == coach
