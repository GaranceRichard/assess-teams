from rest_framework import serializers

from identities.domain.users import Role
from identities.models import User


class ManagedUserSerializer(serializers.ModelSerializer):
    identifier = serializers.CharField(source="username")
    user_type = serializers.SerializerMethodField()
    pending = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "identifier", "email", "user_type", "pending")

    def get_user_type(self, user: User) -> str:
        return "Superadmin" if user.is_superuser else user.role

    def get_pending(self, user: User) -> bool:
        return not user.has_usable_password()


class InviteUserSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=150, allow_blank=False)
    email = serializers.EmailField(max_length=254)
    role = serializers.ChoiceField(choices=Role.values())

    def validate_identifier(self, value: str) -> str:
        identifier = value.strip()
        if User.objects.filter(username__iexact=identifier).exists():
            raise serializers.ValidationError("Cet identifiant est déjà utilisé.")
        return identifier

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Une identité utilise déjà cette adresse.")
        return email


class UpdateManagedUserSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=150, allow_blank=False)
    email = serializers.EmailField(max_length=254)
    role = serializers.ChoiceField(choices=Role.values(), required=False)

    def validate_identifier(self, value: str) -> str:
        identifier = value.strip()
        user = self.context["user"]
        if User.objects.filter(username__iexact=identifier).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Cet identifiant est déjà utilisé.")
        return identifier

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        user = self.context["user"]
        if User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Une identité utilise déjà cette adresse.")
        return email


class ChoosePasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
