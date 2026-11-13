# Chronologies instrumentées et états durables

Origine t=0 : envoi `write_attempt` du second pair, juste avant exécution SQL native.
Les mesures sont en millisecondes, issues de `monotonic_ns` sur le même noyau.
Le hook SQL de mesure entoure le hook du test : `sql_start` précède donc `write_attempt`.
La fin du commit est une borne supérieure instrumentée de la libération, pas un traçage des verrous noyau.

| Essai | Retard injecté (ms) | continue envoyé | commit détenteur fini | BUSY concurrent | HTTP 1/2 | Équipes/activités | Code scénario |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [trace-development-01](trace-development-01.md) | 0 | 30.397 | 54.602 | — | 201/201 | 2/2 | 0 |
| [trace-development-02](trace-development-02.md) | 150 | 30.481 | 196.588 | 102.001 | 201/500 | 1/1 | 1 |
| [trace-development-03](trace-development-03.md) | 150 | 30.619 | 198.637 | 101.847 | 201/500 | 1/1 | 1 |
| [trace-production-01](trace-production-01.md) | 0 | 30.517 | 45.334 | — | 201/201 | 2/2 | 0 |
| [trace-production-02](trace-production-02.md) | 150 | 30.440 | 197.759 | 101.753 | 201/500 | 1/1 | 1 |
| [trace-production-03](trace-production-03.md) | 150 | 30.539 | 196.301 | 101.776 | 201/500 | 1/1 | 1 |

Tous les fichiers : `integrity_check=ok`, `foreign_key_check=[]`, identifiants/noms
des équipes créées identiques à ceux du Journal. Contrôle après fermeture des processus.
Dans les essais rouges, le scénario échoue avant son `verify()` ; l’inspection externe
est donc consignée séparément et ne transforme pas le scénario rouge en succès.

Les quatre échecs contrôlés aboutissent à la même assertion `result(second)[0] == 201`
que la CI ; l’API réelle retourne son refus BUSY contractuel, après annulation de la mutation.
Les traces ne démontrent pas que GitHub a subi le même retard le 11 novembre.
