# Registre des décisions produit — socle Organisation

Ce registre est la source canonique des décisions et arbitrages qui structurent le périmètre Organisation. Il ne décide rien à la place du produit. Une entrée `À arbitrer — bloquant` interdit de présenter les éléments cités comme prêts à raffiner ou à implémenter, sans transformer pour autant une Feature non raffinée en PBI.

## Décisions prises communes

- **Décision prise — cloisonnement :** le produit gère plusieurs organisations ; aucune donnée ou opération organisationnelle n’est lisible, associable, modifiable, agrégée ou révélée entre organisations sans règle de partage explicitement décidée.
- **Décision prise — équipe :** une équipe appartient obligatoirement à exactement une organisation à un instant donné ; archivage et réactivation ne changent pas ce rattachement. Un éventuel transfert reste soumis à `ARB-ORG-007`.
- **Décision prise — traçabilité :** les historiques conservent l’organisation qui donnait leur contexte aux faits enregistrés.
- **Décision prise — rôles :** `Admin`, `Coach` et `Viewer` sont les seuls rôles métier canoniques. La consultation sans compte est un mode d’accès, pas un quatrième rôle.
- **Décision prise — accès sans compte :** le besoin porte uniquement sur la consultation en lecture seule de résultats rendus accessibles par une décision de publication. Rien n’est public par défaut.
- **Décision prise — Superadmin technique :** le `Superadmin` désigne le superuser Django global. Le premier est créé par le mécanisme de bootstrap Django. Cette capacité technique n’est pas un quatrième rôle métier et n’est utilisable dans le backlog fonctionnel que lorsqu’un PBI la cite explicitement.
- **Décision prise — fonction utilisateur :** une identité gérée par `USER-001` à `USER-004` porte exactement une fonction métier parmi `Admin`, `Coach` et `Viewer` ; l’héritage de capacités n’est pas un cumul de rôles explicites.
- **Décision prise — droits CRUD Organisations et Équipes :** `Superadmin` et `Admin` peuvent créer, lire, modifier et supprimer ; `Coach` et `Viewer` peuvent uniquement lire. Cette décision porte sur le droit d’exercer l’action, pas sur le périmètre des objets accessibles.
- **Décision prise — suppression d’une équipe :** le `DELETE` d’une équipe réalise l’archivage métier défini par `TEAM-005` ; il ne supprime physiquement ni l’équipe ni son historique.

## Arbitrages

### ARB-ORG-001 — Cardinalité d’appartenance d’une identité

- **Décision prise :** les capacités d’un `Admin` ou d’un `Coach` s’exercent dans un périmètre organisationnel explicite ; aucune appartenance implicite n’est admise.
- **Décision à arbitrer — bloquante :** une identité peut-elle relever d’une seule ou de plusieurs organisations, pour chacun des rôles applicables, et avec quelles contraintes de cumul ?
- **Backlog bloqué :** raffinement et implémentation de `FEAT-037`, `FEAT-038` et des aspects organisationnels de `FEAT-004` ; les chemins `Admin` de `USER-002` à `USER-004`, `FEAT-003` et `FEAT-008` restent dépendants de ce socle.

### ARB-ORG-002 — Création de la première organisation

- **Décision prise :** toute organisation possède un identifiant stable et un état déterminable.
- **Décision prise :** le `Superadmin` peut créer la toute première organisation par `ORG-001`, avant qu’un `Admin` rattaché existe.
- **Arbitrage résolu :** l’autorité de création de la première organisation est décidée. L’ordre et le parcours de rattachement du premier `Admin` relèvent encore de `ARB-ORG-003` ; `ARB-ORG-002` ne bloque plus `ORG-001`.

### ARB-ORG-003 — Création et rattachement du premier Admin

