## EPIC-010 — Traçabilité opérationnelle

Cet Epic régularise deux verticales déjà livrées. Dans `main`, elles restent distinctes sous les noms
**Journal d’activité** et **Journal des erreurs** ; la transformation éventuelle en « Logs » n’est pas livrée.

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

### FEAT-040 — Consulter le Journal des erreurs

- **Intention métier :** diagnostiquer les opérations refusées ou échouées sans exposer de donnée sensible.
- **Acteurs concernés :** `Superadmin` global et `Admin` dans son organisation.
- **Description :** consulter séparément les erreurs fonctionnelles nettoyées et leur identifiant de corrélation.
- **Priorité :** P1.

#### JOURNAL-002 — Consulter les opérations en erreur

- **Identifiant / Feature parente :** `JOURNAL-002` / `FEAT-040`.
- **Nature :** régularisation documentaire du comportement livré le 2026-09-28.
- **User story :** en tant qu’administrateur autorisé, je veux filtrer les erreurs nettoyées afin de diagnostiquer un échec sans divulguer de secret.
- **Critères d’acceptation :** lecture seule distincte des activités, ordre antéchronologique, pagination et mêmes filtres ; opération, catégorie, message nettoyé et corrélation ; absence de corps, traceback, token, cookie ou credential ; Admin cloisonné, erreurs système réservées au Superadmin.
- **Principaux refus :** anonyme, Coach, Viewer, écriture, organisation hors périmètre.
- **Valeur apportée :** facilite le diagnostic fonctionnel sans exposer les données techniques sensibles.
- **Dépendances / preuves :** `FEAT-004` ; modèle, API `/api/admin/error-journal/`, UI `/error-journal`, OpenAPI et tests backend/React/E2E.
