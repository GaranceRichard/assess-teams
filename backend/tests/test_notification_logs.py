from datetime import date

import pytest
from django.core import mail

from assessments.application.schedule_notifications import send_due_notification
from assessments.models import Evaluation, EvaluationSchedule, EvaluationStatus, ScheduleMode
from identities.domain.users import Role
from identities.models import Organization
from journals.models import LogEntry, LogLevel, LogSource
from teams.models import Team
from tests.identity_helpers import create_user


@pytest.fixture(autouse=True)
def email_settings(settings) -> None:
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"


def schedule_context(with_assignee: bool) -> EvaluationSchedule:
    organization = Organization.objects.create(name="North")
    team = Team.objects.create(organization=organization, name="Alpha")
    evaluation = Evaluation.objects.create(
        organization=organization,
        index=1,
        name="Maturité",
        status=EvaluationStatus.VALIDATED,
    )
    assignee = None
    if with_assignee:
        assignee = create_user("coach", Role.COACH)
        assignee.email = "coach@example.com"
        assignee.save(update_fields=["email"])
        organization.users.add(assignee)
    return EvaluationSchedule.objects.create(
        team=team,
        evaluation=evaluation,
        assignee=assignee,
        mode=ScheduleMode.FIXED,
        first_due_date=date(2026, 9, 29),
        next_due_date=date(2026, 9, 29),
    )


@pytest.mark.django_db
def test_sent_evaluation_notification_records_info() -> None:
    schedule = schedule_context(with_assignee=True)

    assert send_due_notification(schedule) == 1

    log = LogEntry.objects.get()
    assert log.level == LogLevel.INFO
    assert log.source == LogSource.NOTIFICATIONS
    assert log.organization == schedule.team.organization
    assert log.team == schedule.team
    assert log.actor == schedule.assignee
    assert log.message == "Notification d’évaluation envoyée."
    assert len(mail.outbox) == 1


@pytest.mark.django_db
def test_undeliverable_notification_records_warning() -> None:
    schedule = schedule_context(with_assignee=False)

    assert send_due_notification(schedule) == 0

    log = LogEntry.objects.get()
    assert log.level == LogLevel.WARNING
    assert log.source == LogSource.NOTIFICATIONS
    assert log.message == ("Notification d’évaluation non envoyée : aucun destinataire éligible.")
    assert not mail.outbox
