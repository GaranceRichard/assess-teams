from unittest.mock import patch

import pytest
from django.db import IntegrityError, connection
from django.urls import reverse
from django.utils import timezone

from assessments.application.schedule_notifications import deliver_due_schedule
from assessments.models import EvaluationRun, EvaluationSchedule, ScheduleMode
from journals.models import ActivityEntry, LogEntry
from tests.managed_user_helpers import csrf_post
from tests.test_evaluation_schedules import planning_context as named_planning_context
from tests.test_schedule_notifications import logged_in_client, payload, planning_context

pytestmark = [
    pytest.mark.django_db(transaction=True),
    pytest.mark.functional,
    pytest.mark.integration,
]


def due_schedule(name="North"):
    _, team, evaluation = named_planning_context(name)
    coach = team.coaches.get()
    return EvaluationSchedule.objects.create(
        team=team,
        evaluation=evaluation,
        assignee=coach,
        mode=ScheduleMode.MONTHLY,
        first_due_date=timezone.localdate(),
        next_due_date=timezone.localdate(),
    )


def test_due_delivery_commits_run_notification_log_and_next_date(settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    schedule = due_schedule()
    assert deliver_due_schedule(schedule, timezone.localdate())
    schedule.refresh_from_db()
    run = schedule.runs.get()
    assert run.organization_id == schedule.team.organization_id
    assert run.assignee_id == schedule.assignee_id
    assert schedule.next_due_date > schedule.first_due_date
    assert LogEntry.objects.filter(source="notifications").count() == 1


@pytest.mark.parametrize("failure", ["mail", "date_save"])
def test_due_failure_rolls_back_new_run_and_log_preserves_prior_commit(failure, settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    previous = due_schedule()
    assert deliver_due_schedule(previous, timezone.localdate())
    committed_date = EvaluationSchedule.objects.get(pk=previous.pk).next_due_date
    schedule = due_schedule("Other")
    target = (
        "assessments.application.schedule_notifications._send_due_email"
        if failure == "mail"
        else "assessments.models.EvaluationSchedule.save"
    )
    with patch(target, side_effect=IntegrityError("private-sql-detail")):
        with pytest.raises(IntegrityError):
            deliver_due_schedule(schedule, timezone.localdate())
    schedule.refresh_from_db()
    assert schedule.next_due_date == schedule.first_due_date
    assert not schedule.runs.exists()
    assert previous.runs.count() == 1
    assert EvaluationSchedule.objects.get(pk=previous.pk).next_due_date == committed_date
    assert EvaluationRun.objects.count() == LogEntry.objects.count() == 1


def test_notification_failure_after_commit_keeps_creation_success(settings, caplog):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    organization, team, evaluation, _ = planning_context()
    with patch(
        "assessments.adapters.api.schedule_views.notify_schedule_created",
        side_effect=RuntimeError("smtp-unavailable"),
    ):
        response = csrf_post(
            logged_in_client(),
            reverse("evaluation-schedule-list"),
            payload(organization, team, evaluation),
        )
    assert response.status_code == 201
    schedule = EvaluationSchedule.objects.get(pk=response.json()["id"])
    assert schedule.runs.count() == 1
    assert schedule.team.coaches.filter(pk=schedule.assignee_id).exists()
    assert ActivityEntry.objects.count() == 1
    assert "smtp-unavailable" in caplog.text


def test_due_smtp_runs_outside_sqlite_transaction(settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    schedule = due_schedule()
    from assessments.application.schedule_notifications import send_mail

    def send(*args, **kwargs):
        assert not connection.in_atomic_block
        return send_mail(*args, **kwargs)

    with patch("assessments.application.schedule_notifications.send_mail", send):
        assert deliver_due_schedule(schedule, timezone.localdate())
