# Synthèse du backlog

Cette page est la vue dérivée du suivi courant. Les [sources fonctionnelles](README.md#source-fonctionnelle-détaillée)
font autorité pour le périmètre ; le [registre canonique](tracking/pbis.md) fait autorité pour les statuts et dates.
Les PBIs signalés comme régularisations décrivent des comportements déjà livrés sans prétendre qu’ils avaient été
planifiés avant leur implémentation. L’avancement mesure les PBIs raffinés, pas la complétude du produit entier.

## Produit réellement disponible au 2026-09-29

- session par login/logout, reprise de session, invitations et choix du mot de passe ;
- liste et administration hiérarchique des comptes, avec écarts au contrat `USER-002` à `USER-004` ;
- organisations : création, liste/détail Admin-Superadmin, renommage et gestion des membres ;
- équipes : liste active Admin-Superadmin, création, renommage, archivage et Coachs courants ;
- modèles locaux : CRUD des modèles et questions à ordre d’ajout automatique, sans publication ni version ;
- planification locale : équipe, modèle, responsable, immédiat/ponctuel/mensuel/trimestriel et échéances ;
- courriels de confirmation et d’échéance, avec commande de traitement différé ;
- Journal d’activité et Journal des erreurs distincts, filtrables, paginés et en lecture seule ;
- health check, réglages development/production, OpenAPI, CI et quality gates documentés techniquement.

La passation `/evaluations`, les résultats `/results`, le pilotage `/steering` et le tableau de bord générique
restent des placeholders. La présence de leurs routes ne constitue pas une livraison fonctionnelle.

## Vue d’ensemble

| Epic | Features | PBI | Réalisés | Avancement |
| --- | ---: | ---: | ---: | ---: |
| EPIC-001 — Identités, coachs et habilitations | 4 | 5 | 2 | 40 % |
| EPIC-002 — Gestion des équipes | 4 | 7 | 2 | 29 % |
| EPIC-002A — Accompagnement des équipes | 2 | 1 | 1 | 100 % |
| EPIC-003 — Référentiel des modèles d’évaluation | 4 | 1 | 1 | 100 % |
| EPIC-004 — Affectations et planification des évaluations | 5 | 1 | 1 | 100 % |
| EPIC-005 — Passation et preuve d’évaluation | 4 | 0 | 0 | N/A |
| EPIC-006 — Suivi longitudinal | 4 | 0 | 0 | N/A |
| EPIC-007 — Notifications du dispositif | 3 | 1 | 1 | 100 % |
| EPIC-008 — Pilotage du dispositif | 5 | 0 | 0 | N/A |
| EPIC-009 — Gestion des organisations | 3 | 6 | 4 | 67 % |
| EPIC-010 — Traçabilité opérationnelle | 2 | 2 | 2 | 100 % |

Un Epic à 100 % signifie seulement que tous ses PBIs actuellement raffinés sont réalisés ; les Features non
raffinées et les limites explicites des PBIs restent hors du dénominateur.

## État de raffinement des Features

| Epic | Features raffinées | Features non raffinées |
| --- | --- | --- |
| EPIC-001 | `FEAT-001`, `FEAT-002` | `FEAT-003`, `FEAT-004` |
| EPIC-002 | `FEAT-005`, `FEAT-006`, `FEAT-007`, `FEAT-010` | aucune |
| EPIC-002A | `FEAT-008` | `FEAT-009` |
| EPIC-003 | `FEAT-011` | `FEAT-012`, `FEAT-013`, `FEAT-014` |
| EPIC-004 | `FEAT-017` | `FEAT-015`, `FEAT-016`, `FEAT-018`, `FEAT-019` |
| EPIC-005 | aucune | `FEAT-020` à `FEAT-023` |
| EPIC-006 | aucune | `FEAT-024` à `FEAT-027` |
| EPIC-007 | `FEAT-030` | `FEAT-028`, `FEAT-029` |
| EPIC-008 | aucune | `FEAT-031` à `FEAT-035` |
| EPIC-009 | `FEAT-036`, `FEAT-037`, `FEAT-038` | aucune |
| EPIC-010 | `FEAT-039`, `FEAT-040` | aucune |

## Suivi des PBIs raffinés

| PBI | Statut | Écart ou preuve principale |
| --- | --- | --- |
| AUTH-001 — Ouvrir et fermer une session produit | Réalisé | API, UI et E2E d’authentification ; 2026-09-22 |
| USER-001 — Créer un utilisateur | Réalisé | contrat historique ; 2026-09-21 |
| USER-002 — Consulter les utilisateurs | Ouvert | liste livrée ; détail et `nom`/`prénom` absents |
| USER-003 — Modifier un utilisateur | Ouvert | édition présente, mais identifiant/fonction mutables et noms absents |
| USER-004 — Supprimer un utilisateur | Bloqué | suppression physique au lieu de désactivation ; `ARB-ORG-008` |
| ORG-001 — Créer une organisation | Réalisé | création et rattachements atomiques ; 2026-09-24 |
| ORG-002 — Consulter les organisations | Ouvert | Superadmin/Admin livrés ; Coach/Viewer absents |
| ORG-003 — Modifier une organisation | Réalisé | renommage cloisonné ; 2026-09-24 |
| ORG-004 — Supprimer une organisation | Bloqué | cascade actuelle sur données dépendantes ; `ARB-ORG-005` |
| ORG-005 — Gérer le rattachement courant des Admins | Réalisé | scope et protection des pairs ; 2026-09-28 |
| ORG-006 — Gérer le rattachement courant d’un Coach | Réalisé | cardinalité et scope ; 2026-09-28 |
| TEAM-001 — Créer une équipe | Réalisé | API/UI/tests et unicité organisationnelle ; 2026-09-27 |
| TEAM-002 — Lister les équipes | Ouvert | Admin/Superadmin seulement |
| TEAM-003 — Consulter une équipe | Ouvert | détail par identifiant absent |
| TEAM-004 — Modifier une équipe | Réalisé | renommage cloisonné ; 2026-09-27 |
| TEAM-005 — Archiver une équipe | Ouvert | archivage livré ; restitution archivée et second refus absents |
| TEAM-006 — Consulter les équipes archivées | Ouvert | absent |
| TEAM-007 — Réactiver une équipe | Ouvert | absent |
| COACH-001 — Affecter les Coachs courants d’une équipe | Réalisé | affectation locale multi-Coachs ; 2026-09-27 |
| EVAL-001 — Administrer un modèle local et ses questions ordonnées | Réalisé | CRUD local sans publication/version ; 2026-09-28 |
| PLAN-001 — Planifier un modèle local pour une équipe | Réalisé | quatre modes, responsable et CRUD ; 2026-09-29 |
| NOTIF-001 — Remettre les notifications de planification par courriel | Réalisé | confirmation, échéance et récurrence ; 2026-09-28 |
| JOURNAL-001 — Consulter les activités métier réussies | Réalisé | journal cloisonné et testé ; 2026-09-28 |
| JOURNAL-002 — Consulter les opérations en erreur | Réalisé | erreurs nettoyées et cloisonnées ; 2026-09-28 |

## Écarts et décisions encore ouverts

- `ARB-ORG-005` doit décider le traitement des équipes, modèles et planifications avant de rétablir `ORG-004`.
- `ARB-ORG-008` reste nécessaire pour le dernier Admin ; le `DELETE` utilisateur actuel contourne la protection.
- `ARB-ORG-010` reste ouvert pour un éventuel partage de modèles ; le code ne livre qu’un périmètre strictement local.
- `ARB-ORG-006`, `ARB-ORG-007` et `ARB-ORG-013` restent ouverts pour historique des rattachements, transfert d’équipe et partage/agrégation.
- modèles publiés/versionnés, passations, résultats, suivi longitudinal, retards et pilotage restent non réalisés.
- la notification livrée est un courriel direct sans état durable de remise, préférence de canal ni déduplication métier historisée.

## Matrices CRUD réellement protégées par le backend

| Objet | `Superadmin` | `Admin` | `Coach` | `Viewer` |
| --- | --- | --- | --- | --- |
| Organisation | CRUD global | lecture/mise à jour de son organisation | aucun endpoint Organisation | aucun endpoint Organisation |
| Équipe | création/liste/mise à jour/archivage global | mêmes actions dans son organisation | aucune lecture d’équipe par API | aucune lecture d’équipe par API |
| Utilisateur | liste et gestion hors soi-même | membres non-Admin de son organisation | liste et gestion des Viewers de son organisation | liste seule de son organisation |
| Modèle/planification | gestion globale | gestion dans son organisation | aucune gestion | aucune gestion |
| Journaux | lecture globale | lecture de son organisation | refus | refus |

## Scoring global

| Indicateur | Valeur |
| --- | ---: |
| Nombre d’Epics | 11 |
| Nombre de Features | 40 |
| Features raffinées | 15 |
| Features non raffinées | 25 |
| Nombre total de PBIs | 24 |
| PBIs ouverts | 8 |
| PBIs en cours | 0 |
| PBIs bloqués | 2 |
| PBIs non réalisés | 10 |
| PBIs réalisés | 14 |
| Avancement global | 58 % |
