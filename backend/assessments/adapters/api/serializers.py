from django.db.models import Max
from rest_framework import serializers

from assessments.models import Evaluation, Question


class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ("id", "name")


class EvaluationInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, allow_blank=False)

    def create(self, validated_data: dict) -> Evaluation:
        highest_index = Evaluation.objects.aggregate(Max("index"))["index__max"] or 0
        return Evaluation.objects.create(index=highest_index + 1, **validated_data)

    def update(self, instance: Evaluation, validated_data: dict) -> Evaluation:
        instance.name = validated_data["name"]
        instance.save(update_fields=["name"])
        return instance


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ("id", "index", "name")


class QuestionInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, allow_blank=False)

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
        instance.save(update_fields=["name"])
        return instance
