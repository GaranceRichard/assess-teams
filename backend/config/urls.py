from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from health.views import HealthView
from identities.adapters.api.admin_views import (
    AcceptInvitationView,
    ManagedUserDetailView,
    ManagedUserListCreateView,
)
from identities.adapters.api.session_views import CurrentSessionView, LoginView, LogoutView
from identities.adapters.api.views import UserCreateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthView.as_view(), name="health"),
    path("api/session/", CurrentSessionView.as_view(), name="session-current"),
    path("api/session/login/", LoginView.as_view(), name="session-login"),
    path("api/session/logout/", LogoutView.as_view(), name="session-logout"),
    path("api/users/", UserCreateView.as_view(), name="user-create"),
    path("api/admin/users/", ManagedUserListCreateView.as_view(), name="managed-user-list"),
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
