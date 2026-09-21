## EPIC-009 — Gestion des organisations

Cet Epic porte l’identité et le cycle de vie du périmètre Organisation ainsi que le rattachement organisationnel des acteurs. Les rôles, la matrice CRUD commune et les invariants sont définis dans les [concepts métier transverses](00-concepts-transverses.md). Le [registre des arbitrages Organisation](00-arbitrages-organisations.md) distingue les décisions prises, les décisions `À arbitrer — bloquant` et les éléments bloqués. Le `Superadmin` cité ici est le superuser Django global, pas un quatrième rôle métier.

### FEAT-036 — Gérer le cycle de vie d’une organisation

Cette Feature est raffinée par `ORG-001` à `ORG-004` pour couvrir le CRUD backend des Organisations. `nom` est la seule donnée métier obligatoire et l’identifiant technique est stable. Les droits et périmètres sont décidés ; l’unicité du nom, les états et la sémantique du `DELETE` restent bloqués par les arbitrages cités dans chaque PBI.

#### ORG-001 — Créer une organisation

- **Identifiant :** `ORG-001`.
- **Feature parente :** `FEAT-036`.
- **Titre :** Créer une organisation.
- **User story :** en tant que `Superadmin`, je veux créer une organisation afin de créer le périmètre dans lequel seront rattachés les utilisateurs, équipes et données métier.
- **Intention métier :** établir un périmètre organisationnel identifiable et durable.
- **Description :** exposer la création backend d’une organisation à partir de son `nom`, seule donnée métier obligatoire. Le système lui attribue un identifiant technique stable. La règle d’unicité du nom reste `À arbitrer` dans `ARB-ORG-004` et l’état initial dans `ARB-ORG-005`.
- **Critères d’acceptation :**
  - un `Superadmin` peut créer une organisation ;
  - un `Admin`, un `Coach` ou un `Viewer` ne peut pas créer d’organisation ;
  - `nom` est la seule donnée métier obligatoire à la création ;
  - une organisation valide reçoit un identifiant technique stable ;
  - le `Superadmin` peut créer la première organisation avant qu’un `Admin` rattaché existe ;
  - une création refusée ne persiste aucune donnée partielle ;
  - la règle d’unicité du nom et l’état initial restent `À arbitrer`.
- **Principaux cas de refus :** acteur non authentifié ; `Admin`, `Coach` ou `Viewer` ; `nom` absent ou invalide ; données invalides selon la règle d’unicité restant à arbitrer.
- **Décisions produit bloquantes :** `ARB-ORG-004` pour l’unicité du nom et `ARB-ORG-005` pour l’état initial. Aucune règle d’unicité ni aucun état ne doit être inventé.
- **Dépendances :** aucune.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.
- **Valeur apportée :** crée le périmètre racine nécessaire aux rattachements et aux données métier.

#### ORG-002 — Consulter les organisations

- **Identifiant :** `ORG-002`.
- **Feature parente :** `FEAT-036`.
- **Titre :** Consulter les organisations.
- **User story :** en tant que `Superadmin`, `Admin`, `Coach` ou `Viewer`, je veux lister et consulter les organisations accessibles afin de connaître le contexte organisationnel du dispositif.
- **Intention métier :** rendre le contexte organisationnel consultable sans révéler de données hors périmètre.
- **Description :** exposer dans le backend une liste des organisations accessibles et la consultation d’une organisation par son identifiant stable.
- **Critères d’acceptation :**
  - le `Superadmin` peut consulter toutes les organisations ;
  - l’`Admin` peut consulter uniquement son organisation ;
  - le `Coach` et le `Viewer` peuvent consulter uniquement les organisations de leur périmètre autorisé ;
  - une liste des organisations est disponible ;
  - une organisation peut être consultée par identifiant ;
  - les informations retournées sont cohérentes avec le périmètre autorisé ;
  - aucune consultation anonyme n’est permise ;
  - aucun accès hors périmètre ne révèle l’existence ou les données d’une organisation.
- **Principaux cas de refus :** acteur non authentifié ; identifiant absent, mal formé ou inexistant ; organisation hors du périmètre autorisé.
- **Décision produit bloquante :** `ARB-ORG-012` pour le mode d’attribution et de détermination du périmètre du `Viewer`. Le périmètre global du `Superadmin` et le périmètre mono-organisation de l’`Admin` sont décidés par `ARB-ORG-015`.
- **Dépendances :** `ORG-001`.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.
- **Valeur apportée :** fournit le contexte organisationnel minimal aux parcours du produit.

#### ORG-003 — Modifier une organisation

- **Identifiant :** `ORG-003`.
- **Feature parente :** `FEAT-036`.
- **Titre :** Modifier une organisation.
- **User story :** en tant que `Superadmin` ou `Admin`, je veux modifier les informations d’une organisation afin de maintenir son information à jour.
- **Intention métier :** faire évoluer les informations courantes sans rompre l’identité de l’organisation.
- **Description :** exposer la modification backend des informations d’une organisation sans changer son identifiant technique stable. `nom` reste la seule donnée métier obligatoire ; sa règle d’unicité reste conditionnée par `ARB-ORG-004`. Aucun autre champ n’est rendu obligatoire implicitement.
- **Critères d’acceptation :**
  - un `Superadmin` peut modifier toute organisation ;
  - un `Admin` peut modifier uniquement son organisation ;
  - un `Coach` et un `Viewer` ne peuvent pas modifier une organisation ;
  - `nom` reste renseigné après la modification ;
  - l’identifiant technique de l’organisation reste stable ;
  - une modification invalide, interdite ou hors périmètre ne produit aucun changement partiel.
