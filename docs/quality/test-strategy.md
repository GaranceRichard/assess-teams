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

Les commandes propres aux outils applicatifs sont actives avec les squelettes Django et React.

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

## Stratégie de couverture

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

Le pre-push et la CI exécutent `quality:full`. Côté backend, une exécution pytest unique couvre toutes les catégories collectées, active le branch coverage et applique le seuil de 90 % porté par `.coveragerc`. Côté frontend, `test:coverage` couvre les tests unitaires, fonctionnels, de composants, d'intégration, de contrat et de non-régression ; Vitest porte les seuils d'au moins 90 % pour branches, fonctions, lignes et statements. `test:e2e` exécute séparément les parcours Playwright inventoriés depuis le backlog.

Le coverage backend exclut les migrations générées, les tests, les points d'entrée et les fichiers Django purement déclaratifs (`settings`, ASGI et WSGI). Le coverage frontend exclut seulement les sorties générées, l'entrée de rendu et les fichiers de configuration ou de test ; il ne retire pas du calcul le code applicatif testable.

Le bootstrap actuel rend applicables les groupes backend, frontend et E2E. Les tests unitaires backend
couvrent désormais la politique de création d'utilisateur de `USER-001`. Les niveaux sans objet réel, comme
les tests de non-régression en l'absence de bug corrigé, restent explicitement `NON APPLICABLE`.

Le parcours d'accès produit ajoute des tests API de connexion valide et invalide, de session protégée, de
déconnexion et de contrôle CSRF. Les tests frontend vérifient les menus exacts Admin, Coach et Viewer,
l'héritage des capacités, l'absence des entrées interdites et le refus des routes directes. Playwright exerce
le parcours critique navigateur → session Django → espace Viewer → déconnexion, ainsi que les refus de
connexion et de route Admin.

Le bootstrap de développement vérifie séparément la création et l'authentification des trois identités
fictives, leurs fonctions, l'idempotence, la préservation des comptes existants et le refus défensif en
production. Un test de configuration garantit aussi que l'application de données locales n'est pas installée
par les réglages de production.

La gestion Superadmin est couverte par les contrats API, les permissions, les invitations signées, les
notifications aux anciennes et nouvelles adresses, l'indicateur d'attente et les composants de dialogue.
Playwright valide le parcours navigateur de création, modification et suppression d'une identité invitée.
