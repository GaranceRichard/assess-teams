from rest_framework import serializers


class StrictPasswordSerializer(serializers.Serializer):
    def to_internal_value(self, data):
        if isinstance(data, dict) and set(data) - set(self.fields):
            raise serializers.ValidationError({"detail": "Un champ non accepté a été fourni."})
        return super().to_internal_value(data)


class PasswordRecoverySerializer(StrictPasswordSerializer):
    email = serializers.EmailField(max_length=254, write_only=True)


class NewPasswordSerializer(StrictPasswordSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False, max_length=128)
    password_confirmation = serializers.CharField(
        write_only=True, trim_whitespace=False, max_length=128
    )


class PasswordResetSerializer(NewPasswordSerializer):
    uid = serializers.CharField(write_only=True, max_length=64)
    token = serializers.CharField(write_only=True, max_length=128, trim_whitespace=False)


class PasswordChangeSerializer(NewPasswordSerializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)


class PasswordRecoveryResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()
