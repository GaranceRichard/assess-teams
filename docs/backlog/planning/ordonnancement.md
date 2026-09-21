## Ordonnancement recommandé

1. **Socle Organisation :** arbitrer puis raffiner `FEAT-036` à `FEAT-038`, afin qu’une organisation et les rattachements nécessaires existent avant la création d’une équipe.
2. **Premier PBI d’implémentation après ce socle :** `TEAM-001`, sans dépendance à l’implémentation technique de l’authentification ou des permissions, mais avec un rattachement organisationnel explicite.
3. **Suite du socle P0 :** raffiner les Features `FEAT-001` à `FEAT-004`, puis livrer les PBIs nécessaires ; poursuivre avec `TEAM-002` à `TEAM-005`, `FEAT-008` et `FEAT-009` après leur raffinement.
4. **Cadre d’évaluation P0 :** arbitrer la portée organisationnelle des modèles et paramètres, puis raffiner et livrer `FEAT-011` à `FEAT-018`.
5. **Passation et preuve P0 :** raffiner puis livrer `FEAT-020` à `FEAT-024`, puis valider `PV-001` en E2E dans une organisation déterminée.
6. **Suite P1/P2 :** `TEAM-006`, `TEAM-007`, puis les autres Features après leur raffinement selon la valeur et les dépendances.

Cet ordre indique une séquence de valeur ; il ne prescrit ni lots techniques ni applications Django.

## Hypothèse de cartographie des domaines métier

Cette cartographie est une hypothèse évolutive. Elle guide un découpage cohérent sans figer prématurément les frontières. Dans chaque domaine, une future implémentation pourra distinguer sobrement **Domain**, **Application**, **Ports** et **Adapters** lorsque cette séparation apporte une valeur réelle.

### Organisations

- **Responsabilité principale :** identité et cycle de vie des organisations, rattachements organisationnels des `Admin` et des `Coach`.
- **Features concernées :** `FEAT-036` à `FEAT-038`.
- **Dépendances :** fournit aux autres domaines un périmètre explicite ; les rôles et règles communes restent définis dans la source transverse.

### Identités et habilitations

- **Responsabilité principale :** identités, accès, cycle de vie des identités et profils `Coach`, décisions d’autorisation.
- **Features concernées :** `FEAT-001` à `FEAT-004`.
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
- **Features concernées :** `FEAT-024` à `FEAT-027`.
- **Dépendances :** lit les preuves finalisées de Passations et la sémantique des versions du Référentiel ; n’altère jamais les évaluations sources.

### Notifications

- **Responsabilité principale :** intentions de rappel ou d’alerte, destinataires, déduplication et suivi de remise.
- **Features concernées :** `FEAT-028` à `FEAT-030`.
- **Dépendances :** consomme échéances, retards et affectations ; remet ses messages au moyen d’un port de notification afin que les règles métier ignorent les canaux concrets.

### Pilotage du dispositif

- **Responsabilité principale :** paramètres transverses autorisés et vues de supervision explicables du programme.
- **Features concernées :** `FEAT-031` à `FEAT-035`.
- **Dépendances :** consolide des informations des autres domaines sans devenir leur propriétaire ; les indicateurs restent reliés aux données sources.

## Garde-fous pour l’architecture future

- Le domaine métier et ses règles ne dépendront directement ni de Django REST Framework, ni de l’ORM Django, ni de SQLite, ni de HTTP, ni de React, ni de serializers, ni d’un système concret de notification.
- Les cas d’usage orchestreront les règles et dépendront de ports définis selon les besoins métier ; les adapters porteront persistance, API, interface et canaux externes.
- Les frontières suivront les responsabilités ci-dessus, pas des regroupements techniques génériques tels que `core`, `services`, `repositories`, `controllers` ou `utils`.
- SQLite est un adapter de persistance initial, pas une contrainte du domaine. React et Django REST Framework exposent le produit, mais ne définissent pas ses règles.
- La séparation restera pragmatique : aucun port, adapter ou abstraction ne sera créé sans collaboration réelle à isoler ou règle à protéger.
