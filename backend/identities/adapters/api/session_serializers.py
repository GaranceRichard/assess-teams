from rest_framework import serializers

from identities.domain.users import Role


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, allow_blank=False)
    password = serializers.CharField(write_only=True, allow_blank=False, trim_whitespace=False)


class SessionUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    role = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField()

    def get_role(self, user) -> str:
        return Role.ADMIN.value if user.is_superuser else user.role
