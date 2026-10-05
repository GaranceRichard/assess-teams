from rest_framework import serializers

from journals.models import ActivityEntry, LogEntry


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


class LogEntrySerializer(JournalEntrySerializer):
    class Meta(JournalEntrySerializer.Meta):
        model = LogEntry
        fields = JournalEntrySerializer.Meta.fields + (
            "actor_id",
            "team_id",
            "evaluation_id",
            "evaluation_name",
            "method",
            "status_code",
            "level",
            "source",
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


class LogPageSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = LogEntrySerializer(many=True)
