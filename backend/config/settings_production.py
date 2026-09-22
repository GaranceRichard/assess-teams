import os

from config.settings_base import *  # noqa: F403

ENVIRONMENT = "production"
DEBUG = False
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
FRONTEND_URL = os.environ["APP_BASE_URL"].rstrip("/")
ALLOWED_HOSTS = [host for host in os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",") if host]
CSRF_TRUSTED_ORIGINS = [
    origin for origin in os.getenv("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",") if origin
]
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@assess-teams.local")
