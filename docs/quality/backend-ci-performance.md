# Régression du backend sélectif — octobre 2026

## Diagnostic mesuré

Le [push MEP-037, run 39083777674](https://github.com/GaranceRichard/assess-teams/actions/runs/39083777674)
sur `11e3a41` exécute le backend dans un seul job : **748 s**, dont **718,55 s**
pour **1 258 tests pytest**. Accélérer le téléchargement des dépendances ne résout pas ce coût.
Le workflow sélectif avait perdu le partitionnement utilisé en qualification exhaustive.

La [qualification 39125905327](https://github.com/GaranceRichard/assess-teams/actions/runs/39125905327)
du même SHA prend **228 / 365 / 136 s** pour ses trois jobs backend.
Les poids provenaient encore de 922 tests : ils ne décrivaient plus la collection courante.
Les JUnit complets de cette qualification réussie donnent **639,348 s** cumulées,
dont **107,354 s** pour `test_sqlite_contention_operational.py`.
Ces deux runs ne constituent pas une comparaison contrôlée de runners identiques.

## Correction et garanties

[`backend.yml`](../../.github/workflows/backend.yml) est partagé par CI sélective complète
et qualification exhaustive : statiques indépendants, **huit partitions pytest** puis fusion.
Les poids versionnés sont rafraîchis depuis les trois JUnit réussis du run 39125905327.
Après intégration de MEP-038, les trois nouveaux fichiers courts sont mesurés séparément :
15 tests passent sous Windows/Python 3.12, sans couverture, en 2,58 s.
Leurs poids réservent le double du temps JUnit, avec un plancher d'une seconde ;
ce sont des estimations locales distinctes des mesures Linux et à confirmer en CI.
Les nouveaux fichiers gardent leur poids conservateur et sont toujours exécutés.
Ce poids suit le plus gros bloc planifié, et non le total d'un fichier déjà réparti par cas.
Le découpage conserve les fichiers entiers, sauf `test_sqlite_critical_conflicts.py` :
ses 42 cas autonomes utilisent chacun leurs propres processus et base temporaire.
Le [run intégrant MEP-040](https://github.com/GaranceRichard/assess-teams/actions/runs/39162211478)
porte le backend à 1 010 s, contre 748 s pour MEP-037. Une estimation conservatrice de
300 s réserve la charge de ce fichier, répartie par cas ; ce delta entre deux runs
n'est pas présenté comme une mesure JUnit individuelle. SQLite reste isolé sur chaque runner.

La fusion exige les huit données de couverture et manifestes, une collection identique,
une union disjointe exhaustive, des versions coverage identiques et des tests tous réussis.
Elle conserve les branches et le seuil global **>= 90 %**. Aucun test n'est retiré,
aucun hasher, timeout, retry, contrôle de sécurité ou seuil n'est modifié.
Les tests ciblés passent toujours par le plan du diff, sans lancer les partitions complètes.
Le gate final exige le succès du workflow backend, y compris sa fusion.

Les huit jobs pytest ajoutent cinq préparations par rapport aux trois partitions
exhaustives antérieures, et sept par rapport au job sélectif séquentiel. Le chemin
sélectif parallèle ajoute aussi des jobs distincts pour les statiques et la fusion.
Les statiques et la fusion ne réexécutent pas les tests.

## Vérification de livraison

Les tests de régression vérifient que les deux appelants partagent ce moteur,
que le mode complet est obligatoire par défaut en qualification, que les checkouts
utilisent le candidat exact et que les tests ciblés conservent leur base réelle.
Les tests de couverture refusent notamment une partition absente parmi huit.
Le rafraîchissement des poids conserve la liste des cas répartis, avec une régression dédiée.
Les durées après intégration sont mesurées sur le SHA publié ; préparation, fusion
et attente entre jobs restent incluses dans le chemin backend.
Une campagne exhaustive déclenchée par cette modification CI ne suffit pas à elle seule
à démontrer le routage sélectif : celui-ci est aussi protégé par les tests de workflow.

## Résultats sur le SHA publié

Trois tentatives indépendantes de `5aee9f2e7e4541f1c5fd4c851529c86f0cfce199`,
toutes réussies. Le backend passe de **12 min 28 s** à une médiane de
**2 min 58 s**, préparation et fusion comprises : **4,20 fois plus rapide**
et **76,2 %** de durée en moins sur ces références.
Par rapport au run intégrant MEP-040 (16 min 50 s), le facteur observé est 5,67.
Les SHA avant/après et les suites diffèrent : ce gain observé ne constitue pas
une garantie de durée pour toute charge ou tout futur changement.

| Tentative | Backend complet | Plus long job de tests | Fusion | Workflow complet | Runners backend cumulés |
| --- | --- | --- | --- | --- | --- |
| [1](https://github.com/GaranceRichard/assess-teams/actions/runs/39188871847/attempts/1) | 3 min 00 s | 2 min 48 s | 9 s | 3 min 44 s | 1164 s |
| [2](https://github.com/GaranceRichard/assess-teams/actions/runs/39188871847/attempts/2) | 2 min 58 s | 2 min 42 s | 12 s | 5 min 18 s | 1066 s |
| [3](https://github.com/GaranceRichard/assess-teams/actions/runs/39188871847/attempts/3) | 2 min 58 s | 2 min 44 s | 11 s | 5 min 17 s | 1200 s |

Le backend est mesuré du démarrage de son premier job à la fin de la fusion :
installations, tests, téléversements et attente entre partitions/fusion inclus.
L'attente avant le tout premier job est exclue, comme dans le job de référence.
Les durées viennent de l'API Actions pour chaque tentative exacte ; les jobs
skipped ne consomment aucune seconde de runner, même si leurs horodatages sont inversés.
La médiane du workflow entier est **5 min 17 s**, avec une variabilité E2E
distincte de celle du backend. Chaque tentative exécute 18 jobs.

| Partition | Tentative 1 | Tentative 2 | Tentative 3 | Médiane | Préparation médiane |
| --- | --- | --- | --- | --- | --- |
| 1/8 | 151 s | 123 s | 143 s | 143 s | 21 s |
| 2/8 | 127 s | 103 s | 94 s | 103 s | 14 s |
| 3/8 | 93 s | 120 s | 140 s | 120 s | 16 s |
| 4/8 | 164 s | 154 s | 164 s | 164 s | 21 s |
| 5/8 | 153 s | 104 s | 156 s | 153 s | 18 s |
| 6/8 | 168 s | 162 s | 163 s | 163 s | 26 s |
| 7/8 | 130 s | 132 s | 153 s | 132 s | 20 s |
| 8/8 | 139 s | 120 s | 152 s | 139 s | 16 s |

Le coût backend médian est **1164 secondes de runners cumulés**, contre
748 s pour MEP-037 et 1 010 s après MEP-040. Il inclut les préparations supplémentaires
et une suite enrichie depuis les références ; ce coût observé ne mesure donc pas
isolément le surcoût du partitionnement. Aucun résultat de test n'est réutilisé en CI.

La fusion confirme **1 324 tests backend**, union exhaustive sans doublon,
et **97,37 % de branch coverage**, seuil de 90 % conservé. Les trois campagnes passent
aussi les **428 tests frontend**, les **66 parcours E2E réels et 9 de démo**, les statiques,
migrations et contraintes du dépôt. Aucun échec n'est écarté de ces trois tentatives.
