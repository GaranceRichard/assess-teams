from django.urls import path

from identities.adapters.api.lifecycle_views import DeactivateUserView, ReactivateUserView
from identities.adapters.api.password_views import (
    PasswordChangeView,
    PasswordRecoveryView,
    PasswordResetView,
)

urlpatterns = [
    path("api/password/recovery/", PasswordRecoveryView.as_view(), name="password-recovery"),
    path("api/password/reset/", PasswordResetView.as_view(), name="password-reset"),
    path("api/session/password/", PasswordChangeView.as_view(), name="session-password"),
    path(
        "api/admin/users/<int:user_id>/deactivate/",
        DeactivateUserView.as_view(),
        name="user-deactivate",
    ),
    path(
        "api/admin/users/<int:user_id>/reactivate/",
        ReactivateUserView.as_view(),
        name="user-reactivate",
    ),
]
