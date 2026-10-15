# MEP-039 — Mesures reproductibles

[Décision et exploitation](README.md) ; [126 observations brutes](mep-039-measurements.jsonl).
La première ligne JSONL décrit le runtime ; chaque ligne suivante est une observation indépendante.
Les durées sont en secondes et les débits en transactions validées/seconde.

## Méthode

Mesure du 2026-10-15 sur Windows 11 build 26200, AMD64, Python 3.12.10, SQLite 3.49.1.
Base de départ `f536ca1` ; protocole et tables correspondent aux scripts MEP-039 de cette livraison.
Le disque est celui du répertoire temporaire local ; modèle, latence disque, CPU et stockage MESS
ne sont pas qualifiés. Les processus/antivirus et la charge du poste peuvent affecter les résultats.
Les valeurs représentent ce poste, sans extrapolation aux requêtes métier ni à une cible MESS inconnue.

Depuis `backend`, avec le runtime Python déjà préparé :

```powershell
.venv/Scripts/python.exe -m tools.sqlite_concurrency --output report.jsonl --repeats 3
.venv/Scripts/python.exe -m pytest tests/test_sqlite_contention.py tests/test_sqlite_configuration.py tests/test_sqlite_api_workers.py tests/test_sqlite_worker_connections.py
```

Les modules [probe](../../../backend/tools/sqlite_probe.py),
[charge](../../../backend/tools/sqlite_load.py) et [CLI](../../../backend/tools/sqlite_concurrency.py)
n’utilisent que la bibliothèque standard. Chaque scénario crée un fichier indépendant ; aucun argument
ne permet de viser une base existante. `spawn` impose de vrais processus séparés, y compris sous Windows.
Les connexions sont prêtes avant le signal de départ, hors mesure ; échanges Pipe et limites d’attente
détectent un enfant bloqué. La durée d’une opération inclut BEGIN/SQL/COMMIT et l’attente SQLite.
Les connexions de charge rouvertes incluent leur coût après la première opération.

Probes : un processus tient un verrou, l’autre tente une lecture ou une transaction d’écriture.
Le signal `started` précède la tentative ; le détenteur libère après 200 ms (`writer_waits`),
ou conserve le verrou jusqu’au résultat (`writer_times_out`). `reader_blocks_commit` conserve une
lecture transactionnelle jusqu’à la fin de la tentative de commit du pair. Modes DELETE/WAL,
`synchronous=FULL`, timeouts 0,1/1/5 s ; aucune reprise après refus.

Charge : 1/2/4 processus, vingt opérations chacun, démarrage commun, sans temps de réflexion.
Chaque transaction incrémente un compteur et insère une ligne d’audit, puis conserve le verrou
10 ms avant commit. Variantes : écriture avant lecture, connexion rouverte à chaque opération,
ou lecture avant écriture dans un BEGIN différé. Ce sont des opérations synthétiques sqlite3,
pas des endpoints ni une mesure de capacité utilisateur. Les réglages équivalents sont vérifiés via
de vraies connexions Django dans `test_sqlite_configuration`.

Après fermeture des processus, on contrôle compteur = audit = succès, et `integrity_check=ok`.
Les probes d’échec vérifient aussi l’absence d’écriture partielle. Le test API séparé utilise les
modèles, services, permissions/session/CSRF et Journal réels ; seul le transport SMTP est suspendu.
Les suites MEP-003 restent les preuves métier d’atomicité, sans être réimplémentées par le compteur.

## Résultats de contention

Chaque cellule décrit les trois répétitions (plage min–max).

| Scénario | DELETE | WAL expérimental |
| --- | --- | --- |
| Écrivain tenu 200 ms, timeout 100 ms | 3 refus, 159–173 ms | 3 refus, 157–172 ms |
| Écrivain tenu 200 ms, timeout 1 s | 3 succès, 229–264 ms | 3 succès, 259–274 ms |
| Écrivain tenu 200 ms, timeout 5 s | 3 succès, 225–266 ms | 3 succès, 258–274 ms |
| Écrivain non libéré, timeout 100 ms | 3 refus, 165–177 ms | 3 refus, 166–183 ms |
| Écrivain non libéré, timeout 1 s | 3 refus, 1,160–1,182 s | 3 refus, 1,163–1,178 s |
| Écrivain non libéré, timeout 5 s | 3 refus, 5,566–5,610 s | 3 refus, 5,552–5,617 s |
| Lecteur pendant écriture non validée | 9 succès, 0,166–0,493 ms | 9 succès, 0,031–0,053 ms |
| Commit face à une lecture maintenue, timeout 5 s | 3 refus, 5,565–5,612 s | 3 succès, 7,042–8,995 ms |

Tous les refus de ces probes sont `SQLITE_BUSY`. Toutes les vérifications d’intégrité réussissent.
Les délais montrent un dépassement du timeout demandé sur ce poste : ne pas le présenter comme deadline.
Le test Django établit en plus `SQLITE_BUSY_SNAPSHOT` après lecture WAL devenue obsolète, malgré timeout 5 s.

## Résultats de charge, timeout 5 s

Les succès/refus sont cumulés sur trois répétitions. Débit : plage des trois campagnes.
P95 : plage des percentiles de chaque campagne, succès et refus confondus, hors démarrage des processus.
Quantile empirique : durée triée à l’indice `min(N-1, floor(0,95*N))`, indices à partir de zéro.
Maximum : durée de l’opération la plus longue des trois campagnes.

