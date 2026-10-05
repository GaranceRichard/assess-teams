# EVAL-003 — Versionner les modèles d’évaluation

- **Feature parente :** `FEAT-014 — Versionner un modèle sans réécrire le passé`.
- **Nature :** évolution du référentiel local ; réalisée le 2026-10-05.
- **Acteurs :** Superadmin global et Admin uniquement dans son organisation.
- **User story :** faire évoluer un questionnaire par une nouvelle version tout en conservant
  les planifications/passations et leurs références exactes.
- **Dépendances :** `EVAL-002`, `PLAN-001`, `PASS-001` et mécanismes de journaux existants.

## Critères réalisés

- Famille stable organisationnelle et versions entières uniques ; création initiale en v1 brouillon.
- Création explicite depuis toute version : prochain numéro, copie exacte des questions et de leur ordre,
  source intacte, protection transactionnelle/DB et test de créations réellement concurrentes sur SQLite.
- Lifecycle irréversible ; seule une version brouillon est modifiable. La validation refuse un référentiel
  incomplet et archive automatiquement la version active précédente dans la même transaction.
- Planning réservé aux versions actuellement validées ; anciennes FK exactes conservées après archivage.
- Runs/snapshots conservés ; passation commencée sur v1 finalisable après activation de v2.
- `/templates` indique famille, version, statut et version active ; actions selon état et nouvelle version.
- Journal métier avec famille/version et Logs communs ; isolation et IDs forgés testés.
- Migration additive sans réidentification ni regroupement supposé des anciens modèles.
- OpenAPI, tests API/ORM/migration/concurrence, Vitest et cycle significatif Playwright.

Le [choix d’architecture et la politique active](../../architecture/evaluation-versioning.md) détaillent
les contraintes, la migration, les verrous et le comportement des attentes encore non démarrées.

## Limites explicites

Aucun résultat agrégé, comparaison temporelle/statistique, branche, rollback, publication externe
ni import/export. La consultation autonome Viewer des familles n’est pas ajoutée : permissions existantes
conservées. Le parcours Viewer plus large de `FEAT-014` reste à raffiner.
