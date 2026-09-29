from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.authentication import SessionAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from journals.adapters.api.filters import (
    JournalFilterSerializer,
    LogFilterSerializer,
    filter_entries,
)
from journals.adapters.api.permissions import CanViewJournals
from journals.adapters.api.scope import visible_activity_entries, visible_log_entries
from journals.adapters.api.serializers import (
    ActivityEntrySerializer,
    ActivityPageSerializer,
    LogEntrySerializer,
    LogPageSerializer,
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


class LogsView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanViewJournals]

    @extend_schema(
        description=(
            "Liste les événements applicatifs nettoyés. Les logs système sans organisation "
            "sont réservés au Superadmin."
        ),
        parameters=[LogFilterSerializer],
        responses={200: LogPageSerializer, 400: OpenApiResponse(), 403: OpenApiResponse()},
    )
    def get(self, request):
        entries = filter_entries(
            visible_log_entries(request.user),
            request.query_params,
            LogFilterSerializer,
        )
        paginator = JournalPagination()
        page = paginator.paginate_queryset(entries, request, view=self)
        data = LogEntrySerializer(page, many=True).data
        return paginator.get_paginated_response(data)
