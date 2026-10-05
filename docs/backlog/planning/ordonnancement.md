# Planification du backlog

## Sprint 1 — Backend Utilisateurs

**Objectif :** disposer du cycle backend minimal des comptes `Admin`, `Coach` et `Viewer`, administré par un `Superadmin` technique ou un `Admin` autorisé, sans création d’un nouvel Epic et sans confondre identité, fonction et rattachement organisationnel.

| Ordre | PBI | État d’entrée | Condition d’enchaînement |
| ---: | --- | --- | --- |
| 1 | `USER-001` — Créer un utilisateur | Réalisé | Livré le 2026-09-21 |
| 2 | `USER-002` — Consulter les utilisateurs | Ouvert | compléter le détail et `nom`/`prénom` |
| 3 | `USER-003` — Modifier un utilisateur | Ouvert | aligner les champs modifiables sur le contrat |
| 3 | `USER-004` — Supprimer un utilisateur | Bloqué | décider `ARB-ORG-008` et remplacer la suppression physique |

Le bootstrap du premier `Superadmin` par Django est un prérequis opératoire de `USER-001`, pas un PBI ni un rôle métier. Le socle technique de liste, édition et suppression existe, mais `USER-002` à `USER-004` ne sont pas déclarés réalisés tant que leurs contrats fonctionnels divergent. `USER-003` peut être complété après `USER-002`; `USER-004` reste bloqué indépendamment par `ARB-ORG-008`.

## Ordonnancement global recommandé

1. **Contrats Utilisateurs :** compléter `USER-002` et `USER-003`; conserver `USER-004` bloqué jusqu’à `ARB-ORG-008` et à une désactivation logique.
2. **Cycle Organisation :** compléter `ORG-002`; décider avec `ARB-ORG-005` le sort des données dépendantes avant de reprendre `ORG-004`.
3. **Cycle Équipes :** `TEAM-001` et `TEAM-004` sont livrés ; compléter `TEAM-002`, `TEAM-003` et `TEAM-005`, puis `TEAM-006` et `TEAM-007`.
4. **Rattachements historiques :** les états courants `ORG-005`, `ORG-006` et `COACH-001` sont livrés ; l’historisation de `FEAT-008`, `FEAT-009`, `FEAT-037` et `FEAT-038` reste à raffiner.
5. **Référentiel d’évaluation :** `EVAL-001` livre le CRUD local, `EVAL-002` la validation immuable et l’archivage, `EVAL-003` les familles et versions ; modalités et partage éventuel restent à raffiner/arbitrer.
6. **Planification :** `PLAN-001` livre le planning courant ; périodes d’association, historique et calcul piloté par les finalisations restent dans `FEAT-015`, `FEAT-016` et `FEAT-018`.
7. **Passation et preuve P0 :** raffiner puis livrer `FEAT-020` à `FEAT-024`, puis valider `PV-001` en E2E dans une organisation déterminée.
8. **Résultats :** `RESULT-001` compare les dernières complétions interéquipes pour une version exacte après `EVAL-003` et `PASS-001` ; comparaison temporelle hors périmètre.
9. **Suite P1/P2 :** retards, rappels avancés, historique temporel et pilotage après leurs dépendances et arbitrages explicites.

Cet ordre indique une séquence de valeur ; il ne prescrit ni lots techniques ni applications Django. Il ne rend aucun élément prêt tant que les décisions bloquantes du [registre des arbitrages Organisation](../source/00-arbitrages-organisations.md) ne sont pas résolues.

## Hypothèse de cartographie des domaines métier

Cette cartographie est une hypothèse évolutive. Elle guide un découpage cohérent sans figer prématurément les frontières. Dans chaque domaine, une future implémentation pourra distinguer sobrement **Domain**, **Application**, **Ports** et **Adapters** lorsque cette séparation apporte une valeur réelle.

### Organisations

- **Responsabilité principale :** identité et cycle de vie des organisations, rattachements organisationnels des `Admin` et des `Coach`.
- **Features concernées :** `FEAT-036` à `FEAT-038` ; `ORG-001` à `ORG-004` raffinent `FEAT-036`.
- **Dépendances :** fournit aux autres domaines un périmètre explicite ; les rôles et règles communes restent définis dans la source transverse.

### Identités et habilitations

