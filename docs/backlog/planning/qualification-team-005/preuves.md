# TEAM-005 — Exécution et preuves après approbation

Statut historique conservé ci-dessous ; [clôture fonctionnelle approuvée le 2026-11-13](cloture.md),
statut courant dans le registre canonique.

Contrat et publication explicitement approuvés par l'utilisateur le 2026-11-12.
[Qualification initiale et contrat exact](rapport.md), base `2fedab80cdcff42325c6c1bfc06f5650c702c2ae`.
Branche `team-005-archive-refusal`, worktree isolé annoncé dans le rapport.
TEAM-005 reste **Ouvert / N/A** ; aucun statut, date de réalisation ou indicateur de backlog changé.

## Réalisation bornée

README mis à jour avant les tests et toute modification applicative.
Le DELETE conserve le premier appel à `manageable_team` pour les actifs. Après son 404 uniquement,
`archivable_team` filtre à nouveau l’organisation avant recherche et contrôle d’état.
L'archive accessible déclenche `ValidationError` : **400**, corps exact `["Équipe déjà archivée."]`.
Cette garde précède toute sauvegarde et tout enregistrement d'activité métier.
Premier DELETE : 204 sans corps, seule transition is_active=false, une activité team_archived.
Équipe étrangère active/archivée ou inexistante : même 404 et même JSON existants.
`manageable_team`, PUT et GET restent inchangés ; permissions, session et CSRF conservés.
OpenAPI décrit le 400 avec liste de chaînes et exemple exact, sans corps de requête DELETE.
Aucun modèle, migration, mécanisme de verrouillage, workflow CI ou helper de contention SQLite modifié.
C04, TEAM-006/007 et tous les autres chantiers restent hors périmètre.

## Preuve rouge avant correction

Tests ajoutés puis exécutés sur l'implémentation initiale, avant modification de scope.py/views.py :
`test_team_archive`, `test_team_archive_openapi`, `test_team_detail_integrity`,
`test_team_detail_openapi`, `test_openapi`.
**6 échecs, 24 succès en 12,00 s** : deux rôles avec second DELETE 404 au lieu de 400,
régression archive existante et trois assertions du 400 absent d'OpenAPI.
Le premier archivage et la conservation des historiques passent avant le point d'échec.
Trace locale : `%TEMP%/assess-team-005-qualification/red-tests.txt`.

`npm.cmd run quality:targeted -- e2e e2e/teams.spec.ts` avant correction :
**1 échec, 1 succès en 26,8 s**. Le navigateur authentifié réussit création/édition, premier DELETE 204,
GET archivé 200 puis échoue exactement sur le second DELETE 404 attendu à 400.
Le parcours Coach reste vert. Aucun échec CSRF ou infrastructure substitué à la preuve du défaut.

## Compatibilité de la contention existante

La première campagne complète a trouvé **2 échecs, 1 514 succès en 1 382,10 s**, couverture **97,52 %**.
Cas : `api_worker_upgrade-development` et `api_worker_upgrade-production` de
`test_sqlite_contention_operational`. Leur instrumentation attend l’appel actif existant
à `views.manageable_team` ; le premier essai du correctif le contournait.
Le handler conserve désormais cet appel et ne recherche une archive scopée qu’après son 404.
Aucun test/helper SQLite, timeout, synchronisation ou mécanisme de concurrence n’a été modifié.
Le schéma d’erreur est nommé dans serializers.py pour garder la vue sous 200 lignes, sans compaction.
Cette première campagne reste en échec. Après correction, **81 tests ciblés passent en 40,26 s**,
incluant les 79 contrôles API/ORM/OpenAPI et les deux cas de contention inchangés.
Une nouvelle validation complète est obligatoire et consignée ci-dessous.

## Matrice de non-régression automatisée

| Attente | Preuve |
| --- | --- |
| Admin local et Superadmin global : 204 puis 400 exact | `test_archive_is_unique_and_preserves_all_business_history` × deux acteurs |
| Identité, liens, modèles, questions, planifications, résultats et activités antérieures conservés | Même test : snapshots de toutes les tables métier concernées avant/après |
| Une seule activité d'archivage ; aucune sauvegarde métier au refus | Même test : comptage, comparaison intégrale, capture SQL avec seule insertion Log HTTP |
| GET post-archive minimal inchangé ; absence de liste active | Même test et `test_team_detail_integrity` |
| Archive étrangère et active = ID inexistant, Admin avec/sans rattachement | `test_archive_foreign_and_missing_are_identical_without_business_effects` |
| Coach affecté, Viewer, inactif, anonyme × actif/archivé | `test_archive_refuses_unauthorized_actors_before_disclosing_state` |
| CSRF absent × actif/archivé, aucun effet métier | `test_archive_requires_csrf_without_any_business_write` |
| IDs 0, absent et entier hors stockage : même 404 contrôlé | `test_archive_missing_integer_ids_are_controlled` |
| PUT archive toujours 404, GET et filtre Logs inchangés | `test_team_detail_integrity`, `test_log_team_options` |
| OpenAPI : cookieAuth, aucun body, 204/400/403/404/500, erreur liste et exemple exact | `test_team_archive_openapi`, `test_team_detail_openapi`, `test_openapi` |
| Génération/validation stricte, schéma HTTP et Swagger | `test_openapi`, commande spectacular avec validate/fail_on_warn |
| Session navigateur/CSRF réels : archive→GET→second refus→GET inchangé | `frontend/e2e/teams.spec.ts` |

