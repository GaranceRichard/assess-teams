# Definition of Done

Cette checklist est **bloquante**. Une tâche est Done uniquement si chaque point applicable est validé. Un point non applicable doit être explicitement justifié dans la revue.

## Fonctionnalité et conception

- [ ] La fonctionnalité demandée est complète et ses critères d'acceptation sont satisfaits.
- [ ] Les responsabilités sont clairement séparées et l'architecture existante est respectée.
- [ ] Le code respecte Clean Code : fonctions courtes, noms explicites, faible couplage, forte cohésion, logique simple et peu imbriquée.
- [ ] Il n'existe ni abstraction prématurée, ni duplication significative, ni code mort, ni dette technique cachée.

## Limite bloquante des fichiers

- [ ] **Aucun fichier maintenu manuellement ne dépasse 200 lignes ; cette limite est non négociable et bloquante.**
- [ ] Le contrôle couvre les fichiers Python, TypeScript, TSX, JavaScript, les tests, les utilitaires et les configurations maintenues manuellement.
- [ ] Seuls les fichiers générés automatiquement, les lock files et les migrations Django générées sont exclus.
- [ ] La limite n'est pas contournée par une compaction artificielle, la suppression de retours à la ligne utiles ou une dégradation de la lisibilité.

## Tests et couverture

- [ ] Chaque élément fonctionnel possède au minimum un test fonctionnel passant.
- [ ] Chaque élément fonctionnel possède au minimum un test fonctionnel non passant représentant un vrai cas fonctionnel ou métier.
- [ ] Les tests unitaires nécessaires couvrent la logique isolée.
- [ ] Les tests fonctionnels et API nécessaires couvrent les comportements et endpoints modifiés.
- [ ] Le coverage backend est **>= 90 %**.
- [ ] Le coverage frontend est **>= 90 %**.
- [ ] Tous les tests passent.

## Intégration, contrats et E2E

- [ ] Les tests d'intégration nécessaires couvrent les interactions significatives : service Django + ORM, API + base de données, authentification + permissions + endpoint, React + couche API et frontend + backend.
- [ ] Les tests de contrat nécessaires entre React et Django REST Framework couvrent requêtes, réponses, champs obligatoires, types, codes HTTP, erreurs et validations.
- [ ] Les parcours métier critiques concernés sont couverts par des tests E2E Playwright.
- [ ] La couverture E2E est évaluée en parcours fonctionnels critiques, distinctement du code coverage.

## Non-régression

- [ ] Toute correction de bug possède un test de non-régression qui reproduit le défaut réel.
- [ ] Ce test échoue avant la correction et passe après la correction.

## Contrôles techniques

- [ ] Le lint passe sans erreur.
- [ ] Le contrôle de formatage passe sans erreur.
- [ ] Toute modification de modèle Django possède la migration requise.

## Documentation

- [ ] `README.md` a été mis à jour avant le début du travail avec le périmètre, le sujet et l'évolution attendue.
- [ ] Une revue d'impact documentaire a été effectuée avant le push.
- [ ] `README.md`, `AGENTS.md`, `QUALITY_CHARTER.md`, `DEFINITION_OF_DONE.md` et `TEST_STRATEGY.md` ont été vérifiés.
- [ ] Les documentations d'architecture et d'API ainsi que les autres fichiers Markdown concernés ont été vérifiés.
- [ ] Tous les documents affectés sont à jour.

## Sécurité

- [ ] Aucun secret, jeton, mot de passe ou identifiant sensible n'est commité.
- [ ] Les validations, permissions, erreurs et données sensibles concernées ont été contrôlées et testées.

## Gates de livraison

- [ ] Le gate rapide informatif a fourni son feedback au commit sans bloquer les commits intermédiaires.
- [ ] `quality:full` passe localement avant le push.
- [ ] Le pre-push bloque effectivement tout résultat non conforme.
- [ ] La CI GitHub exécute la même commande `quality:full` et passe.
- [ ] Tout contrôle non applicable est explicitement identifié et justifié ; aucun échec applicable n'est masqué.
- [ ] Sauf instruction explicite contraire du prompt, le changement est commité puis poussé conformément à la procédure de référence d'`AGENTS.md`.
- [ ] Le commit ne contient que les fichiers pertinents et aucun secret, credential ou artefact local.
- [ ] Le push a été vérifié, la branche locale est synchronisée avec sa branche distante et le working tree est propre.

Si une case applicable n'est pas cochée, la tâche n'est pas Done.
