from django.apps import AppConfig
from django.conf import settings

from config.startup_security import validate_production_settings


class ConfigurationConfig(AppConfig):
    name = "config"

    def ready(self):
        validate_production_settings(settings)
