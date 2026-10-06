from django.urls import path

from assessments.adapters.api.result_history_views import (
    ResultCriterionHistoryView,
    ResultFamilyComparisonView,
    ResultFamilyListView,
    ResultOrganizationListView,
)
from assessments.adapters.api.results_views import ResultComparisonView, ResultVersionListView

urlpatterns = [
    path(
        "api/results/organizations/",
        ResultOrganizationListView.as_view(),
        name="result-organizations",
    ),
    path("api/results/families/", ResultFamilyListView.as_view(), name="result-families"),
    path(
        "api/results/families/<int:family_id>/",
        ResultFamilyComparisonView.as_view(),
        name="result-family-comparison",
    ),
    path(
        "api/results/families/<int:family_id>/criteria/<uuid:lineage_id>/",
        ResultCriterionHistoryView.as_view(),
        name="result-criterion-history",
    ),
    path("api/results/versions/", ResultVersionListView.as_view(), name="result-versions"),
    path(
        "api/results/versions/<int:evaluation_id>/",
        ResultComparisonView.as_view(),
        name="result-comparison",
    ),
]
