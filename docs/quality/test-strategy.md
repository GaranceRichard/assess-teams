# Stratégie de tests

## Objectifs

La stratégie de tests protège les comportements métier, les contrats entre couches et les parcours critiques. Elle combine des retours rapides au niveau unitaire avec des validations réalistes aux niveaux intégration et E2E.

Tout élément fonctionnel doit avoir au minimum :

- un test fonctionnel passant pour son comportement attendu ;
- un test fonctionnel non passant représentant un véritable cas fonctionnel ou métier.

## Outils cibles

- Backend : **pytest** et **pytest-django**.
- Frontend : **Vitest** et **React Testing Library**.
- E2E : **Playwright**.

La commande globale `test:all` orchestre les suites backend, frontend et E2E ainsi que leurs seuils de coverage. Elle est réutilisée par `quality:full` et documentée dans le [README](../../README.md#tests-et-coverages). Les commandes propres à Django et React sont obligatoires dès que leur squelette est détecté ; leur absence produit un échec plutôt qu'un faux `NON APPLICABLE`.

Le socle qualité exécute aussi des tests fonctionnels isolés du bootstrap local. Ils couvrent la création et la
réutilisation du virtualenv backend, les changements de requirements, la création et la réutilisation des
`node_modules` racine et frontend, les changements de lockfile, les erreurs bloquantes, l'emploi des runtimes
préparés et le `post-checkout` d'un vrai worktree temporaire. Le parcours réel `dev:all` est aussi vérifié avant
livraison par les réponses HTTP de Django et Vite.

## Niveaux de tests

### Tests unitaires

Ils vérifient rapidement une unité de logique isolée : règles métier, services purs, transformations, hooks et composants dont les dépendances sont maîtrisées. Les doubles de test restent ciblés et ne doivent pas masquer les intégrations importantes.

### Tests fonctionnels

Ils expriment le comportement observable à partir d'un besoin métier. Pour chaque élément fonctionnel, un cas passant et un cas non passant réel sont obligatoires. Le cas non passant peut couvrir, par exemple, une validation refusée, un état interdit ou une permission insuffisante.

### Tests API

Ils couvrent les endpoints Django REST Framework : authentification, autorisation, validation, sérialisation, codes HTTP, corps de réponse, erreurs et effets persistés. Ils incluent les cas nominaux et les refus métier pertinents. Pour chaque endpoint nouveau ou modifié, ils vérifient aussi les éléments contractuels applicables documentés par OpenAPI.

### Tests d'intégration

Ils vérifient les collaborations réelles significatives, en particulier :

- service Django + ORM ;
- API + base de données ;
- authentification + permissions + endpoint ;
- React + couche API ;
- frontend + backend.

SQLite peut être utilisée pour la base initiale lorsque son comportement est représentatif. Toute divergence avec un environnement cible futur devra être identifiée et couverte.

### Tests de contrat

Ils empêchent la dérive des contrats entre React et Django REST Framework. Ils vérifient des exemples valides et invalides pour :

- la structure des requêtes ;
- la structure des réponses ;
- les champs obligatoires ;
- les types ;
- les codes HTTP ;
- les formats d'erreur ;
- les validations.

Les deux côtés du contrat doivent s'appuyer sur les mêmes attentes versionnées. Toute évolution incompatible doit être explicite et accompagnée d'une stratégie de migration.

`drf-spectacular` génère le schéma de référence exposé sur `/api/schema/`, consultable avec Swagger UI sur `/api/docs/`. La suite backend doit générer et valider le schéma complet, puis vérifier sa cohérence avec les méthodes, chemins, paramètres, corps, réponses, codes HTTP, erreurs, authentification et permissions réellement exposés. Des exemples sont testés lorsqu’ils portent une règle contractuelle utile.

### Tests de non-régression

Chaque correction de bug ajoute un test qui reproduit le défaut réel. Le test doit échouer sur la version défectueuse et passer après la correction. Il est placé au niveau le plus bas capable de reproduire fidèlement le défaut, avec un test de niveau supérieur si le risque de réintégration le justifie.

### Tests E2E

Playwright valide les parcours métier critiques à travers l'interface et le backend réels. La sélection est fondée sur le risque : valeur métier, fréquence, permissions, persistance, erreurs critiques et dépendances entre écrans.

Chaque parcours critique est inventorié avec son état de couverture. Les scénarios incluent le chemin nominal et les refus métier essentiels sans dupliquer inutilement les tests de niveaux inférieurs.
Les parcours utilisent un seul worker tant que le backend E2E repose sur SQLite, afin de sérialiser leurs écritures et d’éviter une contention propre à cette base locale.

Le versionnement ajoute une concurrence réelle sur SQLite fichier (copies et validations simultanées),
une migration conservant IDs/FK/snapshots/journaux et des refus de périmètre. Le parcours Playwright
`evaluation-versions.spec.ts` vérifie l’ancienne passation v1 après activation et planification de v2.

Résultats : `test_results*` vérifie la récence métier, le tie-break, les snapshots ordonnés, les archives,
l’isolation et un nombre constant de requêtes. Les tests React couvrent 0/1/N équipes, styles, légende,
dates, désélection, changement d’organisation/famille et réponses obsolètes. `results.spec.ts` exerce le radar réel
avec deux équipes et deux complétions pour l’une, sans requête supplémentaire lors des sélections.
Le longitudinal ajoute les tests `test_result_longitudinal*` et `test_question_lineage*` : lignées
explicites, migration conservatrice, v1/v2, isolement et IDs forgés. `results-longitudinal.spec.ts`
vérifie le radar automatique, le chargement à la demande, les observations accessibles et le retour.
`test_viewer_results` et `viewer-results.spec.ts` protègent la consultation Viewer des COMPLETED de
son organisation, le longitudinal, les refus inter-organisations et l’absence d’accès/mutation admin.

Le [Pilotage P0](../architecture/steering-api.md) couvre projection/permissions/OpenAPI, bornes de retard,
snapshots, absence de N+1, états React, réponses obsolètes et drill-down. `steering.spec.ts` valide
Admin/Superadmin, refus Coach/Viewer, thèmes/palettes, mobile/clavier et recharge Results.

Le [Dashboard personnel](../architecture/dashboard-api.md#validation-et-revue-documentaire) inventorie
ses preuves API/ORM/OpenAPI, React et Playwright : provenance, scopes, refus, états et palettes.

Le Superadmin sans appartenance est couvert par `test_superadmin_memberships` (refus API/ORM,
lecture défensive) et `test_superadmin_membership_migration` (liens seuls, historique et rollback).
`users-layout.spec.ts` contrôle cellules, dimensions, centrage et contraste des deux états,
avec/sans actions, desktop/mobile et les dix palettes dans les deux modes.

Le logo officiel est couvert par `ProductSidebar.test.tsx` (marque accessible et navigation), puis
`brand-logo.spec.ts` : chargement SVG vectoriel, contraste dans les dix palettes et les deux modes,
viewBox corrigé et translation de la flèche, ratio fourni, taille du symbole relative au texte, gap compact,
centrage vertical, absence de débordement desktop/mobile à densité double et nom masqué en sidebar repliée.
Les assertions reproduisent avant correction le SVG obsolète, puis le symbole trop petit. Le lien reste accessible et ramène au dashboard après un accès Viewer refusé.

## Stratégie de couverture

Les palettes personnelles sont couvertes par `test_session_palette`, `test_palette_contract` et
`test_palette_migration` (persistance, isolation, refus, CSRF, contrats et défaut historique), les tests
React `PalettePicker` et `AppPalette`, puis `palettes.spec.ts` (reprise, reconnexion, nouveau navigateur,
clavier et erreur). `theme-tokens.spec.ts` protège les cartes claires blanches identiques, les fonds centraux et bandeaux dérivés des dix palettes, les valeurs
sombres validées, les bandeaux dérivés de chaque accent et les contrastes en un seul test ; `theme-surfaces.spec.ts` capture les écrans
représentatifs (dont Bleu/Violet/Vert en clair) et vérifie bandeaux/fond central teintés, cartes blanches, densité
desktop et fonds sombres inchangés. La migration protège aussi les quatre préférences historiques. `results.spec.ts` et
`results-longitudinal.spec.ts` protègent les séries du radar et des courbes historiques.
`PlanningLoading.test.tsx` reproduit la réponse initiale obsolète qui effaçait une planification créée
sous StrictMode ; le parcours `evaluation-versions.spec.ts` vérifie le résultat dans le navigateur réel.

- Coverage backend global : **>= 90 %**.
- Coverage frontend global : **>= 90 %**.
- Toute baisse sous un seuil bloque la livraison.
- Tout code nouveau ou modifié doit être couvert selon son risque, même lorsque le seuil global reste atteint.
- Les branches, erreurs et règles métier significatives doivent être exercées ; atteindre un pourcentage sans assertions pertinentes n'est pas suffisant.

Le **code coverage** indique quelles lignes et branches ont été exécutées. La **couverture des parcours métier** indique quels parcours critiques ont été validés de bout en bout. Ces mesures sont distinctes : le seuil de 90 % ne prouve pas la couverture E2E, et les tests E2E ne remplacent pas le coverage du code.

## Données et isolation

Les tests sont déterministes, indépendants et reproductibles. Chaque test crée les données minimales nécessaires, contrôle le temps et les dépendances externes si besoin, et nettoie son état via les mécanismes du framework. Les données sensibles réelles sont interdites dans les fixtures.

## Exécution et quality gates

Les tests rapides sont exécutés au plus tôt ; la suite complète inclut tests backend, frontend, intégration, contrat et E2E applicables. Avant livraison :

- tous les tests passent ;
- les deux seuils de coverage sont atteints ;
- chaque élément fonctionnel possède ses cas passant et non passant ;
- chaque interaction, contrat et parcours critique affecté possède la couverture nécessaire ;
- le schéma OpenAPI est générable, valide et cohérent avec toute API nouvelle ou modifiée ;
- chaque bug corrigé possède son test de non-régression.

Tout échec constitue un blocage, jamais une simple alerte.

Le gate de commit constitue l'exception explicitement informative : `quality:quick` exécute les tests unitaires et fonctionnels rapides ainsi que le coverage courant, mais retourne zéro afin d'autoriser les commits intermédiaires. Les échecs restent visibles comme `FAIL informatif` et `WARNING`.

Le pre-push exécute `quality:full` ; la [CI](ci.md) répartit ses scopes indépendants et exige leur succès sans répéter les tests. Le build frontend inclut le typecheck. Les tests des scopes et de l’agrégation couvrent succès, refus et absence de doublons ; les invariants YAML protègent dépendances, caches et déclencheurs. Côté backend, une exécution pytest unique couvre toutes les catégories collectées, active le branch coverage et applique le seuil de 90 % porté par `.coveragerc`. Côté frontend, `test:coverage` couvre les tests unitaires, fonctionnels, de composants, d'intégration, de contrat et de non-régression ; Vitest porte les seuils d'au moins 90 % pour branches, fonctions, lignes et statements. `test:e2e` exécute séparément les parcours Playwright inventoriés depuis le backlog.

Le coverage backend exclut les migrations générées, les tests, les points d'entrée et les fichiers Django purement déclaratifs (`settings`, ASGI et WSGI). Le coverage frontend exclut seulement les sorties générées, l'entrée de rendu et les fichiers de configuration ou de test ; il ne retire pas du calcul le code applicatif testable.

Les preuves par domaine sont détaillées dans l’[inventaire des couvertures fonctionnelles](functional-coverage.md).

Le [shell produit](../architecture/product-layout.md#preuves-et-revue-documentaire) ajoute les invariants viewport/overflow, pagination serveur bornée, filtres et réponses obsolètes aux suites API, React et Playwright.
