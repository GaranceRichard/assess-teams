# Correction ciblée de la validation — 16 octobre 2026

## Constats et périmètre

Audit initial sur `1bb4db697d6282473116d8d5c3490ce1345a721a` dans un worktree isolé.
Le TTL de huit heures et l'assimilation des mots SQLite/transaction/permission à l'exhaustif
étaient encore présents. Sur neuf nouveaux tests de régression, cinq échouaient avant correction :
preuve ancienne, métadonnées invérifiables, retrait d'une preuve réutilisée devenue instable,
classification SQLite et permissions techniques. Ces défauts sont corrigés.

Aucune fonctionnalité métier, dépendance de production, règle de branche, hook ou workflow YAML
n'est modifié. Les responsabilités classification/plan et inventaire/runtime sont séparées pour
respecter la limite de 200 lignes. Aucun mécanisme de planification ou de publication n'est remplacé.

## Règles corrigées et garanties

- Preuve v3 : réussite, provenance locale déclarée, scope, clé et horodatages cohérents obligatoires.
- Aucune expiration par âge ; code, tests, configuration, règles, dépendances, runtimes,
  environnement et sélection exacts déterminent sa validité. `--fresh` reste disponible.
- Les octets installés sont vérifiés, pas seulement leurs versions. Les secrets restent dans le
  calcul en mémoire ; seules des empreintes et métadonnées non sensibles sont persistées.
- Les entrées sont contrôlées après chaque validation réutilisable et en fin de plan ; une preuve
  réutilisée devenue instable est aussi supprimée. HEAD et propreté restent gardés au pré-push.
- SQLite/transactions/workers et permissions techniques : backend entier avec couverture,
  transactions, API, Journal, sécurité et multiprocessus. Aucune sélection pytest partielle inventée.
- Contrat/sécurité produit, modèles et dépendances identités non cartographiées : frontend/E2E
  conservateurs ajoutés. Configuration globale, migrations, inconnu et transverse restent exhaustifs.
- Le message contractuel `CONTENTION_FAILED` élargit le plan même dans le helper SQLite.
- La CI utilise le même plan et exécute ses propres contrôles ; son gate final refuse tout skip
  injustifié. Nightly, trois shards backend, couverture fusionnée et qualification MESS sont intacts.

Les raisons et frontières exactes figurent dans la [matrice](validation-costs.md).
`/api/users/` n'a aucun consommateur React/Playwright ; `/api/admin/users/`, consommé par
`managedUsers.ts`, conserve frontend et E2E. Les workers n'exposent pas de contrat UI.

## Non-régressions et validation

| Scénarios | Preuve automatisée |
| --- | --- |
| CU01, CU05, CU11 | `evidence-regression.test.mjs` et `validation.test.mjs` : preuve datée de sept jours, refus, stabilité réelle et simulée |
| CU02, CU03, CU04 | `evidence-regression`, `runtime-inputs`, `validation-inputs` : code, dépendances installées, runtime, politique, sélecteurs |
| CU06, CU07, CU08 | `sensitive-impact.test.mjs` : backend entier, contrats UI, workers, configuration, inconnu |
| CU09 | `sensitive-impact` : plan documentaire de publication sans suite applicative |
| CU10 | `test_impact_workflow.py` : déclencheurs, SHA, trois shards, couverture et absence de conditions sélectives dans l'exhaustif |
| CU12 | `impact-git` : même vrai diff avant/après commit ; `sensitive-impact` et `impact-execution` : jobs requis, refus et skips |

118 tests Node des scripts qualité passent ; les quatre invariants Python des workflows passent.
Le fixture PowerShell des scopes exige aussi les nouvelles suites ; son ancienne attente a bloqué
la première tentative de publication, avant tout push, puis a été corrigée et revérifiée.
Le runner Linux fournit `LD_LIBRARY_PATH` : le test de cache local isole désormais ses chargeurs
externes, et un cas distinct impose le frais avec un chargeur externe. Le garde-fou de production
reste inchangé ; la CI initiale a refusé cette attente de test incohérente.
Les essais applicatifs ciblés exécutent réellement 46 tests backend et 103 tests frontend, tous réussis.
Ruff, formatage, migrations et contrôles documentaires sont inclus dans ces essais selon leur scope.
Le lot modifie l'infrastructure : son propre plan est exhaustif. Le pré-push et la CI du SHA publié
fournissent la validation finale obligatoire, indépendamment de ces benchmarks de développement.

## Mesures vérifiables

Les [plans avant/après](validation-policy-plans.json), [mesures](validation-policy-benchmarks.json)
et [métriques JSONL natives](validation-policy-metrics.jsonl) conservent chemins, sélections,
empreintes de sources, horodatages, statuts et durées. Windows x64, Node 24.20.0, Python 3.12.10 ;
runtimes chauds et isolés. Les chemins simulent un changement ; les contrôles sont réellement exécutés.
Les empreintes identifient les sources avant export des résultats. Aucun fichier métier n'a été édité.
Un essai par phase, pas une moyenne statistique. La preuve de sept jours utilise une horloge simulée ;
il ne s'agit pas d'une attente réelle de sept jours. Aucune campagne exhaustive n'est ajoutée pour benchmarker.

