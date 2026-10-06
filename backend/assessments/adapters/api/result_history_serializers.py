from rest_framework import serializers

from assessments.adapters.api.results_serializers import (
    ResultAxisSerializer,
    ResultTeamSerializer,
    ResultVersionSerializer,
)


class ResultOrganizationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class ResultFamilyQuerySerializer(serializers.Serializer):
    organization_id = serializers.IntegerField(min_value=1)


class ResultFamilySerializer(ResultVersionSerializer):
    organization_id = serializers.IntegerField()


class ResultCriterionSerializer(ResultAxisSerializer):
    lineage_id = serializers.UUIDField()


class ResultFamilyComparisonSerializer(serializers.Serializer):
    evaluation_id = serializers.IntegerField()
    version = serializers.IntegerField(min_value=1)
    axes = ResultCriterionSerializer(many=True)
    teams = ResultTeamSerializer(many=True)


class ResultHistoryQuerySerializer(serializers.Serializer):
    team_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), required=False, default=list
    )


class ResultObservationSerializer(serializers.Serializer):
    run_id = serializers.IntegerField()
    team_name = serializers.CharField()
    completed_at = serializers.DateTimeField()
    score = serializers.IntegerField(min_value=0, max_value=10)
    criterion_text = serializers.CharField()
    evaluation_id = serializers.IntegerField()
    version = serializers.IntegerField(min_value=1)


class ResultHistoryTeamSerializer(serializers.Serializer):
    team_id = serializers.IntegerField()
    team_name = serializers.CharField()
    points = ResultObservationSerializer(many=True)


class ResultHistorySerializer(serializers.Serializer):
    lineage_id = serializers.UUIDField()
    criterion_text = serializers.CharField()
    teams = ResultHistoryTeamSerializer(many=True)