- **Principaux cas de refus :** acteur non authentifié ; `Coach` ou `Viewer` ; `Admin` ciblant une autre organisation ; organisation inexistante ou hors périmètre ; `nom` absent ou invalide ; tentative de modifier l’identifiant stable.
- **Décision produit bloquante :** `ARB-ORG-004` pour la règle d’unicité du nom. Le périmètre de l’`Admin` est décidé par `ARB-ORG-015`.
- **Dépendances :** `ORG-002`.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.
- **Valeur apportée :** maintient une information fiable tout en conservant l’identité organisationnelle.

#### ORG-004 — Supprimer une organisation

- **Identifiant :** `ORG-004`.
- **Feature parente :** `FEAT-036`.
- **Titre :** Supprimer une organisation.
- **User story :** en tant que `Superadmin` ou `Admin`, je veux retirer une organisation afin d’empêcher l’utilisation future d’une organisation qui ne doit plus être active.
- **Intention métier :** permettre la sortie contrôlée d’une organisation du dispositif actif sans inventer le traitement de son patrimoine.
- **Description :** exposer l’action backend `DELETE` sur une organisation. Sa sémantique métier exacte — suppression physique, archivage ou désactivation — reste `À arbitrer` dans `ARB-ORG-005`.
- **Critères d’acceptation :**
  - un `Superadmin` peut demander la suppression de toute organisation ;
  - un `Admin` peut demander la suppression de son organisation uniquement ;
  - un `Coach` et un `Viewer` ne peuvent pas supprimer une organisation ;
  - une suppression refusée ne produit aucun effet partiel ;
  - la sémantique exacte de `DELETE` reste `À arbitrer` ;
  - les conséquences sur les utilisateurs, équipes et historiques restent explicites dans l’arbitrage et ne sont pas inventées par l’implémentation.
- **Principaux cas de refus :** acteur non authentifié ; `Coach` ou `Viewer` ; `Admin` ciblant une autre organisation ; organisation inexistante ou hors périmètre ; précondition de cycle de vie non satisfaite une fois celle-ci arbitrée.
- **Décision produit bloquante :** `ARB-ORG-005`. `ORG-004` n’est pas prêt à implémenter avant la décision sur la sémantique et les conséquences du `DELETE`.
- **Dépendances :** `ORG-002`.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.
- **Valeur apportée :** empêche l’usage futur d’une organisation selon un traitement contrôlé et explicite.

### FEAT-037 — Rattacher un Admin à une organisation

- **Intention métier :** rendre explicite le périmètre dans lequel un `Admin` peut administrer le dispositif.
- **Acteur concerné :** `Admin` habilité à gérer ce rattachement ; l’autorité d’initialisation n’est pas décidée.
- **Description :** créer, faire évoluer et retracer le rattachement d’un `Admin` à une organisation existante.
- **Critères d’acceptation principaux :**
  - un `Admin` est rattaché à exactement une organisation et toute fonction `Admin` y est exercée ;
  - un rattachement vers une organisation inexistante ou non admissible selon son état est refusé sans effet partiel ;
  - un `Admin` ne peut consulter ou administrer aucune autre organisation que celle de son rattachement ;
  - l’historique permet de déterminer le rattachement applicable à une action passée.
- **Décisions produit bloquantes :** `ARB-ORG-003`, `ARB-ORG-005`, `ARB-ORG-006` et `ARB-ORG-008`. La cardinalité de l’`Admin` est décidée ; cette Feature reste non prête à raffiner ou implémenter pour les autres arbitrages cités.
- **Dépendances éventuelles :** `FEAT-002`, `FEAT-036`.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.

### FEAT-038 — Rattacher un Coach à une organisation

- **Intention métier :** garantir qu’un `Coach` et les équipes qu’il accompagne relèvent du même périmètre organisationnel.
- **Acteur concerné :** `Admin` de l’organisation concernée.
- **Description :** créer, faire évoluer et retracer le rattachement d’un `Coach` à une organisation existante.
- **Critères d’acceptation principaux :**
  - un `Coach` n’est proposé pour une affectation qu’à une équipe de la même organisation ;
  - un rattachement vers une organisation inexistante ou non admissible selon son état est refusé sans effet partiel ;
  - un changement ne réécrit pas l’organisation des affectations et évaluations historiques ;
  - aucune affectation interorganisation implicite n’est possible.
- **Décisions produit bloquantes :** `ARB-ORG-001`, `ARB-ORG-005`, `ARB-ORG-006` et, si la multi-appartenance du `Coach` est retenue, `ARB-ORG-011`. Cette Feature n’est pas prête à être raffinée ni implémentée.
- **Dépendances éventuelles :** `FEAT-002`, `FEAT-036`.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.
