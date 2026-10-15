# Inventaire — Django et SQLite

[Conventions, sensibilité et obligation](README.md#lecture-de-linventaire).
Sources : **B** = [settings_base.py](../../../backend/config/settings_base.py),
**D** = [settings_development.py](../../../backend/config/settings_development.py),
**P** = [settings_production.py](../../../backend/config/settings_production.py),
**L** = [login_security.py](../../../backend/config/login_security.py).
**G** désigne les défauts locaux `django/conf/global_settings.py` ; **R** ceux de `rest_framework/settings.py`.
Les constantes B s'appliquent aux deux environnements sauf surcharge D/P.

| Paramètre | Source | Défaut public / comportement | Sens. | Production |
| --- | --- | --- | --- | --- |
| `DJANGO_SETTINGS_MODULE` | [manage.py](../../../backend/manage.py), [ASGI](../../../backend/config/asgi.py), [WSGI](../../../backend/config/wsgi.py), [alias](../../../backend/config/settings.py) | manage : `config.settings` → production ; ASGI/WSGI : production ; `setdefault` respecte une sélection externe | C | Défaut production ; interdire le module D dans le service |
| `ENVIRONMENT` | D / P | `development` / `production`, constant, pas variable ENVIRONMENT | C | Fixe `production` |
| `DEBUG` | D / P | `True` / `False`, aucune variable DEBUG lue | C | Fixe `False` |
| `DJANGO_SECRET_KEY` → `SECRET_KEY` | D / P | D : constante fictive omise ; P : aucun défaut, accès direct à l'environnement | S | Requis ; robustesse/rotation non validées (R01) |
| `SECRET_KEY_FALLBACKS` | G | `[]`, aucune clé de rotation configurée | S | Défaut ; stratégie de rotation à définir |
| `BASE_DIR` | B | répertoire `backend` du checkout | I | Fixe ; conditionne DB et mail local |
| `INSTALLED_APPS` | B / D | Django admin/auth/contenttypes/sessions/messages/staticfiles, DRF, drf-spectacular, identities, teams, assessments, journals, notifications ; D ajoute development_data | C | Fixe B ; application D interdite |
| `MIDDLEWARE` | B / P | HttpLog, Security, Session, Common, CSRF, Auth, Messages, XFrameOptions ; P ajoute HttpSecurity après HttpLog | C | Fixe ; ordre de protection conservé |
| `ROOT_URLCONF` | B | `config.urls` | P | Fixe |
| `TEMPLATES.BACKEND` | B | `django.template.backends.django.DjangoTemplates` | P | Fixe |
| `TEMPLATES.DIRS` / `APP_DIRS` | B | `[]` / `True` | P | Fixe |
| `TEMPLATES.OPTIONS.context_processors` | B | request, auth, messages Django | P | Fixe |
| `WSGI_APPLICATION` / `ASGI_APPLICATION` | B | `config.wsgi.application` / `config.asgi.application` | P | Fixe ; serveur à provisionner |
| `DATABASES.default.ENGINE` | B | `django.db.backends.sqlite3` | P | Fixe, SQLite permanent |
| `DATABASES.default.NAME` | B / D | `BASE_DIR/db.sqlite3` ; D peut surcharger via ASSESS_E2E_DB | I | Exploitation : persistance/droits/backups ; R07 |
| `ASSESS_E2E_DB` | D | absent : DB ordinaire ; chemin non vide : DB E2E | I | Interdit ; ignoré par P |
| `DATABASES.default.OPTIONS` | B | timeout, transaction_mode et init_command explicites ; aucune variable SQLite lue | C | [Référence mesurée MEP-039](../sqlite/README.md) |
| `OPTIONS.timeout` | B | 5 s d’attente SQLite, pas une deadline HTTP | C | Référence MEP-039 ; refus d’upgrade possible avant ce délai |
| `OPTIONS.transaction_mode` / `init_command` | B | `DEFERRED` / `PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL;` | C | Explicite à chaque connexion |
| `PRAGMA foreign_keys` / `legacy_alter_table` | backend SQLite Django | `ON` / `OFF` à chaque connexion | C | Défaut moteur conservé |
| `journal_mode` / `synchronous` | B, init_command | `DELETE` / `FULL` ; testés sur fichier | C | WAL non retenu ; contrôle du fichier cible au déploiement |
| `DATABASES.default.ATOMIC_REQUESTS` / `AUTOCOMMIT` | B / Django ConnectionHandler | `False` explicite / `True` par défaut | C | Transactions métier explicites préservées |
| `DATABASES.default.CONN_MAX_AGE` / `CONN_HEALTH_CHECKS` | B / Django ConnectionHandler | `0` explicite / `False` par défaut | P | Fin de requête ; workers : fermeture à chaque passe |
| `DATABASES.default.USER` / `PASSWORD` / `HOST` / `PORT` | Django ConnectionHandler | chaînes vides ; SQLite fichier n'utilise pas ces credentials | S/I | Sans objet pour SQLite |
| `DATABASES.default.TIME_ZONE` / `DATABASE_ROUTERS` | Django ConnectionHandler / G | `None` / `[]` | P | Défaut |
| `DATABASES.default.TEST.CHARSET` / `COLLATION` / `MIGRATE` / `MIRROR` | Django ConnectionHandler | `None` / `None` / `True` / `None` | P | N/A tests |
| SQLite `detect_types` / `check_same_thread` / `uri` | backend SQLite Django | PARSE_DECLTYPES + PARSE_COLNAMES / False / True ; Django contrôle le partage de threads | C | Défaut interne, pas de variable |
| SQLite `cached_statements` / `isolation_level` | Python sqlite3 / backend Django | 128 / piloté par Django (None en autocommit), transactions atomic explicites | P | Défaut interne |
| `DATABASES.default.TEST.NAME` | Django ConnectionHandler | `None`, Django crée sa base de test | I | Interdit d'utiliser une base réelle pour les tests |
| `AUTH_USER_MODEL` | B | `identities.User` | C | Fixe |
| `AUTH_PASSWORD_VALIDATORS` | B | similarité attributs, longueur minimale 8, mots de passe communs, purement numériques | C | Fixe ; validateurs utilisateurs, pas de SECRET_KEY |
| `PASSWORD_RESET_TIMEOUT` | B | 259200 s (3 jours) pour invitation | C | Fixe |
| `PASSWORD_RECOVERY_TIMEOUT` | B | 3600 s pour lien de récupération | C | Fixe ; distinct de la fenêtre de remise |
| `LOGIN_ACCOUNT_LIMIT` | L, variable homonyme | 5 échecs, entier strictement positif | C | Défaut sûr existant ; adaptation explicite possible |
| `LOGIN_ORIGIN_LIMIT` | L, variable homonyme | 30 échecs, entier strictement positif | C | Défaut sûr existant |
| `LOGIN_LIMIT_SECONDS` | L, variable homonyme | 900 s, entier strictement positif | C | Défaut sûr existant |
| `LOGIN_TRUSTED_PROXIES` | L, variable homonyme | chaîne vide → `[]`, IP/CIDR ; réseaux stricts, mais /0 accepté | C | Conditionnel derrière proxy pour origine client ; R03 |
| `LANGUAGE_CODE` / `FORMAT_MODULE_PATH` | B | `fr-fr` / `config.formats` | P | Fixe |
| `DATE_FORMAT` / `SHORT_DATE_FORMAT` | [formats/fr](../../../backend/config/formats/fr/formats.py) | `d/m/Y` pour présentation humaine ; parsing API inchangé | P | Fixe |
| `TIME_FORMAT` / `DATETIME_FORMAT` / `SHORT_DATETIME_FORMAT` | formats/fr | `H:i` / `d/m/Y - H:i` / même DATETIME_FORMAT | P | Fixe |
| `CollectionPagination.page_size` | [collection_pagination](../../../backend/config/collection_pagination.py) | 20, pagination des collections avec paramètre page | P | Fixe ; pas de variable d'installation |
| `admin.site.login_form` | [urls.py](../../../backend/config/urls.py) | LimitedAdminAuthenticationForm, applique limites de connexion | C | Fixe |
| `TIME_ZONE` / `USE_I18N` / `USE_TZ` | B | `America/Toronto` / `True` / `True` | P | Fixe |
| `STATIC_URL` / `STATIC_ROOT` | B / G | `static/` / `None` | I | Exploitation : routage/collecte static à définir ; R08 |
| `DEFAULT_AUTO_FIELD` | B | `django.db.models.BigAutoField` | P | Fixe |
| `REST_FRAMEWORK.DEFAULT_PERMISSION_CLASSES` | B | `IsAuthenticated` ; exceptions publiques explicites dans les vues | C | Fixe |
| `REST_FRAMEWORK.DEFAULT_SCHEMA_CLASS` | B | `drf_spectacular.openapi.AutoSchema` | P | Fixe |
| `REST_FRAMEWORK.EXCEPTION_HANDLER` | B | `journals.exceptions.journal_exception_handler` | C | Fixe ; diagnostics contrôlés |
| `REST_FRAMEWORK.DEFAULT_AUTHENTICATION_CLASSES` | R | SessionAuthentication, BasicAuthentication ; certaines vues imposent SessionAuthentication | C | Défaut ; pas de secret frontend |
| `SPECTACULAR_SETTINGS.TITLE` / `VERSION` | B | `Assess teams API` / `1.0.0` | P | Fixe |
| `SPECTACULAR_SETTINGS.DESCRIPTION` | B / P | contrat HTTP ; P décrit HTTPS, refus 400, redirection 301 et absence de cache API | P | Fixe |
| `SPECTACULAR_SETTINGS.SERVE_INCLUDE_SCHEMA` / `SERVE_PERMISSIONS` | B | `False` / `AllowAny` pour docs et schéma | C | Fixe ; publication de documentation explicite |
| `SPECTACULAR_SETTINGS.POSTPROCESSING_HOOKS` | B | enums spectacular, strict_password_requests, operation_errors via journals.schema.operation_errors | P | Fixe |
| `SPECTACULAR_SETTINGS.SERVERS` | P | `[{'url': FRONTEND_URL}]`, absent en D | P | Calculé depuis URL requise |
| `AUTHENTICATION_BACKENDS` | G | ModelBackend Django | C | Défaut |
| `SESSION_ENGINE` / `SESSION_SERIALIZER` | G | sessions en DB / JSONSerializer | C | Défaut ; sessions protégées dans SQLite |
| `SESSION_COOKIE_AGE` | G | 1209600 s (14 jours) | C | Défaut ; pas une durée configurée MESS |
| `SESSION_SAVE_EVERY_REQUEST` / `SESSION_EXPIRE_AT_BROWSER_CLOSE` | G | `False` / `False` | C | Défaut |
| `CACHES.default.BACKEND` / `LOCATION` | G | LocMemCache / chaîne vide, processus local | P | Défaut ; limites de connexion stockées en DB |
| `LOGGING` / `LOGGING_CONFIG` | G | `{}` / `logging.config.dictConfig` ; journaux applicatifs en DB | C | Défaut ; rétention distincte MEP-042 |

Les valeurs de cookies, hôtes et HTTPS figurent dans [l'inventaire HTTP](http.md) ;
les constantes mail dans [l'inventaire SMTP](email.md). La base contient données personnelles,
hashes de mots de passe, sessions, files et historique : le chemin n'est pas un secret, son contenu l'est.
