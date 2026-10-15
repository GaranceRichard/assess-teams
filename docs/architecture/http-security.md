# Sécurisation HTTP — Job 1.2 / MEP-002

## Frontière de production

`config.settings_production` exige une `APP_BASE_URL` HTTPS exacte, sans credentials,
chemin applicatif, query ni fragment. L'application est publiée à la racine de cette origine ;
React et `/api/` sont servis sur la même origine par le proxy. Les invitations, notifications et
liens de récupération utilisent cette URL validée, jamais les en-têtes d'une requête.

| Variable | Contrat |
| --- | --- |
| `APP_BASE_URL` | Obligatoire, par exemple `https://assess.example` ou `https://assess.example:8443` |
| `DJANGO_ALLOWED_HOSTS` | Hôtes exacts, sans ports ni jokers ; défaut : hôte de l'URL publique |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Origines HTTPS exactes avec ports éventuels ; défaut : origine publique |
| `DJANGO_TRUSTED_PROXIES` | IP ou CIDR explicites des pairs proxy ; défaut : aucun |

Les listes sont séparées par des virgules ; les espaces autour des entrées sont retirés.
L'hôte public doit appartenir aux hôtes autorisés, et son origine aux origines CSRF.
Les valeurs invalides, entrées vides, CIDR avec bits d'hôte et réseaux universels `/0`
empêchent le démarrage. Une origine CSRF supplémentaire ne crée pas un accès CORS :
aucun CORS permissif n'est activé, et le client React reste sur l'origine publique.
La gestion de `DJANGO_SECRET_KEY` est définie par [MEP-009](../operations/configuration/startup-security.md).

## Contrat du proxy de confiance

Le middleware de sécurité, avant les contrôles HTTPS/session/CSRF, valide `Host`, puis vérifie l'adresse du pair transport
`REMOTE_ADDR`. Il ne consulte jamais `X-Forwarded-For` pour accorder la confiance.
Le serveur WSGI/ASGI doit préserver cette adresse réelle et laisser la classification du protocole
à ce middleware ; ne pas le configurer pour réécrire l'adresse du pair ou le schéma à partir
d'en-têtes clients. Limiter aussi l'accès réseau au backend aux proxys nécessaires.

Les [limites de connexion](login-security.md) utilisent séparément `LOGIN_TRUSTED_PROXIES`
pour identifier les clients via `X-Forwarded-For` ; cette liste n’accorde aucune confiance TLS.
Configurer les deux listes selon les pairs réels ; seul `DJANGO_TRUSTED_PROXIES` autorise le protocole.
MEP-009 refuse au démarrage un pair HTTP non couvert par LOGIN, les réseaux LOGIN universels
et une confiance LOGIN sans proxy HTTP ; les intermédiaires supplémentaires restent permis dans LOGIN.

Le proxy TLS transmet le `Host` public, port compris, et **remplace** `X-Forwarded-Proto`
par une valeur unique, exactement `https` ou `http`, calculée sur sa connexion entrante.
Il ne recopie ni ne concatène un en-tête fourni par le client. Dans une chaîne de proxys,
le dernier pair doit être autorisé et reconstruire cette valeur depuis une source contrôlée.

