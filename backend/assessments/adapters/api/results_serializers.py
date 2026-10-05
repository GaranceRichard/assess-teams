from rest_framework import serializers


class ResultVersionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    family_id = serializers.IntegerField()
    family_name = serializers.CharField(source="family.name")
    version = serializers.IntegerField(min_value=1)
    organization_name = serializers.CharField(source="organization.name")


class ResultAxisSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    index = serializers.IntegerField(min_value=1)
    text = serializers.CharField()


class ResultTeamSerializer(serializers.Serializer):
    team_id = serializers.IntegerField()
    team_name = serializers.CharField()
    run_id = serializers.IntegerField()
    completed_at = serializers.DateTimeField()
    scores = serializers.ListField(child=serializers.IntegerField(min_value=0, max_value=10))


class ResultComparisonSerializer(serializers.Serializer):
    axes = ResultAxisSerializer(many=True)
    teams = ResultTeamSerializer(many=True)
