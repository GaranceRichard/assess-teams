from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from assessments.adapters.api.lifecycle_views import ArchiveEvaluationView, ValidateEvaluationView
from assessments.adapters.api.question_views import QuestionDetailView, QuestionListCreateView
from assessments.adapters.api.result_history_views import (
    ResultCriterionHistoryView,
    ResultFamilyComparisonView,
    ResultFamilyListView,
    ResultOrganizationListView,
)
from assessments.adapters.api.results_views import ResultComparisonView, ResultVersionListView
from assessments.adapters.api.schedule_views import (
    EvaluationScheduleDetailView,
    EvaluationScheduleListCreateView,
)
from assessments.adapters.api.taking_views import (
    EvaluationFinalizeView,
    EvaluationRevisionView,
    EvaluationRunListView,
    EvaluationRunView,
    EvaluationScoreView,
)
from assessments.adapters.api.version_views import CreateEvaluationVersionView
from assessments.adapters.api.views import EvaluationDetailView, EvaluationListCreateView
from health.views import HealthView
from identities.adapters.api.admin_views import (
    ManagedUserDetailView,
    ManagedUserListCreateView,
)
from identities.adapters.api.invitation_views import AcceptInvitationView
from identities.adapters.api.organization_detail_views import OrganizationDetailView
from identities.adapters.api.organization_views import (
    OrganizationListCreateView,
    OrganizationMemberUpdateView,
)
from identities.adapters.api.session_views import CurrentSessionView, LoginView, LogoutView
from identities.adapters.api.views import UserCreateView
from journals.adapters.api.views import ActivityJournalView, LogsView
from teams.adapters.api.views import TeamDetailView, TeamListCreateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthView.as_view(), name="health"),
    path("api/session/", CurrentSessionView.as_view(), name="session-current"),
    path("api/session/login/", LoginView.as_view(), name="session-login"),
    path("api/session/logout/", LogoutView.as_view(), name="session-logout"),
    path("api/users/", UserCreateView.as_view(), name="user-create"),
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
    path("api/evaluations/", EvaluationRunListView.as_view(), name="evaluation-run-list"),
    path(
        "api/evaluations/<int:run_id>/",
        EvaluationRunView.as_view(),
        name="evaluation-run-detail",
    ),
    path(
        "api/evaluations/<int:run_id>/responses/<int:question_id>/",
        EvaluationScoreView.as_view(),
        name="evaluation-run-score",
    ),
    path(
        "api/evaluations/<int:run_id>/finalize/",
        EvaluationFinalizeView.as_view(),
        name="evaluation-run-finalize",
    ),
    path(
        "api/evaluations/<int:run_id>/revision/",
        EvaluationRevisionView.as_view(),
        name="evaluation-run-revision",
    ),
    path(
        "api/admin/evaluations/",
        EvaluationListCreateView.as_view(),
        name="evaluation-list",
    ),
    path(
        "api/admin/planning/",
        EvaluationScheduleListCreateView.as_view(),
        name="evaluation-schedule-list",
    ),
    path(
        "api/admin/planning/<int:schedule_id>/",
        EvaluationScheduleDetailView.as_view(),
        name="evaluation-schedule-detail",
    ),
    path(
        "api/admin/evaluations/<int:evaluation_id>/",
        EvaluationDetailView.as_view(),
        name="evaluation-detail",
    ),
    path(
        "api/admin/evaluations/<int:evaluation_id>/versions/",
        CreateEvaluationVersionView.as_view(),
        name="evaluation-new-version",
    ),
    path(
        "api/admin/evaluations/<int:evaluation_id>/validate/",
        ValidateEvaluationView.as_view(),
        name="evaluation-validate",
    ),
    path(
        "api/admin/evaluations/<int:evaluation_id>/archive/",
        ArchiveEvaluationView.as_view(),
        name="evaluation-archive",
    ),
    path(
        "api/admin/evaluations/<int:evaluation_id>/questions/",
        QuestionListCreateView.as_view(),
        name="question-list",
    ),
    path(
        "api/admin/questions/<int:question_id>/",
        QuestionDetailView.as_view(),
        name="question-detail",
    ),
    path(
        "api/admin/activity-journal/",
        ActivityJournalView.as_view(),
        name="activity-journal",
    ),
    path(
        "api/admin/logs/",
        LogsView.as_view(),
        name="logs",
    ),
    path("api/admin/users/", ManagedUserListCreateView.as_view(), name="managed-user-list"),
    path(
        "api/admin/organizations/",
        OrganizationListCreateView.as_view(),
        name="organization-list",
    ),
    path(
        "api/admin/organizations/<int:organization_id>/members/",
        OrganizationMemberUpdateView.as_view(),
        name="organization-members",
    ),
    path(
        "api/admin/organizations/<int:organization_id>/",
        OrganizationDetailView.as_view(),
        name="organization-detail",
    ),
    path(
        "api/admin/organizations/<int:organization_id>/teams/",
        TeamListCreateView.as_view(),
        name="team-list",
    ),
    path(
        "api/admin/teams/<int:team_id>/",
        TeamDetailView.as_view(),
        name="team-detail",
    ),
    path(
        "api/admin/users/<int:user_id>/",
        ManagedUserDetailView.as_view(),
        name="managed-user-detail",
    ),
    path(
        "api/invitations/<str:uid>/<str:token>/",
        AcceptInvitationView.as_view(),
        name="invitation-accept",
    ),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
