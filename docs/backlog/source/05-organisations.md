## EPIC-009 — Gestion des organisations

Cet Epic porte l’identité et le cycle de vie du périmètre Organisation ainsi que le rattachement organisationnel des acteurs. Les rôles, la matrice CRUD commune et les invariants sont définis dans les [concepts métier transverses](00-concepts-transverses.md). Le [registre des arbitrages Organisation](00-arbitrages-organisations.md) distingue les décisions prises, les décisions `À arbitrer — bloquant` et les éléments bloqués. Le `Superadmin` cité ici est le superuser Django global, pas un quatrième rôle métier.

### FEAT-036 — Gérer le cycle de vie d’une organisation

Cette Feature est raffinée par `ORG-001` à `ORG-004` pour couvrir le CRUD backend des Organisations. `nom` est la seule donnée métier obligatoire et l’identifiant technique est stable. La création et le renommage sont livrés ; la consultation reste limitée aux Admins/Superadmins et la suppression doit être réconciliée avec les dépendances apparues depuis sa livraison initiale.

#### ORG-001 — Créer une organisation

- **Identifiant :** `ORG-001`.
- **Feature parente :** `FEAT-036`.
- **Titre :** Créer une organisation.
- **User story :** en tant que `Superadmin`, je veux créer une organisation et y affecter des utilisateurs afin d’établir leur périmètre métier.
- **Intention métier :** établir un périmètre organisationnel identifiable et durable.
- **Description :** exposer au Superadmin la création d’une organisation à partir de son `nom` et d’au moins un utilisateur existant. Le système lui attribue un identifiant technique stable et persiste atomiquement tous les rattachements. Chaque rôle métier appartient au plus à une organisation.
- **Critères d’acceptation :**
  - un `Superadmin` peut créer une organisation depuis le menu Organisation ;
  - un `Admin`, `Coach` ou `Viewer` ne peut pas créer d’organisation ;
  - `nom` est la seule donnée métier obligatoire à la création ;
  - une organisation valide reçoit un identifiant technique stable ;
  - un ou plusieurs utilisateurs existants sont affectés dans la même transaction ;
  - plusieurs Admins peuvent appartenir à une même organisation ;
  - un `Admin`, `Coach` ou `Viewer` déjà rattaché ne peut pas être affecté à une seconde organisation ;
  - le `Superadmin` peut créer la première organisation avant qu’un `Admin` rattaché existe ;
  - une création refusée ne persiste aucune donnée partielle ;
  - deux organisations distinctes peuvent porter le même nom.
- **Principaux cas de refus :** acteur non authentifié ou non-Superadmin ; `nom` absent ou invalide ; aucun utilisateur ; identifiant utilisateur inexistant ; utilisateur déjà rattaché à une autre organisation.
- **Décisions produit bloquantes :** aucune pour la création.
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
  - l’`Admin` peut consulter uniquement son organisation d'affectation ;
  - le `Coach` et le `Viewer` peuvent consulter uniquement les organisations de leur périmètre autorisé ;
  - une liste des organisations est disponible ;
  - une organisation peut être consultée par identifiant ;
  - les informations retournées sont cohérentes avec le périmètre autorisé ;
  - toute consultation exige une identité authentifiée ;
  - aucun accès hors périmètre ne révèle l’existence ou les données d’une organisation.
- **Principaux cas de refus :** acteur non authentifié ; identifiant absent, mal formé ou inexistant ; organisation hors du périmètre autorisé.
- **Décision produit bloquante :** aucune ; le rattachement unique de l'Admin détermine son périmètre.
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
- **Description :** exposer la modification backend des informations d’une organisation sans changer son identifiant technique stable. `nom` reste la seule donnée métier obligatoire et n’est pas soumis à une contrainte d’unicité.
- **Critères d’acceptation :**
  - un `Superadmin` peut modifier toute organisation ;
  - un `Admin` peut modifier une organisation à laquelle il est rattaché ;
  - un `Coach` et un `Viewer` ne peuvent pas modifier une organisation ;
  - `nom` reste renseigné après la modification ;
  - l’identifiant technique de l’organisation reste stable ;
  - une modification invalide, interdite ou hors périmètre ne produit aucun changement partiel.
- **Principaux cas de refus :** acteur non authentifié ; `Coach` ou `Viewer` ; `Admin` ciblant une autre organisation ; organisation inexistante ou hors périmètre ; `nom` absent ou invalide ; tentative de modifier l’identifiant stable.
- **Décisions produit bloquantes :** aucune ; le renommage depuis la liste administrative est livré le 2026-09-24.
- **Dépendances :** aucune pour le renommage livré ; la consultation métier complète reste portée par `ORG-002`.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.
- **Valeur apportée :** maintient une information fiable tout en conservant l’identité organisationnelle.

#### ORG-004 — Supprimer une organisation

- **Identifiant :** `ORG-004`.
- **Feature parente :** `FEAT-036`.
- **Titre :** Supprimer une organisation.
- **User story :** en tant que `Superadmin`, je veux supprimer une organisation afin de retirer définitivement un périmètre qui ne doit plus exister.
- **Intention métier :** permettre au seul acteur global de retirer définitivement une organisation encore dépourvue de données métier historiques.
- **Description :** exposer la suppression physique d’une organisation et de ses rattachements, sans supprimer les identités associées.
- **Critères d’acceptation :**
  - un `Superadmin` peut demander la suppression de toute organisation ;
  - un `Admin`, un `Coach` et un `Viewer` ne peuvent pas supprimer une organisation ;
  - une suppression refusée ne produit aucun effet partiel ;
  - les comptes utilisateurs survivent à la suppression et leurs autres rattachements restent intacts ;
  - tout futur modèle historique dépendant devra protéger ses données contre une cascade silencieuse.
