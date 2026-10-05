from datetime import timedelta

import pytest
from django.core import mail
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from assessments.models import Evaluation, EvaluationStatus, ScheduleMode
from identities.domain.users import Role
from identities.models import Organization
from teams.models import Team
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post


def client_for(user) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


def context():
    organization = Organization.objects.create(name="North")
    admin = create_user("admin", Role.ADMIN)
    coach = create_user("coach", Role.COACH)
    coach.email = "coach@example.com"
    coach.save(update_fields=["email"])
    organization.users.add(admin, coach)
    team = Team.objects.create(organization=organization, name="Alpha")
    team.coaches.add(coach)
    evaluation = Evaluation.objects.create(
        organization=organization,
        index=1,
        name="Maturité",
        status=EvaluationStatus.VALIDATED,
    )
    return organization, admin, team, evaluation


def payload(organization, team, evaluation, assignee_id: int) -> dict:
    return {
        "organization_id": organization.pk,
        "team_id": team.pk,
        "evaluation_id": evaluation.pk,
        "assignee_id": assignee_id,
        "mode": ScheduleMode.MONTHLY,
        "first_due_date": str(timezone.localdate() + timedelta(days=7)),
    }


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_superadmin_assigns_itself_to_an_organization_schedule(
    django_capture_on_commit_callbacks,
) -> None:
    organization, _, team, evaluation = context()
    root = create_superuser()
    root.email = "root@example.com"
    root.save(update_fields=["email"])

    with django_capture_on_commit_callbacks(execute=True):
        response = csrf_post(
            client_for(root),
            reverse("evaluation-schedule-list"),
            payload(organization, team, evaluation, root.pk),
        )

    assert response.status_code == 201
    assert response.json()["assignee_identifier"] == "root"
    assert response.json()["assignee_role"] == "Superadmin"
    assert [message.to for message in mail.outbox] == [["root@example.com"]]


@pytest.mark.django_db
@pytest.mark.api
def test_admin_cannot_assign_a_superadmin() -> None:
    organization, admin, team, evaluation = context()
    root = create_superuser()
    root.email = "root@example.com"
    root.save(update_fields=["email"])

    response = csrf_post(
        client_for(admin),
        reverse("evaluation-schedule-list"),
        payload(organization, team, evaluation, root.pk),
    )

    assert response.status_code == 404
