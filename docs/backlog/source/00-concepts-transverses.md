# Concepts métier transverses

Ce document est la source fonctionnelle canonique des concepts partagés par plusieurs Epics. Les sources des Epics les référencent et n’en donnent pas de définition concurrente.

## Organisation

Le système gère plusieurs organisations. Une **Organisation** est le périmètre métier auquel sont obligatoirement rattachés les `Admin`, les `Coach` et les équipes.

- toute équipe appartient à exactement une organisation pendant tout son cycle de vie ; son archivage ou sa réactivation ne change pas ce rattachement ;
- toute donnée ou opération métier doit permettre de déterminer sans ambiguïté son organisation, soit par rattachement direct, soit par un rattachement métier explicite à une donnée déjà rattachée ;
- une consultation, une commande, un calcul, une notification ou un indicateur est limité au périmètre organisationnel applicable à l’acteur ;
- aucune opération ne peut lire, associer, modifier, agréger ou révéler implicitement des données d’une autre organisation ;
- toute relation entre deux données organisationnelles exige qu’elles appartiennent à la même organisation, sauf règle de partage interorganisation explicitement arbitrée ; aucune règle de ce type n’est définie à ce jour ;
- les historiques conservent l’organisation qui donnait son contexte aux faits enregistrés.

Les règles suivantes ne sont pas encore décidées et ne doivent pas être déduites par une implémentation :

- **À arbitrer :** données obligatoires, règle d’unicité et états précis d’une organisation ;
- **À arbitrer :** transitions autorisées du cycle de vie d’une organisation et effets de chaque état sur les rattachements ou opérations existants ;
- **À arbitrer :** possibilité pour une même identité de relever de plusieurs organisations et modalités de sélection du périmètre actif ;
- **À arbitrer :** modalités de transfert d’un acteur ou d’une équipe entre organisations ; aucun transfert implicite n’est permis ;
- **À arbitrer :** caractère propre à une organisation ou partageable des modèles d’évaluation et des paramètres, ainsi que les règles de partage éventuelles ;
- **À arbitrer :** portée de l’unicité du nom d’une équipe : au sein d’une organisation ou dans l’ensemble du système. Le traitement des équipes actives et archivées reste celui défini dans `TEAM-001`.

## Rôles métier et capacités

Les seuls rôles métier canoniques sont `Admin`, `Coach` et `Viewer`. Un qualificatif tel que « affecté », « responsable » ou « destinataire » précise un lien contextuel ; il ne crée pas un nouveau rôle.

| Rôle | Capacités cumulées | Périmètre |
| --- | --- | --- |
| `Admin` | fonctions `Admin`, `Coach` et `Viewer` | organisation à laquelle l’`Admin` est rattaché |
| `Coach` | fonctions `Coach` et `Viewer` | organisation à laquelle le `Coach` est rattaché, puis équipe concernée lorsque la Feature exige une affectation |
| `Viewer` | consultation uniquement | périmètre organisationnel de consultation qui lui est accordé |

Une capacité héritée ne supprime pas les préconditions métier propres à l’action. Par exemple, une fonction exigeant le `Coach` affecté à une équipe conserve cette précondition lorsqu’elle est exercée par un `Admin`.

- une action d’administration est ouverte à `Admin` uniquement ;
- une action de coaching est ouverte à `Coach` et `Admin`, sous réserve des liens contextuels exigés ;
- une fonction de consultation déclarée pour `Viewer` est également ouverte à `Coach` et `Admin`, dans leur périmètre applicable ;
- un refus de rôle ou de périmètre ne modifie aucune donnée et ne révèle aucune donnée de l’autre organisation ;
- le présent vocabulaire décrit des capacités métier et ne prescrit aucune solution d’authentification ou de gestion technique des permissions.

**À arbitrer :** mode d’attribution du périmètre organisationnel d’un `Viewer`, ainsi que la possibilité de cumuler plusieurs rôles explicites au-delà de la hiérarchie de capacités définie ci-dessus.

## Rattachements et usages

| Concept ou donnée | Rattachement organisationnel canonique | Sources utilisatrices |
| --- | --- | --- |
| `Admin` | rattachement explicite à une organisation | `FEAT-002`, `FEAT-004`, `FEAT-037` et toutes les Features administrées |
| `Coach` | rattachement explicite à une organisation | `FEAT-003`, `FEAT-004`, `FEAT-038`, `FEAT-008` à `FEAT-009`, `FEAT-020` à `FEAT-030`, `FEAT-032` |
| `Viewer` | périmètre de consultation applicable, modalité à arbitrer | toutes les Features de consultation |
| Équipe | rattachement direct et obligatoire à exactement une organisation | `FEAT-005` à `FEAT-010` et toutes les données rattachées à une équipe |
| Modèle et paramètres | rattachement ou partage à arbitrer, mais organisation d’origine toujours déterminable | `FEAT-011` à `FEAT-019`, `FEAT-031` |
| Passation, évaluation, échéance, notification et indicateur | organisation déterminée par l’équipe source et vérifiée avec les autres rattachements | `FEAT-018` à `FEAT-035` |

## Règle d’usage dans le backlog

Une source d’Epic ou de PBI indique les acteurs avec les rôles canoniques, les liens contextuels éventuels et les conséquences spécifiques à sa capacité. Elle renvoie au présent document pour la hiérarchie des rôles, le cloisonnement entre organisations et les rattachements communs. Une règle encore absente est marquée `À arbitrer` ; une synthèse ne la complète jamais.
