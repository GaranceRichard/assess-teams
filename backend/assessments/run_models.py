from django.db import models
from django.db.models.functions import Cast


class EvaluationRunState(models.TextChoices):
    NOT_STARTED = "not_started", "À passer"
    IN_PROGRESS = "in_progress", "En cours"
    COMPLETED = "completed", "Complétée"


class EvaluationRun(models.Model):
    schedule = models.ForeignKey(
        "assessments.EvaluationSchedule",
        on_delete=models.PROTECT,
        related_name="runs",
    )
    due_date = models.DateField()
    organization = models.ForeignKey("identities.Organization", on_delete=models.PROTECT)
    organization_name = models.CharField(max_length=255)
    team = models.ForeignKey("teams.Team", on_delete=models.PROTECT)
    team_name = models.CharField(max_length=255)
    evaluation = models.ForeignKey("assessments.Evaluation", on_delete=models.PROTECT)
    evaluation_name = models.CharField(max_length=255)
    assignee = models.ForeignKey(
        "identities.User",
        null=True,
        on_delete=models.SET_NULL,
        related_name="assigned_evaluation_runs",
    )
    assignee_name = models.CharField(max_length=150)
    state = models.CharField(
        max_length=12,
        choices=EvaluationRunState.choices,
        default=EvaluationRunState.NOT_STARTED,
    )
    completed_by = models.ForeignKey(
        "identities.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="completed_evaluation_runs",
    )
    completed_by_name = models.CharField(max_length=150, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    revised_by = models.ForeignKey(
        "identities.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="revised_evaluation_runs",
    )
    revised_by_name = models.CharField(max_length=150, blank=True)
    revised_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("due_date", "pk")
        constraints = [
            models.UniqueConstraint(
                fields=("schedule", "due_date"), name="run_schedule_due_unique"
            ),
            models.CheckConstraint(
                condition=models.Q(state__in=EvaluationRunState.values),
                name="evaluation_run_state_valid",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(
                        state__in=(EvaluationRunState.NOT_STARTED, EvaluationRunState.IN_PROGRESS),
                        completed_at__isnull=True,
                        completed_by__isnull=True,
                        completed_by_name="",
                    )
                    | (
                        models.Q(state=EvaluationRunState.COMPLETED, completed_at__isnull=False)
                        & ~models.Q(completed_by_name="")
                    )
                ),
                name="evaluation_run_completion_consistent",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(revised_at__isnull=True, revised_by__isnull=True, revised_by_name="")
                    | (
                        models.Q(state=EvaluationRunState.COMPLETED, revised_at__isnull=False)
                        & ~models.Q(revised_by_name="")
                        & models.Q(revised_at__gte=models.F("completed_at"))
                    )
                ),
                name="evaluation_run_revision_consistent",
            ),
        ]


class EvaluationRunQuestion(models.Model):
    lineage_id = models.UUIDField(editable=False, db_index=True)
    run = models.ForeignKey(EvaluationRun, on_delete=models.CASCADE, related_name="questions")
    source_question = models.ForeignKey("assessments.Question", on_delete=models.PROTECT)
    index = models.PositiveIntegerField()
    text = models.CharField(max_length=255)
    score_guides = models.JSONField(default=list, blank=True)
    score = models.PositiveSmallIntegerField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.lineage_id is None:
            self.lineage_id = self.source_question.lineage_id
        super().save(*args, **kwargs)

    class Meta:
        ordering = ("index", "pk")
        constraints = [
            models.UniqueConstraint(
                fields=("run", "source_question"),
                name="run_source_question_unique",
            ),
            models.UniqueConstraint(fields=("run", "lineage_id"), name="run_lineage_unique"),
            models.UniqueConstraint(fields=("run", "index"), name="run_question_index_unique"),
            models.CheckConstraint(
                condition=models.Q(index__gte=1),
                name="run_question_index_gte_1",
            ),
            models.CheckConstraint(
                condition=models.Q(score__isnull=True)
                | (
                    models.Q(score__range=(0, 10))
                    & models.Q(score=Cast(models.F("score"), models.IntegerField()))
                ),
                name="run_question_score_0_10",
            ),
        ]
