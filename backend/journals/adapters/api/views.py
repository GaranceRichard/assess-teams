from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.authentication import SessionAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from journals.adapters.api.filters import JournalFilterSerializer, filter_entries
from journals.adapters.api.permissions import CanViewJournals
from journals.adapters.api.scope import visible_activity_entries, visible_error_entries
from journals.adapters.api.serializers import (
    ActivityEntrySerializer,
    ActivityPageSerializer,
    ErrorEntrySerializer,
    ErrorPageSerializer,
)


class JournalPagination(PageNumberPagination):
    page_size = 20


class ActivityJournalView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanViewJournals]

    @extend_schema(
        description=(
            "Liste les actions métier réussies. Le Superadmin voit le périmètre global ; "
            "l’Admin voit exclusivement son organisation."
        ),
        parameters=[JournalFilterSerializer],
        responses={200: ActivityPageSerializer, 400: OpenApiResponse(), 403: OpenApiResponse()},
    )
    def get(self, request):
        entries = filter_entries(visible_activity_entries(request.user), request.query_params)
        paginator = JournalPagination()
        page = paginator.paginate_queryset(entries, request, view=self)
        data = ActivityEntrySerializer(page, many=True).data
        return paginator.get_paginated_response(data)


class ErrorJournalView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanViewJournals]

    @extend_schema(
        description=(
            "Liste les erreurs applicatives nettoyées. Les erreurs système sans organisation "
            "sont réservées au Superadmin."
        ),
        parameters=[JournalFilterSerializer],
        responses={200: ErrorPageSerializer, 400: OpenApiResponse(), 403: OpenApiResponse()},
    )
    def get(self, request):
        entries = filter_entries(visible_error_entries(request.user), request.query_params)
        paginator = JournalPagination()
        page = paginator.paginate_queryset(entries, request, view=self)
        data = ErrorEntrySerializer(page, many=True).data
        return paginator.get_paginated_response(data)
