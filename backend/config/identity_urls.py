from django.urls import path

from identities.adapters.api.lifecycle_views import DeactivateUserView, ReactivateUserView

urlpatterns = [
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
