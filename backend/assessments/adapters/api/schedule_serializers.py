from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers

from assessments.models import Evaluation, EvaluationSchedule, ScheduleMode
from identities.adapters.api.organization_scope import manageable_organization
from identities.domain.users import Role
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
            "next_due_date",
        )


class CreateEvaluationScheduleSerializer(serializers.Serializer):
    organization_id = serializers.IntegerField(min_value=1, write_only=True)
    team_id = serializers.IntegerField(min_value=1, write_only=True)
    evaluation_id = serializers.IntegerField(min_value=1, write_only=True)
    mode = serializers.ChoiceField(choices=ScheduleMode.choices)
    first_due_date = serializers.DateField(required=False, allow_null=True)
    coach_id = serializers.IntegerField(min_value=1, required=False, write_only=True)

    def _coach_to_attach(self, attrs: dict, organization, team):
        coach_id = attrs.pop("coach_id", None)
        assigned = team.coaches.filter(
            role=Role.COACH.value,
            is_active=True,
            email__gt="",
            organizations=organization,
        )
        if assigned.exists() and coach_id is None:
            return None
        if coach_id is None:
            raise serializers.ValidationError(
                {"coach_id": "L’équipe doit avoir un Coach actif avec une adresse e-mail."}
            )
        coach = get_object_or_404(
            organization.users.filter(role=Role.COACH.value, is_active=True),
            pk=coach_id,
        )
        if not coach.email:
            raise serializers.ValidationError(
                {"coach_id": "Le Coach doit avoir une adresse e-mail."}
            )
        return coach

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
        coach = self._coach_to_attach(attrs, organization, team)
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
        attrs.update(team=team, evaluation=evaluation, coach=coach)
        return attrs

    def create(self, validated_data: dict) -> EvaluationSchedule:
        coach = validated_data.pop("coach")
        validated_data["next_due_date"] = validated_data["first_due_date"]
        schedule = EvaluationSchedule.objects.create(**validated_data)
        if coach is not None:
            schedule.team.coaches.add(coach)
        return schedule