## Campagnes après correction

Sélection verte après correction : **79 succès en 41,54 s**, y compris les acquis Équipes, TEAM-003, Logs et OpenAPI strict.
Plan réel : documentation, backend complet, frontend complet et E2E complet ; aucun domaine ignoré.
Sur la base initiale, la seconde campagne backend complète passe : **1 516 succès en 1 352,56 s**,
couverture **97,52 %**, lint/formatage/migrations conformes. L’interruption a précédé frontend/E2E.
Reprise le 2026-11-13 : resynchronisation sur la correction CI publiée `f400a8e` ; nouvelle validation requise.
Campagne locale complète sur le candidat `5f66cafcc539362576abfa96a857d7ceb180fca8`, base CI `f400a8e` :
**1 518 tests backend** réussis en **1 450,42 s**, couverture **97,52 %** ; **493 tests frontend / 119 fichiers**.
Frontend : statements **94,87 %**, branches **93,32 %**, fonctions **96,35 %**, lignes **95,71 %**.
Lint, formatage, build, typage, migrations, contrat OpenAPI strict et contrôles de sécurité requis verts.
E2E : **150 parcours applicatifs en 22,8 min**, puis **10 démo en 41,0 s**, tous réussis.
Le 2026-11-13, la nouvelle politique et vitrine de `3a881f8` sont intégrées sans modifier ce code métier.
Les preuves antérieures sont conservées ; le pre-push a recalculé et relancé tous les contrôles invalidés.

## Livraison et CI du SHA exact — 2026-11-13

`npm run publish` a publié **`8f8985534cf562eabc15fecaa216344cd0887889`** directement vers main,
après resynchronisation sur `3a881f8fc1cc80d2895df40c5e1c101c9477a0f9`, sans PR ni bypass.
Le nouveau README produit et les corrections CI entrantes sont intégralement préservés.
Le pre-push a réexécuté les quatre domaines obligatoires avec succès :

| Contrôle final | Résultat |
| --- | --- |
| Documentation, lignes, secrets, structure et préparation propriétaire | Vert ; fichier de vue 198 lignes, aucun fichier maintenu au-delà de 200. |
| Backend complet | **1 518 succès en 1 235,83 s**, couverture **97,52 %**. |
| Frontend complet | **493 tests / 119 fichiers**, quatre couvertures **94,87 / 93,32 / 96,35 / 95,71 %**. |
| Statiques, migrations, contrat strict, build et typage | Tous conformes ; aucune migration requise. |
| E2E applicatifs | **150 succès en 21,0 min**, dont archivage→GET→second 400 exact→GET inchangé. |
| E2E de démo | **10 succès en 37,8 s** ; build statique conforme. |

[CI indépendante du SHA exact : succès — run 43481970237](https://github.com/GaranceRichard/assess-teams/actions/runs/43481970237).
Plan, repository, frontend, backend statique, huit partitions backend, couverture globale, E2E
et **Required impact gate** réussis. Le job exhaustif non sélectionné reste non applicable au plan.
`publish` confirme push, fast-forward sûr du main principal et CI verte ; aucun échec applicable masqué.
Le présent suivi final est documentaire et suit le même circuit, avec sa propre CI exacte.
Le nettoyage concerne uniquement le worktree et la branche TEAM-005, après ce dernier succès.
La preuve rouge ne remplace aucun gate de livraison.

## Revue documentaire et limites

Contrat Équipes/backend, matrices isolation/permissions, source et vues courantes du backlog,
inventaire fonctionnel et note du cahier de recette actualisés ; audits datés conservés.
Le README avait été préparé avant le code sous la règle antérieure ; la vitrine produit entrante
est maintenant conservée sans journal technique TEAM-005. La préparation réelle, son adaptation
au nouveau format et la revue de contenu sont explicites dans le rapport propriétaire.
Règles agents, charte, DoD, stratégie, fondamentaux et contrat des journaux relus : aucune politique à modifier.
Aucun nouvel écran ni changement visuel ; recette visuelle UX nouvelle non applicable.
Aucun changement de modèle : migration nouvelle non applicable ; contrôle migrations existant reste requis.
Le correctif séquentiel n'introduit aucune politique nouvelle pour deux requêtes concurrentes.
Toute anomalie de concurrence démontrée sera documentée et soumise à décision complémentaire.
## Verdict et proposition de clôture

Les sept scénarios du mandat sont satisfaits dans le périmètre approuvé ; preuves rouges puis vertes,
contrat exact, historique, permissions/isolation, non-régressions et DoD applicable sont démontrés.
La publication et la CI du SHA applicatif exact sont vertes : **clôture de TEAM-005 proposée**.
Cette proposition ne vaut pas approbation humaine. TEAM-005 reste **Ouvert / N/A** ; aucune date de
réalisation ni aucun indicateur de backlog n’est actualisé avant accord explicite du mainteneur.
TEAM-003/C04, TEAM-006/007, les autres PBI et les décisions MESS ne sont pas modifiés par cette proposition.
