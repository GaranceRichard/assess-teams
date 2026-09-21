## EPIC-009 — Gestion des organisations

Cet Epic porte l’identité et le cycle de vie du périmètre Organisation ainsi que le rattachement organisationnel des acteurs. Les rôles, la matrice CRUD commune et les invariants sont définis dans les [concepts métier transverses](00-concepts-transverses.md). Le [registre des arbitrages Organisation](00-arbitrages-organisations.md) distingue les décisions prises, les décisions `À arbitrer — bloquant` et les éléments bloqués. Le `Superadmin` cité ici est le superuser Django global, pas un quatrième rôle métier.

### FEAT-036 — Gérer le cycle de vie d’une organisation

Cette Feature est raffinée par `ORG-001` à `ORG-004` pour couvrir le CRUD backend des Organisations. Les droits sont décidés ; les données obligatoires, l’unicité, le périmètre des objets accessibles et la sémantique du `DELETE` restent bloqués par les arbitrages cités dans chaque PBI.

#### ORG-001 — Créer une organisation

- **Identifiant :** `ORG-001`.
- **Feature parente :** `FEAT-036`.
- **Titre :** Créer une organisation.
- **User story :** en tant que `Superadmin` ou `Admin`, je veux créer une organisation afin de créer le périmètre dans lequel seront rattachés les utilisateurs, équipes et données métier.
- **Intention métier :** établir un périmètre organisationnel identifiable et durable.
- **Description :** exposer la création backend d’une organisation. Les données obligatoires et règles d’unicité ne sont pas encore décidées et restent `À arbitrer` dans `ARB-ORG-004`.
- **Critères d’acceptation :**
  - un `Superadmin` peut créer une organisation ;
  - un `Admin` peut créer une organisation ;
  - un `Coach` ne peut pas créer d’organisation ;
  - un `Viewer` ne peut pas créer d’organisation ;
  - une organisation valide reçoit un identifiant stable ;
  - le `Superadmin` peut créer la première organisation avant qu’un `Admin` rattaché existe ;
  - une création refusée ne persiste aucune donnée partielle ;
  - les données obligatoires et règles d’unicité restent `À arbitrer`.
- **Principaux cas de refus :** acteur non authentifié ; `Coach` ou `Viewer` ; données invalides selon les règles restant à arbitrer ; périmètre non autorisé une fois `ARB-ORG-015` décidé.
- **Décisions produit bloquantes :** `ARB-ORG-004`, `ARB-ORG-005` et `ARB-ORG-015`. Aucun attribut, état initial, règle d’unicité ou périmètre de l’`Admin` ne doit être inventé.
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
  - le `Superadmin` peut consulter les organisations autorisées ;
  - l’`Admin` peut consulter les organisations autorisées ;
  - le `Coach` peut consulter les organisations autorisées ;
  - le `Viewer` peut consulter les organisations autorisées ;
  - une liste des organisations est disponible ;
  - une organisation peut être consultée par identifiant ;
  - les informations retournées sont cohérentes avec le périmètre autorisé ;
  - aucun accès hors périmètre ne révèle l’existence ou les données d’une organisation.
- **Principaux cas de refus :** acteur non authentifié ; identifiant absent, mal formé ou inexistant ; organisation hors du périmètre autorisé.
- **Décisions produit bloquantes :** `ARB-ORG-012` et `ARB-ORG-015`. Aucun périmètre de lecture ne doit être déduit de la seule matrice de droits.
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
- **Description :** exposer la modification backend des informations modifiables d’une organisation. La liste des informations obligatoires ou modifiables reste conditionnée par `ARB-ORG-004`.
- **Critères d’acceptation :**
  - un `Superadmin` peut modifier une organisation ;
  - un `Admin` peut modifier une organisation ;
  - un `Coach` et un `Viewer` ne peuvent pas modifier une organisation ;
  - l’identifiant de l’organisation reste stable ;
  - une modification invalide, interdite ou hors périmètre ne produit aucun changement partiel.
- **Principaux cas de refus :** acteur non authentifié ; `Coach` ou `Viewer` ; organisation inexistante ou hors périmètre ; données invalides ; tentative de modifier l’identifiant stable.
- **Décisions produit bloquantes :** `ARB-ORG-004` et `ARB-ORG-015`. Les champs modifiables et le périmètre de l’`Admin` ne doivent pas être inventés.
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
  - un `Superadmin` peut supprimer une organisation ;
  - un `Admin` peut supprimer une organisation ;
  - un `Coach` et un `Viewer` ne peuvent pas supprimer une organisation ;
  - une suppression refusée ne produit aucun effet partiel ;
  - la sémantique exacte de `DELETE` reste `À arbitrer` ;
  - les conséquences sur les utilisateurs, équipes et historiques restent explicites dans l’arbitrage et ne sont pas inventées par l’implémentation.
- **Principaux cas de refus :** acteur non authentifié ; `Coach` ou `Viewer` ; organisation inexistante ou hors périmètre ; précondition de cycle de vie non satisfaite une fois celle-ci arbitrée.
- **Décisions produit bloquantes :** `ARB-ORG-005` et `ARB-ORG-015`. `ORG-004` n’est pas prêt à implémenter avant la décision sur la sémantique et les conséquences du `DELETE`.
- **Dépendances :** `ORG-002`.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.
- **Valeur apportée :** empêche l’usage futur d’une organisation selon un traitement contrôlé et explicite.

### FEAT-037 — Rattacher un Admin à une organisation

- **Intention métier :** rendre explicite le périmètre dans lequel un `Admin` peut administrer le dispositif.
- **Acteur concerné :** `Admin` habilité à gérer ce rattachement ; l’autorité d’initialisation n’est pas décidée.
- **Description :** créer, faire évoluer et retracer le rattachement d’un `Admin` à une organisation existante.
- **Critères d’acceptation principaux :**
  - toute fonction `Admin` est exercée dans l’organisation applicable au rattachement ;
  - un rattachement vers une organisation inexistante ou non admissible selon son état est refusé sans effet partiel ;
  - un `Admin` respecte le périmètre qui sera décidé ; aucune consultation ou manipulation interorganisationnelle n’est implicite ;
  - l’historique permet de déterminer le rattachement applicable à une action passée.
- **Décisions produit bloquantes :** `ARB-ORG-001`, `ARB-ORG-003`, `ARB-ORG-005`, `ARB-ORG-006`, `ARB-ORG-008` et, si la multi-appartenance est retenue, `ARB-ORG-011`. Cette Feature n’est pas prête à être raffinée ni implémentée.
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
- **Décisions produit bloquantes :** `ARB-ORG-001`, `ARB-ORG-005`, `ARB-ORG-006` et, si la multi-appartenance est retenue, `ARB-ORG-011`. Cette Feature n’est pas prête à être raffinée ni implémentée.
- **Dépendances éventuelles :** `FEAT-002`, `FEAT-036`.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.
