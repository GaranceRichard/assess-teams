# MEP-048 — jeu fixe et provenance

> Historique de qualification : les réserves et restrictions de cette phase sont conservées.
> Voir le [rapport consolidé](rapport.md) pour la correction et la proposition actuelles.

Candidat : `2d9b6c3c5c960e94630c93ce6c523bbcc6a0badd`.
Codex, 2026-11-01 ; JSON observé à 23:35:20 UTC, soit 18:35:20 Toronto.
Base fictive `.cache/mep-048/manual.sqlite3`, distincte de la base E2E.
Les écritures suivantes constituent exclusivement les données de recette.

## J1 — quatre actives, une archivée

Préparation : helpers existants `results_context("MEP048")`, `another_run`, `client_for`,
`csrf_put`, `revision_answers` ; aucun test ajouté/modifié.
D = **2026-11-01** ; organisation/famille/évaluation ID 1, version v1.
A1–A4 : IDs 1–4 ; archivée ID 5.
Notes initiales A1 du helper : (0, 10) ; A2 : (7, 3).

| Entrée | Faits persistés | Attendu | Observé API |
| --- | --- | --- | --- |
| A1 | Run 1 COMPLETED le 30/10/2026 à 10:00 Toronto ; aucune attente | À jour ; aucune échéance ; source | up_to_date ; next_due_date null ; run 1 v1 |
| A2 | Run 2 COMPLETED le 31/10/2026 à 10:00 Toronto ; attente D−1 | En retard ; échéance 31/10 | overdue ; next_due_date 2026-10-31 ; run 2 v1 |
| A3 | Aucune complétion ; attente D−1 | Jamais évaluée, contribue au retard | never_evaluated ; last_result null ; échéance 2026-10-31 |
| A4 | Aucune complétion ; attente D+1 puis variante D | Jamais évaluée ; aucun retard dans les deux cas | never_evaluated ; dates 2026-11-02 puis 2026-11-01 ; compteur inchangé |
| Archivée | is_active=False avec complétion | Exclue de toute carte/ligne Pilotage | Absente ; active_teams reste 4 |

| Carte | Attendu | Observé avant/après révision et A4 due D |
| --- | --- | --- |
| Équipes actives | 4 | 4 |
| Avec un résultat | 2 | 2 |
| Sans résultat | 2 | 2 |
| Évaluations en retard | 2 passations | 2 |
| Dernière complétion | A2 le 31/10/2026 à 10:00 Toronto | 2026-10-31T10:00:00-04:00 |

Ordre : **A2, A3, A4, A1**. Base remise à A4 due D+1 après variante D.
B1 complète les bornes D−1/D/D+1 en NOT_STARTED et IN_PROGRESS.
A3 ne devient pas « évaluée » du fait du retard.

Révision A1 : PUT `evaluation-run-revision`, deux notes explicites 0, retour **200**.
Avant/après : run/date A1 inchangés ; maximum A2 inchangé.
GET `/api/results/families/1/?evaluation_id=1` : A1/run1 scores **[0, 0]**,
A2/run2 scores **[7, 3]**, même famille/version. Zéro est ici une vraie note.
Les last_result null A3/A4 restent des absences, pas des notes zéro.
Lien A1 attendu : `/results?organization_id=1&family_id=1&team_id=1`.
Ce chemin J1 n’a pas été suivi en navigateur ; E1 suit l’équivalent sur sa propre fixture.

Dashboard J1 : Admin/Coach voient révision et complétions accessibles avec auteurs ;
Viewer reçoit author_name null et pending_assignments null.
Toutes les passations J1 sont assignées au même Coach : l’exclusion d’un autre assigné est
démontrée par B2, pas par J1. La complétion archivée reste accessible dans Dashboard,
différence de scope attendue avec Pilotage.

## J2 — organisation sans équipe

Organisation MEP048-empty, Admin dédié.
Attendu/observé : 0 actives, 0 avec, 0 sans, 0 retard ; last_completed_at null ; teams=[].
Message « Aucune équipe active dans cette organisation » et « Aucune complétion »
vérifiés dans R1, pas relus visuellement sur J2.

## J3 — une équipe, aucune complétion

Organisation MEP048-uncompleted, une équipe active et Admin dédié.
Attendu/observé : 1 / 0 / 1 / 0 ; last_completed_at null ;
last_result null, next_due_date null, coaches=[], état never_evaluated.
R1 vérifie « Aucun modèle évalué », « Non disponible », « Aucune échéance connue »,
« Aucune complétion » et l’absence de lien. Aucun écran connecté J3 revendiqué.

## Refus et preuves locales

J1 : Coach Pilotage **403**, Viewer **403**, Admin demandant J2 **404**.
B1/B2 : anonyme/inactif, Admin sans organisation unique, IDs invalides/répétés,
perte de rattachement/assignation et relations interorganisations incohérentes.
E1 : refus route/API Coach/Viewer et changement d’organisation Superadmin.

Réponses : `.cache/mep-048/jeu-fixe.json` ; recette exacte : `recette-executee.txt`
dans le même cache. Rejeu sur base neuve avec settings de développement explicite.
Preuves locales non commitées, distinctes d’une recette cible.
[Rapport contradictoire](rapport.md) ; [validations](validations.md).
