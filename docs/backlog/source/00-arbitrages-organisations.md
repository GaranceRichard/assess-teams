# Registre des décisions produit — socle Organisation

Ce registre est la source canonique des décisions et arbitrages qui structurent le périmètre Organisation. Il ne décide rien à la place du produit. Une entrée `À arbitrer — bloquant` interdit de présenter les éléments cités comme prêts à raffiner ou à implémenter, sans transformer pour autant une Feature non raffinée en PBI.

## Décisions prises communes

- **Décision prise — cloisonnement :** le produit gère plusieurs organisations ; aucune donnée ou opération organisationnelle n’est lisible, associable, modifiable, agrégée ou révélée entre organisations sans règle de partage explicitement décidée.
- **Décision prise — équipe :** une équipe appartient obligatoirement à exactement une organisation à un instant donné ; archivage et réactivation ne changent pas ce rattachement. Un éventuel transfert reste soumis à `ARB-ORG-007`.
- **Décision prise — traçabilité :** les historiques conservent l’organisation qui donnait leur contexte aux faits enregistrés.
- **Décision prise — authentification :** toute lecture de donnée métier exige une identité authentifiée.
- **Décision prise — rôles :** `Admin`, `Coach` et `Viewer` sont les seuls rôles métier canoniques et sont toujours authentifiés.
- **Décision prise — Organisation :** une Organisation possède un identifiant technique stable ; sa seule donnée métier obligatoire est `nom`.
- **Décision prise — Superadmin technique :** le `Superadmin` désigne le superuser Django global. Le premier est créé par le mécanisme de bootstrap Django. Cette capacité technique n’est pas un quatrième rôle métier et n’est utilisable dans le backlog fonctionnel que lorsqu’un PBI la cite explicitement.
- **Décision prise — fonction utilisateur :** une identité gérée par `USER-001` à `USER-004` porte exactement une fonction métier parmi `Admin`, `Coach` et `Viewer` ; l’héritage de capacités n’est pas un cumul de rôles explicites.
- **Décision prise — données utilisateur :** une identité métier comprend explicitement `nom`, `prénom` et `mail`. La relation entre `mail` et l’éventuel identifiant technique `username` n’est pas décidée et ne doit pas être déduite de cette décision.
- **Décision prise — périmètres CRUD Organisations et Équipes :** le `Superadmin` peut agir sur toutes les organisations. Un `Admin` peut créer une organisation, consulter la liste administrative globale et administrer les organisations auxquelles il est explicitement rattaché. `Coach` et `Viewer` peuvent uniquement lire les Organisations et Équipes de leur périmètre autorisé.
- **Décision prise — suppression d’une équipe :** le `DELETE` d’une équipe réalise l’archivage métier défini par `TEAM-005` ; il ne supprime physiquement ni l’équipe ni son historique.

## Arbitrages

### ARB-ORG-001 — Cardinalité d’appartenance d’une identité

- **Décision prise :** toute identité peut appartenir explicitement à une ou plusieurs organisations.
- **Décision prise :** une création d’organisation accepte un ou plusieurs utilisateurs et crée tous ces rattachements atomiquement.
- **Arbitrage résolu :** la cardinalité ne bloque plus `FEAT-037`, `FEAT-038` ni leurs parcours dépendants ; le choix d’un périmètre actif reste traité par `ARB-ORG-011`.

### ARB-ORG-002 — Création de la première organisation

- **Décision prise :** toute organisation possède un identifiant technique stable.
- **Décision prise :** le `Superadmin` ou un `Admin` peut créer une organisation par `ORG-001` et lui affecter immédiatement des utilisateurs.
- **Arbitrage résolu :** l’autorité de création et le rattachement initial sont décidés ; `ARB-ORG-002` ne bloque plus `ORG-001`.

### ARB-ORG-003 — Création et rattachement du premier Admin

- **Décision prise :** toute action administrative doit être attribuable et exercée dans le périmètre applicable.
- **Décision prise :** le premier `Superadmin`, créé par le bootstrap Django, peut créer la première identité de fonction `Admin` au titre de `USER-001` ; cette création ne vaut pas rattachement organisationnel.
- **Décision prise :** la création d’une organisation sélectionne au moins une identité existante et persiste ses rattachements dans la même transaction.
- **Arbitrage résolu :** le premier Admin peut ainsi être rattaché lors de la création de la première organisation.

