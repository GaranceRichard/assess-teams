# Serveur, workers, ordonnanceur et code applicatif

[Index](README.md) · [bibliothèques communes](python.md).

L’application originale est Apache-2.0 ; LICENSE et NOTICE restent obligatoires et inchangés (acquis MEP-006).
Version source examinée : `9abde71` (MEP-054 documentaire inclus), code applicatif identique à `9d8cc6f`.
Les répertoires backend et frontend sont identifiés par les arbres Git ci-dessous ; toute évolution du candidat impose le rapprochement du nouvel arbre.

| Entrée ou arbre suivi | Identité / SHA-256 |
| --- | --- |
| backend/manage.py | eb4ab20c0190b0247d9230f908c1c35aa6a4ec87243c7c75c4fdc933d382c355 |
| backend/config/wsgi.py | 82ddaa6badabcee0d15f13b2fdacf7b6044bebfec9d89cf6cfec67a12ca9ba63 |
| backend/notifications/management/commands/send_pending_notifications.py | f4bb1c4e15dde8f671089b37b017875709c4d4e84f9370fb65cb7fed1da71553 |
| backend/identities/management/commands/send_password_reset_emails.py | 7da612ee099c4f8e6fe8a1dd73853b9e4ef39d19d6eea86c0474945fd47d30f5 |
| backend/assessments/management/commands/send_due_evaluation_notifications.py | 2509e279b6dba87d0971a79529f4eae5ed80dbaac55d49a2e72b560e545e96bf |
| backend/journals/management/commands/purge_journals.py | d89980165fb9a95f368fe71a2d6636772eddd4ea46fff5cd8191b9a8d84b2e27 |
| backend (Git tree SHA-1) | 3bec22a5ac6a75be3d7f281c16ec5459f26e5323 |
| frontend (Git tree SHA-1) | 8efbd417895603ce653c420efb504f76cda8197f |
| LICENSE | 074e6e32c86a4c0ef8b3ed25b721ca23aca83df277cd88106ef7177c354615ff |
| NOTICE | f3b889d12d1d31b63591778d8c115bf62f98bd9ae704563d552bc03c7e6bc6d7 |

## Fermeture des processus

- API : `config.wsgi:application`, CPython + Django/DRF/Spectacular + Waitress ; Caddy termine TLS et sert les statiques.
- Deux workers de remise : `send_pending_notifications` et `send_password_reset_emails`, commandes Django utilisant la même base et le même runtime que l’API.
- Échéances : `send_due_evaluation_notifications`, commande Django ; fuseau America/Toronto disponible dans tzdata.
- Purge acquise : `purge_journals`, commande Django bornée ; aucun droit de purge métier ni programmation automatique supplémentaire.
- Ordonnanceur du profil : Planificateur de tâches Windows, composant de l’OS Server 2022 Standard 10.0.20348.5873 de référence, non redistribué. Versions et empreintes réelles de Schedule/schtasks/taskschd à relever avec le build de l’hôte au préflight.
- Les fréquences du profil (remise chaque minute, échéances 02:00) ne créent ni Celery, Redis, APScheduler, cron, service wrapper ou module PowerShell externe.
- Aucun serveur ASGI additionnel, Gunicorn, IIS, Docker, Node ou npm requis sur cible par cette nomenclature.
- MEP-063 livrera services/tâches : aucune tâche n’est créée, aucun wrapper non livré n’est supposé. L’inventaire du candidat devra incorporer tout composant effectivement ajouté alors.

SQLite, smtplib, ssl, zoneinfo et les outils OS proviennent des composants déjà nommés ; le relais SMTP, le DNS, le temps et les certificats locaux restent des services/entrées du profil.
Leur compatibilité opérationnelle et les ACL se prouvent sur le banc réel ; aucune version de serveur SMTP ou de certificat privé n’est inventée.
`seed_development_users`, runserver, Vite et les données de développement ne constituent pas les entrées de production.
