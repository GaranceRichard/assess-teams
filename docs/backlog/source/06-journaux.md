## EPIC-010 — Traçabilité opérationnelle

Cet Epic régularise deux verticales déjà livrées. Dans `main`, elles restent distinctes sous les noms
**Journal d’activité** et **Logs** : le premier retrace les actions métier réussies, le second les événements
applicatifs nettoyés utiles à l’exploitation et au diagnostic.

### FEAT-039 — Consulter le Journal d’activité

- **Intention métier :** retrouver les mutations métier réussies sans les déduire de l’état courant.
- **Acteurs concernés :** `Superadmin` global et `Admin` dans son organisation.
- **Description :** consulter en lecture seule des activités horodatées avec action, description et snapshots.
- **Priorité :** P1.

#### JOURNAL-001 — Consulter les activités métier réussies

- **Identifiant / Feature parente :** `JOURNAL-001` / `FEAT-039`.
- **Nature :** régularisation documentaire du comportement livré le 2026-09-28.
- **User story :** en tant qu’administrateur autorisé, je veux filtrer le Journal d’activité afin d’expliquer les changements réussis de mon périmètre.
- **Critères d’acceptation :** lecture seule, ordre antéchronologique, pagination et filtres date/organisation/auteur/équipe ; snapshots lisibles après suppression ; activité créée seulement après succès ; Admin cloisonné et erreurs système invisibles.
- **Principaux refus :** anonyme, Coach, Viewer, écriture, organisation hors périmètre.
- **Valeur apportée :** explique les changements réussis sans dépendre de l’état courant des objets.
- **Dépendances / preuves :** `FEAT-004` ; modèle, API `/api/admin/activity-journal/`, UI `/activity-journal`, OpenAPI et tests backend/React/E2E.

### FEAT-040 — Consulter les Logs

- **Intention métier :** comprendre les événements applicatifs utiles sans exposer de donnée sensible.
- **Acteurs concernés :** `Superadmin` global et `Admin` dans son organisation.
- **Description :** consulter séparément les logs `INFO`, `WARNING` et `ERROR`, nettoyés et corrélables.
- **Priorité :** P1.

#### JOURNAL-002 — Consulter les logs applicatifs

- **Identifiant / Feature parente :** `JOURNAL-002` / `FEAT-040`.
- **Nature :** évolution du journal d’erreurs livrée le 2026-09-29, avec conservation de l’historique ; extension HTTP exhaustive le 2026-10-05.
- **User story :** en tant qu’administrateur autorisé, je veux filtrer les logs nettoyés afin de diagnostiquer un événement sans divulguer de secret.
- **Critères d’acceptation :** lecture seule distincte des activités, ordre antéchronologique, pagination et filtres organisation/utilisateur/équipe/évaluation/du/au/méthode/niveau/source/statut ; capture GET/POST/PUT/PATCH/DELETE succès et erreurs sur API applicative, sans récursion ; message nettoyé et corrélation ; absence de corps, headers/query sensibles, IP/User-Agent/fingerprint, traceback, token, cookie ou credential ; Admin cloisonné, logs système réservés au Superadmin.
- **Principaux refus :** anonyme, Coach, Viewer, écriture, organisation hors périmètre.
- **Valeur apportée :** facilite le diagnostic fonctionnel sans exposer les données techniques sensibles.
- **Dépendances / preuves :** `FEAT-004` ; modèle, API `/api/admin/logs/`, UI `/logs`, OpenAPI et tests backend/React/E2E.
