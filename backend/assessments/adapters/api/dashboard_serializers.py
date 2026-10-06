from rest_framework import serializers

from identities.adapters.api.session_serializers import SessionUserSerializer


class DashboardProfileSerializer(SessionUserSerializer):
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)


class DashboardActivitySerializer(serializers.Serializer):
    run_id = serializers.IntegerField()
    type = serializers.ChoiceField(choices=["completed", "revised"])
    organization_id = serializers.IntegerField()
    organization_name = serializers.CharField(help_text="Organisation snapshotée de la passation.")
    team_name = serializers.CharField(help_text="Équipe snapshotée de la passation.")
    model_name = serializers.CharField(help_text="Modèle snapshoté de la passation.")
    version = serializers.IntegerField(help_text="Version exacte du modèle immuable référencé.")
    occurred_at = serializers.DateTimeField()
    author_name = serializers.CharField(allow_null=True, help_text="Masqué pour Viewer.")


class DashboardSerializer(serializers.Serializer):
    profile = DashboardProfileSerializer()
    activity_scope = serializers.ChoiceField(choices=["global", "accessible_results"])
    recent_activity = DashboardActivitySerializer(many=True)
    pending_assignments = serializers.IntegerField(
        allow_null=True,
        help_text="Assignations persistées réalisables ; null pour Viewer/Superadmin.",
    )
