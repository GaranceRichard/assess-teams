from rest_framework import serializers

from journals.models import LogLevel, LogSource


class JournalFilterSerializer(serializers.Serializer):
    date = serializers.DateField(required=False)
    organization_id = serializers.IntegerField(required=False, min_value=1)
    player = serializers.CharField(required=False, allow_blank=False, max_length=150)
    team = serializers.CharField(required=False, allow_blank=False, max_length=255)
    page = serializers.IntegerField(required=False, min_value=1)


class LogFilterSerializer(serializers.Serializer):
    organization = serializers.IntegerField(required=False, min_value=1)
    organization_id = serializers.IntegerField(required=False, min_value=1)
    actor = serializers.IntegerField(required=False, min_value=1)
    team = serializers.IntegerField(required=False, min_value=1)
    evaluation = serializers.IntegerField(required=False, min_value=1)
    method = serializers.ChoiceField(
        required=False, choices=["GET", "POST", "PUT", "PATCH", "DELETE"]
    )
    status_code = serializers.IntegerField(required=False, min_value=100, max_value=599)
    level = serializers.ChoiceField(required=False, choices=LogLevel.choices)
    source = serializers.ChoiceField(required=False, choices=LogSource.choices)
    page = serializers.IntegerField(required=False, min_value=1)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["from"] = serializers.DateTimeField(required=False)
        self.fields["to"] = serializers.DateTimeField(required=False)

    def validate(self, attrs):
        if "from" in attrs and "to" in attrs and attrs["from"] > attrs["to"]:
            raise serializers.ValidationError("La borne de début dépasse la fin.")
        return attrs


def filter_logs(queryset, params):
    serializer = LogFilterSerializer(data=params)
    serializer.is_valid(raise_exception=True)
    filters = serializer.validated_data
    lookups = {
        "organization": "organization_id",
        "organization_id": "organization_id",
        "actor": "actor_id",
        "team": "team_id",
        "evaluation": "evaluation_id",
        "from": "created_at__gte",
        "to": "created_at__lte",
        "method": "method",
        "status_code": "status_code",
        "level": "level",
        "source": "source",
    }
    for key, lookup in lookups.items():
        if key in filters:
            queryset = queryset.filter(**{lookup: filters[key]})
    return queryset


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
    return queryset
