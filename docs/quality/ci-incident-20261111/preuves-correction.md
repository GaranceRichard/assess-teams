# Preuves du correctif et répétitions bornées

## Journaux rouge/vert

| Journal local archivé | Résultat | SHA-256 |
| --- | --- | --- |
| `regression-red.log` | Windows : 2 échecs de protocole | `9c5c37dcfc6f72c447089f5343a6d7d07bd63a40a7e99c83b43ffec436d7d607` |
| `regression-green.log` | Windows : 2 réussites | `838034073a5b8c700bc672763093b399bb6f71817cec1e492c3fd22cffc15072` |
| `correction/linux-red.log` | Linux : 2 échecs de protocole | `d42d781399efcab4893f0c4654d64e7ed2b24465546b37d4ec7ac2f149c79809` |
| `correction/linux-green.log` | Linux : 2 réussites | `e03b2cdedc7a986b3f1b181384afcc58632aa3c3fde627eae1a9fa8f72be3105` |

Le refus de préparation Windows est archivé séparément dans `regression-setup-error.log`.
Il ne compte pas parmi les tests rouges.

## Cinq séries ciblées Linux

Chaque invocation exécute `apis_release`, `apis_release_handoff` et `apis_timeout`
dans development et production, avec nouveaux processus et bases temporaires par cas.

| Série | Durée externe (s) | Résultat pytest | Code |
| --- | --- | --- | --- |
| 1 | 24.234 | 6 passed, 18 deselected in 23.60s | 0 |
| 2 | 24.500 | 6 passed, 18 deselected in 23.82s | 0 |
| 3 | 24.781 | 6 passed, 18 deselected in 23.98s | 0 |
| 4 | 24.532 | 6 passed, 18 deselected in 23.64s | 0 |
| 5 | 25.875 | 6 passed, 18 deselected in 25.10s | 0 |

Total : **30 cas réussis**, dont dix refus natifs attendus validés par les assertions existantes.
Aucune nouvelle répétition lancée après cette borne.

```sh
python -m pytest -q tests/test_sqlite_contention_operational.py -k apis_release_handoff
python -m pytest -q tests/test_sqlite_contention_operational.py -k "apis_release or apis_timeout"
```

La recette rouge extrait `HEAD:backend/tests/sqlite_contention_cases.py` de `2fedab80…`,
ajoute uniquement la branche du nouveau scénario `apis_release_handoff`, et conserve
le hook SQL original. Helper de non-régression et matrice pytest sont identiques en rouge/vert.
La recette verte remplace seulement les deux sources corrigées du scénario et du pair.

## Empreintes de la comparaison Linux

| Entrée | SHA-256 |
| --- | --- |
| Ancien scénario + entrée de non-régression | `410026d7695162eb289f88ed8b9f8b83a5a0003a61678def7547438a27a1ed46` |
| Scénario corrigé final | `88300c7a479b20dc8ea3ca1be79f00288fa123d4e6d8f60bebf24e5095f7d290` |
| Pair corrigé final | `1a1ba6fd0a7f480568cf8e5501afa56b9ce07fb6a5d3bf55991a152bd7fe0929` |
| Non-régression | `39d0533340e5c6fc37f9ee7501db142f191a8b969e69b9974a0f97beb4e9188b` |

Le formatage Ruff final n’affecte pas le comportement du scénario utilisé dans les séries Linux.
Les validations obligatoires du checkout final utilisent ses fichiers formatés.
Le conteneur et les logs Linux sont internes au chantier ; aucun serveur existant n’est touché.

## Extraits conservés après nettoyage du worktree

`regression-red.log` :

```text
E         AssertionError: Holder resumed before contender was parked
E        +  where 1 = CompletedProcess(args=['C:\\Users\\garan\\Desktop\\Projets\\Assess-teams-ci-20261111\\backend\\.venv\\Scripts\\python....contender was parked"\n           ~~~~~~~~~~~^^^^^^^^^^\nAssertionError: Holder resumed before contender was parked\n').returncode
FAILED tests/test_sqlite_contention_operational.py::test_operational_contention[apis_release_handoff-development]
FAILED tests/test_sqlite_contention_operational.py::test_operational_contention[apis_release_handoff-production]
2 failed, 22 deselected in 17.41s
```

`regression-green.log` :

```text
2 passed, 22 deselected in 9.48s
```

`correction/linux-red.log` :

```text
E         AssertionError: Holder resumed before contender was parked
E        +  where 1 = CompletedProcess(args=['/usr/local/bin/python', '-m', 'tests.sqlite_contention_cases', 'apis_release_handoff', '/tmp/p...contender was parked"\n           ~~~~~~~~~~~^^^^^^^^^^\nAssertionError: Holder resumed before contender was parked\n').returncode
FAILED tests/test_sqlite_contention_operational.py::test_operational_contention[apis_release_handoff-development]
FAILED tests/test_sqlite_contention_operational.py::test_operational_contention[apis_release_handoff-production]
2 failed, 22 deselected in 13.87s
```

`correction/linux-green.log` :

```text
2 passed, 22 deselected in 7.74s
```
