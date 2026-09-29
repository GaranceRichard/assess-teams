from rest_framework import serializers

from journals.models import LogLevel, LogSource


class JournalFilterSerializer(serializers.Serializer):
    date = serializers.DateField(required=False)
    organization_id = serializers.IntegerField(required=False, min_value=1)
    player = serializers.CharField(required=False, allow_blank=False, max_length=150)
    team = serializers.CharField(required=False, allow_blank=False, max_length=255)
    page = serializers.IntegerField(required=False, min_value=1)


class LogFilterSerializer(JournalFilterSerializer):
    level = serializers.ChoiceField(required=False, choices=LogLevel.choices)
    source = serializers.ChoiceField(required=False, choices=LogSource.choices)


def filter_entries(queryset, params, serializer_class=JournalFilterSerializer):
    serializer = serializer_class(data=params)
    serializer.is_valid(raise_exception=True)
    filters = serializer.validated_data
    if "date" in filters:
        queryset = queryset.filter(created_at__date=filters["date"])
    if "organization_id" in filters:
        queryset = queryset.filter(organization_id=filters["organization_id"])
    if "player" in filters:
        queryset = queryset.filter(actor_name__icontains=filters["player"])
    if "team" in filters:
        queryset = queryset.filter(team_name__icontains=filters["team"])
    if "level" in filters:
        queryset = queryset.filter(level=filters["level"])
    if "source" in filters:
        queryset = queryset.filter(source=filters["source"])
    return queryset
