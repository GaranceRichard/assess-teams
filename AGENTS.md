# Règles de travail des agents

## Portée et priorité

Ce fichier s'applique à tout le dépôt **Assess teams** et à tout agent humain ou automatisé qui y contribue. Les règles ci-dessous sont obligatoires. En cas de conflit, appliquer la règle qui protège le mieux la qualité, la sécurité et la maintenabilité, puis signaler le conflit.

Avant toute modification, inspecter l'existant et respecter l'architecture, les conventions et les responsabilités déjà établies. Ne pas introduire de nouvelle couche, dépendance ou abstraction sans besoin démontré. Garder Django et Django REST Framework côté backend, React et TypeScript côté frontend, et SQLite comme base initiale tant qu'une décision d'architecture documentée ne les remplace pas.

## Préparation obligatoire avant travail

Avant tout développement, correction, refactoring ou changement technique, mettre à jour `README.md` pour annoncer le périmètre travaillé, le sujet ou la feature lorsqu'il existe, et l'évolution attendue. Cette mise à jour précède le travail ; elle ne doit pas être ajoutée a posteriori pour satisfaire le gate.

L'ordre temporel ne pouvant pas être vérifié fiablement par Git, l'automatisation contrôle qu'un lot comportant un changement applicatif ou technique comporte aussi une modification de `README.md`. Ce contrôle de cohérence ne remplace pas la responsabilité de mise à jour préalable et ne justifie jamais une modification artificielle sans changement de périmètre.

## Règle bloquante des 200 lignes

**Aucun fichier source ne doit dépasser 200 lignes. Cette limite est non négociable et bloquante.**

Elle s'applique notamment aux fichiers Python, TypeScript, TSX, JavaScript, aux tests, aux utilitaires et aux configurations maintenues manuellement.

Les seules exclusions sont :

- les fichiers générés automatiquement ;
- les lock files ;
- les migrations Django générées.

Il est interdit de contourner cette règle par une compaction artificielle, la suppression de retours à la ligne utiles ou toute dégradation de la lisibilité. Lorsqu'un fichier approche de la limite, le découper selon des responsabilités cohérentes.

## Clean Code obligatoire

Chaque changement doit garantir :

- des responsabilités clairement séparées ;
- des fonctions courtes et des noms explicites ;
- un faible couplage et une forte cohésion ;
- une logique simple avec peu d'imbrication ;
- aucune abstraction prématurée ;
- aucune duplication significative ;
- aucun code mort ;
- aucune dette technique cachée.

Toute dette acceptée exceptionnellement doit être visible, justifiée, documentée et suivie. Elle ne doit jamais masquer un quality gate en échec.

## Règles de tests

Tout élément fonctionnel doit avoir au minimum :

- un test fonctionnel passant couvrant le comportement attendu ;
- un test fonctionnel non passant couvrant un véritable refus, échec ou cas métier, et non un scénario artificiel.

Selon l'impact du changement, ajouter ou mettre à jour les tests unitaires, fonctionnels, API, d'intégration, de contrat, de non-régression et E2E nécessaires. Les interactions significatives doivent être vérifiées, notamment service Django + ORM, API + base de données, authentification + permissions + endpoint, React + couche API et frontend + backend.

Les contrats entre React et Django REST Framework doivent couvrir la structure des requêtes et réponses, les champs obligatoires, les types, les codes HTTP, les erreurs et les validations. Les parcours métier critiques doivent être couverts en E2E et suivis par parcours fonctionnel, indépendamment du coverage de lignes.

Toute correction de bug doit inclure un test de non-régression qui reproduit le défaut réel, échoue avant la correction et passe après celle-ci.

## Seuils et contrôles bloquants

- Coverage backend : **>= 90 %**.
- Coverage frontend : **>= 90 %**.
- Tous les tests doivent passer.
- Le lint et le formatage doivent passer.
- Toute modification de modèle Django doit avoir sa migration requise.
- Aucun secret, jeton, mot de passe ou identifiant sensible ne doit être commité.

Un seuil global ne dispense jamais de tester les comportements modifiés, les branches métier significatives et les erreurs attendues.

## Documentation

Avant tout push, effectuer une revue d'impact documentaire. Vérifier au minimum `README.md`, `AGENTS.md`, `QUALITY_CHARTER.md`, `DEFINITION_OF_DONE.md`, `TEST_STRATEGY.md`, la documentation d'architecture, la documentation API et tout autre fichier Markdown concerné. Mettre à jour chaque document affecté dans le même changement.

## Procédure de livraison

Avant de déclarer une tâche terminée :

1. vérifier la conformité à `DEFINITION_OF_DONE.md` ;
2. contrôler la longueur de tous les fichiers source concernés ;
3. exécuter les tests, le coverage, le lint et le contrôle de formatage applicables ;
4. vérifier les migrations, les contrats, les parcours E2E et la sécurité selon l'impact ;
5. effectuer la revue documentaire avant le push ;
6. signaler explicitement tout contrôle impossible à exécuter.

Une tâche reste non terminée dès qu'un quality gate est en échec.

## Automatisation des quality gates

Les commandes canoniques et l'installation des hooks sont documentées dans le [README](README.md#commandes-qualité). Le `pre-commit` exécute le gate rapide, informatif et non bloquant. Le `pre-push` et la CI GitHub exécutent le même full quality gate, exhaustif et bloquant. Contourner le hook local ne dispense jamais du contrôle distant.
