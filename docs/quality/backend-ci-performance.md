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

Le coût supplémentaire est cinq préparations de runners par rapport aux trois partitions
exhaustives antérieures, et sept par rapport au job sélectif séquentiel.
Les statiques et la fusion ne réexécutent pas les tests.

## Vérification de livraison

Les tests de régression vérifient que les deux appelants partagent ce moteur,
que le mode complet est obligatoire par défaut en qualification, que les checkouts
utilisent le candidat exact et que les tests ciblés conservent leur base réelle.
Les tests de couverture refusent notamment une partition absente parmi huit.
Le rafraîchissement des poids conserve la liste des cas répartis, avec une régression dédiée.
Les durées après intégration doivent être mesurées sur le SHA publié ; le temps de
préparation, la fusion et l'attente runner restent inclus dans le chemin backend.
Une campagne exhaustive déclenchée par cette modification CI ne suffit pas à elle seule
à démontrer le routage sélectif : celui-ci est aussi protégé par les tests de workflow.
