from rest_framework import serializers

from assessments.adapters.api.guide_serializers import ScoreGuideSerializer
from assessments.adapters.api.score_fields import StrictScoreField, StrictTakingInput
from assessments.application.taking_scope import is_evaluation_admin
from assessments.models import EvaluationRun, EvaluationRunQuestion, EvaluationRunState


class EvaluationRunListSerializer(serializers.ModelSerializer):
    schedule_id = serializers.IntegerField(read_only=True)
    organization_id = serializers.IntegerField(read_only=True)
    team_id = serializers.IntegerField(read_only=True)
    evaluation_id = serializers.IntegerField(read_only=True)
    family_id = serializers.IntegerField(source="evaluation.family_id", read_only=True)
    family_name = serializers.CharField(source="evaluation.family.name", read_only=True)
    evaluation_version = serializers.IntegerField(source="evaluation.version", read_only=True)
    assignee_id = serializers.IntegerField(read_only=True, allow_null=True)
    completed_by_id = serializers.IntegerField(read_only=True, allow_null=True)
    revised_by_id = serializers.IntegerField(read_only=True, allow_null=True)
    assigned_to = serializers.CharField(source="assignee_name", read_only=True)
    filled_by = serializers.CharField(source="completed_by_name", read_only=True)
    revised_by = serializers.CharField(source="revised_by_name", read_only=True)
    is_assignee = serializers.SerializerMethodField()
    can_revise = serializers.SerializerMethodField()
    requires_reassignment = serializers.BooleanField(
        source="schedule.requires_reassignment", read_only=True
    )
    assignee_active = serializers.BooleanField(
        source="assignee.is_active", read_only=True, allow_null=True
    )

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
            "family_id",
            "family_name",
            "evaluation_version",
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
            "requires_reassignment",
            "assignee_active",
        )


class EvaluationRunQuestionSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField(source="source_question_id", read_only=True)
    score_guides = ScoreGuideSerializer(many=True, read_only=True)

    class Meta:
        model = EvaluationRunQuestion
        fields = ("question_id", "index", "text", "score", "score_guides")


class EvaluationRunSerializer(EvaluationRunListSerializer):
    questions = EvaluationRunQuestionSerializer(many=True, read_only=True)

    class Meta(EvaluationRunListSerializer.Meta):
        fields = (*EvaluationRunListSerializer.Meta.fields, "questions")


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
