# Charte qualité

## Engagement

**Assess teams** adopte une approche quality-first : la qualité fait partie de la fonctionnalité et ne constitue pas une phase optionnelle. Un changement n'est livrable que lorsque tous les quality gates applicables sont satisfaits.

## Clean Code et maintenabilité

La conformité aux principes de Clean Code est obligatoire :

- responsabilités clairement séparées ;
- fonctions courtes ;
- noms explicites ;
- faible couplage ;
- forte cohésion ;
- logique simple et peu imbriquée ;
- aucune abstraction prématurée ;
- aucune duplication significative ;
- aucun code mort ;
- aucune dette technique cachée.

Les modules doivent exprimer leur intention, rester faciles à tester et évoluer sans effets de bord disproportionnés. Une dette exceptionnellement acceptée doit être explicite, justifiée, documentée et planifiée.

## Limite non négociable de 200 lignes

**Aucun fichier source ne doit dépasser 200 lignes. Cette règle est non négociable et bloquante.**

La limite couvre les fichiers Python, TypeScript, TSX, JavaScript, les tests, les utilitaires et les configurations maintenues manuellement.

Sont exclus uniquement :

- les fichiers générés automatiquement ;
- les lock files ;
- les migrations Django générées.

La conformité doit être obtenue par une séparation cohérente des responsabilités. Compacter artificiellement le code, retirer des retours à la ligne utiles ou dégrader la lisibilité pour rester sous la limite est interdit.

## Politique de tests

Tout élément fonctionnel possède au minimum un test fonctionnel passant et un test fonctionnel non passant. Le scénario non passant doit représenter un véritable cas fonctionnel ou métier : validation refusée, permission insuffisante, état incompatible ou règle métier violée, par exemple.

La pyramide de tests comprend :

- tests unitaires pour la logique isolée ;
- tests fonctionnels pour les comportements métier ;
- tests API pour les endpoints Django REST Framework ;
- tests d'intégration pour les frontières techniques significatives ;
- tests de contrat pour l'accord React / Django REST Framework ;
- tests de non-régression pour les défauts corrigés ;
- tests E2E pour les parcours métier critiques.

Toute correction de bug inclut un test qui reproduit le défaut réel, échoue avant la correction et passe après celle-ci.

## Coverage

- Le coverage backend doit être **>= 90 %**.
- Le coverage frontend doit être **>= 90 %**.

Ces seuils sont bloquants, mais ne remplacent pas la qualité des assertions ni la couverture des risques. Le code coverage mesure le code exécuté ; la couverture E2E mesure séparément les parcours fonctionnels critiques couverts.

## Intégration et contrats

Les tests d'intégration couvrent toutes les interactions significatives, notamment :

- service Django + ORM ;
- API + base de données ;
- authentification + permissions + endpoint ;
- React + couche API ;
- frontend + backend.

Les tests de contrat React / Django REST Framework vérifient :

- la structure des requêtes et des réponses ;
- les champs obligatoires et les types ;
- les codes HTTP ;
- les erreurs et les validations.

## E2E et parcours métier

Playwright couvre les parcours métier critiques de bout en bout, y compris leurs principaux refus métier. La couverture E2E est inventoriée et mesurée en nombre de parcours fonctionnels critiques couverts, jamais en lignes de code.

## Sécurité

Aucun secret ou identifiant sensible ne doit être commité. Les entrées sont validées, l'authentification et les permissions sont testées, les erreurs ne divulguent pas d'information sensible et les dépendances sont évaluées selon le risque.

## Documentation

La documentation évolue avec le code. Avant tout push, une revue d'impact vérifie `README.md`, `AGENTS.md`, `QUALITY_CHARTER.md`, `DEFINITION_OF_DONE.md`, `TEST_STRATEGY.md`, les documentations d'architecture et d'API, ainsi que les autres fichiers Markdown concernés. Tout contenu affecté doit être mis à jour dans le même changement.

## Quality gates bloquants

Une tâche n'est pas terminée si au moins une condition est vraie :

- un fichier source dépasse 200 lignes ;
- Clean Code n'est pas respecté ou une dette est cachée ;
- des tests obligatoires manquent, notamment le cas passant ou non passant d'un élément fonctionnel ;
- le coverage backend ou frontend est inférieur à 90 % ;
- un test d'intégration, de contrat, E2E ou de non-régression nécessaire manque ;
- un test, le lint ou le formatage échoue ;
- une migration Django requise manque ;
- la documentation est obsolète ;
- un secret ou identifiant sensible est commité.
