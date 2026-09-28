from datetime import date, timedelta

import pytest
from django.core import mail
from django.core.management import call_command
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from assessments.application.schedule_notifications import following_due_date
from assessments.models import Evaluation, EvaluationSchedule, ScheduleMode
from identities.domain.users import Role
from identities.models import Organization
from teams.models import Team
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post


@pytest.fixture(autouse=True)
def email_settings(settings) -> None:
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    settings.FRONTEND_URL = "http://testserver"


def planning_context():
    organization = Organization.objects.create(name="North")
    team = Team.objects.create(organization=organization, name="Alpha")
    evaluation = Evaluation.objects.create(
        organization=organization,
        index=1,
        name="Maturité",
    )
    coach = create_user("coach", Role.COACH)
    coach.email = "coach@example.com"
    coach.save(update_fields=["email"])
    organization.users.add(coach)
    return organization, team, evaluation, coach


def logged_in_client() -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(create_superuser())
    client.get(reverse("session-current"))
    return client


def payload(organization, team, evaluation, mode=ScheduleMode.MONTHLY):
    data = {
        "organization_id": organization.pk,
        "team_id": team.pk,
        "evaluation_id": evaluation.pk,
        "mode": mode,
    }
    if mode != ScheduleMode.IMMEDIATE:
        data["first_due_date"] = str(timezone.localdate() + timedelta(days=7))
    return data


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_admin_attaches_coach_and_sends_future_planning_email(
    django_capture_on_commit_callbacks,
) -> None:
    organization, team, evaluation, coach = planning_context()
    data = {**payload(organization, team, evaluation), "coach_id": coach.pk}

    with django_capture_on_commit_callbacks(execute=True):
        response = csrf_post(logged_in_client(), reverse("evaluation-schedule-list"), data)

    schedule = EvaluationSchedule.objects.get()
    assert response.status_code == 201
    assert list(team.coaches.values_list("pk", flat=True)) == [coach.pk]
    assert schedule.next_due_date == schedule.first_due_date
    assert mail.outbox[0].to == ["coach@example.com"]
    assert "Équipe : Alpha" in mail.outbox[0].body
    assert "Évaluation : Maturité" in mail.outbox[0].body
    assert "Fréquence : Mensuelle" in mail.outbox[0].body


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_planning_refuses_team_without_deliverable_coach() -> None:
    organization, team, evaluation, coach = planning_context()
    client = logged_in_client()

    missing = csrf_post(
        client,
        reverse("evaluation-schedule-list"),
        payload(organization, team, evaluation),
    )
    coach.email = ""
    coach.save(update_fields=["email"])
    undeliverable = csrf_post(
        client,
        reverse("evaluation-schedule-list"),
        {**payload(organization, team, evaluation), "coach_id": coach.pk},
    )

    assert missing.status_code == 400
    assert undeliverable.status_code == 400
    assert not EvaluationSchedule.objects.exists()


@pytest.mark.django_db
@pytest.mark.api
def test_immediate_planning_sends_evaluation_link(
    django_capture_on_commit_callbacks,
) -> None:
    organization, team, evaluation, coach = planning_context()
    team.coaches.add(coach)

    with django_capture_on_commit_callbacks(execute=True):
        response = csrf_post(
            logged_in_client(),
            reverse("evaluation-schedule-list"),
            payload(organization, team, evaluation, ScheduleMode.IMMEDIATE),
        )

    assert response.status_code == 201
    assert "http://testserver/evaluations" in mail.outbox[0].body
    assert EvaluationSchedule.objects.get().next_due_date is None


@pytest.mark.django_db
def test_due_command_sends_link_and_advances_monthly_schedule(capsys) -> None:
    organization, team, evaluation, coach = planning_context()
    team.coaches.add(coach)
    today = timezone.localdate()
    schedule = EvaluationSchedule.objects.create(
        team=team,
        evaluation=evaluation,
        mode=ScheduleMode.MONTHLY,
        first_due_date=today,
        next_due_date=today,
    )

    call_command("send_due_evaluation_notifications")

    schedule.refresh_from_db()
    assert "http://testserver/evaluations" in mail.outbox[0].body
    assert schedule.next_due_date > today
    assert "1 planification(s) notifiée(s)." in capsys.readouterr().out


@pytest.mark.django_db
def test_due_command_closes_fixed_schedule_after_delivery() -> None:
    organization, team, evaluation, coach = planning_context()
    team.coaches.add(coach)
    today = timezone.localdate()
    schedule = EvaluationSchedule.objects.create(
        team=team,
        evaluation=evaluation,
        mode=ScheduleMode.FIXED,
        first_due_date=today,
        next_due_date=today,
    )

    call_command("send_due_evaluation_notifications")

    schedule.refresh_from_db()
    assert schedule.next_due_date is None
    assert len(mail.outbox) == 1


def test_monthly_and_quarterly_dates_keep_calendar_boundaries() -> None:
    assert following_due_date(ScheduleMode.MONTHLY, date(2027, 1, 31), date(2027, 1, 31)) == date(
        2027, 2, 28
    )
    assert following_due_date(
        ScheduleMode.QUARTERLY,
        date(2027, 11, 30),
        date(2027, 11, 30),
    ) == date(2028, 2, 29)
    assert following_due_date(
        ScheduleMode.MONTHLY,
        date(2027, 2, 28),
        date(2027, 2, 28),
        anchor_day=31,
    ) == date(2027, 3, 31)
    assert following_due_date(ScheduleMode.FIXED, date(2027, 1, 1), date(2027, 1, 1)) is None
