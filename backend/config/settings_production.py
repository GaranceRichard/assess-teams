import os

from config.http_security import production_http_settings
from config.settings_base import *  # noqa: F403

ENVIRONMENT = "production"
DEBUG = False
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
HTTP_SECURITY = production_http_settings(os.environ)
globals().update(HTTP_SECURITY)
MIDDLEWARE = [
    MIDDLEWARE[0],  # noqa: F405 - retain HTTP logging around transport refusals.
    "config.http_middleware.HttpSecurityMiddleware",
    *MIDDLEWARE[1:],  # noqa: F405
]
SPECTACULAR_SETTINGS = {
    **SPECTACULAR_SETTINGS,  # noqa: F405
    "SERVERS": [{"url": HTTP_SECURITY["FRONTEND_URL"]}],
    "DESCRIPTION": (
        "Contrat HTTP du backend Assess teams. Production : HTTPS obligatoire ; "
        "400 pour transport, hôte ou proxy non fiable ; 301 pour accès HTTP sûr ; "
        "CSRF et origine contrôlés sur les mutations, réponses API sans cache."
    ),
}
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "false").lower() == "true"
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", str(not EMAIL_USE_SSL)).lower() == "true"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_TIMEOUT = 10
EMAIL_DELIVER_ON_COMMIT = False
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@assess-teams.local")
