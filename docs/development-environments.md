# Environnements et identités locales

## Sélection explicite des réglages

Django utilise deux modules de réglages sans détection implicite :

- `config.settings_development` active `ENVIRONMENT = "development"`, le mode debug et l'application
  `development_data` ; pytest et `scripts/dev-backend.ps1` sélectionnent ce module ;
- `config.settings_production` active `ENVIRONMENT = "production"`, désactive le mode debug et n'installe
  jamais `development_data` ; les points d'entrée ASGI et WSGI sélectionnent ce module.

`manage.py`, ASGI et WSGI utilisent par défaut `config.settings`, alias sûr vers la production. Une exécution de production doit fournir
`DJANGO_SECRET_KEY`. Elle peut aussi définir `DJANGO_ALLOWED_HOSTS` et `DJANGO_CSRF_TRUSTED_ORIGINS` sous forme
de listes séparées par des virgules. Une configuration absente ne bascule donc jamais vers le développement.

## Credentials fictifs réservés au développement local

Le bootstrap crée les trois identités actives suivantes avec le mot de passe commun
`AssessTeams-Local-2026!` :

| Fonction | Identifiant |
| --- | --- |
| Admin | `admin.dev@assess-teams.local` |
| Coach | `coach.dev@assess-teams.local` |
| Viewer | `viewer.dev@assess-teams.local` |

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

La commande est idempotente : elle crée uniquement une identité réservée absente, ne duplique rien et ne
modifie aucun compte existant. Une collision incohérente avec un identifiant réservé arrête le bootstrap
explicitement sans modification partielle.

## Garantie de production

L'application `development_data` n'appartient pas aux applications installées en production : sa commande
n'est donc pas chargée par les points d'entrée ASGI/WSGI. Elle possède en plus un refus défensif lorsque
`ENVIRONMENT` n'est pas `development`. Aucun démarrage, migration ou défaut de configuration de production ne
peut créer ces trois comptes.