- **Décision prise :** toute action administrative doit être attribuable et exercée dans le périmètre applicable.
- **Décision prise :** le premier `Superadmin`, créé par le bootstrap Django, peut créer la première identité de fonction `Admin` au titre de `USER-001` ; cette création ne vaut pas rattachement organisationnel.
- **Décision à arbitrer — bloquante :** comment cette première identité `Admin` est-elle rattachée à la première organisation, dans quel ordre par rapport à la création de celle-ci et avec quelle date d’effet ?
- **Backlog bloqué :** raffinement et implémentation de l’initialisation de `FEAT-037` et démarrage organisationnel de `PV-001`. La création de l’identité par le chemin `Superadmin` de `USER-001` n’est pas bloquée par cet arbitrage.

### ARB-ORG-004 — Données et unicité d’une organisation

- **Décision prise :** l’identité d’une organisation reste stable dans le temps.
- **Décision à arbitrer — bloquante :** quelles données sont obligatoires et quelle règle d’unicité identifie une organisation ?
- **Backlog bloqué :** implémentation de `ORG-001` et `ORG-003` dans `FEAT-036`.

### ARB-ORG-005 — États et cycle de vie d’une organisation

- **Décision prise :** toute transition conserve l’identité et l’historique ; aucun effet partiel n’est admis.
- **Décision à arbitrer — bloquante :** quels sont les états, l’état initial, les transitions autorisées et les effets de chaque état sur acteurs, équipes, rattachements et opérations ? Pour `ORG-004`, `DELETE` signifie-t-il suppression physique, archivage ou désactivation, et quelles sont ses conséquences sur les utilisateurs, équipes et historiques ?
- **Backlog bloqué :** `ORG-001`, `ORG-004`, `FEAT-037`, `FEAT-038`, `TEAM-001`, puis toute Feature qui doit refuser une organisation dans un état non admissible.

### ARB-ORG-006 — Changement ou transfert d’organisation d’un acteur

- **Décision prise :** aucun changement ne réécrit le contexte organisationnel des faits, affectations ou évaluations historiques ; aucun transfert implicite n’est permis.
- **Décision à arbitrer — bloquante :** changement ou transfert d’un `Admin` ou d’un `Coach`, autorité requise, date d’effet, traitement des liens courants et compatibilité avec une éventuelle multi-appartenance.
- **Backlog bloqué :** raffinement et implémentation des évolutions de rattachement de `FEAT-037` et `FEAT-038` ; règles dépendantes de `FEAT-003`, `FEAT-008` et `FEAT-009`.

### ARB-ORG-007 — Changement ou transfert d’organisation d’une équipe

- **Décision prise :** une équipe ne possède jamais plusieurs organisations simultanées et son organisation ne change jamais implicitement.
- **Décision à arbitrer — bloquante :** transfert autorisé ou interdit, autorité, date d’effet et traitement des coachs, modèles, passations, évaluations et historiques liés.
- **Backlog bloqué :** aucun PBI actuel ne porte ce transfert ; tout raffinement de cette capacité et les règles de continuité concernées de `FEAT-008`, `FEAT-009` et `FEAT-015` à `FEAT-027` restent bloqués.

### ARB-ORG-008 — Dernier Admin d’une organisation

- **Décision prise :** une organisation ne doit pas perdre silencieusement son administration ni la traçabilité des actions passées.
- **Décision à arbitrer — bloquante :** peut-on retirer, désactiver ou transférer le dernier `Admin`, sous quelles préconditions et avec quel mécanisme de reprise ?
- **Backlog bloqué :** raffinement et implémentation des retraits ou changements de rattachement dans `FEAT-037`, ainsi que le retrait d’un `Admin` par `USER-004` lorsqu’il est le dernier `Admin` de son organisation.

### ARB-ORG-009 — Portée de l’unicité du nom d’une équipe

- **Décision prise :** le nom est obligatoire, comparé sans tenir compte de la casse ni des espaces périphériques, et les équipes actives et archivées participent à la règle.
- **Décision à arbitrer — bloquante :** l’unicité s’applique-t-elle dans une organisation ou dans l’ensemble du système ?
- **Backlog bloqué :** implémentation de `TEAM-001` et `TEAM-004` ; les PBIs qui en dépendent ne sont pas prêts à être ordonnancés en aval.

