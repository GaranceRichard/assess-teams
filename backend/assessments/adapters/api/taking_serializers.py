from rest_framework import serializers

from assessments.application.taking_scope import is_evaluation_admin
from assessments.models import EvaluationRun, EvaluationRunQuestion, EvaluationRunState


class EvaluationRunListSerializer(serializers.ModelSerializer):
    schedule_id = serializers.IntegerField(read_only=True)
    organization_id = serializers.IntegerField(read_only=True)
    team_id = serializers.IntegerField(read_only=True)
    evaluation_id = serializers.IntegerField(read_only=True)
    assignee_id = serializers.IntegerField(read_only=True, allow_null=True)
    completed_by_id = serializers.IntegerField(read_only=True, allow_null=True)
    revised_by_id = serializers.IntegerField(read_only=True, allow_null=True)
    assigned_to = serializers.CharField(source="assignee_name", read_only=True)
    filled_by = serializers.CharField(source="completed_by_name", read_only=True)
    revised_by = serializers.CharField(source="revised_by_name", read_only=True)
    is_assignee = serializers.SerializerMethodField()
    can_revise = serializers.SerializerMethodField()

    def get_is_assignee(self, run: EvaluationRun) -> bool:
        return run.assignee_id == self.context["request"].user.pk

    def get_can_revise(self, run: EvaluationRun) -> bool:
        return bool(
            run.state == EvaluationRunState.COMPLETED
            and is_evaluation_admin(self.context["request"].user)
        )

    class Meta:
        model = EvaluationRun
        fields = (
            "id",
            "schedule_id",
            "organization_id",
            "organization_name",
            "team_id",
            "team_name",
            "evaluation_id",
            "evaluation_name",
            "assignee_id",
            "assigned_to",
            "filled_by",
            "completed_by_id",
            "completed_at",
            "state",
            "revised_by",
            "revised_by_id",
            "revised_at",
            "due_date",
            "is_assignee",
            "can_revise",
        )


class EvaluationRunQuestionSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField(source="source_question_id", read_only=True)

    class Meta:
        model = EvaluationRunQuestion
        fields = ("question_id", "index", "text", "score")


class EvaluationRunSerializer(EvaluationRunListSerializer):
    questions = EvaluationRunQuestionSerializer(many=True, read_only=True)

    class Meta(EvaluationRunListSerializer.Meta):
        fields = (*EvaluationRunListSerializer.Meta.fields, "questions")


class StrictScoreField(serializers.IntegerField):
    def to_internal_value(self, data):
        if type(data) is not int:
            self.fail("invalid")
        return super().to_internal_value(data)


class StrictTakingInput(serializers.Serializer):
    def to_internal_value(self, data):
        if isinstance(data, dict):
            unexpected = set(data) - set(self.fields)
            if unexpected:
                raise serializers.ValidationError(
                    {field: "Ce champ n’est pas accepté." for field in unexpected}
                )
        return super().to_internal_value(data)


class EvaluationScoreSerializer(StrictTakingInput):
    score = StrictScoreField(min_value=0, max_value=10)


class EvaluationRevisionAnswerSerializer(StrictTakingInput):
    question_id = serializers.IntegerField(min_value=1)
    score = StrictScoreField(min_value=0, max_value=10)


class EvaluationRevisionSerializer(StrictTakingInput):
    answers = EvaluationRevisionAnswerSerializer(many=True, allow_empty=False)

    def validate_answers(self, answers: list[dict]) -> list[dict]:
        question_ids = [answer["question_id"] for answer in answers]
        if len(question_ids) != len(set(question_ids)):
            raise serializers.ValidationError("Chaque question doit apparaître une seule fois.")
        return answers
