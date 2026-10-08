import os

from config.settings_base import *  # noqa: F403

ENVIRONMENT = "development"
SECRET_KEY = "local-development-key-not-for-production"
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost", "testserver"]
CSRF_TRUSTED_ORIGINS = [
    "http://127.0.0.1:5173",
    f"http://127.0.0.1:{os.getenv('ASSESS_E2E_FRONTEND_PORT', '5180')}",
]
INSTALLED_APPS = [*INSTALLED_APPS, "development_data"]  # noqa: F405
EMAIL_BACKEND = "django.core.mail.backends.filebased.EmailBackend"
EMAIL_FILE_PATH = BASE_DIR / ".mail"  # noqa: F405
DEFAULT_FROM_EMAIL = "Assess teams <noreply@assess-teams.local>"
FRONTEND_URL = os.getenv(
    "APP_BASE_URL", f"http://127.0.0.1:{os.getenv('ASSESS_E2E_FRONTEND_PORT', '5173')}"
).rstrip("/")
