from django.contrib import admin

from notifications.delivery import (
    confirm_accepted_notifications,
    retry_notifications,
    retry_uncertain_notifications,
)
from notifications.models import EmailNotification


@admin.register(EmailNotification)
class EmailNotificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "subject",
        "organization",
        "state",
        "attempts",
        "created_at",
        "next_attempt_at",
    )
    list_filter = ("state", "organization", "created_at")
    fields = list_display + ("error_code", "sent_at")
    readonly_fields = fields
    actions = ("retry_failed", "retry_uncertain", "confirm_accepted")

    def has_module_permission(self, request):
        return request.user.is_active and request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        return self.has_module_permission(request)

    def has_change_permission(self, request, obj=None):
        return self.has_module_permission(request)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.action(description="Reprogrammer les notifications en échec ou en reprise")
    def retry_failed(self, request, queryset):
        count = retry_notifications(queryset)
        self.message_user(request, f"{count} notification(s) reprogrammée(s).")

    @admin.action(description="Après vérification SMTP : reprendre les remises incertaines")
    def retry_uncertain(self, request, queryset):
        count = retry_uncertain_notifications(queryset)
        self.message_user(request, f"{count} notification(s) reprogrammée(s).")

    @admin.action(description="Confirmer l’acceptation dans les journaux SMTP")
    def confirm_accepted(self, request, queryset):
        count = confirm_accepted_notifications(queryset)
        self.message_user(request, f"{count} acceptation(s) confirmée(s), sans nouvel envoi.")
