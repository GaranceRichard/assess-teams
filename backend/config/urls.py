from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from assessments.adapters.api.views import (
    EvaluationDetailView,
    EvaluationListCreateView,
    QuestionDetailView,
    QuestionListCreateView,
)
from health.views import HealthView
from identities.adapters.api.admin_views import (
    AcceptInvitationView,
    ManagedUserDetailView,
    ManagedUserListCreateView,
)
from identities.adapters.api.organization_views import (
    OrganizationDetailView,
    OrganizationListCreateView,
    OrganizationMemberUpdateView,
)
from identities.adapters.api.session_views import CurrentSessionView, LoginView, LogoutView
from identities.adapters.api.views import UserCreateView
from teams.adapters.api.views import TeamDetailView, TeamListCreateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthView.as_view(), name="health"),
    path("api/session/", CurrentSessionView.as_view(), name="session-current"),
    path("api/session/login/", LoginView.as_view(), name="session-login"),
    path("api/session/logout/", LogoutView.as_view(), name="session-logout"),
    path("api/users/", UserCreateView.as_view(), name="user-create"),
    path(
        "api/admin/evaluations/",
        EvaluationListCreateView.as_view(),
        name="evaluation-list",
    ),
    path(
        "api/admin/evaluations/<int:evaluation_id>/",
        EvaluationDetailView.as_view(),
        name="evaluation-detail",
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