- **Principaux cas de refus :** acteur non authentifié ; `Admin`, `Coach` ou `Viewer` ; organisation inexistante.
- **Décision produit bloquante :** `ARB-ORG-005` est rouvert pour le traitement des équipes, modèles et planifications désormais dépendants.
- **Dépendances :** aucune dans le modèle courant.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.
- **Valeur apportée :** empêche l’usage futur d’une organisation selon un traitement contrôlé et explicite.

### FEAT-037 — Rattacher un Admin à une organisation

- **Intention métier :** rendre explicite le périmètre dans lequel un `Admin` peut administrer le dispositif.
- **Acteur concerné :** `Superadmin` exclusivement.
- **Description :** créer, faire évoluer et retracer les rattachements d’un `Admin` à des organisations existantes.
- **Critères d’acceptation principaux :**
  - un `Admin` peut être rattaché à une seule organisation et plusieurs Admins peuvent y être pairs ;
  - les membres courants peuvent être ajoutés ou retirés atomiquement depuis le menu Organisation ;
  - seul le Superadmin peut ajouter, retirer, déplacer ou modifier un Admin ;
  - un rattachement vers une organisation inexistante ou non admissible selon son état est refusé sans effet partiel ;
  - une opération métier d’un `Admin` est limitée au rattachement actif applicable ;
  - l’historique permet de déterminer le rattachement applicable à une action passée.
- **Décisions produit bloquantes :** `ARB-ORG-008` et `ARB-ORG-011` pour la levée éventuelle de la protection du dernier Admin, l’historisation et le périmètre actif. Le rattachement initial multiple et l’édition du rattachement courant sont livrés.
- **Dépendances éventuelles :** `FEAT-002`, `FEAT-036`.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.

#### ORG-005 — Gérer le rattachement courant des Admins

- **Identifiant / Feature parente :** `ORG-005` / `FEAT-037`.
- **Nature :** régularisation documentaire du socle finalisé le 2026-09-28.
- **User story :** en tant que `Superadmin`, je veux gérer les Admins courants d’une organisation sans qu’un Admin pair puisse les administrer.
- **Critères livrés :** rattachement atomique, une seule organisation par Admin, plusieurs Admins pairs permis, modification des Admins réservée au Superadmin, refus de retirer le dernier Admin via l’édition des membres.
- **Limites :** pas de date d’effet ni d’historique ; la suppression physique du compte contourne encore la protection du dernier Admin portée par `ARB-ORG-008`.
- **Valeur apportée :** matérialise le périmètre administratif courant et protège les Admins pairs.
- **Dépendances / priorité / preuves :** `FEAT-002`, `FEAT-036` / P0 / migration d’invariant, API et tests de scope des Admins pairs.

### FEAT-038 — Rattacher un Coach à une organisation

- **Intention métier :** garantir qu’un `Coach` et les équipes qu’il accompagne relèvent du même périmètre organisationnel.
- **Acteur concerné :** `Admin` de l’organisation concernée.
- **Description :** créer, faire évoluer et retracer le rattachement d’un `Coach` à une organisation existante.
- **Critères d’acceptation principaux :**
  - un `Coach` n’est proposé pour une affectation qu’à une équipe de la même organisation ;
  - un `Coach` appartient au plus à une organisation et ne peut pas être ajouté à une seconde ;
  - le rattachement courant peut être ajouté ou retiré atomiquement depuis le menu Organisation ;
  - un rattachement vers une organisation inexistante ou non admissible selon son état est refusé sans effet partiel ;
  - un changement ne réécrit pas l’organisation des affectations et évaluations historiques ;
  - aucune affectation interorganisation implicite n’est possible.
- **Décisions produit bloquantes :** `ARB-ORG-006` pour les changements datés et leurs effets sur les liens métier. Le rattachement unique courant et son édition sont livrés.
- **Dépendances éventuelles :** `FEAT-002`, `FEAT-036`.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.

#### ORG-006 — Gérer le rattachement courant d’un Coach

- **Identifiant / Feature parente :** `ORG-006` / `FEAT-038`.
- **Nature :** régularisation documentaire du socle finalisé le 2026-09-28.
- **User story :** en tant que `Superadmin` ou `Admin`, je veux ajouter ou retirer un Coach courant dans mon périmètre afin de l’utiliser dans les équipes et planifications.
- **Critères livrés :** mise à jour atomique, une seule organisation par Coach, Admin limité à son organisation, refus d’un membre déjà rattaché ailleurs et contrôle de cohérence lors des affectations d’équipe.
- **Limites :** aucun changement daté ni historique des rattachements ; `ARB-ORG-006` reste ouvert pour ces effets.
- **Valeur apportée :** fournit un Coach organisationnel cohérent aux équipes et aux planifications.
- **Dépendances / priorité / preuves :** `FEAT-002`, `FEAT-036` / P0 / API Organisations, tests de cardinalité, de scope et d’affectation.
