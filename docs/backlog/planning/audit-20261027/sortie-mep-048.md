# MEP-048 — dossier de sortie, indicateurs explicables sans nouveau KPI

[Source F07](../../source/mess/f07.md) · [Fiche](fiches/MEP-048.md) · [Ordre motivé](ordonnancement-ux.md).
Base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`. Statut Ouvert inchangé ;
DASH-001/STEER-001 réalisés, nature A. Ni nouveau calcul ni filtre par carte supplémentaire.

| Chaque critère / refus canonique | Implémentation retrouvée | Assertions/appuis existants | Preuve manquante précise |
| --- | --- | --- | --- |
| Couverture reliée aux faits | SteeringSummary : actifs, avec/sans résultat ; SteeringTeams affiche seulement actifs avec dernière complétion | test_steering : summary_active_teams_missing_data_and_snapshot_context, empty_projection ; SteeringPage définitions/absences | Tableau attendu/observé sur jeu fixe, définition lisible et chaque absence distinguée du zéro. |
| Complétions reliées aux sources | dernière completed_at/ID, version snapshotée ; Dashboard distingue complétion/révision et bornage à dix événements | test_steering latest_completion_uses_date_then_id_not_due_or_revision ; tests dashboard et E2E steering | Relecture dates/auteur autorisé/version et limite de l’activité personnelle ; aucun inventaire exhaustif prétendu. |
| Retards reliés aux échéances | as_of_date et attente persistée strictement passée ; priorité jamais évaluée sur état d’équipe, compte des attentes séparé | test_strict_date_boundary_for_expected_evaluations ; never_evaluated_takes_precedence_but_overdue_counts_runs ; SteeringSummary/Teams | Cas hier/aujourd’hui/futur, une équipe sans complétion avec attente échue, valeurs et explications lues ensemble. |
| Explications actionnables vers Results, sans nouveau calcul | Comprendre les indicateurs, définitions textuelles ; lien par équipe avec famille/organisation validées par Results | SteeringPage : « imposes Admin organization and shows definitions…Results link » ; ResultsIntent : succès, équipe absente, contexte inaccessible | Suivre le lien réel, vérifier contexte/version/équipe ou message d’absence ; ne pas exiger un lien par carte non prévu. |
| Refus classement individuel | projection de couverture sans classement Coach ni mesure de performance | Contrat STEER-001 ; test/lecture des cinq cartes et lignes | Revue des textes par rôle : pas de formulation suggérant classement/performance. |
| Refus score global Pilotage | pas de note globale ni moyenne dans projection/cartes | Contrat/projection steering.py ; tests de synthèse | Vérifier valeurs réellement exposées et explications ; absence de score ne se déduit pas du seul titre Pilotage. |
| Refus indicateur sans provenance | données organisationnelles, date de référence, snapshots et lien source autorisé | test_steering et ResultsIntent ; tests steering_security/Dashboard | Chaque carte doit être expliquée par le jeu ; refus/absence de source explicités sans substitution de donnée. |

Code : [projection](../../../../backend/assessments/application/steering.py),
[cartes/définitions](../../../../frontend/src/SteeringSummary.tsx),
[table/liens](../../../../frontend/src/SteeringTeams.tsx),
[Dashboard](../../../../frontend/src/DashboardActivity.tsx).
Tests : [API/calcul](../../../../backend/tests/test_steering.py),
[React indicateurs](../../../../frontend/src/SteeringPage.test.tsx),
[lien source](../../../../frontend/src/ResultsIntent.test.tsx),
[E2E](../../../../frontend/e2e/steering.spec.ts).
Appuis et limites : [contrat](../../../../docs/architecture/steering-api.md).

## Réutilisabilité et manque de validation

Le code de projection provient de `51574e0` (STEER-001) ; SteeringSummary a ensuite évolué à
`8bc5d14` pour la présentation des dates. Ces antécédents identifient du code, pas un PV de 048.
Même une projection inchangée ne valide pas le contexte du lien Results, les dates rendues et les
styles du shell courant. [Comparaison de la sélection](reutilisation-consolidee.md).
Il manque un compte rendu 048 sur candidat identifié reliant valeurs attendues/observées, définitions,
liens, rôles et lecture visuelle. Aucun besoin de nouveaux indicateurs n’est démontré.

## Recette discriminante sur jeu fixe

1. Organisation A, date de référence explicite D : quatre équipes actives, une archivée.
   A1 a une complétion, A2 une complétion et une attente D−1, A3 aucune complétion et une attente D−1,
   A4 aucune complétion et une attente D ou D+1. Pas d’autre attente.
2. Attendre actifs=4, avec résultats=2, sans résultat=2, attentes en retard=2 ; archivée exclue.
   État A2 En retard ; A3 et A4 Jamais évaluée ; A1 À jour si aucune attente échue.
   La présence du retard A3 dans le compteur ne doit pas transformer son état en « évaluée ».
3. Ouvrir Comprendre les indicateurs ; lire date, définitions et échéances. Ajouter une révision
   à la complétion la plus ancienne : la dernière complétion initiale ne doit pas être redatée.
4. Ouvrir source A1/A2 : organisation/famille/équipe autorisées, ou message si l’équipe n’a pas de
   résultat exploitable sur la version radar courante. Ne substituer ni équipe ni version implicite.
5. Dashboard Admin/Coach/Viewer/Superadmin : activité selon leurs scopes et bornage ; Viewer sans
   auteurs administratifs, Coach seulement assignations ; Pilotage refusé Coach/Viewer.
6. Cas organisation sans équipe et cas aucune complétion : définitions/absences lisibles ; aucun score
   global, performance Coach ou total inventé. Les refus de scope n’affichent pas une organisation étrangère.
7. Formats UX-09 et deux thèmes : lecture humaine des termes, chiffres, dates et liens. Inventaire
   lexical MEP-016 en parallèle ; occurrence trompeuse localisée, pas un blocage d’ordre abstrait.

Sortie : sept lignes critère/refus plus tableau du jeu fixe et lien source observé ; consommateur MEP-070.
La cohérence lexicale de 016 ne crée pas une attente technique si les explications de ce jeu sont déjà correctes.

## Issue bornée et conditions de clôture proposée

| Observation après la sélection ci-dessus | Issue à consigner | Passage autorisé |
| --- | --- | --- |
| Tous critères et vrais refus satisfaits ; preuves exactes et DoD démontrées | **Clôture proposée**, sans développement | Soumettre verdict, preuves et date justifiée à la validation de suivi ; aucune clôture pendant cet audit. |
| Comportement conforme, mais une cellule/entrée/preuve manque | **Qualification ciblée A** | Exécuter seulement la cellule nommée ; ne pas relancer une amélioration indéfinie ni reconstruire la capacité. |
| Un attendu canonique échoue avec reproduction | **Correction minimale B à préparer** | Nommer cas, attendu/observé, propriétaire et test de non-régression ; aucun correctif développé ici. |
| Une attente dépasse le contrat limité | **Arbitrage distinct D** | Isoler l’exigence et son effet de périmètre ; ne pas l’imputer implicitement au PBI. |

La clôture proposée exige une ligne par critère/refus avec code/entrée, assertion, résultat réel,
preuve visuelle pertinente, auteur/date de recette et verdict ; aucun « Non exécuté » nécessaire
ne peut être transformé en Passé. Les points DoD applicables et les gates du changement de clôture
doivent être satisfaits, avec trace d’intégration du comportement livré et date fondée sur preuves.
Si aucun code ne change : contrôle documentaire adapté pour la clôture, sans inventer un nouveau
déploiement applicatif. Aucun nombre de jours d’attente ou intitulé « améliorer » ne maintient à lui seul
le PBI ouvert. Le défaut global de transitions reste suivi séparément : il ne clôt ni ne bloque
automatiquement un critère indépendant ; une gêne réelle lors d’un scénario est consignée.

Cette consolidation ne produit aucun run métier/API/E2E nouveau ni acceptation visuelle du candidat.
**Verdict actuel : comportement principal couvert, qualification ciblée restante ; aucune clôture proposée
comme déjà validée et aucun développement identifié.**
