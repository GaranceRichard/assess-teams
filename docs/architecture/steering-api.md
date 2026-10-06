# Pilotage P0 — STEER-001

`/steering` répond à la couverture et aux échéances du dispositif : **Mesurer pour accompagner,
pas pour surveiller** et **Piloter sans réduire une équipe à un score**. Aucune note, moyenne,
comparaison interorganisation ou mesure de performance des Coachs n’est produite.

## Audit et réutilisation

Base auditée : `741d3be`, avec Results radar/longitudinal et palettes personnelles. `Team.is_active`,
les affectations `Team.coaches`, `EvaluationRun`, `EvaluationSchedule.next_due_date`, les familles
et versions existent. Les scopes `evaluation_runs_for`, `completed_results_for`,
`assigned_admin_organization` et la permission administrative existante sont réutilisés.
La projection ne lit ni ne recalcule les scores Results et ne crée aucune passation attendue.
Resynchronisation sur `8943a2e` : Viewer lit les COMPLETED de son organisation dans Results,
sans accès Utilisateurs/Équipes, passation ni Pilotage. Cette matrice est conservée ; le scope
Results distinct du Viewer ne confère aucun droit sur l’API Steering.
Les snapshots et FK historiques ne sont jamais modifiés. Aucun modèle ni migration n’est ajouté.

## Contrat HTTP

Session Django active par cookie ; GET uniquement, sans corps. OpenAPI `/api/schema/` et
Swagger `/api/docs/` décrivent paramètres, réponses, types, nulls, authentification et refus.

- `GET /api/steering/organizations/` : `200`, `[{id, name}]`, tri nom puis ID.
  Superadmin : organisations globales ; Admin : son organisation unique.
- `GET /api/steering/?organization_id=ID` : `200`,
  `{organization: {id, name}, as_of_date, summary, teams}`.
  Admin : paramètre facultatif, son organisation est imposée. Superadmin : paramètre obligatoire.
  Paramètre vide, invalide ou répété : `400`. Organisation inexistante ou hors scope : `404`.
- Anonyme, inactif, Coach, Viewer : `403` sur les deux endpoints. Admin sans organisation unique :
  `403`. Un identifiant fourni ne peut élargir le scope. Méthodes d’écriture non exposées (`405`
  pour une session autorisée avec CSRF valide ; refus d’authentification/CSRF possible avant).

`summary` contient `active_teams`, `teams_with_results`, `teams_without_results`,
`overdue_evaluations`, `last_completed_at`.

Chaque ligne `teams` contient `team_id`, `team_name` courant, `coaches: [{id, name}]`,
`last_result`, `next_due_date`, `status`. `last_result` vaut `null` ou contient
`{run_id, evaluation_id, family_id, model_name, version, completed_at}`.
`model_name` est le nom snapshoté ; `version` est la version exacte référencée par la passation.
Les affectations Coachs sont courantes (fonction Coach et rattachement à cette organisation),
triées identifiant puis ID ; leur désactivation n’efface pas leur affectation existante.
Liste vide, résultat/date `null` : absence explicitement présentée par React.

## Définitions métier

Toutes les métriques concernent les équipes **actives de l’unique organisation sélectionnée**.

| Champ / état | Définition |
| --- | --- |
| Équipes actives | Nombre de `Team.is_active=True` dans le scope |
| Avec un résultat | Équipes avec au moins une `COMPLETED` accessible ; aucune certification de qualité du snapshot |
| Sans résultat | Actives moins équipes avec une `COMPLETED` |
| Évaluations en retard | Nombre de passations attendues persistées non complétées avec `due_date < as_of_date` ; plusieurs par équipe possibles |
| Dernière complétion | Maximum des dates initiales `completed_at` des actives, ou `null` |
| Dernier résultat par équipe | `completed_at DESC`, puis `pk DESC` ; aucune récence par échéance ou révision |
| `never_evaluated` / Jamais évaluée | Aucune `COMPLETED`, même si des passations sont en retard |
| `overdue` / En retard | Sinon, au moins une passation non complétée strictement avant aujourd’hui |
| `up_to_date` / À jour | Sinon ; n’exprime ni maturité ni qualité d’équipe |
| Prochaine échéance | Minimum des échéances non complétées et du `next_due_date` planifié non déjà satisfait par une `COMPLETED` ; peut être en retard |

`as_of_date` est `timezone.localdate()` côté backend, selon le fuseau configuré (Toronto).
Aujourd’hui et le futur ne sont jamais en retard. Les équipes archivées sont exclues de toute
métrique. Une échéance planifiée non matérialisée en passation attendue ne crée pas de retard
artificiel ; sa date reste affichée. Aucun cycle récurrent omis n’est reconstitué par ce GET.

Le tri est retard → jamais évaluée → à jour, puis nom courant sans casse et ID. Une lecture
transactionnelle matérialise une seule projection cohérente, avec cinq SELECT au maximum
(équipes/dernier ID, Coachs, dernières complétions jointes, attentes groupées, planning groupé),
indépendamment du nombre d’équipes ; zéro mutation métier. Les Logs HTTP existants restent actifs.

## Interface et drill-down

Superadmin : choisir une organisation avant tout affichage. Admin : organisation affichée sans
sélecteur. Cartes compactes avec définitions, puis tableau sémantique. Chargement, vide et erreur
sont explicites. Réponses obsolètes ignorées, table défilable et focus clavier, tokens de thème
et palettes existants ; aucune nouvelle dépendance ni graphique.

Le lien `Voir les résultats` ouvre
`/results?organization_id=ID&family_id=ID&team_id=ID`. La navigation existante conserve les
paramètres sans nouveau routeur. Results présélectionne uniquement les IDs présents dans ses
réponses backend autorisées ; les paramètres ne donnent aucun droit. Recharge et nouvel onglet
sont compatibles. Un changement manuel annule l’intention initiale.

**Limite explicite :** Results conserve sa dernière version ayant des résultats par famille.
L’équipe source peut n’avoir qu’une complétion ancienne ou un snapshot inexploitable ; si elle
n’est pas éligible sur le radar courant, un message explique l’absence et aucune équipe n’est
sélectionnée. Le lien n’impose pas la version historique affichée dans Pilotage et ne duplique
ni radar ni longitudinal. Le détail historique général demeure un incrément ultérieur.

## Preuves et périmètre restant

`test_steering*` : synthèse, snapshots, complétions multiples et tie-break, bornes temporelles,
attentes/échéances, archives, permissions, isolation et IDs forgés, lecture seule, requêtes et
OpenAPI. React : Admin/Superadmin, synthèse/états/absences, loading/error/empty, réponses obsolètes,
refus de route, client API et intention Results. `steering.spec.ts` : Admin, changement
d’organisation Superadmin, refus Coach/Viewer, navigation/recharge Results, clavier/mobile,
jour/nuit et quatre palettes.

`FEAT-031` à `FEAT-035` restent incomplètes. Archives dédiées, filtres, historique général,
configuration, objectifs, exports, notifications, tendances calculées et supervision individuelle
ne sont pas livrés par ce PBI.
