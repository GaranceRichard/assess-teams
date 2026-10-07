from drf_spectacular.utils import PolymorphicProxySerializer, inline_serializer
from rest_framework import serializers
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class PageQuerySerializer(serializers.Serializer):
    page = serializers.IntegerField(min_value=1, required=False)


class CollectionQuerySerializer(PageQuerySerializer):
    organization_id = serializers.IntegerField(min_value=1, required=False)


class CollectionPagination(PageNumberPagination):
    page_size = 20


def collection_schema(serializer):
    name = serializer.__name__.removesuffix("Serializer")
    envelope = inline_serializer(
        name=f"{name}Page",
        fields={
            "count": serializers.IntegerField(),
            "next": serializers.URLField(allow_null=True),
            "previous": serializers.URLField(allow_null=True),
            "results": serializer(many=True),
        },
    )
    return PolymorphicProxySerializer(
        component_name=f"{name}Collection",
        serializers=[serializer(many=True), envelope],
        resource_type_field_name=None,
        many=False,
    )


def collection_response(request, queryset, serializer, organization_field=None, context=None):
    query_type = CollectionQuerySerializer if organization_field else PageQuerySerializer
    query = query_type(data=request.query_params)
    query.is_valid(raise_exception=True)
    organization_id = query.validated_data.get("organization_id")
    if organization_id is not None:
        queryset = queryset.filter(**{organization_field: organization_id})
    if "page" not in query.validated_data:
        return Response(serializer(queryset, many=True, context=context or {}).data)
    order = queryset.query.order_by or queryset.model._meta.ordering or ["pk"]
    queryset = queryset.order_by(*order, "pk")
    pagination = CollectionPagination()
    items = pagination.paginate_queryset(queryset, request)
    return pagination.get_paginated_response(
        serializer(items, many=True, context=context or {}).data
    )
