from django.contrib import admin

from identities.models import User


@admin.register(User)
class IdentityAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_superuser", "is_active")
    list_filter = ("is_active", "role", "is_superuser")
    search_fields = ("username", "email")
    actions = None

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
