from rest_framework import serializers

from identities.domain.users import Role
from identities.models import Organization, User


class OrganizationUserSerializer(serializers.ModelSerializer):
    identifier = serializers.CharField(source="username")
    user_type = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "identifier", "user_type")

    def get_user_type(self, user: User) -> str:
        return "Superadmin" if user.is_superuser else user.role


class OrganizationSerializer(serializers.ModelSerializer):
    users = OrganizationUserSerializer(many=True, read_only=True)

    class Meta:
        model = Organization
        fields = ("id", "name", "users")


class CreateOrganizationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, allow_blank=False)
    user_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        allow_empty=False,
        source="users",
    )

    def validate_name(self, value: str) -> str:
        return value.strip()

    def create(self, validated_data: dict) -> Organization:
        users = validated_data.pop("users")
        organization = Organization.objects.create(**validated_data)
        organization.users.set(users)
        return organization


class UpdateOrganizationMembersSerializer(serializers.Serializer):
    user_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        allow_empty=False,
        source="users",
    )

    def validate(self, attrs: dict) -> dict:
        had_admin = self.instance.users.filter(role=Role.ADMIN).exists()
        keeps_admin = any(user.role == Role.ADMIN for user in attrs["users"])
        if had_admin and not keeps_admin:
            raise serializers.ValidationError(
                {"user_ids": "L'organisation doit conserver au moins un Admin."}
            )
        return attrs

    def update(self, instance: Organization, validated_data: dict) -> Organization:
        instance.users.set(validated_data["users"])
        return instance
