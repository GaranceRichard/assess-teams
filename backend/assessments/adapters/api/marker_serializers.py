from rest_framework import serializers

from assessments.adapters.api.score_fields import StrictScoreField


class AppreciationMarkerSerializer(serializers.Serializer):
    score = StrictScoreField(min_value=0, max_value=10)
    text = serializers.CharField(allow_blank=False)

    def to_internal_value(self, data):
        if isinstance(data, dict) and "text" in data and not isinstance(data["text"], str):
            raise serializers.ValidationError({"text": "Une appréciation textuelle est requise."})
        if isinstance(data, dict) and set(data) - set(self.fields):
            raise serializers.ValidationError("Seuls score et text sont acceptés.")
        return super().to_internal_value(data)


def validate_markers(markers: list[dict]) -> list[dict]:
    scores = [marker["score"] for marker in markers]
    if len(scores) != len(set(scores)):
        raise serializers.ValidationError("Un seul repère est autorisé par niveau et question.")
    return sorted(markers, key=lambda marker: marker["score"])
