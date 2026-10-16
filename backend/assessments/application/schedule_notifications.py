from calendar import monthrange
from datetime import date
from hashlib import sha256

from django.conf import settings
from django.db.models import F
from django.utils import timezone
from django.utils.formats import date_format

from assessments.application.expected_evaluations import ensure_expected_evaluation
from assessments.models import EvaluationSchedule, ScheduleMode
from config.sqlite_contention import retryable_sqlite_atomic
from journals.models import LogLevel, LogSource
from journals.services import record_log
from notifications.queue import enqueue_email


def _recipient_coaches(schedule: EvaluationSchedule):
    return schedule.team.coaches.filter(
        role="Coach",
        is_active=True,
        email__gt="",
        organizations=schedule.team.organization,
    ).distinct()


def _recipients(schedule: EvaluationSchedule):
    if schedule.requires_reassignment:
        return []
    assignee = schedule.assignee
    if (
        assignee
        and assignee.is_active
        and assignee.email
        and (
            assignee.is_superuser
            or schedule.team.organization.users.filter(pk=assignee.pk).exists()
        )
    ):
        return [assignee]
    return list(_recipient_coaches(schedule))


def _send_to_recipients(schedule: EvaluationSchedule, subject: str, body: str) -> int:
    recipients = _recipients(schedule)
    for recipient in recipients:
        digest = sha256(f"{body}:{recipient.email}".encode()).hexdigest()[:32]
        enqueue_email(
            schedule_notification=True,
            schedule=schedule,
            subject=subject,
            body=f"Bonjour {recipient.username},\n\n{body}",
            recipient=recipient.email,
            event_key=f"schedule:{schedule.pk}:{subject}:{schedule.next_due_date}:{recipient.pk}:{digest}",
            user=recipient,
            organization=schedule.team.organization,
            team=schedule.team,
            evaluation=schedule.evaluation,
        )
    count = len(recipients)
    if not count:
        record_log(
            level=LogLevel.WARNING,
            source=LogSource.NOTIFICATIONS,
            actor=schedule.assignee,
            organization=schedule.team.organization,
            team=schedule.team,
            evaluation=schedule.evaluation,
            operation="Envoi d’une notification d’évaluation",
            message="Notification d’évaluation non envoyée : aucun destinataire éligible.",
        )
    return count


def _evaluation_link() -> str:
    return f"{settings.FRONTEND_URL.rstrip('/')}/evaluations"


def send_planning_confirmation(schedule: EvaluationSchedule) -> int:
    body = (
        f"Équipe : {schedule.team.name}\n"
        f"Évaluation : {schedule.evaluation.name}\n"
        f"Fréquence : {schedule.get_mode_display()}\n"
        f"Prochaine évaluation : {date_format(schedule.next_due_date, 'DATE_FORMAT')}"
    )
    return _send_to_recipients(schedule, "Évaluation planifiée", body)


def send_due_notification(schedule: EvaluationSchedule) -> int:
    body = (
        f"L’évaluation prévue est disponible.\n"
        f"Équipe : {schedule.team.name}\n"
        f"Évaluation : {schedule.evaluation.name}\n"
        f"Accéder à l’évaluation : {_evaluation_link()}"
    )
    return _send_to_recipients(schedule, "Votre évaluation est disponible", body)


def _add_months(value: date, months: int, anchor_day: int) -> date:
    month_index = value.year * 12 + value.month - 1 + months
    year, zero_based_month = divmod(month_index, 12)
    month = zero_based_month + 1
    day = min(anchor_day, monthrange(year, month)[1])
    return date(year, month, day)


def following_due_date(
    mode: str,
    due_date: date,
    reference_date: date,
    anchor_day: int | None = None,
) -> date | None:
    months = {
        ScheduleMode.MONTHLY: 1,
        ScheduleMode.QUARTERLY: 3,
    }.get(mode)
    if months is None:
        return None
    day = anchor_day or due_date.day
    candidate = _add_months(due_date, months, day)
    while candidate <= reference_date:
        candidate = _add_months(candidate, months, day)
    return candidate


@retryable_sqlite_atomic
def deliver_due_schedule(schedule: EvaluationSchedule, reference_date: date) -> bool:
    EvaluationSchedule.objects.filter(pk=schedule.pk).update(next_due_date=F("next_due_date"))
    schedule.refresh_from_db()
    if not schedule.next_due_date or schedule.next_due_date > reference_date:
        return False
    if schedule.requires_reassignment:
        return False
    ensure_expected_evaluation(schedule, schedule.next_due_date)
    if send_due_notification(schedule) == 0:
        return False
    schedule.next_due_date = following_due_date(
        schedule.mode,
        schedule.next_due_date,
        reference_date,
        schedule.first_due_date.day,
    )
    schedule.save(update_fields=["next_due_date"])
    return True


def notify_schedule_created(schedule_id: int) -> None:
    schedule = EvaluationSchedule.objects.select_related(
        "team__organization",
        "evaluation",
        "assignee",
    ).get(pk=schedule_id)
    today = timezone.localdate()
    if schedule.next_due_date and schedule.next_due_date <= today:
        deliver_due_schedule(schedule, today)
    else:
        send_planning_confirmation(schedule)


def deliver_due_schedules(reference_date: date | None = None) -> int:
    today = reference_date or timezone.localdate()
    schedules = EvaluationSchedule.objects.filter(
        next_due_date__lte=today,
    ).select_related("team__organization", "evaluation", "assignee")
    return sum(deliver_due_schedule(schedule, today) for schedule in schedules)
