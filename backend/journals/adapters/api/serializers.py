from rest_framework import serializers

from journals.models import ActivityEntry, ErrorEntry


class JournalEntrySerializer(serializers.ModelSerializer):
    organization_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        fields = (
            "id",
            "created_at",
            "organization_id",
            "organization_name",
            "actor_name",
            "team_name",
        )


class ActivityEntrySerializer(JournalEntrySerializer):
    class Meta(JournalEntrySerializer.Meta):
        model = ActivityEntry
        fields = JournalEntrySerializer.Meta.fields + ("action", "description")


class ErrorEntrySerializer(JournalEntrySerializer):
    class Meta(JournalEntrySerializer.Meta):
        model = ErrorEntry
        fields = JournalEntrySerializer.Meta.fields + (
            "operation",
            "category",
            "message",
            "correlation_id",
        )


class ActivityPageSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = ActivityEntrySerializer(many=True)


class ErrorPageSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = ErrorEntrySerializer(many=True)
