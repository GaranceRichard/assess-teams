from rest_framework import serializers


class JournalFilterSerializer(serializers.Serializer):
    date = serializers.DateField(required=False)
    organization_id = serializers.IntegerField(required=False, min_value=1)
    player = serializers.CharField(required=False, allow_blank=False, max_length=150)
    team = serializers.CharField(required=False, allow_blank=False, max_length=255)
    page = serializers.IntegerField(required=False, min_value=1)


def filter_entries(queryset, params):
    serializer = JournalFilterSerializer(data=params)
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
    return queryset
