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

**Aucun fichier maintenu manuellement ne doit dépasser 200 lignes. Cette règle est non négociable et bloquante.**

La limite couvre les fichiers Python, TypeScript, TSX, JavaScript, les tests, les utilitaires et les configurations maintenues manuellement.

`scripts/quality/files.ps1` porte l’unique définition exécutable des exclusions, décrite dans les [règles des agents](agent-rules.md) : métadonnées Git ; dépendances et environnements locaux ; répertoires nommés de build, coverage, rapports E2E et caches ; migrations Django, fichiers minifiés et source maps ; lock files explicitement reconnus ; fichiers binaires détectés par extension ou contenu.

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

Le contrat HTTP du backend est décrit en permanence par OpenAPI avec Django REST Framework et `drf-spectacular`. Le schéma est exposé sur `/api/schema/` et Swagger UI sur `/api/docs/`.

Tout endpoint nouveau ou modifié documente méthode, chemin, paramètres, corps de requête, schémas de réponse, codes HTTP, erreurs et refus métier, authentification et permissions applicables, ainsi que des exemples lorsque le contrat le justifie. Le schéma complet doit être générable, valide et cohérent avec l’implémentation.

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

Les tests de contrat et de schéma détectent également tout endpoint absent du contrat, toute génération OpenAPI invalide et toute divergence vérifiable entre documentation et comportement.

## E2E et parcours métier

Playwright couvre les parcours métier critiques de bout en bout, y compris leurs principaux refus métier. La couverture E2E est inventoriée et mesurée en nombre de parcours fonctionnels critiques couverts, jamais en lignes de code.

## Sécurité

Aucun secret ou identifiant sensible ne doit être commité. Les entrées sont validées, l'authentification et les permissions sont testées, les erreurs ne divulguent pas d'information sensible et les dépendances sont évaluées selon le risque.

## Documentation

La documentation évolue avec le code. Avant tout push, une revue d'impact vérifie le [README racine](../../README.md), les [règles des agents](agent-rules.md), la [charte qualité](quality-charter.md), la [Definition of Done](definition-of-done.md), la [stratégie de tests](test-strategy.md), les documentations d'architecture et d'API, ainsi que les autres fichiers Markdown concernés. Tout contenu affecté doit être mis à jour dans le même changement.

Avant même de commencer un développement, une correction, un refactoring ou un changement technique, `README.md` annonce le périmètre, le sujet ou la feature et l'évolution attendue. L'automatisation vérifie seulement la présence cohérente du README dans un lot de changements techniques ; elle ne prétend pas prouver l'ordre temporel. Une modification du README reste motivée par un changement réel de périmètre.

## Workflow automatisé

Le workflow de référence est : mise à jour préalable du README lorsque nécessaire, travail, tests et contrôles, full quality gate, commit avec gate rapide informatif, pre-push avec full gate bloquant, push, puis vérification finale. Sauf instruction explicite contraire du prompt, une tâche terminée est commitée et poussée. Les [règles des agents](agent-rules.md) portent la procédure complète et ses exceptions. Les commandes et l'activation des hooks versionnés sont définies dans le [README](../../README.md#commandes-qualité).

- `quality:quick` exécute les contrôles rapides applicables, affiche le coverage courant et signale les échecs sans empêcher un commit intermédiaire.
- `quality:full` exécute tous les contrôles applicables et retourne un code d'échec si l'un d'eux n'est pas conforme.
- `PASS`, `WARNING`, `FAIL informatif`, `FAIL` et `NON APPLICABLE` distinguent explicitement les résultats.
- Un squelette backend ou frontend absent est non applicable ; un squelette détecté mais mal configuré est en échec.
- Les hooks ne contiennent pas la logique qualité : ils appellent la commande commune également utilisée par la CI.
- Aucun push ne contourne le pre-push avec `--no-verify`.

## Quality gates bloquants

Une tâche n'est pas terminée si au moins une condition est vraie :

- un fichier maintenu dépasse 200 lignes ;
- Clean Code n'est pas respecté ou une dette est cachée ;
- des tests obligatoires manquent, notamment le cas passant ou non passant d'un élément fonctionnel ;
- le coverage backend ou frontend est inférieur à 90 % ;
- un test d'intégration, de contrat, E2E ou de non-régression nécessaire manque ;
- un test, le lint ou le formatage échoue ;
- une migration Django requise manque ;
- la documentation est obsolète ;
- le contrat OpenAPI d’un endpoint nouveau ou modifié est absent, invalide ou incohérent avec l’implémentation ;
- un secret ou identifiant sensible est commité.
