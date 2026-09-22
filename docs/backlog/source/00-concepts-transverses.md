# Concepts métier transverses

Ce document est la source fonctionnelle canonique des concepts partagés par plusieurs Epics. Les sources des Epics les référencent et n’en donnent pas de définition concurrente.

## Organisation

Le système gère plusieurs organisations. Une **Organisation** est le périmètre métier auquel sont rattachés les capacités des `Admin` et des `Coach`, ainsi que les équipes. Elle possède un identifiant technique stable et `nom` comme seule donnée métier obligatoire. Un `Admin` appartient à exactement une organisation ; la cardinalité du `Coach` reste à arbitrer dans `ARB-ORG-001`.

- toute équipe appartient à exactement une organisation à un instant donné ; son archivage ou sa réactivation ne change pas ce rattachement ;
- toute donnée ou opération métier doit permettre de déterminer sans ambiguïté son organisation, soit par rattachement direct, soit par un rattachement métier explicite à une donnée déjà rattachée ;
- une consultation, une commande, un calcul, une notification ou un indicateur est limité au périmètre organisationnel applicable à l’acteur ;
- aucune opération ne peut lire, associer, modifier, agréger ou révéler implicitement des données d’une autre organisation ;
- toute relation entre deux données organisationnelles exige qu’elles appartiennent à la même organisation, sauf règle de partage interorganisation explicitement arbitrée ; aucune règle de ce type n’est définie à ce jour ;
- les historiques conservent l’organisation qui donnait son contexte aux faits enregistrés.

Les décisions prises, décisions `À arbitrer — bloquant` et éléments du backlog bloqués sont tenus sans duplication dans le [registre des arbitrages Organisation](00-arbitrages-organisations.md).

## Identité utilisateur

Une identité métier comprend explicitement `nom`, `prénom`, `mail` et exactement une fonction parmi `Admin`, `Coach` et `Viewer`. La relation entre `mail` et l’éventuel identifiant technique `username` n’est pas décidée : elle devra être traitée comme une distinction technique ultérieure, sans déduire que le mail remplace l’identifiant d’authentification. La création d’une identité ne crée aucun rattachement organisationnel implicite.

## Rôles métier et capacités

Les seuls rôles métier canoniques sont `Admin`, `Coach` et `Viewer`. Ils désignent des acteurs authentifiés. Un qualificatif tel que « affecté », « responsable » ou « destinataire » précise un lien contextuel ; il ne crée pas un nouveau rôle.

Le `Superadmin` désigne le superuser Django global. C’est une capacité technique réservée au bootstrap et à l’administration explicitement prévue. Il n’est ni un quatrième rôle métier, ni une valeur supplémentaire de fonction utilisateur. Le premier `Superadmin` est créé par le mécanisme de bootstrap Django. Pour les Organisations et les Équipes, il peut agir sur toutes les organisations ; les autres opérations métier ne lui sont ouvertes que lorsqu’elles le citent explicitement.

| Rôle | Capacités cumulées | Périmètre |
| --- | --- | --- |
| `Admin` | fonctions `Admin`, `Coach` et `Viewer` | son unique organisation selon un rattachement explicite |
| `Coach` | fonctions `Coach` et `Viewer` | organisation applicable selon un rattachement explicite, puis équipe concernée lorsque la Feature exige une affectation |
| `Viewer` | consultation uniquement | périmètre organisationnel de consultation qui lui est accordé |

Une capacité héritée ne supprime pas les préconditions métier propres à l’action. Par exemple, une fonction exigeant le `Coach` affecté à une équipe conserve cette précondition lorsqu’elle est exercée par un `Admin`.

- parmi les rôles métier, une action d’administration est ouverte à `Admin` uniquement ; une ouverture au `Superadmin` doit rester explicite, comme dans la matrice CRUD Organisations et Équipes ci-dessous ;
- une action de coaching est ouverte à `Coach` et `Admin`, sous réserve des liens contextuels exigés ;
- une fonction de consultation déclarée pour `Viewer` est également ouverte à `Coach` et `Admin`, dans leur périmètre applicable ;
- un refus de rôle ou de périmètre ne modifie aucune donnée et ne révèle aucune donnée de l’autre organisation ;
- le présent vocabulaire décrit des capacités métier et ne prescrit aucune solution d’authentification ou de gestion technique des permissions.

