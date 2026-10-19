from django.apps import AppConfig
from django.conf import settings

from config.journal_retention import validate_journal_retention
from config.startup_security import validate_production_settings


class ConfigurationConfig(AppConfig):
    name = "config"

    def ready(self):
        validate_journal_retention(settings.JOURNAL_RETENTION)
        validate_production_settings(settings)
