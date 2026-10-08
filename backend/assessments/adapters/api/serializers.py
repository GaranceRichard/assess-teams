from django.db.models import Max
from rest_framework import serializers

from assessments.adapters.api.marker_serializers import (
    AppreciationMarkerSerializer,
    validate_markers,
)
from assessments.models import Evaluation, Question
from identities.adapters.api.organization_scope import manageable_organization


class EvaluationSerializer(serializers.ModelSerializer):
    organization_id = serializers.IntegerField(read_only=True)
    family_id = serializers.IntegerField(read_only=True)
    family_name = serializers.CharField(source="family.name", read_only=True)

    class Meta:
        model = Evaluation
        fields = ("id", "organization_id", "family_id", "family_name", "version", "name", "status")
        read_only_fields = ("status", "version")


class EvaluationInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, allow_blank=False)

    def create(self, validated_data: dict) -> Evaluation:
        organization = self.context["organization"]
        highest_index = (
            Evaluation.objects.filter(organization=organization).aggregate(Max("index"))[
                "index__max"
            ]
            or 0
        )
        return Evaluation.objects.create(
            organization=organization,
            index=highest_index + 1,
            **validated_data,
        )

    def update(self, instance: Evaluation, validated_data: dict) -> Evaluation:
        instance.name = validated_data["name"]
        instance.save(update_fields=["name"])
        return instance


class CreateEvaluationInputSerializer(EvaluationInputSerializer):
    organization_id = serializers.IntegerField(min_value=1, write_only=True)

    def validate(self, attrs: dict) -> dict:
        organization_id = attrs.pop("organization_id")
        self.context["organization"] = manageable_organization(
            self.context["request"].user,
            organization_id,
        )
        return super().validate(attrs)


class QuestionSerializer(serializers.ModelSerializer):
    appreciation_markers = AppreciationMarkerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ("id", "index", "name", "appreciation_markers")


class QuestionInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, allow_blank=False)
    appreciation_markers = AppreciationMarkerSerializer(
        many=True,
        required=False,
        max_length=11,
        help_text="Repères facultatifs : un seul texte non vide par score entier 0–10. "
        "Omission : conservation ; liste vide : suppression.",
    )

    def validate_appreciation_markers(self, markers: list[dict]) -> list[dict]:
        return validate_markers(markers)

    def create(self, validated_data: dict) -> Question:
        evaluation = self.context["evaluation"]
        highest_index = evaluation.questions.aggregate(Max("index"))["index__max"] or 0
        return Question.objects.create(
            evaluation=evaluation,
            index=highest_index + 1,
            **validated_data,
        )

    def update(self, instance: Question, validated_data: dict) -> Question:
        instance.name = validated_data["name"]
        if "appreciation_markers" in validated_data:
            instance.appreciation_markers = validated_data["appreciation_markers"]
        instance.save(update_fields=["name", "appreciation_markers"])
        return instance
