from django.db.models import Q
from rest_framework import serializers

from identities.application.lifecycle import LAST_ADMIN_MESSAGE
from identities.domain.organizations import requires_single_organization
from identities.domain.users import Role
from identities.models import Organization, User


def validate_membership_limit(
    users: list[User],
    current_organization: Organization | None = None,
) -> None:
    locked_users = User.objects.select_for_update().filter(pk__in=[user.pk for user in users])
    existing_ids = (
        set(current_organization.users.values_list("pk", flat=True))
        if current_organization
        else set()
    )
    if any(not user.is_active and user.pk not in existing_ids for user in locked_users):
        raise serializers.ValidationError(
            {"user_ids": "Un utilisateur désactivé ne peut pas être affecté."}
        )
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
            {
                "user_ids": (
                    "Un Admin, un Coach ou un Viewer ne peut appartenir "
                    "qu'à une seule organisation."
                )
            }
        )


class OrganizationUserSerializer(serializers.ModelSerializer):
    identifier = serializers.CharField(source="username")
    user_type = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "identifier", "user_type", "is_active")

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
        help_text=("Un Admin, un Coach ou un Viewer appartient au plus à une organisation."),
    )

    def validate_name(self, value: str) -> str:
        return value.strip()

    def validate(self, attrs: dict) -> dict:
        validate_membership_limit(attrs["users"])
        if not any(user.role == Role.ADMIN and user.is_active for user in attrs["users"]):
            raise serializers.ValidationError({"user_ids": LAST_ADMIN_MESSAGE})
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
        help_text=("Un Admin, un Coach ou un Viewer appartient au plus à une organisation."),
    )

    def validate(self, attrs: dict) -> dict:
        validate_membership_limit(attrs["users"], self.instance)
        current_protected_ids = set(
            self.instance.users.filter(Q(role=Role.ADMIN) | Q(is_superuser=True)).values_list(
                "pk", flat=True
            )
        )
        requested_protected_ids = {
            user.pk for user in attrs["users"] if user.is_superuser or user.role == Role.ADMIN.value
        }
        if (
            not self.context["actor"].is_superuser
            and requested_protected_ids != current_protected_ids
        ):
            raise serializers.ValidationError(
                {"user_ids": "Seul le Superadmin peut modifier les Admin de l'organisation."}
            )
        keeps_admin = any(user.role == Role.ADMIN and user.is_active for user in attrs["users"])
        if not keeps_admin:
            raise serializers.ValidationError({"user_ids": LAST_ADMIN_MESSAGE})
        return attrs

    def update(self, instance: Organization, validated_data: dict) -> Organization:
        instance.users.set(validated_data["users"])
        return instance
