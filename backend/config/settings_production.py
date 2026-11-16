from config.installation import load_installation
from config.settings_base import *  # noqa: F403

ENVIRONMENT = "production"
DEBUG = False
globals().update(load_installation())
MIDDLEWARE = [
    MIDDLEWARE[0],  # noqa: F405 - retain HTTP logging around transport refusals.
    "config.http_middleware.HttpSecurityMiddleware",
    *MIDDLEWARE[1:],  # noqa: F405
]
SPECTACULAR_SETTINGS = {
    **SPECTACULAR_SETTINGS,  # noqa: F405
    "SWAGGER_UI_DIST": "/static/swagger-ui",
    "SWAGGER_UI_FAVICON_HREF": "/static/swagger-ui/favicon-32x32.png",
    "SWAGGER_UI_SETTINGS": {
        "deepLinking": True,
        "validatorUrl": None,
        "queryConfigEnabled": False,
    },
    "SERVERS": [{"url": FRONTEND_URL}],  # noqa: F405
    "DESCRIPTION": (
        "Contrat HTTP du backend Assess teams. Production : HTTPS obligatoire ; "
        "400 pour transport, hôte ou proxy non fiable ; 301 pour accès HTTP sûr ; "
        "CSRF et origine contrôlés sur les mutations, réponses API sans cache."
    ),
}
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_TIMEOUT = 10
EMAIL_DELIVER_ON_COMMIT = False