### ARB-ORG-010 — Rattachement ou partage des modèles d’évaluation

- **Décision prise :** l’organisation d’origine d’un modèle reste déterminable et aucune association interorganisation n’est implicite.
- **Décision à arbitrer — bloquante :** un modèle est-il propre à son organisation ou partageable ; si partageable, par qui, vers qui, dans quels états et avec quels effets sur versions et retraits ?
- **Backlog bloqué :** raffinement et implémentation de `FEAT-011` à `FEAT-016`, puis parcours dépendants `FEAT-020` à `FEAT-027`.

### ARB-ORG-011 — Périmètre actif en cas de multi-appartenance

- **Décision prise :** chaque commande ou consultation possède un périmètre non ambigu et ne mélange pas implicitement plusieurs organisations.
- **Décision à arbitrer — bloquante :** si `ARB-ORG-001` autorise plusieurs appartenances, comment le périmètre actif est-il sélectionné, propagé, affiché et contrôlé ?
- **Backlog bloqué :** aspects organisationnels de `FEAT-004`, chemins `Admin` de `USER-002` à `USER-004` et toutes les Features exécutées par une identité multi-organisation ; aucune API concernée ne peut être contractualisée définitivement.

### ARB-ORG-012 — Périmètre du Viewer authentifié et cumul de rôles

- **Décision prise :** le `Viewer` est authentifié, consulte uniquement son périmètre accordé et reste distinct de la consultation sans compte. Une identité possède une seule fonction métier ; la hiérarchie de capacités ne constitue pas un cumul de rôles explicites.
- **Décision à arbitrer — bloquante :** mode d’attribution et de détermination du périmètre du `Viewer`.
- **Backlog bloqué :** raffinement des consultations authentifiées de `FEAT-004`, `FEAT-007`, `FEAT-014` et `FEAT-023` à `FEAT-027`, ainsi que les chemins `Admin` de `USER-002` à `USER-004` qui ciblent un `Viewer`.

### ARB-ORG-013 — Paramètres et vues multi-organisation

- **Décision prise :** chaque paramètre, vue et indicateur expose son organisation et aucune agrégation interorganisation n’est implicite.
- **Décision à arbitrer — bloquante :** paramètres strictement propres ou partageables, règles de partage et existence éventuelle d’une vue multi-organisation.
- **Backlog bloqué :** raffinement de `FEAT-031` et `FEAT-035`, puis règles dépendantes de `FEAT-017` à `FEAT-019` et `FEAT-028` à `FEAT-034`.

### ARB-ORG-014 — Publication de résultats pour consultation sans compte

- **Décision prise :** l’accès est strictement en lecture seule, porte uniquement sur des résultats explicitement publiés et ne confère aucun rôle métier ; aucune donnée organisationnelle n’est publique par défaut.
- **Décision à arbitrer — bloquante :** résultats publiables, granularité, auteur et révocation de la publication, mode d’accès, protection, durée, traçabilité et données masquées.
- **Backlog bloqué :** raffinement de l’accès sans compte dans `FEAT-023` à `FEAT-027` ; aucune implémentation de publication ou d’accès anonyme ne peut commencer.

### ARB-ORG-015 — Périmètre des opérations CRUD Organisations et Équipes

- **Décision prise :** la matrice CRUD commune détermine les acteurs autorisés à demander chaque action ; toute lecture hors périmètre ne révèle ni l’existence ni les données de l’objet, et tout refus d’écriture est sans effet partiel.
- **Décision à arbitrer — bloquante :** quels objets sont accessibles à chaque acteur autorisé ? En particulier, un `Admin` est-il limité à son organisation, peut-il créer une autre organisation, et comment le périmètre de lecture des `Coach` et `Viewer` est-il déterminé ?
- **Backlog bloqué :** contractualisation définitive des chemins non `Superadmin` de `ORG-001` à `ORG-004` et des contrôles de périmètre de `TEAM-001` à `TEAM-007`. `ARB-ORG-012` reste applicable au mode d’attribution du périmètre du `Viewer`.
