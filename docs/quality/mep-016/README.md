# MEP-016 — Qualification du vocabulaire Dashboard / Pilotage

Revue Codex du **2026-11-02**, base `cba55ff9c375e0c3da6f8b38f25c0517374ba66d`.
[Source canonique F07](../../backlog/source/mess/f07.md) ·
[Fiche d’audit](../../backlog/planning/audit-20261027/fiches/MEP-016.md) ·
[Inventaire des occurrences et refus](inventaire.md).

## Verdict et portée

**Qualification lexicale conforme, sans écart démontré et sans correction applicative.**
Les formulations présentes distinguent passation, clôture initiale, révision, résultat accessible,
assignation personnelle et pilotage des échéances. L’accompagnement est une finalité explicitée,
pas une fonctionnalité ou un droit nouveau annoncé dans ces écrans.
Aucun changement de sens n’est proposé : **C09 non sollicité**, sans déclarer cet arbitrage clos.

La revue porte sur les textes réellement sélectionnés par les composants, leurs données backend,
les variantes par rôle et les assertions existantes. Elle ne constitue ni une nouvelle campagne
navigateur UX-09 ni une mesure de compréhension auprès d’utilisateurs MESS.
Aucune occurrence modifiée : captures avant/après et test rouge/vert de correction non applicables.

**Clôture sans développement recommandée.** Le statut canonique reste **Ouvert / N/A**, conformément
à la réserve de validation du changement de statut portée par la fiche d’audit. Cette livraison
apporte la qualification manquante ; elle ne présume aucune décision de clôture métier.

## Attendu / observé

| Scénario canonique | Attendu | Observé et preuve | Verdict borné |
| --- | --- | --- | --- |
| S1 — Cohérence terminologique | Distinguer évaluation, résultat, accompagnement ; inventorier complétion/révision/assignation/retard | Inventaire D1–D6/P1–P9 : chaque terme relié au composant et au champ réel ; définitions présentes, pas de score déduit du compteur | Conforme à la revue lexicale |
| S2 — Cohérence selon les rôles | Dashboard authentifié ; Pilotage Admin/Superadmin ; usages réels | Matrice de rôles de l’inventaire confrontée aux projections et tests : activité accessible, auteurs Viewer masqués, assignations personnelles, organisation explicite, refus Coach/Viewer sur Pilotage | Conforme à la revue des contrats et textes |
| S3 — Refus métier | Refuser toute rédaction suggérant performance individuelle ou droit supplémentaire ; identifier l’écart | R1/R2 de l’inventaire : propositions de rédaction explicitement refusées avec occurrence, donnée incompatible et motif ; aucune intégration dans l’UI | Refus de rédaction constatés |

Les refus R1/R2 sont des cas de revue éditoriale, pas des anomalies trouvées dans le produit.
Leur refus ne prétend pas prouver un contrôle automatisé de la signification du langage naturel.
Le texte actuel ne contient aucune de ces propositions.

## Preuves et tests applicables

Les fichiers suivants ont été relus sur la base indiquée ; leur présence ne vaut pas nouvelle exécution.
Les liens de l’inventaire pointent les composants et les deux projections métier relus intégralement.

| Niveau existant | Pièces versionnées relues | Couverture utile à MEP-016 |
| --- | --- | --- |
| React Dashboard | [DashboardPage.test.tsx](../../../frontend/src/DashboardPage.test.tsx) | Terminée/révisée distinctes, dates, noms snapshotés, raccourcis par rôle, absence d’auteur, contexte global |
| React Pilotage | [SteeringPage.test.tsx](../../../frontend/src/SteeringPage.test.tsx), [ProductShellSteering.test.tsx](../../../frontend/src/ProductShellSteering.test.tsx) | Cinq libellés, définitions, états et absences, Results ; organisation Superadmin ; refus de route Coach/Viewer |
| API Dashboard | [test_dashboard.py](../../../backend/tests/test_dashboard.py), [test_dashboard_security.py](../../../backend/tests/test_dashboard_security.py) | Provenance complétion/révision, assignations ; scope Results et retrait d’accès ; auteur Viewer masqué ; GET seul |
| API Pilotage | [test_steering.py](../../../backend/tests/test_steering.py), [test_steering_security.py](../../../backend/tests/test_steering_security.py) | Faits, états et bornes ; Admin imposé, Superadmin sans agrégation, Coach/Viewer 403, identifiants étrangers refusés |
| Parcours existants | [dashboard.spec.ts](../../../frontend/e2e/dashboard.spec.ts), [steering.spec.ts](../../../frontend/e2e/steering.spec.ts) | Libellés et actions par rôle ; affichage global ; navigation Results ; accès Pilotage refusé |

Jeux versionnés relus : [Dashboard North](../../../frontend/src/test/dashboardFixture.ts)
(deux événements du même run v2, révision le 6 octobre après complétion le 5, deux assignations),
[Pilotage North](../../../frontend/src/test/steeringFixture.ts)
(Alpha en retard, Gamma jamais évaluée, Beta à jour ; référence 2026-10-06).
Ils illustrent les distinctions lexicales ; aucun rapprochement de leurs chiffres entre écrans n’est requis.
Le contrôle quantitatif sur jeu fixe, les cinq cartes/date/provenance et le visuel sont réservés à MEP-048.

La [CI de la base auditée](https://github.com/GaranceRichard/assess-teams/actions/runs/41444967577)
est verte : plan, repository et Required impact gate réussis ; backend/frontend/E2E/full **skipped**.
Elle prouve la validation documentaire de cette base, sans nouvelle preuve d’exécution applicative.
Aucun résultat de suite historique ni couverture chiffrée n’est attribué artificiellement à ce rapport.

Pour ce lot de prose, le plan `quality:targeted` et le pré-push exigent le scope documentaire seul :
200 lignes, secrets, conflits, structure, règles et intégrité des références.
Aucune suite backend/frontend/E2E n’est relancée, conformément à la matrice de validation.
Les résultats effectifs du plan, du pré-push et de la CI du commit publié sont confirmés à la livraison.

## Revue DoD et frontières

- Fonctionnalité : aucun comportement ajouté ; trois scénarios examinés, refus éditoriaux explicites.
- Clean Code, modèles, migrations, contrats HTTP/OpenAPI, build/typecheck, lint et couverture applicatifs :
  non applicables au diff de prose ; aucune modification du code, des tests ou des dépendances.
- Documentation relue : README, AGENTS/règles, charte, DoD, stratégie, coûts de validation,
  fondamentaux, contrat API général, Dashboard/Pilotage, vision, source F07 et fiche MEP-016.
  Impact limité au README et au présent dossier ; architecture, critères et contrats conservés.
- Sécurité : aucun compte, secret, base ou identifiant réel ajouté ; les noms des jeux sont fictifs.
  Les libellés n’élargissent aucun scope, aucune permission ni aucune exposition d’auteur.
- MEP-048 : branche/worktree préservés, aucun fichier de son chantier modifié ; statut et preuves
  indépendants, aucun nouveau calcul, classement, score ou lien Results ajouté.
- MEP-070/recette MESS et MEP-035/GO restent indépendants ; aucun PV cible n’est annoncé.
- Livraison : branche et worktree isolés ; commit, `npm run publish`, pré-push bloquant, CI exacte,
  fast-forward sûr de main et nettoyage du seul chantier MEP-016 ; aucun circuit PR.
