from rest_framework import serializers

from identities.domain.organizations import requires_single_organization
from identities.domain.users import Role
from identities.models import Organization, User


def validate_membership_limit(
    users: list[User],
    current_organization: Organization | None = None,
) -> None:
    locked_users = User.objects.select_for_update().filter(pk__in=[user.pk for user in users])
    restricted_ids = [
        user.pk
        for user in locked_users
        if user.role and requires_single_organization(Role(user.role))
    ]
    memberships = Organization.users.through.objects.filter(user_id__in=restricted_ids)
    if current_organization:
        memberships = memberships.exclude(organization_id=current_organization.pk)
    if memberships.exists():
        raise serializers.ValidationError(
            {"user_ids": ("Un Coach ou un Viewer ne peut appartenir qu'à une seule organisation.")}
        )


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


class RenameOrganizationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, allow_blank=False)

    def validate_name(self, value: str) -> str:
        return value.strip()

    def update(self, instance: Organization, validated_data: dict) -> Organization:
        instance.name = validated_data["name"]
        instance.save(update_fields=["name"])
        return instance


class CreateOrganizationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, allow_blank=False)
    user_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        allow_empty=False,
        source="users",
        help_text=(
            "Un Admin peut appartenir à plusieurs organisations ; un Coach ou "
            "un Viewer appartient au plus à une organisation."
        ),
    )

    def validate_name(self, value: str) -> str:
        return value.strip()

    def validate(self, attrs: dict) -> dict:
        validate_membership_limit(attrs["users"])
        return attrs

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
        help_text=(
            "Un Admin peut appartenir à plusieurs organisations ; un Coach ou "
            "un Viewer appartient au plus à une organisation."
        ),
    )

    def validate(self, attrs: dict) -> dict:
        validate_membership_limit(attrs["users"], self.instance)
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