- **Responsabilité principale :** identités, accès, cycle de vie des identités et profils `Coach`, décisions d’autorisation.
- **Features concernées :** `FEAT-001` à `FEAT-004` ; `USER-001` à `USER-004` raffinent `FEAT-002` et appliquent la matrice d’autorisation de `FEAT-004`.
- **Dépendances :** fournit l’identité et les autorisations aux autres domaines ; ne porte pas leurs règles métier.

### Gestion des équipes et accompagnement

- **Responsabilité principale :** identité et état des équipes, responsabilité courante du coach et historique des affectations.
- **Features concernées :** `FEAT-005` à `FEAT-010` ; `TEAM-001` à `TEAM-007` raffinent `FEAT-005`, `FEAT-006`, `FEAT-007` et `FEAT-010`.
- **Dépendances :** reçoit les identités de coachs du domaine Identités et habilitations ; expose équipe active et affectation applicable à Planification et Passations.

### Référentiel d’évaluation

- **Responsabilité principale :** définition des critères, modalités, publication et versions immuables des modèles.
- **Features concernées :** `FEAT-011` à `FEAT-014`.
- **Dépendances :** fournit des versions publiées à Planification et des règles de réponse et calcul à Passations ; ne connaît ni équipe ni échéance.

### Planification des évaluations

- **Responsabilité principale :** associations équipe–modèle, cadences, cycles, échéances et qualification du retard.
- **Features concernées :** `FEAT-015` à `FEAT-019`.
- **Dépendances :** utilise l’état des équipes, les versions publiées et les faits de finalisation ; expose les évaluations attendues à Passations, Notifications et Pilotage.

### Passations d’évaluation

- **Responsabilité principale :** cycle de vie d’une passation, réponses, validation, résultats, finalisation et preuve immuable.
- **Features concernées :** `FEAT-020` à `FEAT-023`.
- **Dépendances :** vérifie coach et équipe auprès d’Équipes et coaching, modèle auprès du Référentiel et cycle auprès de Planification ; publie le fait de finalisation sans piloter la cadence.

### Analyse longitudinale

- **Responsabilité principale :** restitution de l’historique, comparabilité, évolutions et représentations des résultats.
- **Features concernées :** `FEAT-024` à `FEAT-027` et `FEAT-041` (Résultats interéquipes).
- **Dépendances :** lit les preuves finalisées de Passations et la sémantique des versions du Référentiel ; n’altère jamais les évaluations sources.

### Notifications

- **Responsabilité principale :** intentions de rappel ou d’alerte, destinataires, déduplication et suivi de remise.
- **Features concernées :** `FEAT-028` à `FEAT-030`.
- **Dépendances :** consomme échéances, retards et affectations ; remet ses messages au moyen d’un port de notification afin que les règles métier ignorent les canaux concrets.

### Pilotage du dispositif

- **Responsabilité principale :** paramètres transverses autorisés et vues de supervision explicables du programme.
- **Features concernées :** `FEAT-031` à `FEAT-035`.
- **Dépendances :** consolide des informations des autres domaines sans devenir leur propriétaire ; les indicateurs restent reliés aux données sources.

### Traçabilité opérationnelle

- **Responsabilité principale :** lecture cloisonnée des activités réussies et erreurs fonctionnelles nettoyées.
- **Features concernées :** `FEAT-039`, `FEAT-040`, livrées par `JOURNAL-001` et `JOURNAL-002`.
- **Dépendances :** reçoit les faits des autres domaines sans devenir leur source métier ; les logs techniques serveur restent distincts.

## Garde-fous pour l’architecture future

- Le domaine métier et ses règles ne dépendront directement ni de Django REST Framework, ni de l’ORM Django, ni de SQLite, ni de HTTP, ni de React, ni de serializers, ni d’un système concret de notification.
- Les cas d’usage orchestreront les règles et dépendront de ports définis selon les besoins métier ; les adapters porteront persistance, API, interface et canaux externes.
- Les frontières suivront les responsabilités ci-dessus, pas des regroupements techniques génériques tels que `core`, `services`, `repositories`, `controllers` ou `utils`.
- SQLite est un adapter de persistance initial, pas une contrainte du domaine. React et Django REST Framework exposent le produit, mais ne définissent pas ses règles.
- La séparation restera pragmatique : aucun port, adapter ou abstraction ne sera créé sans collaboration réelle à isoler ou règle à protéger.
