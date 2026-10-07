from rest_framework import serializers

from assessments.adapters.api.result_history_serializers import ResultOrganizationSerializer


class SteeringQuerySerializer(serializers.Serializer):
    organization_id = serializers.IntegerField(min_value=1, required=False)
    page = serializers.IntegerField(min_value=1, required=False)


class SteeringCoachSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class SteeringLastResultSerializer(serializers.Serializer):
    run_id = serializers.IntegerField()
    evaluation_id = serializers.IntegerField()
    family_id = serializers.IntegerField()
    model_name = serializers.CharField(help_text="Nom snapshoté de la dernière passation.")
    version = serializers.IntegerField()
    completed_at = serializers.DateTimeField()


class SteeringTeamSerializer(serializers.Serializer):
    team_id = serializers.IntegerField()
    team_name = serializers.CharField()
    coaches = SteeringCoachSerializer(many=True)
    last_result = SteeringLastResultSerializer(allow_null=True)
    next_due_date = serializers.DateField(allow_null=True)
    status = serializers.ChoiceField(choices=["overdue", "never_evaluated", "up_to_date"])


class SteeringSummarySerializer(serializers.Serializer):
    active_teams = serializers.IntegerField(help_text="Équipes actives de cette organisation.")
    teams_with_results = serializers.IntegerField(help_text="Au moins une COMPLETED accessible.")
    teams_without_results = serializers.IntegerField(help_text="Aucune COMPLETED accessible.")
    overdue_evaluations = serializers.IntegerField(
        help_text="Passations attendues non complétées, due_date < as_of_date, équipes actives."
    )
    last_completed_at = serializers.DateTimeField(allow_null=True)


class SteeringPaginationSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    page = serializers.IntegerField()
    pages = serializers.IntegerField()


class SteeringSerializer(serializers.Serializer):
    organization = ResultOrganizationSerializer()
    as_of_date = serializers.DateField()
    summary = SteeringSummarySerializer()
    teams = SteeringTeamSerializer(many=True)
    pagination = SteeringPaginationSerializer(required=False)
