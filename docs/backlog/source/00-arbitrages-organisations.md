# Registre des décisions produit — socle Organisation

Ce registre est la source canonique des décisions et arbitrages qui structurent le périmètre Organisation. Il ne décide rien à la place du produit. Une entrée `À arbitrer — bloquant` interdit de présenter les éléments cités comme prêts à raffiner ou à implémenter, sans transformer pour autant une Feature non raffinée en PBI.

## Décisions prises communes

- **Décision prise — cloisonnement :** le produit gère plusieurs organisations ; aucune donnée ou opération organisationnelle n’est lisible, associable, modifiable, agrégée ou révélée entre organisations sans règle de partage explicitement décidée.
- **Décision prise — équipe :** une équipe appartient obligatoirement à exactement une organisation à un instant donné ; archivage et réactivation ne changent pas ce rattachement. Un éventuel transfert reste soumis à `ARB-ORG-007`.
- **Décision prise — traçabilité :** les historiques conservent l’organisation qui donnait leur contexte aux faits enregistrés.
- **Décision prise — rôles :** `Admin`, `Coach` et `Viewer` sont les seuls rôles métier canoniques. La consultation sans compte est un mode d’accès, pas un quatrième rôle.
- **Décision prise — accès sans compte :** le besoin porte uniquement sur la consultation en lecture seule de résultats rendus accessibles par une décision de publication. Rien n’est public par défaut.

## Arbitrages bloquants

### ARB-ORG-001 — Cardinalité d’appartenance d’une identité

- **Décision prise :** les capacités d’un `Admin` ou d’un `Coach` s’exercent dans un périmètre organisationnel explicite ; aucune appartenance implicite n’est admise.
- **Décision à arbitrer — bloquante :** une identité peut-elle relever d’une seule ou de plusieurs organisations, pour chacun des rôles applicables, et avec quelles contraintes de cumul ?
- **Backlog bloqué :** raffinement et implémentation de `FEAT-037`, `FEAT-038` et des aspects organisationnels de `FEAT-004` ; `FEAT-003` et `FEAT-008` restent dépendantes de ce socle.

### ARB-ORG-002 — Création de la première organisation

- **Décision prise :** toute organisation possède un identifiant stable et un état déterminable.
- **Décision à arbitrer — bloquante :** quelle autorité et quel parcours peuvent créer la toute première organisation, avant qu’un `Admin` rattaché existe ?
- **Backlog bloqué :** raffinement et implémentation de l’initialisation portée par `FEAT-036`, donc démarrage du parcours `PV-001`.

### ARB-ORG-003 — Création et rattachement du premier Admin

- **Décision prise :** toute action administrative doit être attribuable et exercée dans le périmètre applicable.
- **Décision à arbitrer — bloquante :** comment la première identité `Admin` est-elle créée, habilitée et rattachée à la première organisation, et par quelle autorité ?
- **Backlog bloqué :** raffinement et implémentation de l’initialisation de `FEAT-037`, articulation avec `FEAT-001`, `FEAT-002` et `FEAT-004`, donc démarrage de `PV-001`.

### ARB-ORG-004 — Données et unicité d’une organisation

- **Décision prise :** l’identité d’une organisation reste stable dans le temps.
- **Décision à arbitrer — bloquante :** quelles données sont obligatoires et quelle règle d’unicité identifie une organisation ?
- **Backlog bloqué :** raffinement et implémentation de la création et de la modification dans `FEAT-036`.

### ARB-ORG-005 — États et cycle de vie d’une organisation

- **Décision prise :** toute transition conserve l’identité et l’historique ; aucun effet partiel n’est admis.
- **Décision à arbitrer — bloquante :** quels sont les états, l’état initial, les transitions autorisées et les effets de chaque état sur acteurs, équipes, rattachements et opérations ?
- **Backlog bloqué :** `FEAT-036` à `FEAT-038`, `TEAM-001`, puis toute Feature qui doit refuser une organisation dans un état non admissible.

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
- **Backlog bloqué :** raffinement et implémentation des retraits ou changements de rattachement dans `FEAT-037`, avec incidence sur `FEAT-002`.

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
- **Backlog bloqué :** aspects organisationnels de `FEAT-004` et toutes les Features exécutées par une identité multi-organisation ; aucune API concernée ne peut être contractualisée définitivement.

### ARB-ORG-012 — Périmètre du Viewer authentifié et cumul de rôles

- **Décision prise :** le `Viewer` est authentifié, consulte uniquement son périmètre accordé et reste distinct de la consultation sans compte.
- **Décision à arbitrer — bloquante :** mode d’attribution du périmètre du `Viewer` et cumul éventuel de rôles explicites au-delà de la hiérarchie de capacités.
- **Backlog bloqué :** raffinement des consultations authentifiées de `FEAT-004`, `FEAT-007`, `FEAT-014` et `FEAT-023` à `FEAT-027`.

### ARB-ORG-013 — Paramètres et vues multi-organisation

- **Décision prise :** chaque paramètre, vue et indicateur expose son organisation et aucune agrégation interorganisation n’est implicite.
- **Décision à arbitrer — bloquante :** paramètres strictement propres ou partageables, règles de partage et existence éventuelle d’une vue multi-organisation.
- **Backlog bloqué :** raffinement de `FEAT-031` et `FEAT-035`, puis règles dépendantes de `FEAT-017` à `FEAT-019` et `FEAT-028` à `FEAT-034`.

### ARB-ORG-014 — Publication de résultats pour consultation sans compte

- **Décision prise :** l’accès est strictement en lecture seule, porte uniquement sur des résultats explicitement publiés et ne confère aucun rôle métier ; aucune donnée organisationnelle n’est publique par défaut.
- **Décision à arbitrer — bloquante :** résultats publiables, granularité, auteur et révocation de la publication, mode d’accès, protection, durée, traçabilité et données masquées.
- **Backlog bloqué :** raffinement de l’accès sans compte dans `FEAT-023` à `FEAT-027` ; aucune implémentation de publication ou d’accès anonyme ne peut commencer.
