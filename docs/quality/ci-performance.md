# Performance CI : trois partitions backend et deux shards E2E

## Référence et protocole

Références demandées : backend 1/2 **304 s**, backend 2/2 **228 s**,
Playwright E2E **326 s**. Ces durées de jobs ne sont pas une mesure du
workflow complet et ne permettent pas de reconstituer son coût total.

Trois runs réussis récents sont mesurés avec la même méthode avant modification :

| Run (tentative 1) | Chemin complet | Somme des jobs | Jobs | Dernier préalable |
| --- | --- | --- | --- | --- |
| [38396893519](https://github.com/GaranceRichard/assess-teams/actions/runs/38396893519) | 438 s | 1 095 s | 8 | E2E |
| [38335685247](https://github.com/GaranceRichard/assess-teams/actions/runs/38335685247) | 269 s | 806 s | 8 | E2E |
| [38331208495](https://github.com/GaranceRichard/assess-teams/actions/runs/38331208495) | 396 s | 1 004 s | 8 | E2E |

Médianes : **396 s** de temps mural et **1 004 s** de jobs cumulés.
Les SHA diffèrent ; ces références montrent la variabilité, pas un benchmark
contrôlé. Le dernier état pertinent a 915 tests backend ; ses rapports JUnit
incluant setup/teardown servent au nouvel équilibrage déterministe.

## Mesure reproductible

```powershell
python scripts/quality/ci_metrics.py <run-id>:1 <run-id>:2 <run-id>:3 --output .cache/ci/after.json
```

Le script lit l’API Actions via `gh` authentifié, pour chaque tentative exacte.
Il conserve SHA, conclusion, durée de chaque job, nombre de jobs, délais des
runners, phase de préparation et dernier préalable du gate final. Les tests
protègent le calcul des délais après disponibilité des dépendances.

Le temps mural va de `run_started_at` à la fin du dernier job, gate final inclus.
La somme des jobs est un coût en secondes de runners, pas une facture ; elle
inclut les jobs simultanés. Le délai runner va de la disponibilité des préalables
au `started_at` du job. L’API ne sépare pas attente en file et provisioning :
ce délai est un indicateur observable, complété par la durée de `Set up job`.
La préparation va du début du job au lancement des tests : checkout, runtime,
dépendances et navigateur ; les tests ne sont pas inclus.

Comparer trois tentatives complètes du même SHA après intégration, avec tous les
gates requis. Les reruns restent indépendants, sans preuve locale réutilisée.
Conserver les échecs/flakiness dans le bilan et ne pas sélectionner seulement
le meilleur run. Les caches de téléchargements et la charge des runners peuvent
varier ; rapporter médiane et étendue. Évaluer l’objectif de quatre minutes sur
le temps mural complet, consolidation incluse.

## Résultats après modification

À compléter avec les mesures GitHub de la version intégrée ; aucun gain mesuré
ni objectif de quatre minutes n’est affirmé avant ces exécutions.
