# Résultats des gates obligatoires

Codex, 2026-10-30 ; `npm.cmd run quality:targeted`, code de sortie 0.
Base `029857a96b730aaf6357c123b429860f56e445a0` + diff préparé ; sources identifiées par les [empreintes](traces.md).
Les durées incluent le contrôle du domaine ; horodatages UTC (America/Toronto : UTC−04:00).

| Domaine imposé | Exécution | Code | Durée | Fin UTC |
| --- | --- | --- | --- | --- |
| repository | Exécuté | 0 | 83.0 s | 2026-10-30T12:56:02.034Z |
| backend | Exécuté | 0 | 1154.7 s | 2026-10-30T13:15:16.779Z |
| frontend | Exécuté | 0 | 92.1 s | 2026-10-30T13:16:48.868Z |
| e2e | Exécuté | 0 | 1100.5 s | 2026-10-30T13:35:09.383Z |

Sélection de la sortie effective, sans en-tête sensible :

```text
  [PASS] Backend lint
  [PASS] Backend format check
  [PASS] Coherence des migrations Django
  ====================== 1456 passed in 1135.61s (0:18:55) ======================
  [PASS] Frontend lint
  [PASS] Frontend format check
  [PASS] Frontend typecheck et build
   Test Files  110 passed (110)
        Tests  443 passed (443)
  All files          |   94.38 |     92.9 |   95.81 |   95.26 |
  =============================== Coverage summary ===============================
  Statements   : 94.38% ( 2086/2210 )
  Branches     : 92.9% ( 1662/1789 )
  Functions    : 95.81% ( 802/837 )
  Lines        : 95.26% ( 1913/2008 )
    111 passed (17.3m)
    10 passed (39.9s)
```

Le plan exhaustif vient du classificateur des captures binaires et du parcours composant non cartographié.
Aucune campagne exhaustive supplémentaire n’a été lancée pour étendre la recette MEP-045.
Les sept critères déjà conformes conservent leurs preuves initiales.
Le pre-push, le push et la CI du commit exact attendent l’autorisation de publication.
