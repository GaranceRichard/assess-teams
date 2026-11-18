# Qualification exhaustive CI-OPT 10/5

## Préparation du changement — 2026-11-18

Préparation rédigée dans le worktree CI dédié avant toute modification technique.
Départ : `origin/main` à `6a81c98134a7a6bfe2a16b223b1e560a0541f5ec`.
Le chantier C2 possède un autre worktree et reste indépendant.

- Périmètre : faire évoluer les workflows et consolidateurs existants vers dix partitions backend et cinq E2E, avec qualification quotidienne exhaustive.
- Objectif : réduire le chemin critique E2E et corriger la base documentaire absente des qualifications manuelles et planifiées.
- Effets attendus : exécuter chaque test exactement une fois, consolider toutes les preuves et attester seulement le SHA candidat intégralement réussi.
- Risques : une identité incohérente, une collection divergente, une preuve perdue ou une mauvaise base Git pourrait créer une qualification incomplète ; les refus restent bloquants.
- Vérification : contrats réels de partitionnement et de résolution Git, refus des consolidateurs, campagne locale exhaustive, publication canonique et qualification distante indépendante du SHA final.
- Fichier : `.github/workflows/quality.yml`
- Fichier : `.github/workflows/exhaustive.yml`
- Fichier : `.github/workflows/backend.yml`
- Fichier : `.github/workflows/e2e.yml`
- Fichier : `.github/workflows/exhaustive-report.yml`
- Fichier : `scripts/quality/backend_shards.py`
- Fichier : `scripts/quality/backend-test-durations.json`
- Fichier : `scripts/quality/combine_backend_coverage.py`
- Fichier : `scripts/quality/e2e_collection.mjs`
- Fichier : `scripts/quality/combine_e2e_reports.mjs`
- Fichier : `scripts/quality/tests/ci-diff-base.test.mjs`
- Fichier : `scripts/quality/tests/e2e-reports.test.mjs`
- Fichier : `scripts/quality/tests/e2e-artifacts.test.mjs`
- Fichier : `scripts/quality/tests/scopes.tests.ps1`
- Fichier : `scripts/quality/tests/validation-policy.test.mjs`
- Fichier : `frontend/e2e/reports.ts`
- Fichier : `frontend/src/browserGates.test.ts`
- Fichier : `scripts/quality.ps1`
- Fichier : `scripts/test-all.ps1`
- Fichier : `backend/tests/test_backend_shards.py`
- Fichier : `backend/tests/test_backend_coverage.py`
- Fichier : `backend/tests/test_backend_workflow.py`
- Fichier : `backend/tests/test_ci_workflow.py`
- Fichier : `backend/tests/test_impact_workflow.py`

## Diagnostic avant modification

