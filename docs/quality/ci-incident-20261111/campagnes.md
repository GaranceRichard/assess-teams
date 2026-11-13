# Campagnes et matrice des jobs

> État de la phase d’audit initiale avant GO. Voir la [qualification du 12 novembre](qualification-20261112.md) et la [correction approuvée](correction.md) pour la suite.

Extraction des API GitHub Actions, tentative 1 pour les quatre runs. Horaires UTC.

| Run | Événement | Début | Fin | Conclusion |
| --- | --- | --- | --- | --- |
| [42622603260](https://github.com/GaranceRichard/assess-teams/actions/runs/42622603260) | push | 2026-11-09T13:06:50Z | 2026-11-09T13:07:50Z | success |
| [42666770555](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555) | schedule | 2026-11-09T17:39:35Z | 2026-11-09T17:52:48Z | success |
| [42846627165](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165) | schedule | 2026-11-10T15:39:28Z | 2026-11-10T15:52:23Z | success |
| [43048132030](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030) | schedule | 2026-11-11T15:24:59Z | 2026-11-11T15:37:33Z | failure |

Tous portent `ec4c3a535065c54e3c25abea8f52b722f5bef5be`.

## Matrice exhaustive

| Job | 9 novembre : ID / résultat | 10 novembre : ID / résultat | 11 novembre : ID / résultat |
| --- | --- | --- | --- |
| identity | [129332419065](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332419065) / success | [129935719445](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935719445) / success | [130617529481](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617529481) / success |
| Repository constraints | [129332522319](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522319) / success | [129935848880](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935848880) / success | [130617628963](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617628963) / success |
| e2e / Playwright E2E (2/2) | [129332522574](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522574) / success | [129935849319](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935849319) / success | [130617629053](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629053) / failure |
| e2e / Playwright E2E (1/2) | [129332522883](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522883) / success | [129935849380](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935849380) / success | [130617629075](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629075) / failure |
| backend / Backend static quality | [129332522727](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522727) / success | [129935849181](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935849181) / success | [130617629199](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629199) / success |
| Frontend quality | [129332522370](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522370) / success | [129935848867](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935848867) / success | [130617629269](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629269) / success |
| backend / Backend tests (4/8) | [129332523043](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332523043) / success | [129935849586](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935849586) / success | [130617629326](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629326) / failure |
| backend / Backend tests (5/8) | [129332522756](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522756) / success | [129935849642](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935849642) / success | [130617629327](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629327) / success |
| backend / Backend tests (1/8) | [129332522869](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522869) / success | [129935849545](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935849545) / success | [130617629374](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629374) / success |
| backend / Backend tests (2/8) | [129332522695](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522695) / success | [129935849632](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935849632) / success | [130617629390](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629390) / success |
| backend / Backend tests (7/8) | [129332522836](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522836) / success | [129935849517](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935849517) / success | [130617629409](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629409) / success |
| backend / Backend tests (3/8) | [129332522664](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522664) / success | [129935849492](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935849492) / success | [130617629447](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629447) / success |
| backend / Backend tests (6/8) | [129332522788](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522788) / success | [129935849547](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935849547) / success | [130617629470](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629470) / success |
| backend / Backend tests (8/8) | [129332522844](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129332522844) / success | [129935849474](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129935849474) / success | [130617630883](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617630883) / success |
| backend / Backend global coverage | [129334610387](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129334610387) / success | [129938118073](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129938118073) / success | [130619704714](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130619704714) / skipped |
| quality / Full quality gate | [129339232077](https://github.com/GaranceRichard/assess-teams/actions/runs/42666770555/job/129339232077) / success | [129943030674](https://github.com/GaranceRichard/assess-teams/actions/runs/42846627165/job/129943030674) / success | [130624418533](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130624418533) / failure |

## Chronologie des jobs du 11 novembre

| ID | Début UTC | Fin UTC |
| --- | --- | --- |
| 130617529481 | 2026-11-11T15:25:02Z | 2026-11-11T15:25:10Z |
| 130617628963 | 2026-11-11T15:25:13Z | 2026-11-11T15:26:26Z |
| 130617629053 | 2026-11-11T15:25:13Z | 2026-11-11T15:36:23Z |
| 130617629075 | 2026-11-11T15:25:13Z | 2026-11-11T15:36:37Z |
| 130617629199 | 2026-11-11T15:25:12Z | 2026-11-11T15:25:44Z |
| 130617629269 | 2026-11-11T15:25:13Z | 2026-11-11T15:28:01Z |
| 130617629326 | 2026-11-11T15:25:12Z | 2026-11-11T15:28:11Z |
| 130617629327 | 2026-11-11T15:25:13Z | 2026-11-11T15:28:25Z |
| 130617629374 | 2026-11-11T15:25:13Z | 2026-11-11T15:26:34Z |
| 130617629390 | 2026-11-11T15:25:13Z | 2026-11-11T15:27:10Z |
| 130617629409 | 2026-11-11T15:25:12Z | 2026-11-11T15:28:39Z |
| 130617629447 | 2026-11-11T15:25:13Z | 2026-11-11T15:27:02Z |
| 130617629470 | 2026-11-11T15:25:13Z | 2026-11-11T15:28:22Z |
| 130617630883 | 2026-11-11T15:25:13Z | 2026-11-11T15:28:22Z |
| 130619704714 | 2026-11-11T15:28:39Z | 2026-11-11T15:28:39Z |
| 130624418533 | 2026-11-11T15:36:40Z | 2026-11-11T15:37:32Z |

## Preuves de qualification historiques

Run 42666770555 : artefact `qualification`, contenu téléchargé.

```json
{
  "sha": "ec4c3a535065c54e3c25abea8f52b722f5bef5be",
  "success": true,
  "exhaustive": true,
  "provenance": "github-actions",
  "runId": "42666770555",
  "timestamp": "2026-11-09T17:52:44.790Z"
}
```

Run 42846627165 : artefact `qualification`, contenu téléchargé.

```json
{
  "sha": "ec4c3a535065c54e3c25abea8f52b722f5bef5be",
  "success": true,
  "exhaustive": true,
  "provenance": "github-actions",
  "runId": "42846627165",
  "timestamp": "2026-11-10T15:52:20.027Z"
}
```
