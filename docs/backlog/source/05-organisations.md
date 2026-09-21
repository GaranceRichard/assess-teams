## EPIC-009 — Gestion des organisations

Cet Epic porte l’identité et le cycle de vie du périmètre Organisation ainsi que le rattachement organisationnel des acteurs. Les rôles, capacités et invariants communs sont définis dans les [concepts métier transverses](00-concepts-transverses.md).

### FEAT-036 — Gérer le cycle de vie d’une organisation

- **Intention métier :** disposer d’un périmètre durable auquel rattacher acteurs, équipes et données métier.
- **Acteur concerné :** `Admin` disposant de la capacité de gestion des organisations ; l’autorité habilitée à créer la toute première organisation est **À arbitrer**.
- **Description :** créer une organisation, faire évoluer ses informations et gérer son cycle de vie sans rendre son historique ambigu.
- **Critères d’acceptation principaux :**
  - une organisation créée reçoit un identifiant stable et permet de déterminer son état courant ;
  - chaque transition conserve l’identité et l’historique de l’organisation ;
  - une demande invalide ou interdite est refusée sans création ni transition partielle ;
  - les effets d’un changement d’état sur les acteurs, équipes et opérations respectent les règles explicitement arbitrées.
- **À arbitrer :** données obligatoires, unicité, états, transitions, acteur autorisé à créer la première organisation et effets sur les rattachements existants.
- **Dépendances éventuelles :** aucune.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.

### FEAT-037 — Rattacher un Admin à une organisation

- **Intention métier :** rendre explicite le périmètre dans lequel un `Admin` peut administrer le dispositif.
- **Acteur concerné :** `Admin` habilité à gérer ce rattachement ; l’autorité d’initialisation est **À arbitrer**.
- **Description :** créer, faire évoluer et retracer le rattachement d’un `Admin` à une organisation existante.
- **Critères d’acceptation principaux :**
  - toute fonction `Admin` est exercée dans l’organisation applicable au rattachement ;
  - un rattachement vers une organisation inexistante ou non admissible selon son état est refusé sans effet partiel ;
  - un `Admin` ne peut ni consulter ni manipuler implicitement les données d’une autre organisation ;
  - l’historique permet de déterminer le rattachement applicable à une action passée.
- **À arbitrer :** cardinalité des rattachements, changement d’organisation, état d’organisation admissible, autorité permettant de rattacher un `Admin` à une autre organisation et gestion du dernier `Admin` d’une organisation.
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
- **À arbitrer :** cardinalité des rattachements, changement d’organisation et état d’organisation admissible.
- **Dépendances éventuelles :** `FEAT-002`, `FEAT-036`.
- **Priorité :** P0.
- **Domaine métier cible :** Organisations.
