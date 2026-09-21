# Concepts métier transverses

Ce document est la source fonctionnelle canonique des concepts partagés par plusieurs Epics. Les sources des Epics les référencent et n’en donnent pas de définition concurrente.

## Organisation

Le système gère plusieurs organisations. Une **Organisation** est le périmètre métier auquel sont rattachés les capacités des `Admin` et des `Coach`, ainsi que les équipes. La cardinalité des appartenances d’une identité reste à arbitrer.

- toute équipe appartient à exactement une organisation à un instant donné ; son archivage ou sa réactivation ne change pas ce rattachement ;
- toute donnée ou opération métier doit permettre de déterminer sans ambiguïté son organisation, soit par rattachement direct, soit par un rattachement métier explicite à une donnée déjà rattachée ;
- une consultation, une commande, un calcul, une notification ou un indicateur est limité au périmètre organisationnel applicable à l’acteur ;
- aucune opération ne peut lire, associer, modifier, agréger ou révéler implicitement des données d’une autre organisation ;
- toute relation entre deux données organisationnelles exige qu’elles appartiennent à la même organisation, sauf règle de partage interorganisation explicitement arbitrée ; aucune règle de ce type n’est définie à ce jour ;
- les historiques conservent l’organisation qui donnait son contexte aux faits enregistrés.

Les décisions prises, décisions `À arbitrer — bloquant` et éléments du backlog bloqués sont tenus sans duplication dans le [registre des arbitrages Organisation](00-arbitrages-organisations.md).

## Rôles métier et capacités

Les seuls rôles métier canoniques sont `Admin`, `Coach` et `Viewer`. Ils désignent des acteurs authentifiés. Un qualificatif tel que « affecté », « responsable » ou « destinataire » précise un lien contextuel ; il ne crée pas un nouveau rôle.

| Rôle | Capacités cumulées | Périmètre |
| --- | --- | --- |
| `Admin` | fonctions `Admin`, `Coach` et `Viewer` | organisation applicable à l’action selon un rattachement explicite |
| `Coach` | fonctions `Coach` et `Viewer` | organisation applicable selon un rattachement explicite, puis équipe concernée lorsque la Feature exige une affectation |
| `Viewer` | consultation uniquement | périmètre organisationnel de consultation qui lui est accordé |

Une capacité héritée ne supprime pas les préconditions métier propres à l’action. Par exemple, une fonction exigeant le `Coach` affecté à une équipe conserve cette précondition lorsqu’elle est exercée par un `Admin`.

- une action d’administration est ouverte à `Admin` uniquement ;
- une action de coaching est ouverte à `Coach` et `Admin`, sous réserve des liens contextuels exigés ;
- une fonction de consultation déclarée pour `Viewer` est également ouverte à `Coach` et `Admin`, dans leur périmètre applicable ;
- un refus de rôle ou de périmètre ne modifie aucune donnée et ne révèle aucune donnée de l’autre organisation ;
- le présent vocabulaire décrit des capacités métier et ne prescrit aucune solution d’authentification ou de gestion technique des permissions.

Le périmètre du `Viewer` authentifié et le cumul éventuel de rôles relèvent de `ARB-ORG-012`.

## Consultation sans compte

La consultation sans compte répond au besoin d’une personne non inscrite de consulter uniquement des résultats explicitement rendus accessibles. Elle n’est pas un rôle métier et ne doit jamais être assimilée au `Viewer` authentifié.

- elle est strictement en lecture seule et n’accorde aucune capacité `Admin`, `Coach` ou `Viewer` ;
- elle ne donne accès ni aux brouillons, ni aux opérations, ni aux données d’une organisation par simple appartenance ou découverte d’un identifiant ;
- aucune donnée organisationnelle, équipe, identité, modèle, réponse ou résultat ne devient implicitement publique ;
- le périmètre exact, le mode de publication et la protection sont `À arbitrer — bloquant` dans `ARB-ORG-014`.

## Rattachements et usages

| Concept ou donnée | Rattachement organisationnel canonique | Sources utilisatrices |
| --- | --- | --- |
| `Admin` | au moins un rattachement explicite requis pour agir ; cardinalité à arbitrer | `FEAT-002`, `FEAT-004`, `FEAT-037` et toutes les Features administrées |
| `Coach` | au moins un rattachement explicite requis pour agir ; cardinalité à arbitrer | `FEAT-003`, `FEAT-004`, `FEAT-038`, `FEAT-008` à `FEAT-009`, `FEAT-020` à `FEAT-030`, `FEAT-032` |
| `Viewer` | périmètre de consultation applicable, modalité à arbitrer | toutes les Features de consultation |
| Consultation sans compte | aucun rattachement ni rôle ; résultats explicitement publiés uniquement, modalités à arbitrer | `FEAT-023` à `FEAT-027` |
| Équipe | rattachement direct et obligatoire à exactement une organisation | `FEAT-005` à `FEAT-010` et toutes les données rattachées à une équipe |
| Modèle et paramètres | rattachement ou partage à arbitrer, mais organisation d’origine toujours déterminable | `FEAT-011` à `FEAT-019`, `FEAT-031` |
| Passation, évaluation, échéance, notification et indicateur | organisation déterminée par l’équipe source et vérifiée avec les autres rattachements | `FEAT-018` à `FEAT-035` |

## Règle d’usage dans le backlog

Une source d’Epic ou de PBI indique les acteurs avec les rôles canoniques, la consultation sans compte lorsqu’elle s’applique, les liens contextuels éventuels et les conséquences spécifiques à sa capacité. Elle renvoie au présent document pour la hiérarchie des rôles, le cloisonnement entre organisations et les rattachements communs. Une règle encore absente est référencée par son arbitrage ; une synthèse ne la complète jamais.
