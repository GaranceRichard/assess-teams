## EPIC-002 — Gestion des équipes

Cet Epic porte uniquement l’identité et le cycle de vie d’une équipe dans son organisation. Toute équipe appartient obligatoirement à exactement une organisation selon les [concepts métier transverses](00-concepts-transverses.md). L’affectation des `Coach`, les modèles d’évaluation, les fréquences, les évaluations et les notifications restent dans leurs Epics respectifs. Les Features `FEAT-005`, `FEAT-006`, `FEAT-007` et `FEAT-010` sont raffinées par les sept PBIs `TEAM-001` à `TEAM-007`.

### FEAT-005 — Constituer une équipe

#### TEAM-001 — Créer une équipe

- **Identifiant :** `TEAM-001`.
- **Feature parente :** `FEAT-005`.
- **Titre :** Créer une équipe.
- **User story :** en tant qu’`Admin`, je veux créer une équipe dans mon organisation afin qu’elle puisse être suivie dans le bon périmètre.
- **Intention métier :** établir une identité durable et non ambiguë pour le collectif suivi.
- **Description :** enregistrer une équipe à partir d’un nom obligatoire et d’une organisation de rattachement explicite. Le système lui attribue un identifiant stable, conserve son organisation et la rend active par défaut.
- **Critères d’acceptation :**
  - lorsqu’un `Admin` soumet un nom non vide, une organisation de rattachement valide et un nom conforme à la règle d’unicité après arbitrage, une seule équipe est créée dans cette organisation ;
  - l’équipe créée possède un identifiant généré par le système, distinct de son nom et immuable ;
  - son organisation de rattachement est obligatoire, explicite et ne peut être remplacée implicitement par celle d’un autre acteur ou d’une autre donnée ;
  - son état initial est `active`, sans choix supplémentaire demandé à l’`Admin` ;
  - la confirmation de création retourne l’identifiant de l’équipe, son nom enregistré, son état `active` et l’identifiant de son organisation, sans introduire de consultation dédiée ;
  - si la création est refusée, aucune équipe ni donnée partielle correspondant à la demande n’est conservée.
- **Principaux cas de refus :** organisation absente, inexistante, hors du périmètre de l’`Admin` ou non admissible selon son état ; nom absent, vide après suppression des espaces périphériques ou d’un type invalide ; nom déjà porté par une équipe active ou archivée dans la portée qui sera arbitrée, selon une comparaison insensible à la casse et aux espaces périphériques.
- **À arbitrer :** portée de l’unicité du nom entre « au sein d’une organisation » et « dans l’ensemble du système » ; états d’organisation autorisant la création d’une équipe. Aucun de ces choix ne doit être déduit par l’implémentation.
- **Dépendances :** `FEAT-036`, `FEAT-037`.
- **Indépendance technique :** `TEAM-001` ne dépend pas de l’implémentation technique de l’authentification ou des permissions portée par `FEAT-004` ; le contexte `Admin` et Organisation requis reste une précondition métier.
- **Priorité :** P0.
- **Domaine métier cible :** Gestion des équipes.
- **Valeur apportée :** rend une équipe identifiable et disponible pour les parcours métier ultérieurs.
- **Notes d’implémentation :** pilote du premier vertical slice après consolidation et raffinement du socle Organisation. Son implémentation future doit valider le pattern complet `React → API DRF → Application → Domain → Port → Adapter de persistance → SQLite`. Le cas d’usage se limite à la création et retourne les données précisées ci-dessus ; retrouver ensuite une équipe par son identifiant appartient exclusivement à `TEAM-003`. Cette note d’architecture n’est pas un critère d’acceptation métier.

### FEAT-007 — Consulter les équipes

#### TEAM-002 — Lister les équipes

