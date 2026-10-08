from rest_framework import serializers


class StrictScoreField(serializers.IntegerField):
    def to_internal_value(self, data):
        if type(data) is not int:
            self.fail("invalid")
        return super().to_internal_value(data)


class StrictTakingInput(serializers.Serializer):
    def to_internal_value(self, data):
        if isinstance(data, dict):
            unexpected = set(data) - set(self.fields)
            if unexpected:
                raise serializers.ValidationError(
                    {field: "Ce champ n’est pas accepté." for field in unexpected}
                )
        return super().to_internal_value(data)