| Journal | Processus | Politique | Succès / tentatives | Débit | P95 (ms) | Max (ms) |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| DELETE | 1 | écriture d’abord, réutilisée | 60 / 60 | 49,95–52,94 | 20,08–22,56 | 22,56 |
| DELETE | 2 | écriture d’abord, réutilisée | 120 / 120 | 47,26–49,01 | 23,13–35,84 | 456,39 |
| DELETE | 4 | écriture d’abord, réutilisée | 240 / 240 | 45,34–49,83 | 23,04–38,38 | 1406,63 |
| DELETE | 1 | écriture d’abord, rouverte | 60 / 60 | 46,10–48,45 | 23,24–27,03 | 27,03 |
| DELETE | 2 | écriture d’abord, rouverte | 120 / 120 | 42,72–48,09 | 23,73–39,85 | 536,09 |
| DELETE | 4 | écriture d’abord, rouverte | 240 / 240 | 40,67–45,14 | 41,19–346,59 | 1433,98 |
| DELETE | 1 | lecture d’abord, réutilisée | 60 / 60 | 50,68–52,06 | 20,19–23,14 | 23,14 |
| DELETE | 2 | lecture d’abord, réutilisée | 60 / 120 | 51,31–52,90 | 19,90–22,12 | 22,65 |
| DELETE | 4 | lecture d’abord, réutilisée | 60 / 240 | 50,72–52,16 | 20,09–20,98 | 42,16 |
| WAL | 1 | écriture d’abord, réutilisée | 60 / 60 | 67,64–72,50 | 17,93–18,44 | 18,44 |
| WAL | 2 | écriture d’abord, réutilisée | 120 / 120 | 64,27–67,11 | 17,43–19,04 | 340,40 |
| WAL | 4 | écriture d’abord, réutilisée | 240 / 240 | 62,54–64,48 | 18,45–147,75 | 996,40 |
| WAL | 1 | écriture d’abord, rouverte | 60 / 60 | 40,79–42,01 | 26,05–26,64 | 26,64 |
| WAL | 2 | écriture d’abord, rouverte | 120 / 120 | 28,99–63,88 | 32,86–74,09 | 76,01 |
| WAL | 4 | écriture d’abord, rouverte | 240 / 240 | 60,10–61,17 | 154,96–186,96 | 452,08 |
| WAL | 1 | lecture d’abord, réutilisée | 60 / 60 | 68,86–70,92 | 17,51–18,09 | 18,09 |
| WAL | 2 | lecture d’abord, réutilisée | 60 / 120 | 68,65–72,51 | 15,03–16,93 | 17,64 |
| WAL | 4 | lecture d’abord, réutilisée | 60 / 240 | 51,71–71,95 | 14,04–15,34 | 107,51 |

En lecture d’abord, les erreurs observées sont `SQLITE_BUSY` et/ou `SQLITE_BUSY_SNAPSHOT` selon la
campagne WAL, `SQLITE_BUSY` en DELETE ; le détail par répétition est dans le JSONL.
Les P95 faibles des campagnes avec refus ne signifient pas bonne disponibilité : ils incluent les
refus rapides. Pas de gain de capacité d’écriture en ajoutant des processus DELETE ici ; les queues
et maxima augmentent. Conserver des connexions HTTP persistantes pour ces seuls chiffres n’est pas justifié.

## Limites et exploitation des preuves

Trois répétitions courtes ne mesurent ni stabilité prolongée, ni volume réel, ni panne électrique,
équité entre écrivains, sauvegarde en charge ou capacité maximale. Quatre processus constituent
la borne expérimentée, pas une limite sûre ; deux suffisent à refuser des upgrades lecture→écriture.
Le plafond synthétique DELETE observé d’environ 50 transactions/s dépend du verrou maintenu 10 ms
et du disque : il ne vaut ni objectif MESS ni garantie. L’absence de corruption ici ne qualifie pas WAL 3.49.1.
La recette sur la machine MESS doit reprendre ces essais et ajouter les parcours réels et leur volumétrie.
MEP-010/040 traiteront les refus et conflits ; MEP-071 qualifiera la stabilité cible.

## Régression CI — durée de vie des processus auxiliaires

La [CI initiale c7cf5bf](https://github.com/GaranceRichard/assess-teams/actions/runs/38733045558)
a passé tous les tests mais refusé la fusion globale : les trois fichiers attendus étaient présents
à leur emplacement normal et le shard 1 ajoutait un fragment `.coverage.1.<hôte>.<pid>...`, sans ligne ni arc exécuté.
Les artefacts téléchargés n’ont pas de chemin `backend/coverage` doublé. Modifier le chemin de téléchargement
ne corrigerait pas ce fichier supplémentaire.

Les probes sont désormais exécutées via `tests/sqlite_probe_helpers.py` dans un interpréteur isolé.
L’attente des deux flux capturés termine aussi les auxiliaires `multiprocessing` (dont le `resource_tracker`
POSIX) avant la fusion pytest-cov du shard appelant. Les scénarios, assertions et mesures restent identiques.
La vérification ciblée sous coverage exige un seul fichier consolidé, sans fragment tardif.
La fusion CI stricte des trois shards reste la preuve de non-régression sur Linux ; aucun fichier inconnu
n’est ignoré, aucun chemin recherché récursivement et aucun seuil abaissé.
