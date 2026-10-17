from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from identities.domain.users import Role
from identities.models import Organization, User
from teams.models import Team


class TeamCoachSerializer(serializers.ModelSerializer):
    identifier = serializers.CharField(source="username")

    class Meta:
        model = User
        fields = ("id", "identifier", "is_active")


class TeamSerializer(serializers.ModelSerializer):
    organization_id = serializers.IntegerField(read_only=True)
    coaches = serializers.SerializerMethodField()

    @extend_schema_field(TeamCoachSerializer(many=True))
    def get_coaches(self, team: Team) -> list[dict]:
        coaches = [
            coach
            for coach in team.coaches.all()
            if coach.role == Role.COACH.value
            and any(org.pk == team.organization_id for org in coach.organizations.all())
        ]
        return TeamCoachSerializer(coaches, many=True).data

    class Meta:
        model = Team
        fields = ("id", "name", "organization_id", "is_active", "coaches")


class TeamListFilterSerializer(serializers.Serializer):
    include_archived = serializers.BooleanField(required=False, default=False)


class TeamInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, allow_blank=False)
    coach_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.none(),
        many=True,
        allow_empty=True,
        source="coaches",
        error_messages={
            "does_not_exist": "Chaque Coach doit être actif et membre de l'organisation."
        },
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if "organization" in self.context:
            self.fields["coach_ids"].child_relation.queryset = self.context[
                "organization"
            ].users.all()

    def validate_name(self, value: str) -> str:
        return value.strip()

    def validate(self, attrs: dict) -> dict:
        organization: Organization = self.context["organization"]
        coaches: list[User] = attrs["coaches"]
        retained_ids = (
            set(self.instance.coaches.values_list("pk", flat=True)) if self.instance else set()
        )
        invalid_coaches = [
            coach.pk
            for coach in coaches
            if coach.role != Role.COACH or (not coach.is_active and coach.pk not in retained_ids)
        ]
        organization_coach_ids = set(
            organization.users.filter(role=Role.COACH, is_active=True).values_list("pk", flat=True)
        )
        if invalid_coaches or any(
            coach.pk not in organization_coach_ids | retained_ids for coach in coaches
        ):
            raise serializers.ValidationError(
                {"coach_ids": "Chaque Coach doit être actif et membre de l'organisation."}
            )
        duplicates = Team.objects.filter(
            organization=organization,
            name__iexact=attrs["name"],
        )
        if self.instance:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError(
                {"name": "Une équipe de cette organisation porte déjà ce nom."}
            )
        return attrs

    def create(self, validated_data: dict) -> Team:
        coaches = validated_data.pop("coaches")
        team = Team.objects.create(
            organization=self.context["organization"],
            **validated_data,
        )
        team.coaches.set(coaches)
        return team

    def update(self, instance: Team, validated_data: dict) -> Team:
        instance.name = validated_data["name"]
        instance.save(update_fields=["name"])
        instance.coaches.set(validated_data["coaches"])
        return instance
