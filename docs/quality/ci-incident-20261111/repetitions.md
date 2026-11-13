# Résultats des répétitions isolées

Chaque ligne est une invocation séparée de pytest, avec nouveau répertoire temporaire.
UTC = fin de commande ; durée = temps externe de la commande, pas durée du verrou.
Aucun échec spontané dans ces vingt répétitions ; cela ne prouve pas l’absence de défaut.

| ID | UTC | Durée (s) | Code | Résultat pytest |
| --- | --- | --- | --- | --- |
| baseline-development-01 | 2026-11-12T13:25:54.739720+00:00 | 4.977 | 0 | 1 passed in 4.15s |
| baseline-development-02 | 2026-11-12T13:25:59.282495+00:00 | 4.542 | 0 | 1 passed in 4.01s |
| baseline-development-03 | 2026-11-12T13:26:03.888551+00:00 | 4.606 | 0 | 1 passed in 3.97s |
| baseline-development-04 | 2026-11-12T13:26:08.331364+00:00 | 4.444 | 0 | 1 passed in 3.85s |
| baseline-development-05 | 2026-11-12T13:26:12.790416+00:00 | 4.459 | 0 | 1 passed in 3.89s |
| baseline-development-06 | 2026-11-12T13:26:17.080160+00:00 | 4.289 | 0 | 1 passed in 3.73s |
| baseline-development-07 | 2026-11-12T13:26:21.550343+00:00 | 4.470 | 0 | 1 passed in 3.89s |
| baseline-development-08 | 2026-11-12T13:26:25.958773+00:00 | 4.408 | 0 | 1 passed in 3.84s |
| baseline-development-09 | 2026-11-12T13:26:30.747235+00:00 | 4.788 | 0 | 1 passed in 4.21s |
| baseline-development-10 | 2026-11-12T13:26:35.788586+00:00 | 5.042 | 0 | 1 passed in 3.87s |
| baseline-production-01 | 2026-11-12T13:26:40.469009+00:00 | 4.680 | 0 | 1 passed in 4.01s |
| baseline-production-02 | 2026-11-12T13:26:45.266797+00:00 | 4.797 | 0 | 1 passed in 4.09s |
| baseline-production-03 | 2026-11-12T13:26:49.850734+00:00 | 4.584 | 0 | 1 passed in 3.81s |
| baseline-production-04 | 2026-11-12T13:26:54.467539+00:00 | 4.617 | 0 | 1 passed in 3.95s |
| baseline-production-05 | 2026-11-12T13:26:59.243949+00:00 | 4.776 | 0 | 1 passed in 4.19s |
| baseline-production-06 | 2026-11-12T13:27:03.865888+00:00 | 4.621 | 0 | 1 passed in 3.99s |
| baseline-production-07 | 2026-11-12T13:27:08.488774+00:00 | 4.624 | 0 | 1 passed in 3.97s |
| baseline-production-08 | 2026-11-12T13:27:13.236605+00:00 | 4.747 | 0 | 1 passed in 4.03s |
| baseline-production-09 | 2026-11-12T13:27:18.472381+00:00 | 5.236 | 0 | 1 passed in 4.54s |
| baseline-production-10 | 2026-11-12T13:27:23.579313+00:00 | 5.107 | 0 | 1 passed in 4.45s |

Commande, depuis `/audit/backend` :

```sh
python -m pytest -q "tests/test_sqlite_contention_operational.py::test_operational_contention[apis_release-development]"
# Remplacer development par production pour la seconde série.
```

La toute première reproduction ciblée, avant les séries, a également réussi : `1 passed in 4.39s`.
Les sources et assertions de ce test sont celles du SHA audité.
Les essais ne sont pas des preuves de couverture globale ni des gates de livraison.
Les dernières répétitions production ont chevauché le début de la sonde, avec bases/processus séparés ;
aucune isolation des ressources CPU hôte n’est revendiquée.
