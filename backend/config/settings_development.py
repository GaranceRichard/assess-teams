from config.settings_base import *  # noqa: F403

ENVIRONMENT = "development"
SECRET_KEY = "local-development-key-not-for-production"
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost", "testserver"]
CSRF_TRUSTED_ORIGINS = ["http://127.0.0.1:5173", "http://127.0.0.1:5180"]
INSTALLED_APPS = [*INSTALLED_APPS, "development_data"]  # noqa: F405
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "Assess teams <noreply@assess-teams.local>"
FRONTEND_URL = "http://127.0.0.1:5173"
