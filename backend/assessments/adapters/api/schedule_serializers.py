from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers

from assessments.models import Evaluation, EvaluationSchedule, ScheduleMode
from identities.adapters.api.organization_scope import manageable_organization
from identities.domain.users import Role
from identities.models import User
from teams.models import Team


class EvaluationScheduleSerializer(serializers.ModelSerializer):
    organization_id = serializers.IntegerField(source="team.organization_id", read_only=True)
    organization_name = serializers.CharField(source="team.organization.name", read_only=True)
    team_id = serializers.IntegerField(read_only=True)
    team_name = serializers.CharField(source="team.name", read_only=True)
    evaluation_id = serializers.IntegerField(read_only=True)
    evaluation_name = serializers.CharField(source="evaluation.name", read_only=True)
    assignee_id = serializers.IntegerField(read_only=True, allow_null=True)
    assignee_identifier = serializers.CharField(
        source="assignee.username",
        read_only=True,
        allow_null=True,
    )
    assignee_role = serializers.SerializerMethodField()

    def get_assignee_role(self, schedule: EvaluationSchedule) -> str | None:
        if schedule.assignee is None:
            return None
        return "Superadmin" if schedule.assignee.is_superuser else schedule.assignee.role

    class Meta:
        model = EvaluationSchedule
        fields = (
            "id",
            "organization_id",
            "organization_name",
            "team_id",
            "team_name",
            "evaluation_id",
            "evaluation_name",
            "assignee_id",
            "assignee_identifier",
            "assignee_role",
            "mode",
            "first_due_date",
            "next_due_date",
        )


class EvaluationScheduleInputSerializer(serializers.Serializer):
    organization_id = serializers.IntegerField(min_value=1, write_only=True)
    team_id = serializers.IntegerField(min_value=1, write_only=True)
    evaluation_id = serializers.IntegerField(min_value=1, write_only=True)
    assignee_id = serializers.IntegerField(min_value=1, write_only=True)
    mode = serializers.ChoiceField(choices=ScheduleMode.choices)
    first_due_date = serializers.DateField(required=False, allow_null=True)

    def _resources(self, attrs: dict):
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
        assignee_id = attrs.pop("assignee_id")
        actor = self.context["request"].user
        assignee = None
        if actor.is_superuser:
            assignee = User.objects.filter(
                pk=assignee_id,
                is_superuser=True,
                is_active=True,
            ).first()
        if assignee is None:
            assignee = get_object_or_404(
                organization.users.filter(
                    role__in=(Role.ADMIN.value, Role.COACH.value),
                    is_active=True,
                ),
                pk=assignee_id,
            )
        if not assignee.email:
            raise serializers.ValidationError(
                {"assignee_id": "Le responsable doit avoir une adresse e-mail."}
            )
        return team, evaluation, assignee

    def _validate_date(self, attrs: dict) -> None:
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

    def validate(self, attrs: dict) -> dict:
        team, evaluation, assignee = self._resources(attrs)
        self._validate_date(attrs)
        duplicates = EvaluationSchedule.objects.filter(team=team, evaluation=evaluation)
        if self.instance:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError(
                "Cette évaluation est déjà planifiée pour cette équipe."
            )
        attrs.update(team=team, evaluation=evaluation, assignee=assignee)
        return attrs

    @staticmethod
    def _attach_coach(team: Team, assignee) -> None:
        if assignee.role == Role.COACH.value:
            team.coaches.add(assignee)

    def create(self, validated_data: dict) -> EvaluationSchedule:
        validated_data["next_due_date"] = validated_data["first_due_date"]
        schedule = EvaluationSchedule.objects.create(**validated_data)
        self._attach_coach(schedule.team, schedule.assignee)
        return schedule

    def update(self, instance: EvaluationSchedule, validated_data: dict) -> EvaluationSchedule:
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.next_due_date = instance.first_due_date
        instance.save()
        self._attach_coach(instance.team, instance.assignee)
        return instance
