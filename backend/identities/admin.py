from datetime import timedelta

from django.contrib import admin
from django.utils import timezone

from identities.models import User
from identities.password_models import PasswordResetDelivery
from notifications.admin import EmailNotificationAdmin


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


@admin.register(PasswordResetDelivery)
class PasswordResetDeliveryAdmin(EmailNotificationAdmin):
    list_display = ("id", "state", "attempts", "created_at", "next_attempt_at")
    list_filter = ("state", "created_at")
    fields = list_display + ("error_code",)
    readonly_fields = fields
    actions = ("retry_failed", "retry_uncertain", "confirm_accepted")

    def recovery_candidates(self, queryset):
        return queryset.filter(created_at__gte=timezone.now() - timedelta(minutes=15))

    @admin.action(description="Reprogrammer les récupérations en échec encore valides")
    def retry_failed(self, request, queryset):
        super().retry_failed(request, self.recovery_candidates(queryset))

    @admin.action(description="Après vérification SMTP : reprendre les remises incertaines valides")
    def retry_uncertain(self, request, queryset):
        super().retry_uncertain(request, self.recovery_candidates(queryset))

    @admin.action(description="Confirmer l’acceptation dans les journaux SMTP")
    def confirm_accepted(self, request, queryset):
        count, _ = queryset.filter(state="unknown").delete()
        self.message_user(request, f"{count} acceptation(s) confirmée(s), sans nouvel envoi.")