Référence : [exécution 44302567209](https://github.com/GaranceRichard/assess-teams/actions/runs/44302567209),
candidat `6a81c98134a7a6bfe2a16b223b1e560a0541f5ec`, déclenchement manuel.
Les huit shards backend et les deux E2E sont verts ; Repository constraints et Full quality gate échouent.
La couverture backend consolidée mesure **97,36 % pour 1 758 tests**, seuil requis **90 %**.

La répartition backend utilise les poids historiques par fichier, un placement glouton déterministe et
le seul découpage intrafichier audité : `tests/test_sqlite_critical_conflicts.py`.
Les nouveaux fichiers reçoivent un poids conservateur et sont collectés automatiquement.
Chaque shard produit couverture, manifeste, version coverage et JUnit. La fusion vérifie les identités,
collections et sélections disjointes avant le seuil global ; la présence du JUnit doit aussi être exigée.

Playwright utilise un worker, une collection complète par suite/shard, des JSON et blobs isolés.
Le consolidateur vérifie l'union exacte des tests ; le nombre deux est actuellement figé dans plusieurs
contrats. La préparation des blobs doit refuser les ensembles incomplets avant fusion.
Le nombre de workers, les retries et les timeouts restent inchangés.
La revue approfondie reproduit aussi un faux succès de `coverage.combine(strict=True)` : un fichier
illisible est ignoré avec avertissement si les autres suffisent au seuil. Chaque base de couverture sera
donc lue et exigée non vide, avec mesures de branches, avant toute fusion ; refus vide/corrompu/ligne seule.
La revue des artefacts relève aussi des journaux Chromium homonymes entre runners : leur nom sera
suffixé par l'identité du shard avant le téléchargement fusionné, avec contrat de non-collision.

`QUALITY_DIFF_BASE` vaut uniquement `pull_request.base.sha || before` : vide en dispatch/schedule.
Le correctif établira la base depuis le premier parent du candidat effectivement testé dans ces modes,
y compris candidat historique ; push/PR conservent leur base explicite. Aucun parent utilisable : échec.
La résolution est portée par le workflow lui-même, pour rester disponible même quand le checkout
historique précède ce correctif ; les tests exécutent exactement ce bloc du workflow.
La nightly existante `23 7 * * *` est conservée, sans sélection proportionnée ni nouvelle planification.

## Référence mesurée 8/2

Durées GitHub entre début et fin de chaque job, en secondes ; étapes tests mesurées séparément.

| Shard backend | Tests | Job | Étape pytest |
| --- | ---: | ---: | ---: |
| 1/8 | 109 | 137 | 116 |
| 2/8 | 117 | 76 | 50 |
| 3/8 | 156 | 112 | 67 |
| 4/8 | 151 | 81 | 61 |
| 5/8 | 193 | 98 | 64 |
| 6/8 | 299 | 126 | 105 |
| 7/8 | 394 | 273 | 250 |
| 8/8 | 339 | 154 | 123 |
| Somme | 1 758 | 1 057 | 836 |

| Shard E2E | App / démo | Job | Avant étape tests | Étape tests et build démo |
| --- | ---: | ---: | ---: | ---: |
| 1/2 | 78 / 5 | 770 | 376 | 386 |
| 2/2 | 77 / 5 | 593 | 76 | 511 |

L'installation Chromium mesure respectivement 305 et 12 secondes : forte variation de préparation.
Les rapports JSON mesurent app 350,943 / 490,073 s et démo 25,566 / 9,668 s.
Les deux tests `real transitions across themes and palettes` (1366 et 375) prennent
63,318 et 62,415 s sur le shard 2 ; aucune exclusion n'est envisagée.
Le JUnit backend 7 attribue 96,568 s à `test_sqlite_contention_operational.py` et
36,873 s à `test_installation_processes.py` ; backend 1 attribue 74,918 s à
`test_organization_delete_concurrency.py`. Ce sont des mesures, pas de nouveaux poids versionnés.
Frontend : job 173 s, gate complet 113 s. Couverture : job 14 s, fusion 1 s.
Rapport final : job 67 s, consolidation 4 s. Total mural : **855 s (14 min 15)**.
Somme de tous les jobs : **2 789 s, soit environ 46,48 minutes de runners**,
sans arrondi de facturation ; campagne globalement rouge à cause du gate documentaire.

## Contrats vérifiés et revue de contenu

Les contrats Python ciblés passent : 61 tests, dont dix vrais sous-processus pytest disjoints,
couverture fusionnée insuffisante refusée, JUnit manquant/corrompu/échoué/ignoré refusé et invariants YAML.
Les quatre nouvelles régressions couverture échouent avant correction et passent ensuite : fichier vide,
corrompu, lignes seules et absence d'exécution. La lecture obligatoire des dix bases précède la fusion.
Les 40 contrats Node passent : cinq shards, refus de doublons/omissions/collections divergentes,
identités erronées, tests ignorés/échoués/non exécutés, erreur runner et JSON corrompu.
Les faux octets blobs des fixtures testent la présence et le transport ; leur intégrité ZIP relève
du véritable `playwright merge-reports`, qui reste bloquant dans le workflow.
Les sept cas Git/documentation exécutent le bloc réel du workflow et le vrai gate PowerShell :
défaut reproduit sans base, préparation valide acceptée avec parent correct, trois préparations invalides refusées.
Push/PR/call, candidat historique, base divergente, base identique et absence de parent sont couverts.
Les scopes PowerShell et les vingt contrats Vitest navigateur passent, dont les journaux Chromium isolés.
Un vrai `playwright merge-reports` sur ZIP volontairement corrompu termine en échec (code 1).
La collecte Playwright réelle `--list` constate **155 app = 5 × 31** et **10 démo = 5 × 2**,
union complète sans répétition. Cette collecte n'exécute aucun parcours.

La préparation a réellement précédé le code. Les documents CI, charte, DoD, stratégie et matrice
sont alignés sur 10/5. Revue du README, des règles agents, de la charte et des contrats architecture/API :
aucun comportement produit, endpoint, modèle, migration ou information publique n'est modifié.
Le document propriétaire convient aux workflows, scripts et tests concernés ; aucun remplissage artificiel.
Les seuils, statuts canoniques, workers/retries/timeouts et réserves restent inchangés.
La nightly possède des déclenchements `schedule` réels :
[16 novembre réussi](https://github.com/GaranceRichard/assess-teams/actions/runs/43915438560) et
[17 novembre échoué](https://github.com/GaranceRichard/assess-teams/actions/runs/44131501559).
Leurs créations à 17:09:53 et 16:56:51 UTC sont tardives par rapport au cron ; GitHub ne garantit
pas un démarrage ponctuel. La future exécution planifiée 10/5 ne peut être attestée par anticipation.

## Validation applicative et qualification distante

Avant resynchronisation : repository complet réussi, **1 767 pytest réussis en 1 855,56 s**,
couverture backend **97,41 %** ; **510 Vitest réussis**, couverture statements/branches/functions/lines
**94,97 / 93,55 / 96,47 / 95,81 %**, avec lint/format/typecheck/build réussis.
La tentative E2E restreinte refuse le démarrage du backend : écriture du dispatcher Git commun interdite
par le sandbox. Les dix tests démo passent, mais cette tentative reste globalement en échec.
La reprise avec accès autorisé ne réutilise pas les preuves antérieures.
Elle est interrompue pour intégrer C2 publié sur `0857156deb0804acaa743bc899f751e1e3fa2393` :
ses trois scripts de distribution changent les entrées transversales ; une validation finale fraîche est requise.
Aucun résultat de cette reprise interrompue n'est présenté comme une qualification réussie.
Après resynchronisation, les **155 parcours applicatifs et 10 démo** passent intégralement avec accès autorisé.
Un ancien dossier temporaire pytest créé dans le contexte restreint produit ensuite 283 erreurs d'accès ;
son archivage depuis son contexte créateur et celui du cache pytest rétablissent 31 contrats sans avertissement.
La revue de fusion reproduit alors un fichier corrompu ignoré avec 100 % et code 0 sur des données de contrôle ;
ce faux succès est corrigé par les quatre refus ci-dessus. Les campagnes interrompues ne valent pas preuve finale.
La validation finale du correctif réussit : **1 771 pytest en 1 637,01 s**, couverture **97,41 %**,
**510 Vitest**, quatre couvertures inchangées au-dessus de 90 %, puis **155 app + 10 démo** réussis.
Le scope E2E complet mesure **1 426,592 s** sur Windows, préparation et vérifications d'empreinte incluses.
Une interruption temporelle du poste avait fait durer une attente de 50 s environ 45 min et expirer un test ;
la reprise complète réussit avec les mêmes workers, retries et timeouts, sous maintien temporaire en activité.
Le plan consolidé final sort avec code 0 : dépôt frais, trois preuves applicatives identiques réutilisées,
avec vérification des entrées après chaque contrôle et à la fin. Les journaux et métriques sont conservés.
Ces durées locales ne sont pas comparées aux durées des runners GitHub ; les mesures distantes suivent publication.

Les horodatages GitHub et les rapports existants servent de référence 8/2 ; aucune durée n'est inventée.
Comparer séparément préparation, tests, fusions, durée murale et somme des minutes de runners.
La cible 6–8 minutes est un objectif à mesurer, pas un résultat acquis.
Le README produit, les contrats API, SQLite, MESS et les réserves I01/I02/I03 ne sont pas affectés.
Les documents qualité canoniques seront alignés sur le contrat 10/5 après vérification.
