from rest_framework import serializers

from identities.domain.organizations import requires_single_organization
from identities.domain.users import Role


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, allow_blank=False)
    password = serializers.CharField(write_only=True, allow_blank=False, trim_whitespace=False)


class SessionUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    role = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField()
    organization_name = serializers.SerializerMethodField()

    def get_role(self, user) -> str:
        return Role.ADMIN.value if user.is_superuser else user.role

    def get_organization_name(self, user) -> str | None:
        if user.is_superuser or not user.role:
            return None
        if not requires_single_organization(Role(user.role)):
            return None
        return user.organizations.values_list("name", flat=True).first()
