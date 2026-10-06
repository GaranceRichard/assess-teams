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
- **Décision prise — périmètres CRUD Organisations et Équipes :** le `Superadmin` agit globalement et lui seul crée ou supprime une organisation. Un `Admin` administre sans suppression son unique organisation d'affectation. `Coach` et `Viewer` conservent leur périmètre autorisé.
- **Décision prise — suppression d’une équipe :** le `DELETE` d’une équipe réalise l’archivage métier défini par `TEAM-005` ; il ne supprime physiquement ni l’équipe ni son historique.

## Arbitrages

### ARB-ORG-001 — Cardinalité d’appartenance d’une identité

- **Décision prise :** un `Admin`, un `Coach` ou un `Viewer` appartient au plus à une organisation. Une organisation peut compter plusieurs Admins pairs.
- **Décision prise :** une création d’organisation accepte un ou plusieurs utilisateurs et crée tous ces rattachements atomiquement.
- **Décision prise :** l’ajout de tout rôle métier dans une seconde organisation est refusé atomiquement ; une migration ne supprime jamais arbitrairement un rattachement historique.
- **Arbitrage résolu :** la cardinalité ne bloque plus `FEAT-037`, `FEAT-038` ni leurs parcours dépendants ; le choix d’un périmètre actif reste traité par `ARB-ORG-011`.

### ARB-ORG-002 — Création de la première organisation

- **Décision prise :** toute organisation possède un identifiant technique stable.
- **Décision prise :** seul le `Superadmin` crée une organisation et lui affecte immédiatement des utilisateurs.
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

- **Décision prise :** `DELETE` réalise une suppression physique de l’organisation, réservée au `Superadmin`.
- **Décision prise :** les rattachements de membres sont supprimés avec l’organisation, mais les identités sont conservées.
- **État réel :** des équipes, modèles d’évaluation et planifications dépendent désormais de l’organisation ; leur suppression en cascade est actuellement possible et n’est pas couverte par la décision historique.
- **Décision à arbitrer — bloquante :** refus de suppression, archivage ou suppression explicite des données dépendantes, avec règle propre pour les historiques et journaux.
- **Décision prise :** la création initiale ne porte pas d’état de cycle de vie et n’est pas bloquée par l’absence de ce concept.
- **Backlog bloqué :** `ORG-004` tant que le comportement avec dépendances n’est pas décidé et protégé ; la suppression d’une organisation vide livrée le 2026-09-24 reste un socle partiel.

### ARB-ORG-006 — Changement ou transfert d’organisation d’un acteur

- **Décision prise :** aucun changement ne réécrit le contexte organisationnel des faits, affectations ou évaluations historiques ; aucun transfert implicite n’est permis.
- **Décision prise :** le `Superadmin` peut ajouter ou retirer les membres courants de toute organisation ; un `Admin` le peut pour une organisation à laquelle il est rattaché. La nouvelle liste est appliquée atomiquement et conserve au moins un membre.
- **Décision prise :** cette gestion du rattachement courant ne date pas les changements et ne réécrit aucun fait historique.
- **Backlog restant bloqué :** les règles exigeant une date d’effet ou le traitement de liens métier courants dans `FEAT-003`, `FEAT-008` et `FEAT-009`.

### ARB-ORG-007 — Changement ou transfert d’organisation d’une équipe

- **Décision prise :** une équipe ne possède jamais plusieurs organisations simultanées et son organisation ne change jamais implicitement.
- **Décision à arbitrer — bloquante :** transfert autorisé ou interdit, autorité, date d’effet et traitement des coachs, modèles, passations, évaluations et historiques liés.
- **Backlog bloqué :** aucun PBI actuel ne porte ce transfert ; tout raffinement de cette capacité et les règles de continuité concernées de `FEAT-008`, `FEAT-009` et `FEAT-015` à `FEAT-027` restent bloqués.

### ARB-ORG-008 — Dernier Admin d’une organisation

