# Validation et reproduction

## Empreintes des entrées

SHA-256 ci-dessous sur octets normalisés LF ; resolved/integrity SHA-512 restent dans les locks.

| Lockfile | Base 54afdde | Candidat |
| --- | --- | --- |
| package-lock.json | 842d51b0284e59e36cb6ca8521e51743f85ecb8c6b2da52180a602bde58a8b5c | 9188cb60b9a124c8b82750c06b19e0050c1bac066cd2ef7ec8fbb709f9318c92 |
| frontend/package-lock.json | 79013f1ff51a691aa56d060ac14e67996214911ea9b6b3e74447bb34bcbc6f58 | f248fa0f8e1e020d42b187ffb63992e2e2f779aedef031178bb0d6bc6ac9f724 |

## Audits mesurés

| Arbre / sélection | Avant | Après |
| --- | --- | --- |
| racine, total | 2 critiques | 0 |
| frontend, total | 4 élevés, 13 modérés | 10 modérés |
| racine, omit=dev | aucune dépendance runtime vulnérable | 0 |
| frontend, omit=dev | dépendances runtime conservées | 0 |

Les codes npm audit non nuls correspondent aux avis, sans effacement ni interprétation en test vert.
Le résultat racine critique supplémentaire est explicitement inclus dans la qualification.

```powershell
npm.cmd audit --json
npm.cmd audit --prefix frontend --json
npm.cmd audit --omit=dev --json
npm.cmd audit --prefix frontend --omit=dev --json
npm.cmd explain shell-quote
npm.cmd explain --prefix frontend minimatch source-map-js undici zod
npm.cmd ci
npm.cmd ci --prefix frontend
npm.cmd ls --prefix frontend --all --json
```

## Tests rouge / vert

Avant correction du YAML, le nouveau test_ci_concurrency.py produit **3 échecs, 2 succès** :
configuration annulable, trois pushes de SHA distincts et trois runs du même SHA ont le même groupe.
Exemple observé : ensemble des groupes = {Quality gate-refs/heads/main}, cardinalité 1 au lieu de 3.
Après correction : **16 succès** sur test_ci_concurrency.py, test_ci_workflow.py et test_impact_workflow.py.
Les tests lisent le YAML réel ; le petit évaluateur est limité aux expressions utilisées et leur forme
est vérifiée exactement. Il ne prétend pas remplacer le moteur GitHub. Trois runs couvrent aussi le cas
d’un run en attente remplacé, qu’un simple cancel-in-progress false ne résoudrait pas.

Les six tests impact-execution.test.mjs passent, avec deux SHA aux verdicts opposés, refus PR/mauvais
SHA, annulation, échec, skip, attente, et preuves MESS exactes. Aucune publication artificielle.

```powershell
backend/.venv/Scripts/python.exe -m pytest backend/tests/test_ci_concurrency.py backend/tests/test_ci_workflow.py backend/tests/test_impact_workflow.py --no-cov -q
node --test scripts/quality/tests/impact-execution.test.mjs
npm.cmd run quality:targeted
npm.cmd run publish
```

## Plan et revue documentaire

Le plan calcule exhaustive=true : CI et dépendances transversales imposent repository/backend/frontend/e2e.
Aucun seuil ni sélection allégés pour le chantier ; pré-push reste bloquant et CI indépendante.
README modifié avant les tests/correctifs ; annonce ensuite reliée au dossier de preuves.
Revue : AGENTS/agent-rules, charte, stratégie de tests, fondamentaux et contrat API relus, sans changement
nécessaire ; mêmes obligations et aucun endpoint/modèle/droit modifié. CI, validation-costs et DoD mis à jour.
MEP-012, C06, backlog et décisions existantes conservés. Les fichiers maintenus restent limités à 200 lignes.

La première passe repository a refusé un README de 203 lignes ; l’annonce a été intégrée au
paragraphe qualité existant (200 lignes). Les accents des ajouts documentaires ont aussi été corrigés
avant la relance finale. Aucun échec ignoré ni protection contournée.

Le formatage du lockfile frontend régénéré a ensuite été refusé par Prettier ; seul son format
a été corrigé avant relance. Le backend complet a passé : 1 461 tests, couverture 97,50 %.

## Résultats locaux vérifiés

| Contrôle | Résultat |
| --- | --- |
| Repository / outillage | succès ; 200 lignes, secrets, documentation, isolation, publication et preuves |
| Backend complet | 1 461 tests réussis ; couverture 97,50 % ; lint, format, migrations et OpenAPI verts |
| Frontend complet | 119 fichiers / 493 tests réussis ; lint, format, typage et build verts |
| Couverture frontend | statements 94,87 %, branches 93,32 %, fonctions 96,35 %, lignes 95,71 % |
| E2E applicatifs | 150 réussis, aucun retry ; 21,0 min |
| Démo | build puis 10 E2E réussis sans backend ; 37,8 s |
| dev:all réel | Django /api/health/ et Vite / répondent HTTP 200 ; base jetable, seuls les processus créés sont arrêtés |
| Audit final | racine 0, frontend 10 modérés liés à M ; aucun nouvel avis |

Les quatre scopes finaux portent status=0 dans les métriques du plan. La correction de format frontend
n’a pas modifié les entrées backend : sa preuve complète a été réutilisée après vérification de l’empreinte.
Les fichiers de logs, bases de test et preuves locales restent des artefacts ignorés du worktree.
Ces résultats ne remplacent ni le pré-push de l’état commité ni la CI indépendante du SHA publié.

## Livraison

Le SHA publié, le pré-push et la CI du SHA exact seront confirmés au compte rendu de livraison.
Ce document n’atteste pas à l’avance le succès des contrôles restant à exécuter.
La réserve minimatch qualifiée reste distincte du succès des gates ; aucune acceptation de risque.
