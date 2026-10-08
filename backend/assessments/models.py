import uuid

from django.db import models, transaction

from assessments.run_models import (  # noqa: F401
    EvaluationRun,
    EvaluationRunQuestion,
    EvaluationRunState,
)


class EvaluationStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    VALIDATED = "VALIDATED", "Validée"
    ARCHIVED = "ARCHIVED", "Archivée"


class EvaluationFamily(models.Model):
    organization = models.ForeignKey(
        "identities.Organization", on_delete=models.CASCADE, related_name="evaluation_families"
    )
    name = models.CharField(max_length=255)
    next_version = models.PositiveIntegerField(default=2)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(next_version__gte=2), name="family_next_gte_2"
            )
        ]


class Evaluation(models.Model):
    organization = models.ForeignKey(
        "identities.Organization",
        on_delete=models.CASCADE,
        related_name="evaluations",
    )
    family = models.ForeignKey(EvaluationFamily, on_delete=models.CASCADE, related_name="versions")
    version = models.PositiveIntegerField(default=1)
    index = models.PositiveIntegerField()
    name = models.CharField(max_length=255)
    status = models.CharField(
        max_length=10,
        choices=EvaluationStatus.choices,
        default=EvaluationStatus.DRAFT,
    )

    def save(self, *args, **kwargs):
        # Preserve direct ORM creation used by bootstrap and existing integrations.
        with transaction.atomic():
            if not self.family_id:
                self.family = EvaluationFamily.objects.create(
                    organization_id=self.organization_id, name=self.name
                )
            if self.family.organization_id != self.organization_id:
                raise ValueError("La famille doit appartenir à la même organisation.")
            super().save(*args, **kwargs)

    class Meta:
        ordering = ("index", "pk")
        constraints = [
            models.CheckConstraint(
                condition=models.Q(version__gte=1), name="evaluation_version_gte_1"
            ),
            models.UniqueConstraint(
                fields=("family", "version"), name="evaluation_family_version_unique"
            ),
            models.UniqueConstraint(
                fields=("family",),
                condition=models.Q(status=EvaluationStatus.VALIDATED),
                name="evaluation_one_validated_per_family",
            ),
            models.CheckConstraint(condition=models.Q(index__gte=1), name="evaluation_index_gte_1"),
            models.UniqueConstraint(
                fields=("organization", "index"),
                name="evaluation_index_unique_per_organization",
            ),
        ]


class Question(models.Model):
    lineage_id = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    evaluation = models.ForeignKey(
        Evaluation,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    index = models.PositiveIntegerField()
    name = models.CharField(max_length=255)
    appreciation_markers = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ("index", "pk")
        constraints = [
            models.CheckConstraint(condition=models.Q(index__gte=1), name="question_index_gte_1"),
            models.UniqueConstraint(
                fields=("evaluation", "index"),
                name="question_index_unique_per_evaluation",
            ),
            models.UniqueConstraint(
                fields=("evaluation", "lineage_id"), name="question_lineage_unique_per_version"
            ),
        ]


class ScheduleMode(models.TextChoices):
    IMMEDIATE = "immediate", "Tout de suite"
    FIXED = "fixed", "À date fixe"
    MONTHLY = "monthly", "Mensuelle"
    QUARTERLY = "quarterly", "Trimestrielle"


class EvaluationSchedule(models.Model):
    requires_reassignment = models.BooleanField(default=False)
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
