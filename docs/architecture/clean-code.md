# Clean Code

Clean Code est un principe fondamental de l'architecture. Le code privilégie :

- la lisibilité ;
- la simplicité ;
- l'explicitation des intentions ;
- un faible couplage ;
- une forte cohésion ;
- la responsabilité unique ;
- de petites unités de code ;
- des noms métier explicites ;
- le contrôle de la complexité ;
- la suppression de la duplication significative ;
- l'absence de code mort ;
- l'absence d'abstraction prématurée.

## Responsabilité unique

Une classe, une fonction, un composant ou un module possède une responsabilité principale identifiable. Lorsqu'un élément assume plusieurs responsabilités indépendantes, il doit être décomposé.

## Simplicité

La solution retenue est la plus simple qui satisfait le besoin actuel. Il ne faut pas introduire :

- d'abstraction spéculative ;
- de généricité prématurée ;
- de framework interne inutile ;
- de pattern sans problème concret à résoudre ;
- de couche supplémentaire sans responsabilité identifiable.

L'architecture hexagonale ne justifie jamais la sur-ingénierie.

## Nommage

Les noms expriment le vocabulaire métier. Préférer `FinalizeAssessment` à `AssessmentService.process()` et les intentions explicites aux termes génériques comme `manager`, `helper`, `utils`, `processor` ou un `handler` générique.

## Fonctions et méthodes

Les fonctions et méthodes doivent :

- rester courtes ;
- avoir une intention claire ;
- éviter les effets de bord implicites ;
- limiter l'imbrication ;
- éviter les paramètres qui modifient radicalement leur comportement.

## Taille des fichiers

**Aucun fichier maintenu manuellement ne doit dépasser 200 lignes. Cette règle est obligatoire et bloquante.**

Cette limite favorise la séparation des responsabilités, la modularité, la lisibilité et la maintenabilité. Elle ne doit jamais être contournée par une compression artificielle du code, la suppression de retours à la ligne utiles ou une dégradation de la lisibilité.

Un fichier maintenu dépassant 200 lignes constitue une violation architecturale et qualité.
