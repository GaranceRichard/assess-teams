from smtplib import SMTPDataError
from unittest.mock import patch

import pytest
from django.core import mail
from django.urls import reverse
from django.utils import timezone

from assessments.application.schedule_notifications import (
    deliver_due_schedule,
    send_due_notification,
)
from assessments.models import EvaluationSchedule, ScheduleMode
from identities.application.password_delivery import deliver_password_email
from identities.password_models import PasswordResetDelivery
from notifications.delivery import deliver_pending_emails, retry_notifications
from notifications.models import EmailNotification
from tests.managed_user_helpers import authenticated_superadmin_client, csrf_post
from tests.test_notification_logs import schedule_context
from tests.test_schedule_notifications import payload, planning_context

pytestmark = [pytest.mark.django_db(transaction=True), pytest.mark.functional, pytest.mark.api]


@pytest.fixture(autouse=True)
def email_settings(settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    settings.EMAIL_DELIVER_ON_COMMIT = True


def test_smtp_failure_cannot_turn_committed_invitation_into_http_failure():
    client, _ = authenticated_superadmin_client()
    with patch(
        "django.core.mail.message.EmailMessage.send", side_effect=SMTPDataError(451, b"private")
    ):
        response = csrf_post(
            client,
            reverse("managed-user-list"),
            {
                "identifier": "invited",
                "email": "invited@example.com",
                "role": "Coach",
            },
        )
    assert response.status_code == 201
    notification = EmailNotification.objects.get()
    assert notification.user_id == response.data["id"] and notification.state == "retry"
    EmailNotification.objects.update(next_attempt_at=timezone.now())
    assert deliver_pending_emails() == {"sent": 1}
    assert len(mail.outbox) == 1


def test_smtp_failure_cannot_turn_committed_planning_into_http_failure():
    organization, team, evaluation, coach = planning_context()
    client, _ = authenticated_superadmin_client()
    with patch(
        "django.core.mail.message.EmailMessage.send", side_effect=SMTPDataError(451, b"private")
    ):
        response = csrf_post(
            client,
            reverse("evaluation-schedule-list"),
            payload(organization, team, evaluation, ScheduleMode.IMMEDIATE),
        )
    assert response.status_code == 201
    schedule = EvaluationSchedule.objects.get()
    assert schedule.next_due_date is None and schedule.runs.count() == 1
    assert EmailNotification.objects.get().state == "retry"
    assert not deliver_due_schedule(schedule, timezone.localdate())


def test_partial_failure_retries_only_failed_recipient_and_keeps_business_occurrence():
    schedule = schedule_context(with_assignee=True)
    coach = schedule.assignee
    other = type(coach).objects.create_user(
        username="other", email="other@example.com", role="Coach"
    )
    schedule.team.organization.users.add(other)
    schedule.team.coaches.add(coach, other)
    schedule.assignee = None
    schedule.save()
    with patch(
        "notifications.transport.EmailMessage.send", side_effect=[1, SMTPDataError(451, b"x")]
    ):
        assert deliver_due_schedule(schedule, timezone.localdate())
    schedule.refresh_from_db()
    assert schedule.next_due_date is None
    assert sorted(EmailNotification.objects.values_list("state", flat=True)) == ["retry", "sent"]
    EmailNotification.objects.update(next_attempt_at=timezone.now())
    assert deliver_pending_emails() == {"sent": 1}
    assert len(mail.outbox) == 1 and mail.outbox[0].to == [other.email]
    assert retry_notifications(EmailNotification.objects.all()) == 0


def test_due_occurrence_is_idempotent_but_another_recipient_is_independent(settings):
    settings.EMAIL_DELIVER_ON_COMMIT = False
    schedule = schedule_context(with_assignee=True)
    assert send_due_notification(schedule) == send_due_notification(schedule) == 1
    assert EmailNotification.objects.count() == 1
    schedule.assignee.email = "changed@example.com"
    schedule.assignee.save()
    assert send_due_notification(schedule) == 1
    assert EmailNotification.objects.count() == 2


def test_password_delivery_checks_acceptance_and_preserves_uncertain_failure(password_context):
    _, user = password_context
    delivery = PasswordResetDelivery.objects.create(email=user.email)
    with patch("notifications.transport.EmailMessage.send", return_value=0):
        assert deliver_password_email(delivery.pk) == "retry"
    delivery.refresh_from_db()
    assert delivery.state == "retry"
    delivery.next_attempt_at = timezone.now()
    delivery.save()
    with patch("notifications.transport.EmailMessage.send", side_effect=TimeoutError("private")):
        assert deliver_password_email(delivery.pk) == "unknown"
    delivery.refresh_from_db()
    assert delivery.state == "unknown" and delivery.error_code == "connection_uncertain"
    assert deliver_password_email(delivery.pk) == "skipped"


@pytest.mark.parametrize(
    "change", ["disabled", "email", "suspended", "removed", "deleted", "coach_removed", "role"]
)
def test_planning_retry_cancels_notification_when_recipient_is_no_longer_eligible(settings, change):
    settings.EMAIL_DELIVER_ON_COMMIT = False
    schedule = schedule_context(with_assignee=True)
    coach = schedule.assignee
    if change in {"coach_removed", "role"}:
        schedule.team.coaches.add(coach)
        schedule.assignee = None
        schedule.save()
    send_due_notification(schedule)
    if change == "coach_removed":
        schedule.team.coaches.remove(coach)
    elif change == "role":
        coach.role = "Viewer"
        coach.save()
    elif change == "disabled":
        schedule.assignee.is_active = False
        schedule.assignee.save()
    elif change == "email":
        schedule.assignee.email = "new@example.com"
        schedule.assignee.save()
    elif change == "suspended":
        schedule.requires_reassignment = True
        schedule.save()
    elif change == "removed":
        schedule.team.organization.users.remove(schedule.assignee)
    elif change == "deleted":
        schedule.delete()
    assert deliver_pending_emails() == {"cancelled": 1}
    assert not mail.outbox


def test_explicit_reassignment_resumes_a_cancelled_message_without_duplicating_an_accepted_one(
    settings,
):
    settings.EMAIL_DELIVER_ON_COMMIT = False
    schedule = schedule_context(with_assignee=True)
    send_due_notification(schedule)
    schedule.requires_reassignment = True
    schedule.save()
    assert deliver_pending_emails() == {"cancelled": 1}
    schedule.requires_reassignment = False
    schedule.save()
    send_due_notification(schedule)
    assert EmailNotification.objects.count() == 1
    assert deliver_pending_emails() == {"sent": 1}
    send_due_notification(schedule)
    assert deliver_pending_emails() == {}
    assert len(mail.outbox) == 1
