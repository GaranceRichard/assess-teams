from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers

from assessments.models import Evaluation, EvaluationSchedule, ScheduleMode
from identities.adapters.api.organization_scope import manageable_organization
from teams.models import Team


class EvaluationScheduleSerializer(serializers.ModelSerializer):
    organization_id = serializers.IntegerField(source="team.organization_id", read_only=True)
    team_id = serializers.IntegerField(read_only=True)
    team_name = serializers.CharField(source="team.name", read_only=True)
    evaluation_id = serializers.IntegerField(read_only=True)
    evaluation_name = serializers.CharField(source="evaluation.name", read_only=True)

    class Meta:
        model = EvaluationSchedule
        fields = (
            "id",
            "organization_id",
            "team_id",
            "team_name",
            "evaluation_id",
            "evaluation_name",
            "mode",
            "first_due_date",
        )


class CreateEvaluationScheduleSerializer(serializers.Serializer):
    organization_id = serializers.IntegerField(min_value=1, write_only=True)
    team_id = serializers.IntegerField(min_value=1, write_only=True)
    evaluation_id = serializers.IntegerField(min_value=1, write_only=True)
    mode = serializers.ChoiceField(choices=ScheduleMode.choices)
    first_due_date = serializers.DateField(required=False, allow_null=True)

    def validate(self, attrs: dict) -> dict:
        organization = manageable_organization(
            self.context["request"].user,
            attrs.pop("organization_id"),
        )
        team = get_object_or_404(
            Team.objects.filter(organization=organization, is_active=True),
            pk=attrs.pop("team_id"),
        )
        evaluation = get_object_or_404(
            Evaluation.objects.filter(organization=organization),
            pk=attrs.pop("evaluation_id"),
        )
        first_due_date = attrs.get("first_due_date")
        if attrs["mode"] == ScheduleMode.IMMEDIATE:
            if first_due_date is not None:
                raise serializers.ValidationError(
                    {"first_due_date": "Ce champ doit être omis pour une planification immédiate."}
                )
            attrs["first_due_date"] = timezone.localdate()
        elif first_due_date is None:
            raise serializers.ValidationError(
                {"first_due_date": "Une première date est obligatoire pour cette cadence."}
            )
        elif first_due_date < timezone.localdate():
            raise serializers.ValidationError(
                {"first_due_date": "La première date ne peut pas être passée."}
            )
        if EvaluationSchedule.objects.filter(team=team, evaluation=evaluation).exists():
            raise serializers.ValidationError(
                "Cette évaluation est déjà planifiée pour cette équipe."
            )
        attrs.update(team=team, evaluation=evaluation)
        return attrs

    def create(self, validated_data: dict) -> EvaluationSchedule:
        return EvaluationSchedule.objects.create(**validated_data)
