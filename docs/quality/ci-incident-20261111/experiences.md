# Expériences, reproductibilité et limites

Aucune source applicative, source de test ou définition de workflow n’a été modifiée.
Les scripts d’audit ont été exécutés depuis le cache ou `/audit`, jamais chargés par la CI.
Les recettes exactes sont reproduites dans ces documents :
[répétitions](protocole-repeat.md), [sonde](protocole-audit_trace.md),
[pilotage de sonde](protocole-trace_runs.md).

## Environnement contrôlé

Docker Desktop 29.8.2, moteur Linux/WSL2 ; image officielle Python 3.13.18-slim figée
par [digest et métadonnées](environnement.md). Backend extrait par `git archive HEAD backend`.
Les paquets sont installés aux versions exactes de la liste du shard historique, y compris
coverage 7.17.2 (le bootstrap Windows local avait obtenu 7.17.3 ; il n’est pas utilisé ici).
Debian 13.7 et SQLite 3.46.1 diffèrent du runner Ubuntu ; pas d’identité de performance revendiquée.
Aucune ressource cible MESS, donnée réelle, SMTP externe ou serveur applicatif existant utilisé.

## Reconstitution depuis le worktree au SHA audité

Les commandes suivantes créent seulement un conteneur et des fichiers temporaires.
Exécuter les commandes shell depuis un environnement supportant les redirections binaires,
ou utiliser `subprocess.run(..., capture_output=True)` pour écrire l’archive sous Windows.
Ne pas passer l’archive binaire dans une redirection PowerShell ancienne.

```sh
git archive --output=backend-source.tar ec4c3a535065c54e3c25abea8f52b722f5bef5be backend
docker run -d --name assess-ci-audit-20261111 python:3.13.18-slim@sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90 sleep infinity
docker cp backend-source.tar assess-ci-audit-20261111:/tmp/backend-source.tar
docker exec assess-ci-audit-20261111 sh -c 'mkdir -p /audit/evidence; cd /audit; tar -xf /tmp/backend-source.tar'
```

Reconstituer `/tmp/ci-constraints.txt` avec le bloc de contraintes de [l’environnement](environnement.md).
Puis copier les trois recettes Python : `/audit/repeat.py`, `/audit/audit_trace.py`,
`/audit/backend/trace_runs.py`.

```sh
docker exec assess-ci-audit-20261111 python -m pip install -r /tmp/ci-constraints.txt
docker exec -w /audit/backend assess-ci-audit-20261111 python -m pytest -q 'tests/test_sqlite_contention_operational.py::test_operational_contention[apis_release-development]'
docker exec -w /audit/backend assess-ci-audit-20261111 python /audit/repeat.py
docker exec -w /audit/backend assess-ci-audit-20261111 python trace_runs.py
docker cp assess-ci-audit-20261111:/audit/evidence ./linux-evidence
```

Utiliser un conteneur neuf et un dossier `evidence` vide pour éviter les doublons et les bases
préexistantes. Le run réel a commencé par une reproduction ciblée verte, puis la série bornée
10 développement + 10 production, puis six sondes ; aucune campagne exhaustive locale lancée.

## Lecture des sondes

Le wrapper s’exécute comme point d’entrée du scénario. `spawn` le recharge aussi chez chaque pair.
Il instrumente `Connection.send/recv`, l’enveloppe d’exécution SQL et `_commit` Django.
Aucun paramètre SQL, corps HTTP, cookie, secret ou adresse mail n’est enregistré.
Les PRAGMA sont relevés à l’ouverture, avant la surcharge 100 ms du pair.
`armed` commence à `ready` pour écarter migrations et sessions de la chronologie SQL.

La sonde témoin n’ajoute aucun retard ; le mode contraint retarde uniquement le premier pair
après réception de `continue`, sans maintenir le GIL des autres processus.
Ce point modélise une reprise tardive du détenteur, sans prétendre reproduire la charge GitHub.
Les scénarios conservent leur assertion originale, sans interception de l’exception terminale.
Les quatre codes 1 sont attendus comme **résultats rouges de l’investigation**, pas comme gates verts.

Tous les résultats de commandes sont consignés séparément : [répétitions](repetitions.md),
[chronologies et bases après fermeture](chronologies.md). Les traces référencées contiennent
les événements bruts, les statuts et les empreintes des stderr complets conservés en cache.
Les observations montrent une fragilité du test ; elles ne quantifient pas une fréquence en CI.
