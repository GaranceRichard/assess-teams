# Inventaire — HTTPS, cookies, TLS et proxys

[Conventions](README.md#lecture-de-linventaire). **H** = [http_security.py](../../../backend/config/http_security.py),
**M** = [http_middleware.py](../../../backend/config/http_middleware.py), **D/P** = settings development/production,
**G** = défauts Django locaux. [Contrat existant MEP-002](../../architecture/http-security.md).
Aucune variable d'environnement SECURE_*, SESSION_* ou CSRF_* n'est lue directement.

| Paramètre | Source | Défaut public / développement → production | Sens. | Production |
| --- | --- | --- | --- | --- |
| `APP_BASE_URL` → `FRONTEND_URL` | D / H / P | D : HTTP local 5173 (ou port E2E), slash final retiré ; P : absent → refus, origine HTTPS normalisée | C | Requis en P, sans chemin, query, fragment ni credentials |
| `DJANGO_ALLOWED_HOSTS` → `ALLOWED_HOSTS` | D / H | D : 127.0.0.1, localhost, testserver ; P : hôte de APP_BASE_URL sans port | C | Défaut calculé ; liste exacte si fournie, hôte public inclus |
| `DJANGO_CSRF_TRUSTED_ORIGINS` → `CSRF_TRUSTED_ORIGINS` | D / H | D : HTTP 127.0.0.1:5173 et port E2E (5180 par défaut) ; P : APP_BASE_URL | C | Défaut calculé ; liste HTTPS exacte, origine publique incluse |
| `DJANGO_TRUSTED_PROXIES` → `TRUSTED_PROXIES` | H | vide → `[]` ; IP/CIDR stricts ; /0 interdit | C | Conditionnel : pairs réels si TLS terminé par proxy |
| `HTTP_SECURITY` | P / H | dictionnaire calculé ; injecté dans les globals P | C | Fixe, rassemble les paramètres H recensés ci-dessous |
| `SECURE_PROXY_SSL_HEADER` | G / H / M | D : `None` ; P : `(HTTP_X_FORWARDED_PROTO, https)` après validation du pair | C | Fixe ; ne pas activer seul hors middleware |
| `USE_X_FORWARDED_HOST` / `USE_X_FORWARDED_PORT` | G / H | `False` / `False` | C | Fixe ; en-têtes écartés par M |
| `SECURE_SSL_REDIRECT` | G / H | D : `False` ; P : `True` | C | Fixe `True` ; mutations HTTP refusées avant redirection |
| `SECURE_SSL_HOST` | G / H | D : `None` ; P : netloc APP_BASE_URL, port compris | C | Calculé ; destination redirection non contrôlée par client |
| `SECURE_HSTS_SECONDS` | G / H | D : 0 ; P : 31536000 s | C | Fixe, un an en HTTPS |
| `SECURE_HSTS_INCLUDE_SUBDOMAINS` / `SECURE_HSTS_PRELOAD` | G / H | `False` / `False` | C | Fixe ; choix MEP-002, avertissements W005/W021 attendus |
| `SECURE_CONTENT_TYPE_NOSNIFF` / `SECURE_REFERRER_POLICY` | G / H | `True` / `same-origin` | C | Fixe |
| `X_FRAME_OPTIONS` | G, middleware B | `DENY` | C | Défaut |
| `SESSION_COOKIE_SECURE` | G / H | D : `False` ; P : `True` | C | Fixe `True` |
| `SESSION_COOKIE_HTTPONLY` / `SESSION_COOKIE_SAMESITE` | G / H | `True` / `Lax` | C | Fixe |
| `SESSION_COOKIE_DOMAIN` / `SESSION_COOKIE_PATH` | G / H | `None` / `/` | C | Défaut/fixe ; pas de partage de domaine |
| `SESSION_COOKIE_NAME` | G, M | `sessionid` | P | Défaut ; valeur du cookie secrète, jamais inventoriée |
| `CSRF_COOKIE_SECURE` | G / H | D : `False` ; P : `True` | C | Fixe `True` |
| `CSRF_COOKIE_HTTPONLY` / `CSRF_COOKIE_SAMESITE` | G / H | `False` / `Lax` | C | Fixe ; React lit le jeton |
| `CSRF_COOKIE_DOMAIN` / `CSRF_COOKIE_PATH` | G / H | `None` / `/` | C | Défaut/fixe |
| `CSRF_COOKIE_NAME` / `CSRF_HEADER_NAME` | G, [auth.ts](../../../frontend/src/auth.ts) | `csrftoken` / `HTTP_X_CSRFTOKEN` ; React envoie X-CSRFToken | C | Défaut ; contenu du jeton omis |
| `CSRF_COOKIE_AGE` / `CSRF_USE_SESSIONS` | G | 31449600 s / `False` | C | Défaut |
| `CSRF_FAILURE_VIEW` | G | `django.views.csrf.csrf_failure` | P | Défaut |
| `Host` / `REMOTE_ADDR` | M, serveur, proxy | aucune valeur réelle ; hôte public et pair transport réel | C | Exploitation : préserver IP du pair, Host public avec port |
| `X-Forwarded-Proto` | M | absent autorisé en HTTPS direct ; sinon valeur unique http/https depuis pair fiable | C | Conditionnel derrière proxy : écraser la valeur client |
| `X-Forwarded-For` | [login_security adapter](../../../backend/identities/adapters/api/login_security.py) | ignoré sans LOGIN_TRUSTED_PROXIES ; chaîne analysée depuis le pair | C | Conditionnel pour origine des limites ; R03 |
| `Forwarded` / `X-Forwarded-Host` / `X-Forwarded-Port` | M | retirés avant Django | C | Fixe ; ne définissent jamais l'origine |
| `Cache-Control` API | M | P : `private, no-store`, y compris refus | C | Exploitation : proxy respecte absence de cache |
| API frontend / credentials fetch | [auth.ts](../../../frontend/src/auth.ts) et adapters React | chemins `/api/`, `same-origin`, header X-CSRFToken sur mutations | C | Fixe ; frontend et backend sur origine commune |
| Écoute backend / `proxy_pass` | [exemple HTTP](../../architecture/http-security.md#contrat-du-proxy-de-confiance) | exemple local HTTP 127.0.0.1:8000 ; aucun fichier proxy déployable livré | I | Exploitation : accès réseau restreint, topologie MESS à définir |
| Certificat TLS serveur / chaîne CA | infrastructure absente du dépôt | aucun chemin ni défaut réel | I | Exploitation obligatoire pour frontal HTTPS ; R08 |
| Clé privée TLS serveur | infrastructure absente du dépôt | aucun défaut, valeur omise | S | Exploitation obligatoire, externe au dépôt/package |
| Versions TLS / suites / renouvellement / redirection HTTP | infrastructure, contrat HTTP | non configurés par le dépôt | C | Exploitation à qualifier dans contrat/recette MESS ; R08 |

Les listes H séparent les entrées par virgules et refusent les entrées vides explicites.
Le développement n'installe pas M et conserve HTTP local. `LOGIN_TRUSTED_PROXIES` reste actif
via le socle commun dans les deux modes : l'absence de confiance en développement est un défaut,
pas une interdiction de cette variable. Cette liste n'accorde jamais la confiance au protocole TLS.
