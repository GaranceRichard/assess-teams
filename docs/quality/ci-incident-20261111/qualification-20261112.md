# Qualification exhaustive du 12 novembre 2026

[Run 43254284873](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873) : `success`, événement `schedule`, tentative 1.
SHA : `2fedab80cdcff42325c6c1bfc06f5650c702c2ae` ; début `2026-11-12T16:02:24Z`, fin `2026-11-12T16:13:34Z` (UTC).

| Job | ID | Résultat |
| --- | --- | --- |
| identity | [131308177546](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308177546) | success |
| Repository constraints | [131308320152](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308320152) | success |
| Frontend quality | [131308320268](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308320268) | success |
| e2e / Playwright E2E (1/2) | [131308320532](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308320532) | success |
| e2e / Playwright E2E (2/2) | [131308320592](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308320592) | success |
| backend / Backend static quality | [131308320608](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308320608) | success |
| backend / Backend tests (3/8) | [131308320939](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308320939) | success |
| backend / Backend tests (4/8) | [131308320954](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308320954) | success |
| backend / Backend tests (2/8) | [131308320965](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308320965) | success |
| backend / Backend tests (1/8) | [131308320979](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308320979) | success |
| backend / Backend tests (7/8) | [131308321036](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308321036) | success |
| backend / Backend tests (5/8) | [131308321040](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308321040) | success |
| backend / Backend tests (6/8) | [131308321049](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308321049) | success |
| backend / Backend tests (8/8) | [131308321106](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131308321106) | success |
| backend / Backend global coverage | [131310686543](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131310686543) | success |
| quality / Full quality gate | [131314826727](https://github.com/GaranceRichard/assess-teams/actions/runs/43254284873/job/131314826727) | success |

## Artefact de qualification

Artefact `13960384832`, téléchargé et lu :

```json
{
  "sha": "2fedab80cdcff42325c6c1bfc06f5650c702c2ae",
  "success": true,
  "exhaustive": true,
  "provenance": "github-actions",
  "runId": "43254284873",
  "timestamp": "2026-11-12T16:13:30.648Z"
}
```

## Lecture contradictoire

Les deux installations Playwright et les étapes de parcours sont vertes ; le backend,
la fusion de couverture, les contrôles frontend et le gate final sont tous verts.
Le scénario de contention est encore celui d’avant correction : ce succès ne corrige pas sa course.
Le SHA diffère du candidat du 11, notamment par des évolutions TEAM-003 déjà intégrées.
Les fichiers du scénario de contention et les workflows sont inchangés entre ces deux bases.
Le présent chantier ne modifie aucun fichier applicatif TEAM-003.
Aucun rerun historique ni nouvelle campagne exhaustive n’est déclenché pour cet incident.

## Empreintes des preuves archivées

| Fichier | SHA-256 |
| --- | --- |
| `run.json` | `edab4b811d3435ef77087571c1ed631632a945cfd887a2da93b5c8d501f00aac` |
| `jobs.json` | `d53f90dd5bdb70ebfe328517f6b60e5ecc7c9da405e9122b3fbbb5dba8726906` |
| `artifacts.json` | `6bdeae44ee363e93b07eebe845b428a75eab04cd6fea2fccda360a65bad70d16` |
| `logs.zip` | `5ce576f532cb1c84141859f4aaf658b572408c68be2238b983a4262f1c3979f1` |
| `qualification.zip` | `b9c8defa1fa0abb7e2ef97ce2b9198910d73d9b42c5f0a95442439cdd7a2aad7` |
