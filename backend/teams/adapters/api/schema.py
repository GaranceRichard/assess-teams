from drf_spectacular.serializers import PolymorphicProxySerializerExtension
from drf_spectacular.utils import PolymorphicProxySerializer


class TeamReadCollectionSerializer(PolymorphicProxySerializer):
    """Schema-only union of overlapping Coach/Admin list projections."""


class TeamReadCollectionExtension(PolymorphicProxySerializerExtension):
    target_class = TeamReadCollectionSerializer
    priority = 1

    def map_serializer(self, auto_schema, direction):
        schema = super().map_serializer(auto_schema, direction)
        # An empty list and an Admin item also satisfy the minimal Coach schema.
        return {"anyOf": schema["oneOf"]}
