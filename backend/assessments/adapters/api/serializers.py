from django.db.models import Max
from rest_framework import serializers

from assessments.adapters.api.guide_serializers import (
    ScoreGuideSerializer,
    replace_score_guides,
    validate_score_guides,
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
    score_guides = ScoreGuideSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ("id", "index", "name", "score_guides")


class QuestionInputSerializer(serializers.Serializer):
    score_guides = ScoreGuideSerializer(
        many=True,
        required=False,
        allow_empty=True,
        help_text="Repères facultatifs : scores entiers JSON uniques 0–10, textes non vides. "
        "Omission conserve la liste ; [] efface ; liste fournie remplace atomiquement.",
    )

    def validate_score_guides(self, guides):
        return validate_score_guides(guides)

    name = serializers.CharField(max_length=255, allow_blank=False)

    def create(self, validated_data: dict) -> Question:
        guides = validated_data.pop("score_guides", [])
        evaluation = self.context["evaluation"]
        highest_index = evaluation.questions.aggregate(Max("index"))["index__max"] or 0
        question = Question.objects.create(
            evaluation=evaluation,
            index=highest_index + 1,
            **validated_data,
        )

        replace_score_guides(question, guides)
        return question

    def update(self, instance: Question, validated_data: dict) -> Question:
        instance.name = validated_data["name"]
        instance.save(update_fields=["name"])
        if "score_guides" in validated_data:
            replace_score_guides(instance, validated_data["score_guides"])
        return instance
