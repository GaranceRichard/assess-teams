# Environnements et identités locales

## Installation et lancement

Prérequis : Python 3.12 ou 3.13, Node.js 22 ou 24, npm et PowerShell (PowerShell 7 sous macOS/Linux).
Depuis la racine du clone, `npm run dev:all` prépare chaque runtime local : dépendances racine/frontend,
`backend/.venv`, requirements, migrations et identités fictives. Sous Windows, `npm.cmd` reste disponible.
La base locale `backend/db.sqlite3` est créée au lancement et ignorée par Git.
Chaque worktree possède ses dépendances propres, sans partage ni lien symbolique.

`Ctrl+Shift+B` lance le même parcours dans VS Code avec deux terminaux dédiés.
Les commandes séparées restent `npm run dev:backend` et `npm run dev:frontend` ; leurs scripts
`scripts/dev-backend.ps1` et `scripts/dev-frontend.ps1` peuvent être exécutés directement avec PowerShell.
Le premier lancement affiche la préparation des runtimes ; une erreur explicite arrête le service concerné.
Les suivants ne resynchronisent les dépendances que lorsque nécessaire.

- Interface React/Vite : `http://127.0.0.1:5173` ; proxy `/api/*` vers Django sur le port 8000.
- Django : `http://127.0.0.1:8000` ; santé `/api/health/`, schéma `/api/schema/`, Swagger UI `/api/docs/`.
- API et droits : [contrat backend](architecture/backend-api.md), plutôt qu’une seconde liste d’endpoints ici.

Le premier Superadmin technique est créé séparément, depuis `backend`, après les migrations :

```powershell
& .\.venv\Scripts\python.exe manage.py createsuperuser --settings=config.settings_development
```

Sous macOS/Linux, utiliser `.venv/bin/python`. Les comptes fictifs ci-dessous ne créent jamais ce Superadmin.
La [validation selon l’impact](quality/validation-costs.md) porte commandes qualité, hooks et publication.

Les [limites de connexion et proxies fiables](architecture/login-security.md) utilisent les mêmes variables
`LOGIN_ACCOUNT_LIMIT`, `LOGIN_ORIGIN_LIMIT`, `LOGIN_LIMIT_SECONDS` et `LOGIN_TRUSTED_PROXIES`
dans les deux environnements ; les en-têtes transférés sont ignorés sans proxy explicitement fiable.

## Sélection explicite des réglages

Django utilise deux modules de réglages sans détection implicite :

- `config.settings_development` active `ENVIRONMENT = "development"`, le mode debug et l'application
  `development_data` ; pytest et `scripts/dev-backend.ps1` sélectionnent ce module ;
- `config.settings_production` active `ENVIRONMENT = "production"`, désactive le mode debug et n'installe
  jamais `development_data` ; les points d'entrée ASGI et WSGI sélectionnent ce module.

`manage.py` utilise par défaut `config.settings`, alias vers la production ; ASGI et WSGI sélectionnent
directement `config.settings_production`. Une sélection externe `DJANGO_SETTINGS_MODULE` est respectée.
Une exécution de production doit fournir `DJANGO_SECRET_KEY` aléatoire, une `APP_BASE_URL` HTTPS
exacte et `DEFAULT_FROM_EMAIL` explicite hors développement ; [refus et rotation MEP-009](operations/configuration/startup-security.md).
Les listes `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS` et `DJANGO_TRUSTED_PROXIES`
restreignent hôtes, origines et pairs proxy ; leurs défauts et refus sont décrits dans la
[sécurisation HTTP](architecture/http-security.md). `DEFAULT_FROM_EMAIL` est une adresse d'expéditeur.
Une configuration absente ou invalide ne bascule jamais vers le développement.

En développement, les emails sont écrits dans `backend/.mail/`, ignoré par Git, sans contenu dans
le terminal. `dev:backend` lance les deux workers de [remise des courriels](architecture/email-notifications.md#exploitation-mess--on-premise).
`APP_BASE_URL` configure l’URL publique ; les tests isolés utilisent aussi `ASSESS_E2E_FRONTEND_PORT`.
En production, configurer SMTP et superviser `send_password_reset_emails --watch` et `send_pending_notifications --watch`, ou les planifier chaque minute.
Les notifications
d’évaluation arrivées à échéance peuvent être déclenchées manuellement avec :

```powershell
& .\.venv\Scripts\python.exe manage.py send_due_evaluation_notifications --settings=config.settings_development
```

En production, cette même commande doit être planifiée au moins quotidiennement par l’ordonnanceur de la
plateforme ; elle ignore les échéances futures et avance les récurrences dès la mise en file durable, indépendamment de SMTP.

## Credentials fictifs réservés au développement local

Le bootstrap crée les trois identités actives suivantes avec le mot de passe commun
`AssessTeams-Local-2026!` :

| Fonction | Identifiant |
| --- | --- |
| Admin | `Admin` |
| Coach | `Coach` |
| Viewer | `Viewer` |

Ces credentials sont fictifs et strictement réservés au développement local. Le Superadmin Django reste un
compte technique séparé et n'est jamais créé par ce mécanisme.

## Création et recréation

Le lancement normal exécute les migrations puis `seed_development_users` avant de démarrer Django :

```powershell
npm.cmd run dev:all
```

Après suppression de `backend/db.sqlite3`, relancer cette commande suffit à recréer la base et les trois
identités. La commande peut aussi être rejouée explicitement depuis `backend` :

```powershell
& .\.venv\Scripts\python.exe manage.py migrate --noinput --settings=config.settings_development
& .\.venv\Scripts\python.exe manage.py seed_development_users --settings=config.settings_development
```

La commande est idempotente : elle crée uniquement une identité réservée absente et réconcilie les anciens
identifiants locaux sans conserver de doublon. Elle restaure le rôle, l'activation et le mot de passe attendus
des trois comptes réservés, sans modifier les autres comptes. Une collision incohérente avec un identifiant
réservé arrête le bootstrap explicitement sans modification partielle.

## Garantie de production

L'application `development_data` n'appartient pas aux applications installées en production : sa commande
n'est donc pas chargée par les points d'entrée ASGI/WSGI. Elle possède en plus un refus défensif lorsque
`ENVIRONMENT` n'est pas `development`. Aucun démarrage, migration ou défaut de configuration de production ne
peut créer ces trois comptes.

Les [notifications fiables — MEP-004](architecture/email-notifications.md) utilisent deux workers locaux,
lancés par `dev:backend` ; les processus de production sont supervisés séparément.

Les wrappers qualité isolent aussi la base E2E via `ASSESS_E2E_DB` et trois ports par worktree ;
voir [validation proportionnée](quality/validation-costs.md). Le lancement normal conserve sa base locale.

[Inventaire MEP-036](operations/configuration/README.md) : sources et défauts exhaustifs, sensibilité,
obligations production et risques identifiés ; aucune configuration réelle ni secret reproduit.
