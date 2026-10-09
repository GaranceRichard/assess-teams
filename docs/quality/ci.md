# CI parallèle et gates

`npm run quality:full` reste le gate local canonique et le pre-push bloquant.
Il exécute Ruff, les migrations et toute la suite backend, puis les autres contrôles.
La CI répartit ces contrôles sans second passage global.

## Répartition

| Job | Exécution | Contrôles bloquants |
| --- | --- | --- |
| Repository constraints | scope repository | 200 lignes, secrets, cohérence Git, README, documentation, tests qualité/bootstrap/scopes/agrégation |
| Backend static quality | scope backend-static | Ruff lint/format et migrations |
| Backend tests (1/2), (2/2) | backend_shards.py | Tous les tests pytest, contrats/OpenAPI inclus, partitionnés par fichiers |
| Backend global coverage | après tous les shards | Collection exhaustive sans doublons, fusion du branch coverage, seuil global >= 90 % |
| Frontend quality | scope frontend | ESLint, Prettier, seuils Vitest, typecheck/build, tests avec coverage >= 90 % sur quatre métriques |
| Playwright E2E | scope e2e | Tous les parcours réels et de démo, migrations/fixtures, Vite et Chromium |
| Full quality gate | agrégation | Succès de repository, backend-static, backend-tests, backend-coverage, frontend et e2e |

Dépôt, statiques, tests, frontend et E2E partent indépendamment.
Seule la fusion dépend des shards. `fail-fast: false` conserve tous les résultats
même si un shard échoue. La matrice ne comporte ni exclusion ni `continue-on-error`.
Le gate final conserve son nom et `always()` : échec, annulation, skip ou résultat
absent de n'importe quel job bloque la qualité complète.

## Shards et couverture exhaustive

`scripts/quality/backend-test-durations.json` contient les secondes par fichier
issues d'un rapport JUnit réussi, avec setup et teardown. Les fichiers les plus
lents sont affectés d'abord au shard le moins chargé ; l'ordre pytest est conservé.
Deux shards suffisent pour passer sous le temps E2E constaté ; en ajouter
accroîtrait les installations sans gain attendu. Chaque fichier reste entier,
avec ses fixtures et tests paramétrés. Un nouveau fichier est automatiquement
affecté avec un poids conservateur, jamais exclu faute de mesure.
Le rafraîchissement et la reproduction sont décrits dans [les commandes ciblées](test-commands.md).

Chaque shard collecte toute la suite une seule fois et exécute sa partition,
avec la même `.coveragerc`, les mêmes exclusions et le branch coverage.
Seul le verdict de seuil est différé : une couverture partielle n'est pas un
gate autonome. Les données `.coverage.N`, manifests et JUnit sont transférés
par artefacts propres au run, avec les fichiers cachés explicitement inclus.
Les chemins relatifs permettent la fusion entre les checkouts des runners.

Le merger exige exactement les deux données et manifests : mêmes versions de
coverage, mêmes collections, partitions non vides et disjointes, union égale à
la collection complète. Il fusionne les lignes et branches, jamais les pourcentages,
et applique le seuil `.coveragerc` avec un plancher de 90 %. Une entrée manquante
ou incohérente bloque le job. Le XML global est conservé sept jours.
Ses tests fusionnent de vraies données partielles sous 90 % : leur union complète
passe, une union incomplète échoue.

## Installations, caches et déclencheurs

Un bootstrap backend par runner statique, shard ou E2E prépare son `.venv`
physique et valide les dépendances. Les runtimes ne sont ni partagés ni archivés.
Le cache pip conserve seulement les téléchargements selon les requirements.
Le merger installe uniquement la version exacte de coverage produite par les
shards : aucun Django, Ruff, Node, bootstrap ou nouvelle exécution de tests.
Les shards n'installent pas Node. Les requirements applicatifs restent inchangés.

Frontend/E2E conservent le cache npm et un seul `npm ci` par runner.
Playwright installe seulement Chromium headless et ses dépendances système.
Worker SQLite unique, retries et `forbidOnly` restent inchangés.
Les traces E2E d'échec restent disponibles sept jours.

Les déclencheurs push main et PR, sans filtres de chemins, et l'annulation des
runs obsolètes par workflow/référence restent inchangés. Aucun contrôle ne devient
facultatif. Aucun test ou seuil applicatif n'est supprimé ou abaissé.

## Mesures du 9 octobre 2026

| Référence réussie | Workflow complet | Backend | E2E |
| --- | --- | --- | --- |
| [37928739568](https://github.com/GaranceRichard/assess-teams/actions/runs/37928739568), db94189 | 4 min 52 s | 4 min 36 s | 4 min 30 s |
| [37926486899](https://github.com/GaranceRichard/assess-teams/actions/runs/37926486899), 76a5905 | 4 min 59 s | 4 min 47 s | 3 min 57 s |

Sur db94189 : 582 tests en 248,22 s, couverture globale 98,89 % ; Ruff/format
et migrations prennent environ 3 s, préparation backend 13 s.
Le goulot backend est pytest. La mesure locale JUnit sur ce même socle fournit
les poids de départ ; les rapports de chaque shard permettent de les recalibrer
sur GitHub Actions.

Validation locale du découpage : 287 tests en 226,97 s et 322 en 231,08 s,
soit 609 tests réussis, contre 582 tests en 409,66 s pour la référence locale.
Le chemin pytest diminue d'environ 44 %, malgré les tests CI supplémentaires.
Ces temps Windows ne sont pas une mesure du workflow GitHub complet.

À vitesse identique, deux shards visent environ la moitié du temps pytest,
avec une préparation par runner et une fusion courte. Le temps total devient
borné par l'E2E : le gain attendu varie de quelques secondes à environ 50 s
sur ces références. Ce calcul est une estimation, pas une mesure après.
Les runners et files d'attente varient : comparer plusieurs runs froids/chauds.

```powershell
gh run list --workflow quality.yml --limit 10
gh run view <run-id> --json createdAt,updatedAt,jobs
```

## Required check, documentation et Pages

Le check **Full quality gate** et son identifiant `quality` sont conservés.
Il exige explicitement le succès de tous les nouveaux jobs, y compris le résultat
agrégé de la matrice et le verdict de couverture. Aucun changement de protection
ou de droits GitHub n'est effectué par ce chantier.

Les tests YAML protègent graphe, caches, installations, matrice et Pages.
Les tests des scopes protègent le gate local complet et le scope statique.
Les tests Node refusent échec, annulation, skip, absence et JSON invalide pour
chacun des six jobs. Les tests pytest protègent partitionnement et fusion.

README, stratégie, charte, DoD et commandes ciblées sont actualisés.
Règles des agents, architecture et contrat API sont revus sans changement requis :
aucun comportement métier, endpoint, modèle ou migration n'est modifié.

Le [workflow Pages](../../.github/workflows/demo-pages.yml) reste inchangé :
publication seulement après un workflow Quality gate entièrement réussi,
déclenché par push main, et checkout du SHA exactement validé. La démo statique
reste compilée et testée dans le scope E2E avant cette publication.
