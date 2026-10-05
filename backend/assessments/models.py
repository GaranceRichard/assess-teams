from django.db import models

from assessments.run_models import (  # noqa: F401
    EvaluationRun,
    EvaluationRunQuestion,
    EvaluationRunState,
)


class EvaluationStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    VALIDATED = "VALIDATED", "Validée"
    ARCHIVED = "ARCHIVED", "Archivée"


class Evaluation(models.Model):
    organization = models.ForeignKey(
        "identities.Organization",
        on_delete=models.CASCADE,
        related_name="evaluations",
    )
    index = models.PositiveIntegerField()
    name = models.CharField(max_length=255)
    status = models.CharField(
        max_length=10,
        choices=EvaluationStatus.choices,
        default=EvaluationStatus.DRAFT,
    )

    class Meta:
        ordering = ("index", "pk")
        constraints = [
            models.CheckConstraint(condition=models.Q(index__gte=1), name="evaluation_index_gte_1"),
            models.UniqueConstraint(
                fields=("organization", "index"),
                name="evaluation_index_unique_per_organization",
            ),
        ]


class Question(models.Model):
    evaluation = models.ForeignKey(
        Evaluation,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    index = models.PositiveIntegerField()
    name = models.CharField(max_length=255)

    class Meta:
        ordering = ("index", "pk")
        constraints = [
            models.CheckConstraint(condition=models.Q(index__gte=1), name="question_index_gte_1"),
            models.UniqueConstraint(
                fields=("evaluation", "index"),
                name="question_index_unique_per_evaluation",
            ),
        ]


class ScheduleMode(models.TextChoices):
    IMMEDIATE = "immediate", "Tout de suite"
    FIXED = "fixed", "À date fixe"
    MONTHLY = "monthly", "Mensuelle"
    QUARTERLY = "quarterly", "Trimestrielle"


class EvaluationSchedule(models.Model):
    team = models.ForeignKey(
        "teams.Team",
        on_delete=models.CASCADE,
        related_name="evaluation_schedules",
    )
    evaluation = models.ForeignKey(
        Evaluation,
        on_delete=models.CASCADE,
        related_name="schedules",
    )
    assignee = models.ForeignKey(
        "identities.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_evaluation_schedules",
    )
    mode = models.CharField(max_length=12, choices=ScheduleMode.choices)
    first_due_date = models.DateField()
    next_due_date = models.DateField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("first_due_date", "pk")
        constraints = [
            models.UniqueConstraint(
                fields=("team", "evaluation"),
                name="schedule_unique_per_team_evaluation",
            )
        ]