- **Identifiant :** `TEAM-002`.
- **Feature parente :** `FEAT-007`.
- **Titre :** Lister les équipes.
- **User story :** en tant que `Viewer`, je veux consulter les équipes actives de mon périmètre organisationnel afin d’identifier celles que je peux suivre.
- **Intention métier :** offrir une vue courante fiable des équipes en activité.
- **Description :** afficher les équipes actives accessibles au rôle dans son périmètre organisationnel avec les seules données utiles à leur identification : identifiant, nom, état et organisation.
- **Critères d’acceptation :**
  - la liste contient chaque équipe active accessible une seule fois, avec son identifiant, son nom, son état et l’identifiant de son organisation ;
  - une équipe archivée n’apparaît pas dans la liste active par défaut ;
  - lorsqu’aucune équipe active n’est accessible, le résultat est une liste vide valide et l’interface présente un état vide explicite ;
  - une équipe nouvellement créée par `TEAM-001` apparaît dans la liste active lors de la consultation suivante.
- **Principaux cas de refus :** rôle non autorisé ; périmètre organisationnel absent ou tentative d’accès à des équipes d’une autre organisation.
- **Dépendances :** `TEAM-001` ; `FEAT-004` pour le périmètre d’accès.
- **Priorité :** P0.
- **Domaine métier cible :** Gestion des équipes.
- **Valeur apportée :** permet de retrouver rapidement les équipes sur lesquelles une action courante est possible.
- **Notes d’implémentation :** ne prévoit ni pagination, ni recherche, ni filtrage avancé à ce stade.

#### TEAM-003 — Consulter une équipe

- **Identifiant :** `TEAM-003`.
- **Feature parente :** `FEAT-007`.
- **Titre :** Consulter une équipe.
- **User story :** en tant que `Viewer`, je veux consulter une équipe précise de mon périmètre organisationnel afin de connaître son identité et son état.
- **Intention métier :** fournir une référence fiable pour toute action portant sur une équipe déterminée.
- **Description :** retrouver une équipe par son identifiant dans le périmètre organisationnel applicable et présenter son identifiant, son nom, son état courant et son organisation.
- **Critères d’acceptation :**
  - un identifiant existant et accessible restitue exactement une équipe avec son identifiant, son nom, son état et l’identifiant de son organisation ;
  - l’état présenté distingue explicitement une équipe active d’une équipe archivée ;
  - un identifiant inexistant produit une erreur explicite d’équipe introuvable sans contenu d’équipe ;
  - un rôle sans accès à l’équipe, notamment parce qu’elle appartient à une autre organisation, ne reçoit aucune donnée métier sur celle-ci.
- **Principaux cas de refus :** identifiant absent ou mal formé ; équipe inexistante ; rôle non autorisé ; équipe hors du périmètre organisationnel applicable.
- **Dépendances :** `TEAM-001` ; `FEAT-004` pour le périmètre d’accès.
- **Priorité :** P0.
- **Domaine métier cible :** Gestion des équipes.
- **Valeur apportée :** donne un point d’accès stable au dossier minimal d’une équipe.
- **Notes d’implémentation :** les coachs, modèles, fréquences, évaluations et notifications enrichiront d’autres vues ou parcours ; ils ne font pas partie de ce PBI.

### FEAT-006 — Faire évoluer les informations d’une équipe

#### TEAM-004 — Modifier une équipe

- **Identifiant :** `TEAM-004`.
- **Feature parente :** `FEAT-006`.
- **Titre :** Modifier une équipe.
- **User story :** en tant qu’`Admin`, je veux corriger le nom d’une équipe de mon organisation afin que son dossier reste fidèle à la réalité.
- **Intention métier :** faire évoluer l’information courante sans rompre l’identité ni l’historique de l’équipe.
- **Description :** permettre la modification du nom d’une équipe active. Son identifiant et son état ne sont pas modifiables par ce PBI.
- **Critères d’acceptation :**
  - la modification valide du nom est visible lors de la consultation suivante ;
  - l’identifiant de l’équipe reste inchangé après la modification ;
  - une modification valide ne change ni l’organisation ni l’état de l’équipe et ne rompt aucun rattachement historique ;
  - si la modification est refusée, le nom, l’état et les rattachements existants restent inchangés.