| Cas | Avant | Après | Mesure / portée |
| --- | --- | --- | --- |
| Documentation/backlog | Documentation | Documentation | Zéro test applicatif ; contrôle frais conservé |
| Backend métier non cartographié | Backend entier | Backend entier | Aucun gain de sélection revendiqué |
| SQLite/transactions internes | Quatre domaines | Documentation + backend entier | Frontend/E2E évités dans le plan, temps global non remesuré |
| Permissions techniques | Quatre domaines | Documentation + backend entier | Même réduction structurelle ; sécurité backend entière |
| Sécurité produit | Quatre domaines | Documentation + backend + frontend + E2E | Aucun domaine applicatif retiré |
| Frontend audité | Statiques + dépendants | Identique | 103 tests frais ; zéro en reprise |
| Transverse | Quatre domaines | Identique | Pré-push/CI exhaustifs conservés |

| Essai réel | Avant frais | Après frais | Après reprise | Tests en reprise / preuves réutilisées |
| --- | --- | --- | --- | --- |
| Backend : filtres journaux | 52,833 s | 77,925 s | 27,887 s | 0 / 2 ; 46 tests évités |
| Frontend : dateInputValue | 33,029 s | 47,734 s | 25,972 s | 0 / 2 ; 103 tests évités |

La reprise corrigée réduit le temps de 64,2 % et 45,6 % par rapport à sa campagne fraîche.
La lecture renforcée coûte aussi : les campagnes fraîches augmentent ici de 25,092 s et 14,705 s.
Une empreinte complète seule coûte 3,730 s backend, 3,403 s frontend et 6,819 s E2E sur ce poste.
Ces coûts sont inclus dans les temps muraux des plans ; la vérification finale reste obligatoire.
La référence documentaire initiale est 5,514 s, sans suite applicative.

Les [durées historiques](validation-baseline.json) restent contextualisées au SHA du 15 octobre :
51,395 s frontend et 413,138 s E2E, soit 464,533 s de contrôles historiquement associés aux deux domaines.
C'est un potentiel structurel pour SQLite/permissions techniques, pas un gain mural actuel mesuré.
Les 393 tests frontend et 73 E2E de cette référence ne sont ni supprimés ni allégés ; les campagnes
exhaustives continuent à les exécuter. Ne pas extrapoler une garantie de temps à tout changement sensible.

## Risques résiduels et reproduction

La carte reste volontairement petite. Nouveau consommateur ou nouvelle frontière : actualiser règles
et tests ; sinon sélectionner conservativement. Toute l'arborescence du domaine reste dans l'empreinte.
Les charges externes Python/Node non bornées imposent du frais, sans preuve réutilisable.
L'inventaire Chromium repose sur le runtime Playwright installé : une interface incompatible échoue
fermée et demande une adaptation, jamais l'acceptation silencieuse d'une ancienne preuve.
La politique d’empreinte v4 exclut aussi les deux sorties TypeScript déclarées dans les tsconfig :
un test a reproduit leur fausse invalidation pendant un contrôle. Un fichier inconnu dans `.tmp`
reste couvert, ainsi que les fichiers homonymes dans un package imbriqué.
Les caches générés sont exclus ; les octets applicatifs et dépendances distribuées restent vérifiés.
Le cache local n'est pas une signature contre un utilisateur local hostile. La CI reste indépendante.
La limite historique du push direct après pré-push est inchangée et explicitée dans [CI](ci.md).

```powershell
npm run quality:benchmark
npm run quality:benchmark -- documentation
npm run quality:benchmark -- backend
npm run quality:benchmark -- frontend
# Répéter backend/frontend à entrées identiques pour constater REUSE.
npm run quality:targeted -- --fresh
node --test scripts/quality/tests/*.test.mjs
```

## Fichiers du lot

- `AGENTS.md`
- `README.md`
- `backend/tests/test_impact_workflow.py`
- `docs/quality/agent-rules.md`
- `docs/quality/ci.md`
- `docs/quality/test-strategy.md`
- `docs/quality/validation-costs.md`
- `docs/quality/validation-measurements.md`
- `docs/quality/validation-policy-benchmarks.json`
- `docs/quality/validation-policy-metrics.jsonl`
- `docs/quality/validation-policy-plans.json`
- `docs/quality/validation-policy-review.md`
- `scripts/quality.ps1`
- `scripts/quality/benchmark.mjs`
- `scripts/quality/impact-classification.mjs`
- `scripts/quality/impact-runner.mjs`
- `scripts/quality/impact.mjs`
- `scripts/quality/runtime-inputs.mjs`
- `scripts/quality/selective.mjs`
- `scripts/quality/tests/evidence-regression.test.mjs`
- `scripts/quality/tests/impact-execution.test.mjs`
- `scripts/quality/tests/impact-git.test.mjs`
- `scripts/quality/tests/installed-cache.test.mjs`
- `scripts/quality/tests/impact.test.mjs`
- `scripts/quality/tests/scopes.tests.ps1`
- `scripts/quality/tests/runtime-inputs.test.mjs`
- `scripts/quality/tests/sensitive-impact.test.mjs`
- `scripts/quality/tests/validation-fixtures.mjs`
- `scripts/quality/tests/validation-policy.test.mjs`
- `scripts/quality/tests/validation.test.mjs`
- `scripts/quality/validate.mjs`
- `scripts/quality/validation-inputs.mjs`
