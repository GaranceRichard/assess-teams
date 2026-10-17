# Preuves de conformité — MEP-011

[Matrice, règles, routes et arbitrages](organization-isolation.md) ;
[définition canonique](../backlog/source/mess/f01.md#mep-011--contrôler-lisolation-des-accès-entre-organisations).
Audit et tests du 2026-10-16, depuis `origin/main` `20d9ad3` dans un worktree dédié.

## Défauts reproduits puis corrigés

| Défaut | Preuve avant correction | Correction et résultat ciblé |
| --- | --- | --- |
| Ancien Coach passé de A à B réaccepté lors d’un PUT d’équipe A | Test Admin et Superadmin : 200 au lieu de 400, modification et Journal possibles | Résolution des `coach_ids` dans les membres de l’organisation avant validation ; refus 400 identique à un ID absent, état métier inchangé. |
| Identité courante B révélée dans `Team.coaches` via ancien lien A | Après déplacement par API membres et renommage, GET d’équipe A renvoie `B-private-new-name` | Restitution limitée aux Coachs encore membres ; liens persistés et inactifs locaux conservés ; préchargement des organisations. |
| Planning historique A révèle le nouveau nom/rôle d’un responsable passé en B | GET planning expose le nom courant B au lieu de null | Nom/rôle courants null hors rattachement ; ID et snapshots de passation conservés. `assignee_active` devient également null dans ce cas. |
| Exception responsable Superadmin trop large | POST d’un planning neuf accepte un autre Superadmin avec 201 au lieu de 404 | Exception limitée à l’auto-affectation ; responsable Admin/Coach toujours membre actif ; invariants conservés même pour Superadmin. |
| Retrait d’un ancien Coach réintroduit son nouveau nom B dans le Journal A | PUT équipe avec retrait explicite réussi, puis GET Journal révèle le nom B dans `COACH_REMOVED` | Nouvelle description identifie l’ancien lien par `#ID` hors rattachement ; aucun fait historique réécrit ni nom courant B copié. |
| Worker d’échéance réintroduit l’identité B dans A | Échéance existante : Log A avec acteur nommé B ; attente : snapshot renommé ; nouvelle échéance : run créé avec nom B | Refus de créer/réécrire une attente pour un assigné hors organisation ; Log sans acteur étranger, destinataires déjà filtrés conservés. Planning, anciennes passations, date d’échéance et M2M inchangés en cas sans destinataire. |

`test_isolation_regressions.py` a été exécuté avant les corrections applicatives : les tests des
deux mutations, de la liste d’équipes et du Superadmin échouaient sur les valeurs réelles ci-dessus.
Le test planning ajouté ensuite échouait aussi sur le nom divulgué. Tous passent après correction.
La conservation d’un Coach inactif local et son retrait explicite passent avant et après.
Les tests additionnels Journal et worker échouent avant leur correction (nom divulgué et snapshots
modifiés/créés), puis passent pour les trois situations d’échéance : complétée, attente existante et nouvelle.

## Données et méthode

`isolation_helpers.py` crée A et B, chacune avec Admin, Coach, Viewer, équipe, modèle validé,
brouillon, questions, passation COMPLETED et attente. Les IDs étrangers existent réellement.
Connexion via `POST /api/session/login/`, cookies Django, CSRF actif, ORM/SQLite réels :
aucun mock de permissions et aucun `force_authenticate`. Seul l’encodage des mots de passe
des nouvelles fixtures utilise le hasher MD5 de test pour limiter le coût ; le backend d’authentification reste réel.

Les refus comparent tous les enregistrements des applications métier, y compris tables M2M,
questions/snapshots, Journal et file EmailNotification. Les seuls Logs HTTP sont exclus de cette
égalité : une tentative refusée doit précisément rester observable, sans faux Journal de succès.
Les journaux historiques existants sont comparés après rattachement ; les événements légitimes
de changement de membres sont ajoutés, jamais substitués aux faits anciens.

## Scénarios API reproductibles

| Suite | Cas et critères couverts |
| --- | --- |
| `test_isolation_reads.py` | CU01/02/03/06/09 : quatre acteurs, lectures directes A/B, organisations, équipes, questions, passations, versions/familles/critères ; listes, pagination, recherche d’utilisateurs, filtres d’organisation, Journal/Logs, Pilotage et Dashboard ; sélection d’équipes mixte refusée même pour Superadmin. |
| `test_isolation_mutations.py` | CU04/05/06/10/11 : 25 opérations étrangères pour Admin/Coach/Viewer ; création, modification, suppression/archive, validation, nouvelle version, membres, activation, passation et révision ; références planning org/équipe/modèle/responsable en POST et PUT ; Coach et questions étrangers ; mutations locales Admin et transversales Superadmin autorisées. |
| `test_isolation_sessions.py` | CU07/08/11 : Admin, Coach et Viewer déplacés par API membres avec session initiale conservée ; intervalle sans rattachement ; ancien périmètre refusé, nouveau scope autorisé ; ancienne équipe sans effet sur les droits ; réaffectation NOT_STARTED et ancien assigné refusé ; historique A inchangé et toujours accessible à son Admin courant/Superadmin. |
| `test_isolation_history.py` | CU02/08/09 : équipes et modèles archivés A/B ; même scope sur COMPLETED ; protection contre suppression d’organisation commencée ; refus étranger/inexistant identiques ; schéma et Swagger, types nullables et tableau Coachs conservés. |
| `test_isolation_regressions.py` | CU05/07/08/09/10 : défauts réels sur équipe, planning, Journal et worker, non-divulgation des données courantes B par GET API après mutation/échéance ; absence de réécriture/suppression des liens historiques ; exception Superadmin explicite et inactif local légitime. |

Acquis réutilisés : `test_admin_organization_scope`, `test_managed_user_scope`, `test_teams`,
`test_evaluation_schedule_management`, `test_evaluation_taking_permissions`,
`test_results_security`, `test_viewer_results`, `test_steering_security`, `test_dashboard_security`,
Journal/Logs, transactions, lifecycle, authentification et inventaire de routes.
Les suites intégrales restent requises ; une preuve ciblée ne remplace pas les gates.

## Contrats, consommateurs et revue documentaire

Aucun chemin, méthode, corps ou code de succès légitime changé. Références étrangères d’équipe :
400 conservé, message générique pour ne pas distinguer un Coach B d’un ID absent.
Les champs `assignee_identifier`, `assignee_role`, `assignee_active` étaient déjà nullables ;
leur null exprime maintenant aussi l’absence de rattachement courant au contexte historique.
Les IDs et les noms snapshotés ne changent pas. Les annotations `drf-spectacular` et descriptions
des équipes/plannings/passations décrivent le filtrage ; schéma et Swagger sont testés.

Consommateurs vérifiés : `planning.ts`, `ScheduleList.tsx`, `ScheduleManagement.test.tsx`,
`PlanningLifecycle.test.tsx`, `evaluationRuns.ts`, `EvaluationRunsTable.tsx`, adaptateurs des équipes.
Ils acceptent déjà null / tableau filtré ; aucun changement frontend nécessaire.
Les campagnes frontend et E2E restent imposées par le pipeline pour ces adapters API produit.

README annoncé avant toute correction ; revue effectuée sur règles agents, charte qualité, DoD,
stratégie de tests, architecture fondamentale, contrat API/OpenAPI et backlog. Les politiques,
transactions et règles qualité ne changent pas ; aucune migration. L’extension du test de bootstrap
et les modes des hooks relèvent du seul défaut CI bloquant documenté ci-dessous.
Les arbitrages et écarts fonctionnels sont explicités dans la matrice, sans déclaration de capacité voisine livrée.
Les corrections empêchent les nouvelles copies interorganisation ; elles ne requalifient pas les
snapshots déjà persistés avant correction. Sans historique daté des rattachements ni données de
production accessibles, aucun nettoyage ou diagnostic rétrospectif de ces données n’est inventé.

## Contrôles et publication

- Campagne ciblée : 39 cas pytest passent (plusieurs requêtes par case paramétrée), incluant les
  véritables endpoints et vérifications persistantes ; pas une matrice de permissions simulées.
- `npm run quality:plan` classe les changements en sécurité/contrat backend produit : documentation,
  backend complet renforcé avec couverture, frontend complet et tous les E2E, conformément au pipeline intégré.
- La campagne locale `npm run quality:targeted` et les pré-push obligatoires ont réussi.
  Le dernier pré-push de `2bd6eff` exécute aussi les contraintes et tests d’outillage exhaustifs.
- Backend final : 1 101 tests passent, couverture globale branches incluses 97,37 % ;
  Ruff, formatage, cohérence des migrations et contrats OpenAPI réussis.
- Frontend final : 102 fichiers / 393 tests passent ; couverture statements 96,42 %, branches 94,78 %,
  fonctions 96,63 %, lignes 97,30 % ; lint, formatage, typage et build réussis.
- E2E final : 64 parcours applicatifs et 9 parcours de démo passent ; build statique inclus.
  Les contrôles documentaires, de longueur (200 lignes), de secrets et de cohérence sont verts.
- Le premier lancement local a rencontré la politique PowerShell du poste dans la sonde `npm`.
  `PSExecutionPolicyPreference=Bypass`, limité aux processus de validation comme les wrappers existants,
  permet la sonde sans changement de script, réglage machine ou suppression de contrôle qualité.
- La première campagne backend a été interrompue après la découverte des fuites Journal/worker ;
  elle ne constitue aucune preuve. La campagne finale repart sur les entrées applicatives corrigées.
  Le contexte restreint a également été écarté : empreinte différente du contexte Windows de
  publication. La campagne complète finale ci-dessus a réussi dans ce dernier contexte, sans réutilisation partielle.
- Nightly exhaustive, qualification MESS et gate de promotion restent indépendants et inchangés.

## Défaut CI bloquant révélé après publication

Le [run du commit applicatif d61f349](https://github.com/GaranceRichard/assess-teams/actions/runs/38987008342)
réussit backend, frontend, contrôles du dépôt, 64 E2E applicatifs et 9 E2E démo, mais reste rouge :
après les E2E, le garde refuse « Le candidat a change pendant le gate ».
`git ls-files --stage .githooks` montre quatre modes `100644` ; le serveur E2E lance
`dev-backend.ps1`, puis `setup-hooks.ps1`, qui applique `chmod +x` sous Linux. Le candidat est donc
effectivement modifié par l’installation de ses propres hooks, malgré tous les tests réussis.

Exception aux frontières de la mission : défaut bloquant démontré du pipeline, corrigé dans un
second worktree depuis ce main publié. Les quatre hooks passent à `100755`, sans modifier leurs
octets ni la logique de validation. Le test de bootstrap vérifie les modes versionnés, crée une
fixture équivalente, installe les dispatchers et exige `git status --porcelain` vide après installation.
Il échoue avant correction sur le mode de `post-checkout`, puis passe avec les modes corrigés.
La vérification de stabilité après installation a également réussi sous Linux dans la CI exhaustive.

`quality:plan` classe automatiquement cette correction d’infrastructure en exhaustif : dépôt et
tests d’outillage, backend, frontend et E2E. Aucun garde, seuil, sélection, cache, script de validation
ou workflow CI n’est affaibli ; le refus de candidat modifié est conservé.

## Intégration qualifiée et clôture

Le commit intégré `2bd6eff36ca806a591e822f151d5b09c86e0ce78` contient les corrections applicatives
de `d61f349` et le correctif CI. Sa [CI exhaustive indépendante](https://github.com/GaranceRichard/assess-teams/actions/runs/38989293823)
est verte : contraintes du dépôt, statiques, trois shards backend, fusion de couverture,
frontend, deux shards E2E, Full quality gate et Required impact gate.
Les publications utilisent `npm run publish`, branche dédiée vers main, pré-push sans contournement
et fast-forward sûr du checkout principal. `main` local et `origin/main` étaient propres et égaux
à ce SHA lors de la vérification de reprise. Clôture canonique le 2026-10-17, après cette confirmation ;
la publication documentaire de clôture est soumise à son propre contrôle et à sa propre CI.
Cette CI verte ne vaut pas promotion MESS : nightly, qualification et gate de promotion restent distincts.