- **Principaux cas de refus :** rôle autre qu’`Admin` ; équipe inexistante, archivée ou rattachée à une autre organisation ; nom absent, vide après suppression des espaces périphériques, d’un type invalide ou déjà utilisé selon la règle arbitrée de `TEAM-001` ; tentative de modifier l’identifiant, l’organisation ou l’état.
- **Dépendances :** `TEAM-003` ; `FEAT-004` pour l’autorisation.
- **Priorité :** P0.
- **Domaine métier cible :** Gestion des équipes.
- **Valeur apportée :** maintient une information exacte sans perdre la continuité de suivi.
- **Notes d’implémentation :** la mise à jour doit être atomique ; ce point soutient les critères métier d’absence de modification partielle.

### FEAT-010 — Gérer la sortie et la reprise du suivi actif

#### TEAM-005 — Archiver une équipe

- **Identifiant :** `TEAM-005`.
- **Feature parente :** `FEAT-010`.
- **Titre :** Archiver une équipe.
- **User story :** en tant qu’`Admin`, je veux archiver une équipe de mon organisation afin de la sortir du suivi actif sans supprimer son passé.
- **Intention métier :** arrêter les nouvelles activités d’une équipe tout en préservant les preuves et rattachements acquis.
- **Description :** faire passer une équipe de l’état `active` à l’état `archivée`, sans suppression physique.
- **Critères d’acceptation :**
  - l’archivage conserve l’identifiant, le nom, l’organisation et les rattachements historiques de l’équipe ;
  - après archivage, la consultation par identifiant restitue la même équipe avec l’état `archivée` ;
  - l’équipe archivée disparaît de la liste active de `TEAM-002` ;
  - aucune suppression physique de l’équipe ni de son historique n’est effectuée ;
  - une seconde demande d’archivage est refusée avec l’état explicite « équipe déjà archivée » et ne crée aucune transition supplémentaire.
- **Principaux cas de refus :** rôle autre qu’`Admin` ; équipe inexistante, déjà archivée ou rattachée à une autre organisation. Chaque refus laisse l’état et l’historique inchangés.
- **Dépendances :** `TEAM-003` ; `FEAT-004` pour l’autorisation.
- **Priorité :** P0.
- **Domaine métier cible :** Gestion des équipes.
- **Valeur apportée :** garde la liste active pertinente tout en protégeant la traçabilité du dispositif.
- **Notes d’implémentation :** le traitement des affectations, modèles, échéances ou évaluations en cours appartient à leurs Epics respectifs et dépendra de l’état archivé exposé ici.

#### TEAM-006 — Consulter les équipes archivées

- **Identifiant :** `TEAM-006`.
- **Feature parente :** `FEAT-010`.
- **Titre :** Consulter les équipes archivées.
- **User story :** en tant qu’`Admin`, je veux consulter les équipes archivées de mon organisation afin de retrouver les collectifs sortis du suivi actif.
- **Intention métier :** rendre le patrimoine historique repérable sans le mélanger au portefeuille actif.
- **Description :** afficher séparément les équipes archivées de l’organisation applicable avec leur identifiant, leur nom, leur état et leur organisation.
- **Critères d’acceptation :**
  - la liste contient chaque équipe archivée accessible une seule fois, avec son identifiant, son nom, l’état `archivée` et l’identifiant de son organisation ;
  - aucune équipe active n’apparaît dans cette liste ;
  - lorsqu’aucune équipe n’est archivée, le résultat est une liste vide valide et l’interface présente un état vide explicite ;
  - une équipe archivée par `TEAM-005` apparaît dans cette liste lors de la consultation suivante.
