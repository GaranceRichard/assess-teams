from rest_framework import serializers

from identities.domain.organizations import requires_single_organization
from identities.domain.palettes import InterfacePalette
from identities.domain.users import Role


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, allow_blank=False)
    password = serializers.CharField(write_only=True, allow_blank=False, trim_whitespace=False)


class SessionUserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField()
    role = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField()
    organization_name = serializers.SerializerMethodField()
    team_names = serializers.SerializerMethodField()
    interface_palette = serializers.ChoiceField(choices=InterfacePalette.values(), read_only=True)

    def get_role(self, user) -> str:
        return Role.ADMIN.value if user.is_superuser else user.role

    def get_organization_name(self, user) -> str | None:
        if user.is_superuser or not user.role:
            return None
        if not requires_single_organization(Role(user.role)):
            return None
        return user.organizations.values_list("name", flat=True).first()

    def get_team_names(self, user) -> list[str]:
        if user.is_superuser or user.role != Role.COACH.value:
            return []
        return list(
            user.coached_teams.filter(is_active=True)
            .order_by("name", "pk")
            .values_list("name", flat=True)
        )


class SessionPreferenceSerializer(serializers.Serializer):
    interface_palette = serializers.ChoiceField(choices=InterfacePalette.values())

    def to_internal_value(self, data):
        if isinstance(data, dict):
            unexpected = set(data) - set(self.fields)
            if unexpected:
                raise serializers.ValidationError(
                    {field: ["Ce champ n'est pas accepté."] for field in unexpected}
                )
        return super().to_internal_value(data)

    def update(self, instance, validated_data):
        instance.interface_palette = validated_data["interface_palette"]
        instance.save(update_fields=["interface_palette"])
        return instance
