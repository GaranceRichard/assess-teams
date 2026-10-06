# EPIC-008 — Pilotage du dispositif : premier incrément P0

Cet incrément applique la [Vision produit](../../product/vision.md) : **Mesurer pour accompagner,
pas pour surveiller**, **Piloter sans réduire une équipe à un score**. Il complète partiellement
les [Features de pilotage](04-suivi-et-pilotage.md#epic-008--pilotage-du-dispositif), sans les
déclarer réalisées. Le [registre PBI](../tracking/pbis.md) porte statut et date.

## STEER-001 — Piloter la couverture et les échéances des équipes actives

- **Feature parente :** `FEAT-035 — Obtenir une vue globale du dispositif` (déclinaison limitée,
  avec portefeuille actif et états provenant de `FEAT-033`/`FEAT-034`).
- **Priorité :** P0 pour ce premier incrément ; les priorités des Features larges restent inchangées.
- **User story :** en tant qu’Admin ou Superadmin, je veux connaître les équipes suivies, celles
  disposant d’une complétion et celles nécessitant une attention, puis consulter les sources.
- **Accès :** Superadmin global avec choix obligatoire d’une seule organisation ; Admin dans son
  organisation unique imposée ; Coach/Viewer refusés. Backend autoritaire, IDs forgés refusés.
- **Vue livrée :** `/steering`, titre Pilotage, cinq cartes définies, tableau des équipes actives,
  Coachs affectés, dernier modèle snapshoté, version exacte, complétion, prochaine échéance et état.
- **Règles :** résultat = au moins une `COMPLETED` accessible ; dernière selon date initiale de
  complétion puis ID décroissants. Jamais évaluée si aucune complétion ; sinon En retard si une
  attente persistée non complétée a une échéance strictement passée ; sinon À jour. Aujourd’hui
  et le futur ne sont pas en retard. Tri retard/jamais/à jour, puis nom et ID.
- **Synthèse :** actifs, actifs avec/sans complétion, nombre d’attentes réellement en retard,
  dernière complétion connue des actifs ; absences explicites, aucune note agrégée.
- **Drill-down :** lien Results avec organisation/famille/équipe validées par ses listes autorisées.
  Results conserve sa version radar courante ; équipe absente de cette version : message explicite,
  aucune sélection implicite. Pas de radar ni longitudinal dans Pilotage.
- **Critères de refus :** session anonyme/inactive, Coach/Viewer, Admin hors organisation,
  organisation inexistante ou sélection multiple ne peuvent lire les faits ; pas de fuite entre
  organisations, y compris après changement de sélection ou réponse frontend tardive.
- **Intégrité et coût :** une projection GET cohérente réutilise les scopes et modèles existants,
  cinq SELECT au maximum, aucune mutation métier ni reconstruction de snapshots.
- **Preuves :** API/ORM, sécurité, OpenAPI, React et Playwright `steering.spec.ts`, dont clavier,
  mobile, thèmes/palettes et recharge du drill-down ; [contrat détaillé](../../architecture/steering-api.md).
- **Dépendances :** `COACH-001`, `PLAN-001`, `PASS-001`, `EVAL-003`, `RESULT-001/002`.
- **Limites :** seulement équipes actives et attentes persistées ; pas de reconstitution des cycles
  omis, vue archives/filtres, score/moyenne/classement, performance Coachs, objectifs, tendances,
  prédiction, comparaison interorganisation, export, notifications ou configuration. Aucune nouvelle
  bibliothèque graphique ou architecture de routage. `FEAT-031` à `FEAT-035` restent incomplètes.
