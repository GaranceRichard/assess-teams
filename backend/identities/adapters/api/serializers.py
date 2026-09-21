from django.contrib.auth.validators import UnicodeUsernameValidator
from rest_framework import serializers

from identities.domain.users import Role


class CreateUserSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=150,
        allow_blank=False,
        validators=[UnicodeUsernameValidator()],
    )
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    role = serializers.ChoiceField(choices=Role.values())

    def to_internal_value(self, data):
        unexpected_fields = set(data) - set(self.fields)
        if unexpected_fields:
            errors = {field: ["Ce champ n'est pas accepté."] for field in unexpected_fields}
            raise serializers.ValidationError(errors)
        return super().to_internal_value(data)


class UserCreatedSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    role = serializers.ChoiceField(choices=Role.values())
    is_active = serializers.BooleanField()
