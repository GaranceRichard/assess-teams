from drf_spectacular.serializers import PolymorphicProxySerializerExtension
from drf_spectacular.utils import OpenApiResponse, PolymorphicProxySerializer, extend_schema

from teams.adapters.api.serializers import TeamDetailErrorSerializer, TeamDetailSerializer


class TeamReadCollectionSerializer(PolymorphicProxySerializer):
    """Schema-only union of overlapping Coach/Admin list projections."""


class TeamReadCollectionExtension(PolymorphicProxySerializerExtension):
    target_class = TeamReadCollectionSerializer
    priority = 1

    def map_serializer(self, auto_schema, direction):
        schema = super().map_serializer(auto_schema, direction)
        # An empty list and an Admin item also satisfy the minimal Coach schema.
        return {"anyOf": schema["oneOf"]}


team_detail_schema = extend_schema(
    description=(
        "Consulte l'identité et l'état d'une équipe active ou archivée. "
        "Session active Superadmin (toute organisation) ou Admin membre de l'organisation. "
        "Coach actif actuellement affecté et membre courant de l'organisation (C04), "
        "y compris pour une archive. Ancienne affectation ou assignation de passation : "
        "aucun droit supplémentaire. Viewer refusé (403). "
        "Équipe inexistante ou hors périmètre : même 404 JSON sans donnée métier. "
        "Identifiant absent ou mal formé : 404 du routeur, potentiellement non JSON. "
        "Aucune mutation ni entrée au Journal métier ; le Log HTTP technique est conservé."
    ),
    responses={
        200: TeamDetailSerializer,
        403: OpenApiResponse(TeamDetailErrorSerializer, description="Session ou rôle refusé."),
        404: OpenApiResponse(TeamDetailErrorSerializer, description="Équipe introuvable."),
    },
)