Chaque utilisateur géré par `USER-001` à `USER-004` possède exactement une fonction métier parmi `Admin`, `Coach` et `Viewer`. La hiérarchie de capacités ci-dessus ne crée pas plusieurs rôles explicites sur son identité. Le `Superadmin` reste représenté séparément par sa capacité technique Django.

Le périmètre du `Viewer` authentifié relève de `ARB-ORG-012`.

### Matrice CRUD des Organisations

| Action | `Superadmin` | `Admin` | `Coach` | `Viewer` |
| --- | --- | --- | --- | --- |
| CREATE | Oui | Non | Non | Non |
| READ | Toutes | Son organisation | Périmètre autorisé | Périmètre autorisé |
| UPDATE | Toutes | Son organisation | Non | Non |
| DELETE | Toutes | Son organisation | Non | Non |

La sémantique du `DELETE` d’une Organisation reste à arbitrer dans `ARB-ORG-005`. Le mode d’attribution du périmètre du `Viewer` reste à arbitrer dans `ARB-ORG-012`.

### Matrice CRUD des Équipes

| Action | `Superadmin` | `Admin` | `Coach` | `Viewer` |
| --- | --- | --- | --- | --- |
| CREATE | Toutes les organisations | Son organisation | Non | Non |
| READ | Toutes les organisations | Son organisation | Périmètre autorisé | Périmètre autorisé |
| UPDATE | Toutes les organisations | Son organisation | Non | Non |
| DELETE | Toutes les organisations | Son organisation | Non | Non |

Pour les Équipes, `DELETE` réalise l’archivage canonique de `TEAM-005`. Pour les deux matrices, un refus de droit ou de périmètre intervient avant toute écriture, ne produit aucun effet partiel et ne révèle aucune donnée hors périmètre. Toute lecture de donnée métier exige une identité authentifiée.

## Authentification des consultations

Toute consultation exige une identité authentifiée portant une fonction `Admin`, `Coach` ou `Viewer`, ou la capacité technique `Superadmin` lorsqu’elle est explicitement prévue, et reste limitée à son périmètre autorisé.

## Rattachements et usages

| Concept ou donnée | Rattachement organisationnel canonique | Sources utilisatrices |
| --- | --- | --- |
| `Admin` | rattachement explicite à exactement une organisation | `FEAT-002`, `FEAT-004`, `FEAT-037` et toutes les Features administrées |
| `Coach` | au moins un rattachement explicite requis pour agir ; cardinalité à arbitrer | `FEAT-003`, `FEAT-004`, `FEAT-038`, `FEAT-008` à `FEAT-009`, `FEAT-020` à `FEAT-030`, `FEAT-032` |
| `Viewer` | périmètre de consultation applicable, modalité à arbitrer | toutes les Features de consultation |
| Équipe | rattachement direct et obligatoire à exactement une organisation | `FEAT-005` à `FEAT-010` et toutes les données rattachées à une équipe |
| Modèle et paramètres | rattachement ou partage à arbitrer, mais organisation d’origine toujours déterminable | `FEAT-011` à `FEAT-019`, `FEAT-031` |
| Passation, évaluation, échéance, notification et indicateur | organisation déterminée par l’équipe source et vérifiée avec les autres rattachements | `FEAT-018` à `FEAT-035` |

## Règle d’usage dans le backlog

Une source d’Epic ou de PBI indique les acteurs avec les rôles canoniques, les liens contextuels éventuels et les conséquences spécifiques à sa capacité. Elle renvoie au présent document pour la hiérarchie des rôles, le cloisonnement entre organisations et les rattachements communs. Une règle encore absente est référencée par son arbitrage ; une synthèse ne la complète jamais.