- **Statut :** résolu le 2026-10-06 pour le lifecycle User et les rattachements courants.
- **Décision :** une organisation présente conserve au moins un Admin métier actif ; le Superadmin ne compte pas comme Admin métier.
- **Règle livrée :** désactivation/rétrogradation/retrait du dernier Admin actif refusés atomiquement ; affecter ou activer d’abord un autre Admin.
- **Concurrence :** verrou avant lecture des invariants, test SQLite fichier avec opérations concurrentes.
- **Lifecycle :** désactivation réversible, réactivation explicite, aucune suppression physique produit ni restauration implicite de responsabilité.
- **Preuves :** [contrat et audit User](../../architecture/user-lifecycle.md), API/transactions/tests, UI et Journal.
- **Limites :** transfert et lifecycle Organisation non traités ; aucune attribution automatique pour réparer une organisation historique sans Admin actif.

### ARB-ORG-009 — Portée de l’unicité du nom d’une équipe

- **Décision prise :** le nom est obligatoire et unique dans une organisation, comparé sans tenir compte de la casse ni des espaces périphériques ; les équipes actives et archivées participent à la règle.
- **Portée :** deux organisations distinctes peuvent porter des équipes de même nom.
- **Backlog débloqué :** `TEAM-001` et `TEAM-004` peuvent appliquer cette règle sans arbitrage supplémentaire.

### ARB-ORG-010 — Rattachement ou partage des modèles d’évaluation

- **Socle livré :** chaque modèle appartient actuellement à une seule organisation et une planification refuse tout croisement équipe–modèle interorganisation.
- **Décision à arbitrer — bloquante :** un modèle est-il propre à son organisation ou partageable ; si partageable, par qui, vers qui, dans quels états et avec quels effets sur versions et retraits ?
- **Backlog restant bloqué :** tout partage futur, la publication/versioning et les parcours dépendants qui exigent ces décisions ; le CRUD local régularisé par `EVAL-001` et la planification locale de `PLAN-001` ne tranchent pas ce partage.

### ARB-ORG-011 — Périmètre actif en cas de multi-appartenance

- **Décision prise :** chaque commande ou consultation possède un périmètre non ambigu et ne mélange pas implicitement plusieurs organisations.
- **Décision prise :** le périmètre actif d'un Admin est son unique organisation d'affectation ; aucun sélecteur multi-organisation n'est nécessaire.
- **Arbitrage résolu :** les Features organisationnelles appliquent directement ce rattachement unique.

### ARB-ORG-012 — Périmètre du Viewer authentifié

- **Décision prise :** le `Viewer` est authentifié et consulte uniquement son périmètre accordé. Une identité possède une seule fonction métier ; la hiérarchie de capacités ne constitue pas un cumul de rôles explicites.
- **Décision prise :** Viewer consulte les résultats COMPLETED de son unique organisation de rattachement (radar et longitudinal), sans accès Utilisateurs/Équipes, administration ni mutation métier.
- **Arbitrage résolu :** le choix d’un périmètre actif en cas de multi-appartenance reste porté par `ARB-ORG-011`.

### ARB-ORG-013 — Paramètres et vues multi-organisation

- **Décision prise :** chaque paramètre, vue et indicateur expose son organisation et aucune agrégation interorganisation n’est implicite.
- **Décision à arbitrer — bloquante :** paramètres strictement propres ou partageables, règles de partage et existence éventuelle d’une vue multi-organisation.
- **Backlog bloqué :** raffinement de `FEAT-031` et `FEAT-035`, puis règles dépendantes de `FEAT-017` à `FEAT-019` et `FEAT-028` à `FEAT-034`.

### ARB-ORG-015 — Périmètre des opérations CRUD Organisations et Équipes

- **Décision prise :** le `Superadmin` peut créer une organisation, agir sur toutes les organisations et leurs équipes, et supprimer physiquement une organisation.
- **Décision prise :** un `Admin` administre sans suppression son unique organisation et ne peut jamais modifier ses Admins. Seul le Superadmin crée une organisation et administre les comptes Admin.
- **Décision prise :** `Coach` conserve la consultation dans son périmètre autorisé. Viewer n’accède à l’organisation et aux équipes que via leurs résultats COMPLETED, jamais via les écrans/API d’administration. Toute lecture de donnée métier exige une identité authentifiée. Toute lecture hors périmètre ne révèle ni l’existence ni les données de l’objet, et tout refus d’écriture est sans effet partiel.
- **Arbitrage résolu :** les périmètres CRUD sont décidés ; `ARB-ORG-015` ne bloque plus `ORG-001` à `ORG-004` ni `TEAM-001` à `TEAM-007`. `ARB-ORG-011` reste applicable au choix d’un périmètre actif.
