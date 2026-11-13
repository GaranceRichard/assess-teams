# Publication et CI exacte du correctif

Commit : `f400a8e98b0b363f1b10ccca6d4381781390234e`.
[Run 43346012639](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639) : `success`, événement `push`, tentative 1.
Début `2026-11-13T01:35:09Z`, fin `2026-11-13T01:38:44Z` (UTC).

| Job | ID | Résultat |
| --- | --- | --- |
| plan | [131625440170](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625440170) | success |
| repository | [131625526830](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625526830) | success |
| backend / Backend tests (3/8) | [131625527085](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625527085) | success |
| backend / Backend tests (5/8) | [131625527098](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625527098) | success |
| backend / Backend tests (8/8) | [131625527101](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625527101) | success |
| backend / Backend static quality | [131625527138](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625527138) | success |
| backend / Backend tests (6/8) | [131625527156](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625527156) | success |
| backend / Backend tests (7/8) | [131625527162](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625527162) | success |
| backend / Backend tests (4/8) | [131625527167](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625527167) | success |
| backend / Backend tests (2/8) | [131625527345](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625527345) | success |
| backend / Backend tests (1/8) | [131625527563](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625527563) | success |
| full | [131625528227](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625528227) | skipped |
| frontend | [131625529245](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625529245) | skipped |
| e2e | [131625529447](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131625529447) | skipped |
| backend / Backend global coverage | [131626628840](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131626628840) | success |
| Required impact gate | [131626745824](https://github.com/GaranceRichard/assess-teams/actions/runs/43346012639/job/131626745824) | success |

## Contrôles requis réellement exécutés

Plan sélectif : documentation et backend complet. Les huit partitions totalisent **1 498 tests
passés**, sans test perdu ni doublonné selon le gate de fusion existant. Statique backend,
fusion de couverture et `Required impact gate` sont verts. Le TOTAL CI affiche 98 % arrondi ;
ses compteurs sont identiques au rapport local à 97,51 %. Les seuils restent à 90 %.

Les jobs frontend/E2E/exhaustif sont non requis pour ce diff de tests internes ; leurs statuts
GitHub `skipped` proviennent du plan existant. Aucun skip de test ni changement de workflow ajouté.
Ce run est une CI sélective verte du correctif ; il n’est pas présenté comme une nouvelle
qualification exhaustive. La qualification exhaustive du 12 novembre reste attachée à
[`2fedab80…`](qualification-20261112.md), son SHA exact.

## Pré-push et synchronisation

`npm run publish` a validé les protections, la branche/worktree dédiés et le diff annoncé par Git.
Le pré-push a réexécuté la documentation et le backend complet, sans contournement.
Métrique backend du pre-push : code 0, **1 364,123 s**, entrée de preuve fraîche,
base `2fedab80cdcff42325c6c1bfc06f5650c702c2ae`, candidat `f400a8e98b0b363f1b10ccca6d4381781390234e`.
La raison précise de non-réutilisation de la première preuve locale n’a pas été établie ;
le mécanisme de validation n’a pas été modifié dans ce chantier.

Le push utilise la branche dédiée comme source et main comme destination. Le principal a été
avancé en fast-forward. À la reprise du 13 novembre, il est observé propre, non divergent et
exactement à `f400a8e…`, comme `origin/main`. Aucun autre worktree n’est nettoyé.

## Empreintes des preuves de travail

| Fichier | SHA-256 |
| --- | --- |
| `run.json` | `011e520861925750f1979c01821c5add7a8f95c6a902ff5d676732a6fb34daf5` |
| `jobs.json` | `79014e0f2876714b0f9351127a13f7d2a28bf7c4318e79accaba5e8bd159d191` |
| `artifacts.json` | `f9784e93f31ae072313100731a95150453b321e565d1a0afc0b9992b4897ce24` |
| `logs.zip` | `d26def5e5da829a047bccb07d0acc832e927a17a6667c627a913a766895b7dbd` |
