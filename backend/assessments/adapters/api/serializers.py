from rest_framework import serializers

from assessments.models import Evaluation, Question


class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ("id", "index", "name")


class OrderedNameSerializer(serializers.Serializer):
    index = serializers.IntegerField(min_value=1)
    name = serializers.CharField(max_length=255, allow_blank=False)


class EvaluationInputSerializer(OrderedNameSerializer):
    def validate_index(self, value: int) -> int:
        duplicates = Evaluation.objects.filter(index=value)
        if self.instance:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError("Cet index est déjà utilisé.")
        return value

    def create(self, validated_data: dict) -> Evaluation:
        return Evaluation.objects.create(**validated_data)

    def update(self, instance: Evaluation, validated_data: dict) -> Evaluation:
        instance.index = validated_data["index"]
        instance.name = validated_data["name"]
        instance.save(update_fields=["index", "name"])
        return instance


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ("id", "index", "name")


class QuestionInputSerializer(OrderedNameSerializer):
    def validate_index(self, value: int) -> int:
        evaluation = self.context["evaluation"]
        duplicates = Question.objects.filter(evaluation=evaluation, index=value)
        if self.instance:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError("Cet index est déjà utilisé dans cette évaluation.")
        return value

    def create(self, validated_data: dict) -> Question:
        return Question.objects.create(
            evaluation=self.context["evaluation"],
            **validated_data,
        )

    def update(self, instance: Question, validated_data: dict) -> Question:
        instance.index = validated_data["index"]
        instance.name = validated_data["name"]
        instance.save(update_fields=["index", "name"])
        return instance
