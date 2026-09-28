from django.db import models


class Evaluation(models.Model):
    organization = models.ForeignKey(
        "identities.Organization",
        on_delete=models.CASCADE,
        related_name="evaluations",
    )
    index = models.PositiveIntegerField()
    name = models.CharField(max_length=255)

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