Exemple des directives de transmission Nginx dans le serveur qui termine TLS, à adapter aux IP réelles :

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Forwarded "";
    proxy_set_header X-Forwarded-Host "";
    proxy_set_header X-Forwarded-Port "";
}
```

Avec cet exemple, `DJANGO_TRUSTED_PROXIES=127.0.0.1` n'est approprié que si Nginx est
le pair réel ; les autres processus sur cette adresse entrent dans cette frontière de confiance.
Les certificats et leur installation MESS restent hors périmètre.
Le serveur frontal doit rediriger HTTP vers HTTPS avant toute collecte de credentials,
servir React en HTTPS et appliquer la même politique TLS aux autres routes publiées.

Un `X-Forwarded-Proto` reçu d'un pair non autorisé retourne `400`, même si
`X-Forwarded-For` prétend être un proxy autorisé. Une valeur vide, invalide ou une liste
retourne aussi `400`. Un proxy autorisé transmettant en HTTP sans cet en-tête reçoit `400` :
la configuration défectueuse ne devient pas une boucle de redirection.
`Forwarded`, `X-Forwarded-Host` et `X-Forwarded-Port` sont retirés et ne définissent jamais l'origine.
HTTPS direct sans en-tête proxy reste pris en charge, y compris depuis un pair autorisé.

## HTTPS, cookies et réponses sensibles

- Les requêtes sûres HTTP sont redirigées en `301` vers l'hôte et le port de `APP_BASE_URL`,
  avec leur chemin et query conservés. `Host` doit être autorisé ; aucun paramètre `next`
  ni en-tête forwarded ne choisit la destination.
- POST/PUT/PATCH/DELETE HTTP sont refusés en `400`, sans mutation ni cookie de session.
  Une redirection serveur ne peut pas protéger un mot de passe déjà envoyé en HTTP :
  le frontal et le navigateur doivent utiliser HTTPS dès le premier accès.
- HSTS vaut un an sur les réponses HTTPS. `includeSubDomains` et `preload` restent désactivés :
  l'application ne décide pas du TLS des autres services du domaine on-premise.
- Session : `Secure`, `HttpOnly`, `SameSite=Lax`, domaine absent, chemin `/` ; les attributs
  de sécurité sont conservés lors du renouvellement et de la suppression du cookie.
- CSRF : `Secure`, `SameSite=Lax`, domaine absent, chemin `/`. Le cookie reste lisible par React
  pour envoyer `X-CSRFToken`, conformément au contrat existant ; il n'est pas un identifiant de session.
- Les réponses `/api/`, y compris les refus et redirections passant par le middleware,
  portent `Cache-Control: private, no-store` ; le proxy doit respecter cette interdiction de cache.
- Django ajoute `X-Content-Type-Options: nosniff` et `Referrer-Policy: same-origin`.

## CSRF et développement

`GET /api/session/` initialise le cookie CSRF, même avec un `403` anonyme.
Login, acceptation d'invitation, récupération/réinitialisation de mot de passe et mutations
de session exigent CSRF ; les mutations authentifiées conservent `SessionAuthentication`.
Django contrôle le jeton et `Origin`, ou le `Referer` HTTPS en l'absence d'`Origin`.
Un jeton valide ne permet aucune mutation depuis une origine non autorisée ; une session
reste active après un refus CSRF. Le login renouvelle le jeton, que React relit depuis le cookie.

`config.settings_development` conserve HTTP local, cookies sans `Secure` et origines Vite/E2E
existantes ; il ne charge pas le middleware de production. Par défaut, aucune confiance proxy n'est accordée.
Une sélection explicite de LOGIN_TRUSTED_PROXIES reste possible via le socle commun de connexion.
Les points d'entrée déployés continuent de sélectionner la production par défaut.

## Validation et exploitation

La journalisation HTTP existante enveloppe aussi les refus de transport sans enregistrer leurs headers.
Les suites `test_http_security_configuration.py`, `test_http_security_transport.py` et
`test_http_security_sessions.py` couvrent les accès HTTPS direct/proxy IPv4/IPv6, redirections,
hôtes/origines, cache, cookies, session complète et vrais refus sans changement de préférence.
Elles complètent les tests existants de mutations métier et les parcours Playwright en HTTP local.

Exécuter `manage.py check --deploy` avec les variables de production avant ouverture du service.
Django émet volontairement `security.W005` et `security.W021` pour les choix de sous-domaines
et de preload décrits ci-dessus ; le test exige qu'aucun autre problème ne soit présent.
Vérifier depuis le frontal : absence de boucle, cookie `Secure`, refus CSRF et header proxy client
écrasé. Ces essais réels et la pose des certificats appartiennent à la recette d'infrastructure MESS.

Références : [réglages de sécurité Django 5.2](https://docs.djangoproject.com/en/5.2/ref/settings/#secure-proxy-ssl-header),
[CSRF](https://docs.djangoproject.com/en/5.2/ref/csrf/) et
[checklist de déploiement](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/).
