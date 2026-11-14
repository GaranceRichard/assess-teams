"""ARB-ORG-005: no business cascade, regardless of lifecycle state."""

from django.db.models import Q
from rest_framework.exceptions import ValidationError

from assessments.models import (
    Evaluation,
    EvaluationFamily,
    EvaluationRun,
    EvaluationRunQuestion,
    EvaluationSchedule,
    Question,
)
from journals.models import ActivityEntry, LogEntry
from notifications.models import EmailNotification
from teams.models import Team


def evaluation_scope(organization, prefix=""):
    return Q(**{prefix + "organization": organization}) | Q(
        **{prefix + "family__organization": organization}
    )


def schedule_scope(organization, prefix=""):
    return Q(**{prefix + "team__organization": organization}) | evaluation_scope(
        organization, prefix + "evaluation__"
    )


def run_scope(organization, prefix=""):
    return (
        Q(**{prefix + "organization": organization})
        | Q(**{prefix + "team__organization": organization})
        | evaluation_scope(organization, prefix + "evaluation__")
        | schedule_scope(organization, prefix + "schedule__")
    )


def assert_organization_deletable(organization):
    """Caller owns the writer lock and transaction before reading these invariants."""
    dependencies = (
        ("équipes", Team.objects.filter(organization=organization)),
        (
            "référentiels",
            EvaluationFamily.objects.filter(
                Q(organization=organization) | Q(versions__organization=organization)
            ),
        ),
        ("versions", Evaluation.objects.filter(evaluation_scope(organization))),
        ("questions", Question.objects.filter(evaluation_scope(organization, "evaluation__"))),
        ("planifications", EvaluationSchedule.objects.filter(schedule_scope(organization))),
        ("passations", EvaluationRun.objects.filter(run_scope(organization))),
        (
            "observations",
            EvaluationRunQuestion.objects.filter(
                run_scope(organization, "run__")
                | evaluation_scope(organization, "source_question__evaluation__")
            ),
        ),
        (
            "notifications",
            EmailNotification.objects.filter(
                Q(organization=organization)
                | Q(team__organization=organization)
                | evaluation_scope(organization, "evaluation__")
                | schedule_scope(organization, "schedule__")
            ),
        ),
    )
    reasons = [label for label, rows in dependencies if rows.exists()]
    if any(
        model.objects.filter(organization=organization)
        .exclude(organization_origin_id=organization.pk)
        .exists()
        for model in (ActivityEntry, LogEntry)
    ):
        reasons.append("provenance des traces non garantie")
    if reasons:
        raise ValidationError(
            {
                "detail": "Suppression refusée : dépendances protégées présentes — "
                + ", ".join(reasons)
                + "."
            }
        )
