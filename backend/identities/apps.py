from django.apps import AppConfig


class IdentitiesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "identities"

    def ready(self):
        from identities.membership_invariants import register_membership_invariants

        register_membership_invariants()
