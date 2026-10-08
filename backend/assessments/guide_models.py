from django.db import models
from django.db.models.functions import Cast


class QuestionScoreGuide(models.Model):
    question = models.ForeignKey(
        "assessments.Question", on_delete=models.CASCADE, related_name="score_guides"
    )
    score = models.PositiveSmallIntegerField()
    text = models.TextField()

    class Meta:
        ordering = ("score",)
        constraints = [
            models.UniqueConstraint(
                fields=("question", "score"), name="question_score_guide_unique"
            ),
            models.CheckConstraint(
                condition=models.Q(score__range=(0, 10))
                & models.Q(score=Cast(models.F("score"), models.IntegerField())),
                name="question_score_guide_integer_0_10",
            ),
            models.CheckConstraint(
                condition=~models.Q(text=""), name="question_score_guide_nonempty"
            ),
        ]
