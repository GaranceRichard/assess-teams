from rest_framework import serializers

from assessments.adapters.api.score_fields import StrictScoreField, StrictTakingInput
from assessments.models import QuestionScoreGuide


class GuideTextField(serializers.CharField):
    def to_internal_value(self, data):
        if not isinstance(data, str):
            self.fail("invalid")
        return super().to_internal_value(data)


class ScoreGuideSerializer(StrictTakingInput):
    score = StrictScoreField(min_value=0, max_value=10)
    text = GuideTextField(allow_blank=False, min_length=1)


def validate_score_guides(guides):
    scores = [guide["score"] for guide in guides]
    if len(scores) != len(set(scores)):
        raise serializers.ValidationError("Un seul repère est autorisé par niveau et question.")
    return guides


def replace_score_guides(question, guides):
    question.score_guides.all().delete()
    QuestionScoreGuide.objects.bulk_create(
        [QuestionScoreGuide(question=question, **guide) for guide in guides]
    )