### ARB-ORG-004 — Données et unicité d’une organisation

- **Décision prise :** l’identité d’une organisation reste stable dans le temps.
- **Décision prise :** `nom` est la seule donnée métier obligatoire d’une organisation. L’identifiant technique stable n’est pas une donnée métier saisie.
- **Décision prise :** aucune contrainte d’unicité ne s’applique au nom ; des organisations distinctes peuvent porter le même nom.
- **Arbitrage résolu :** l’unicité ne bloque plus `ORG-001` ni `ORG-003`.

### ARB-ORG-005 — États et cycle de vie d’une organisation

- **Décision prise :** toute transition conserve l’identité et l’historique ; aucun effet partiel n’est admis.
- **Décision prise :** la création initiale ne porte pas d’état de cycle de vie et n’est pas bloquée par l’absence de ce concept.
- **Décision à arbitrer — bloquante :** pour `ORG-004`, `DELETE` signifie-t-il suppression physique, archivage ou désactivation, et quelles sont ses conséquences sur les utilisateurs, équipes et historiques ?
- **Backlog bloqué :** `ORG-004` et toute Feature qui exige un cycle de vie explicite.

### ARB-ORG-006 — Changement ou transfert d’organisation d’un acteur

- **Décision prise :** aucun changement ne réécrit le contexte organisationnel des faits, affectations ou évaluations historiques ; aucun transfert implicite n’est permis.
- **Décision à arbitrer — bloquante :** ajout ou retrait ultérieur d’un rattachement, autorité requise, date d’effet et traitement des liens courants.
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
- **Décision prise :** la multi-appartenance est autorisée pour toutes les identités, sans mélange implicite des périmètres.
- **Décision à arbitrer — bloquante :** comment le périmètre actif est-il sélectionné, propagé, affiché et contrôlé pour les opérations qui en exigent un ?
- **Backlog bloqué :** toutes les Features multi-organisation qui exigent un périmètre actif ; la création d’une organisation et de ses rattachements n’en exige pas.

### ARB-ORG-012 — Périmètre du Viewer authentifié

- **Décision prise :** le `Viewer` est authentifié et consulte uniquement son périmètre accordé. Une identité possède une seule fonction métier ; la hiérarchie de capacités ne constitue pas un cumul de rôles explicites.
- **Décision prise :** le périmètre accordé provient des rattachements explicites du Viewer aux organisations.
- **Arbitrage résolu :** le choix d’un périmètre actif en cas de multi-appartenance reste porté par `ARB-ORG-011`.

### ARB-ORG-013 — Paramètres et vues multi-organisation

- **Décision prise :** chaque paramètre, vue et indicateur expose son organisation et aucune agrégation interorganisation n’est implicite.
- **Décision à arbitrer — bloquante :** paramètres strictement propres ou partageables, règles de partage et existence éventuelle d’une vue multi-organisation.
- **Backlog bloqué :** raffinement de `FEAT-031` et `FEAT-035`, puis règles dépendantes de `FEAT-017` à `FEAT-019` et `FEAT-028` à `FEAT-034`.

### ARB-ORG-015 — Périmètre des opérations CRUD Organisations et Équipes

- **Décision prise :** le `Superadmin` peut créer une organisation et agir sur toutes les organisations et leurs équipes.
- **Décision prise :** un `Admin` peut créer une organisation et lui affecter un ou plusieurs utilisateurs. Il administre les organisations auxquelles il est explicitement rattaché.
- **Décision prise :** `Coach` et `Viewer` peuvent uniquement lire les Organisations et Équipes de leur périmètre autorisé. Toute lecture de donnée métier exige une identité authentifiée. Toute lecture hors périmètre ne révèle ni l’existence ni les données de l’objet, et tout refus d’écriture est sans effet partiel.
- **Arbitrage résolu :** les périmètres CRUD sont décidés ; `ARB-ORG-015` ne bloque plus `ORG-001` à `ORG-004` ni `TEAM-001` à `TEAM-007`. `ARB-ORG-011` reste applicable au choix d’un périmètre actif.
