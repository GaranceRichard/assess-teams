# Permissions API restrictives — MEP-008 / Job 1.8

[MEP-037 — matrice des actions par rôle et navigation](role-permissions.md) complète ce socle,
avec [refus API sans effet et preuves](role-permissions-validation.md), sans élargir les exceptions.

## Politique par défaut

Les réglages communs à development et production définissent
`REST_FRAMEWORK.DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]`.
Une nouvelle vue DRF sans permission spécifique exige donc une identité authentifiée,
y compris pour GET, HEAD et OPTIONS. Le refus précède le traitement métier et ne retourne
que l'erreur, sans données métier ni écriture. Une session inactive est refusée.

Ce socle ne remplace pas les permissions métier : les vues conservent leurs contrôles de
rôle et leurs scopes. Toute fonctionnalité exigeant un rôle particulier doit déclarer sa
permission métier. Une identité authentifiée satisfait seulement le socle global.

Les mécanismes d'authentification restent inchangés : les vues produit utilisent la session
Django et refusent les appels anonymes avec 403. Une vue héritant des réglages DRF utilise
également SessionAuthentication en premier et retourne 403 sans WWW-Authenticate.
La création technique `/api/users/` conserve Basic en premier et retourne 401 aux anonymes ;
un rôle interdit retourne 403. Les écritures authentifiées par session restent soumises à CSRF.

## Accès publics intentionnels

Chaque exception utilise explicitement `AllowAny`, jamais une liste vide de permissions.
Les autres protections de ces routes continuent de s'appliquer.

| Route | Nécessité et protections |
| --- | --- |
| `GET /api/health/` | Supervision ; statut applicatif et test SQL minimal, sans données métier. |
| `POST /api/session/login/` | Connexion ; identifiants actifs requis, CSRF, erreur non discriminante. |
| `POST /api/password/recovery/` | Récupération ; CSRF, limites persistées, réponse sans énumération. |
| `POST /api/password/reset/` | Réinitialisation ; CSRF, token limité et à usage unique, validateurs Django. |
| `POST /api/invitations/{uid}/{token}/` | Activation ; lien signé, expirant et à usage unique, validation du mot de passe. |
| `GET /api/schema/` et `GET /api/docs/` | Contrat et documentation existants, sans enregistrements métier ; `SPECTACULAR_SETTINGS.SERVE_PERMISSIONS = [AllowAny]`. |

`GET /api/session/` demeure protégé ; son refus anonyme initialise néanmoins le cookie CSRF
nécessaire à la connexion et à la récupération du mot de passe.
Un ajout public exige une déclaration explicite, une justification dans cet inventaire
et des tests de ses protections. Une liste vide contournerait la politique globale et est interdite.

## Preuves et revue documentaire

`test_default_api_permissions.py` reproduit une nouvelle vue sans permission : avant correction,
GET révèle des données et POST crée une organisation anonymement ; après correction, les sept
méthodes HTTP sont refusées, sans fuite ni écriture. Les tests couvrent aussi les sessions actives
des trois rôles, les sessions inactives et les écritures avec ou sans CSRF.

`test_api_permission_inventory.py` inventorie toutes les routes DRF enregistrées, interdit les
listes vides, fixe l'ensemble des exceptions publiques et vérifie les refus anonymes de chaque
méthode métier. Admin autorisé et Viewer refusé prouvent la conservation des rôles.
Les suites de session, invitations, récupération, réinitialisation, health et OpenAPI protègent
les parcours publics existants ; les E2E d'authentification et de permissions restent applicables.

La revue concerne README, contrat API, stratégie de tests et suivi MEP-008. Les règles des agents,
la charte qualité, la Definition of Done et les principes d'architecture restent applicables sans
modification : aucune migration, aucun rôle nouveau et aucun mécanisme d'authentification modifié.
La refonte des rôles reste hors MEP-008. [MEP-011](organization-isolation.md) complète les scopes
organisationnels, les références courantes et les [preuves API](organization-isolation-validation.md).