- **Principaux cas de refus :** rôle autre qu’`Admin` ; périmètre organisationnel absent ou tentative de consulter les équipes archivées d’une autre organisation.
- **Dépendances :** `TEAM-005` ; `FEAT-004` pour l’autorisation.
- **Priorité :** P1.
- **Domaine métier cible :** Gestion des équipes.
- **Valeur apportée :** permet de retrouver une équipe inactive et d’accéder à son suivi conservé.
- **Notes d’implémentation :** aucune pagination, recherche ou vue historique détaillée n’est incluse sans besoin complémentaire.

#### TEAM-007 — Réactiver une équipe

- **Identifiant :** `TEAM-007`.
- **Feature parente :** `FEAT-010`.
- **Titre :** Réactiver une équipe.
- **User story :** en tant qu’`Admin`, je veux réactiver une équipe archivée de mon organisation afin de reprendre son suivi sans créer une nouvelle identité.
- **Intention métier :** reprendre l’activité d’un collectif en conservant la continuité de son dossier.
- **Description :** faire passer une équipe de l’état `archivée` à l’état `active` sans recréation.
- **Critères d’acceptation :**
  - une équipe archivée réactivée retrouve l’état `active` avec le même identifiant, le même nom et la même organisation ;
  - tous ses rattachements et éléments historiques restent associés à cette identité ;
  - après réactivation, l’équipe apparaît dans la liste active de `TEAM-002` et disparaît de la liste de `TEAM-006` ;
  - si la réactivation est refusée, l’état et l’historique restent inchangés.
- **Principaux cas de refus :** rôle autre qu’`Admin` ; équipe inexistante, déjà active ou rattachée à une autre organisation.
- **Dépendances :** `TEAM-005` ; `FEAT-004` pour l’autorisation.
- **Priorité :** P1.
- **Domaine métier cible :** Gestion des équipes.
- **Valeur apportée :** évite les doublons d’identité et restaure le suivi avec tout son contexte historique.
- **Notes d’implémentation :** la reprise éventuelle d’affectations, de planifications ou d’autres activités reste gouvernée par les Epics propriétaires de ces capacités.

### Dépendances internes de l’Epic

```text
TEAM-001
├── TEAM-002
└── TEAM-003
    ├── TEAM-004
    └── TEAM-005
        ├── TEAM-006
        └── TEAM-007
```

## EPIC-002A — Accompagnement des équipes

### FEAT-008 — Affecter un coach à une équipe

- **Intention métier :** rendre explicite la responsabilité d’accompagnement d’une équipe.
- **Acteur concerné :** `Admin` de l’organisation de l’équipe.
- **Description :** démarrer, remplacer ou terminer l’affectation du coach responsable selon une période déterminée.
- **Critères d’acceptation principaux :**
  - un `Coach` actif peut devenir responsable d’une équipe active de la même organisation à une date d’effet connue ;
  - un remplacement clôt l’affectation courante avant d’ouvrir la suivante, sans chevauchement incohérent ;
  - un `Coach` inactif, une équipe inactive, un rattachement organisationnel différent ou une période invalide entraîne un refus.
- **Dépendances éventuelles :** `FEAT-003`, `FEAT-038`, `TEAM-001`, `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Équipes et coaching.
### FEAT-009 — Retracer les affectations de coachs

- **Intention métier :** savoir qui était responsable d’une équipe à tout moment.
- **Acteurs concernés :** `Admin`, `Coach` autorisé par son affectation.
- **Description :** conserver et consulter la chronologie des affectations, avec dates d’effet et motif de fin ou de remplacement.
- **Critères d’acceptation principaux :**
  - chaque transition conserve le `Coach`, l’organisation, la période et l’auteur de la décision ;
  - l’affectation applicable à une date passée peut être déterminée sans ambiguïté ;
  - une correction ne doit pas effacer silencieusement une période déjà utilisée par une évaluation ;
  - aucun historique d’une autre organisation n’est consultable ou modifiable implicitement.
- **Dépendances éventuelles :** `FEAT-008`.
- **Priorité :** P0.
- **Domaine métier cible :** Équipes et coaching.
