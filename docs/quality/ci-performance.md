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

## Pilote et anomalie détectée

Le premier découpage, commit `a573a3f`, a donné les mesures suivantes :

| Tentative du run 38404099056 | Temps mural | Somme des jobs | Résultat |
| --- | --- | --- | --- |
| [1](https://github.com/GaranceRichard/assess-teams/actions/runs/38404099056/attempts/1) | 266 s | 1 245 s | Succès ; dernier préalable E2E 2/2 |
| [2](https://github.com/GaranceRichard/assess-teams/actions/runs/38404099056/attempts/2) | 277 s | 1 172 s | Échec frontend ; dernier préalable couverture backend |

L’échec de la seconde tentative dans `EvaluationPage.test.tsx` expose une
sélection d’organisation avant chargement de son option. Une régression avec
réponse différée reproduit l’échec ; le helper attend maintenant l’option réelle.
Les assertions métier, timeouts et retries sont conservés ; aucun code produit
ne change. Le gate final a bien refusé cette tentative malgré le succès des
cinq partitions/shards, démontrant le blocage global d’un échec individuel.

Les poids backend sont ensuite actualisés depuis les trois rapports JUnit
réussis de cette tentative : l’échec frontend ne contamine pas ces durées.
Les nouvelles mesures porteront sur cet état corrigé, avec le même protocole.
Un échec intermittent d’écriture du journal du test local de bootstrap a aussi
bloqué le premier pre-push ; sa reprise complète a passé, sans contournement.

## Résultats de l’état corrigé

Trois tentatives complètes du même commit `1946f5b`, toutes réussies :

| Tentative du run 38408477287 | Temps mural | Somme des jobs | Jobs | Dernier préalable |
| --- | --- | --- | --- | --- |
| [1](https://github.com/GaranceRichard/assess-teams/actions/runs/38408477287/attempts/1) | 279 s | 1,215 s | 10 | e2e / Playwright E2E (2/2) |
| [2](https://github.com/GaranceRichard/assess-teams/actions/runs/38408477287/attempts/2) | 246 s | 1,181 s | 10 | e2e / Playwright E2E (1/2) |
| [3](https://github.com/GaranceRichard/assess-teams/actions/runs/38408477287/attempts/3) | 283 s | 1,175 s | 10 | e2e / Playwright E2E (2/2) |

Médiane finale : **279 s (4 min 39 s)**, étendue **246–283 s**.
Médiane de coût : **1 181 s (19 min 41 s)** de runners cumulés.
Par rapport aux références récentes : **117 s gagnées (29,5 %)** sur la médiane
murale, pour **177 s supplémentaires (17,6 %)** de jobs cumulés et deux runners
supplémentaires. Les SHA avant diffèrent ; il s’agit d’un gain observé sur ces
échantillons, pas d’une garantie indépendante de la charge des runners.

| Job | Durées des tentatives 1 / 2 / 3 | Médiane | Préparation médiane |
| --- | --- | --- | --- |
| Backend tests (1/3) | 159 / 191 / 197 s | 191 s | 21 s |
| Backend tests (2/3) | 203 / 192 / 145 s | 192 s | 21 s |
| Backend tests (3/3) | 202 / 195 / 192 s | 195 s | 20 s |
| e2e / Playwright E2E (1/2) | 216 / 223 / 163 s | 216 s | 41 s |
| e2e / Playwright E2E (2/2) | 257 / 202 / 257 s | 257 s | 47 s |
| Backend global coverage | 15 / 15 / 10 s | 15 s | — |
| Full quality gate | 12 / 14 / 18 s | 14 s | — |

Les trois médianes backend sont **191 / 192 / 195 s** : la charge est équilibrée
sur plusieurs runners malgré des variations ponctuelles (145–203 s).
La fusion prend 10–15 s, sans tests supplémentaires. Par rapport aux références
demandées de 304 / 228 s, le backend le plus long passe à une médiane de 195 s.
Les E2E ont des médianes de 216 / 257 s, contre 326 s pour le job unique demandé
comme référence. Ils comprennent chacun leur préparation, build de démo et tests.
Le dernier préalable alterne entre les deux shards : ne pas attribuer toute
variation à la seule composition des scénarios.

Pour les jobs indépendants, le délai observable de démarrage est **4–7 s**,
contre 2–3 s sur les références récentes ; `Set up job` prend **0–3 s**.
Après disponibilité des préalables, couverture et gate final attendent **3–5 s**.
La préparation backend prend **17–26 s**, celle des E2E **41–51 s**.
Ces phases expliquent une part du plancher qui subsiste après le découpage.

Chaque tentative valide **922 tests backend**, couverture fusionnée **98,57 %**,
**393 tests frontend** et **73 scénarios E2E** (64 application, 9 démo).
Le gate final confirme leur union exhaustive sans duplication entre shards.
Les critères restent identiques, y compris les quatre seuils frontend >= 90 %.
Les trois tentatives corrigées n’ont aucun job en échec ; le pilote échoué reste
explicitement conservé dans ce bilan, avec sa cause et sa régression.

## Décision et limite

L’objectif idéal **sous quatre minutes n’est pas atteint**, même sur la meilleure
tentative (4 min 06 s). Le gain médian est mesurable ; le coût cumulé augmente.
Le backend à trois partitions cesse d’être le dernier préalable sur les trois
mesures finales. Une quatrième partition backend seule n’améliorerait donc pas
leur chemin critique : c’est une inférence fondée sur le graphe et ces durées.

Avant d’ajouter un runner, mesurer l’équilibrage et la préparation des E2E,
puis estimer si un troisième shard E2E compenserait son coût de préparation et
si la fusion backend deviendrait alors limitante. Aucun runner supplémentaire,
worker SQLite supplémentaire, seuil réduit ou scénario retiré n’est ajouté ici.
Trois répétitions révèlent la variabilité ; poursuivre ce protocole sur des
changements représentatifs avant de conclure à une performance garantie.
