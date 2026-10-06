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
notifications aux anciennes et nouvelles adresses, l'identifiant, l'indicateur d'attente et les dialogues.
Playwright valide le parcours navigateur de création, modification et suppression d'une identité invitée.
Il vérifie aussi l'accès par le menu Utilisateurs et le changement de thème jour/nuit.

Le référentiel d’évaluation couvre l’attribution automatique des index de modèles et de questions, les
validations, les permissions, le contrat OpenAPI et la cascade. Playwright valide le CRUD complet sans champ
d’index, ainsi que la sélection immédiate d’un modèle nouvellement créé. Le cycle de vie couvre aussi la migration
des modèles planifiés, création en brouillon, validation complète/incomplète, états et transitions interdits,
immutabilité des modèles/questions, archivage logique et audit. React et Playwright vérifient les confirmations,
le filtrage des modèles planifiables et les références historiques après archivage ; l’API teste les requêtes
forgées, permissions Admin/Superadmin et refus inter-organisations.

La planification couvre les quatre cadences, la première échéance, le refus des doublons encore actifs, l’équipe active et
le cloisonnement organisationnel. Elle couvre aussi le responsable Coach ou Admin, l’auto-affectation du
Superadmin et son refus à un Admin, le rattachement atomique d’un Coach, le refus d’un responsable hors
organisation, les modifications et suppressions, les courriels de
confirmation et d’échéance, le lien produit et l’avancement calendaire des récurrences. Les tests React vérifient
les formulaires immédiat et récurrent, la ligne structurée et la suppression dans la modale ; Playwright
traverse la session Admin, le changement de fond au survol, l’ouverture de la ligne, la modification et la suppression.
La non-régression `test_evaluation_replanning*` couvre la replanification après complétion ponctuelle,
l’historique intact, les refus encore actifs et la migration sans perte de données.
`evaluation-replanning.spec.ts` complète puis replanifie le même modèle pour la même équipe, refuse
un doublon en attente et consulte les anciennes notes après la nouvelle complétion.

Les journaux sont couverts séparément : création après succès, absence de succès après refus ou échec,
snapshots historiques, tri, filtres, pagination et lecture seule. Les tests directs des endpoints prouvent les
scopes Admin/Superadmin et l’exclusion des logs système pour l’Admin. Le contrat des Logs couvre les niveaux,
les sources, la migration des erreurs historiques, le filtre de niveau et l’absence de corps de requête,
traceback, secret, token, cookie ou credential exposé. Les tests React vérifient en plus que INFO reste discret,
WARNING identifiable et que toute ligne ERROR reçoit le traitement rouge accessible en modes jour et nuit.

La passation couvre accès assigné/Admin/Superadmin, refus Viewer et hors organisation, ordre et snapshot des
questions, notes entières `0..10`, contraintes SQLite, sauvegarde/reprise, complétude, verrouillage après
validation, auteur/date initiaux et dernière révision. Les payloads forgés et les révisions invalides sont
refusés sans mutation partielle ni activité de succès. Les migrations reprennent les attentes existantes.
React vérifie le tableau, la modale, les bornes et notes affichées, la file de sauvegardes, les erreurs et
la révision. Playwright traverse Coach → reprise après rechargement → finalisation → consultation verrouillée
→ révision Admin → complétion à la place de l’assigné → Journal d’activité, en utilisant le range au clavier.
La passation vérifie aussi le prérequis `VALIDATED`, le refus des nouveaux démarrages sur brouillon/archive
et la reprise, complétion et révision de passations commencées avant l’archivage du modèle.
Une non-régression E2E vérifie aussi la réinitialisation répétée des fixtures avec passations protégées,
sans supprimer les données d’une autre organisation de test.
Les mutations revérifient l’accès après changement d’assignation, d’organisation ou de rattachement entre
lecture et verrouillage. React et Playwright vérifient que « Suivant » attend sa sauvegarde avant de naviguer.

L’extension HTTP des Logs couvre les succès CRUD, les refus PATCH, 4xx/5xx, la corrélation, le contexte sûr,
les filtres seuls/combinés, les bornes inclusives et les tentatives inter-organisations. React vérifie les dix
filtres, dépendances/reset, scopes et pagination ; Playwright crée les événements HTTP avant de les filtrer.
