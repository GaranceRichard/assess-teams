# Synthèse du backlog

Cette page est la vue dérivée du suivi courant. Les [sources fonctionnelles](README.md#source-fonctionnelle-détaillée)
font autorité pour le périmètre ; le [registre canonique](tracking/pbis.md) fait autorité pour les statuts et dates.
Les PBIs signalés comme régularisations décrivent des comportements déjà livrés sans prétendre qu’ils avaient été
planifiés avant leur implémentation. L’avancement mesure les PBIs raffinés, pas la complétude du produit entier.

## Produit réellement disponible au 2026-10-08

- session par login/logout, reprise de session, invitations et choix du mot de passe ;
- récupération publique et modification personnelle depuis Mon profil, avec politique des sessions et remise différée ;
- liste et administration hiérarchique des comptes, avec désactivation/réactivation et écarts restant dans `USER-002/003` ;
- organisations : création, liste/détail Admin-Superadmin, renommage et gestion des membres ;
- équipes : liste active Admin-Superadmin, création, renommage, archivage et Coachs courants ;
- modèles locaux : brouillon modifiable, validation immuable et archivage logique, avec familles, versions et repères d’appréciation par score/question ;
- planification locale : équipe, modèle, responsable, immédiat/ponctuel/mensuel/trimestriel et échéances ;
- courriels de confirmation et d’échéance, avec commande de traitement différé ;
- passation locale persistante, tableau et révision Admin avec provenance conservée ;
- Journal d’activité et Logs distincts, filtrables, paginés et en lecture seule ;
- health check, réglages development/production, OpenAPI, CI et quality gates documentés techniquement.

Le radar `/results` compare les dernières positions sur la dernière version ayant des résultats
par famille/organisation ; le longitudinal restitue les observations d’un critère par lignée explicite.
Le [Pilotage P0](source/04b-steering.md) `/steering` restitue couverture, complétions et retards
des équipes actives pour Admin/Superadmin, avec drill-down Results et sans score.
Le [dashboard personnel](source/01a-dashboard.md) livre profil, palettes, activité prouvée et raccourcis.
Les Features larges de pilotage restent incomplètes.

## Vue d’ensemble

| Epic | Features | PBI | Réalisés | Avancement |
| --- | ---: | ---: | ---: | ---: |
| EPIC-001 — Identités, coachs et habilitations | 4 | 8 | 6 | 75 % |
| EPIC-002 — Gestion des équipes | 4 | 7 | 2 | 29 % |
| EPIC-002A — Accompagnement des équipes | 2 | 1 | 1 | 100 % |
| EPIC-003 — Référentiel des modèles d’évaluation | 4 | 4 | 4 | 100 % |
| EPIC-004 — Affectations et planification des évaluations | 5 | 1 | 1 | 100 % |
| EPIC-005 — Passation et preuve d’évaluation | 4 | 1 | 1 | 100 % |
| EPIC-006 — Suivi longitudinal | 5 | 2 | 2 | 100 % |
| EPIC-007 — Notifications du dispositif | 3 | 1 | 1 | 100 % |
| EPIC-008 — Pilotage du dispositif | 5 | 1 | 1 | 100 % |
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
| EPIC-003 | `FEAT-011` à `FEAT-014` (partielles) | aucune |
| EPIC-004 | `FEAT-017` | `FEAT-015`, `FEAT-016`, `FEAT-018`, `FEAT-019` |
| EPIC-005 | `FEAT-023` | `FEAT-020` à `FEAT-022` |
| EPIC-006 | `FEAT-041`, `FEAT-025` (partielle) | `FEAT-024`, `FEAT-026`, `FEAT-027` |
| EPIC-007 | `FEAT-030` | `FEAT-028`, `FEAT-029` |
| EPIC-008 | `FEAT-035` (partielle) | `FEAT-031` à `FEAT-034` |
| EPIC-009 | `FEAT-036`, `FEAT-037`, `FEAT-038` | aucune |
| EPIC-010 | `FEAT-039`, `FEAT-040` | aucune |

## Suivi des PBIs raffinés

| PBI | Statut | Écart ou preuve principale |
| --- | --- | --- |
| AUTH-001 — Ouvrir et fermer une session produit | Réalisé | API, UI et E2E d’authentification ; 2026-09-22 |
| AUTH-002 — Récupérer son accès après oubli du mot de passe | Réalisé | API/ORM/OpenAPI, non-énumération, tokens, worker et parcours E2E ; 2026-10-08 |
| AUTH-003 — Modifier son mot de passe depuis Mon profil | Réalisé | session personnelle, refus, conservation/invalidation des sessions et E2E ; 2026-10-08 |
| DASH-001 — Accueillir l’utilisateur sur son tableau de bord personnel | Réalisé | provenance EvaluationRun, scopes Results, API/UI/E2E et palettes ; 2026-10-06 |
| USER-001 — Créer un utilisateur | Réalisé | contrat historique ; 2026-09-21 |
| USER-002 — Consulter les utilisateurs | Ouvert | liste livrée ; détail et `nom`/`prénom` absents |
| USER-003 — Modifier un utilisateur | Ouvert | édition présente, mais identifiant/fonction mutables et noms absents |
| USER-004 — Désactiver et réactiver un utilisateur | Réalisé | lifecycle préservant historique ; dernier Admin actif protégé ; 2026-10-06 |
| ORG-001 — Créer une organisation | Réalisé | création et rattachements atomiques ; 2026-09-24 |
| ORG-002 — Consulter les organisations | Ouvert | Superadmin/Admin livrés ; Coach/Viewer absents |
| ORG-003 — Modifier une organisation | Réalisé | renommage cloisonné ; 2026-09-24 |
| ORG-004 — Supprimer une organisation | Bloqué | cascade actuelle sur données dépendantes ; `ARB-ORG-005` |
| ORG-005 — Gérer le rattachement courant des Admins | Réalisé | scope et protection des pairs ; 2026-09-28 |
| ORG-006 — Gérer le rattachement courant d’un Coach | Réalisé | cardinalité et scope ; 2026-09-28 |
| TEAM-001 — Créer une équipe | Réalisé | API/UI/tests et unicité organisationnelle ; 2026-09-27 |
| TEAM-002 — Lister les équipes | Ouvert | Admin/Superadmin livrés ; Coach absent, Viewer exclu |
| TEAM-003 — Consulter une équipe | Ouvert | détail par identifiant absent |
| TEAM-004 — Modifier une équipe | Réalisé | renommage cloisonné ; 2026-09-27 |
| TEAM-005 — Archiver une équipe | Ouvert | archivage livré ; restitution archivée et second refus absents |
| TEAM-006 — Consulter les équipes archivées | Ouvert | archives disponibles pour le filtre Logs ; écran dédié absent |
| TEAM-007 — Réactiver une équipe | Ouvert | absent |
| COACH-001 — Affecter les Coachs courants d’une équipe | Réalisé | affectation locale multi-Coachs ; 2026-09-27 |
| EVAL-001 — Administrer un modèle local et ses questions ordonnées | Réalisé | CRUD local sans publication/version ; 2026-09-28 |
| PLAN-001 — Planifier un modèle local pour une équipe | Réalisé | quatre modes, responsable et CRUD ; 2026-09-29 |
| EVAL-002 — Sécuriser le cycle de vie des modèles locaux | Réalisé | validation/archivage audités, immutabilité et planification validée ; 2026-10-05 |
| EVAL-003 — Versionner les modèles d’évaluation | Réalisé | familles, versions immuables, historique conservé, concurrence et E2E ; 2026-10-05 |
| EVAL-004 — Configurer les repères d’appréciation par question et score | Réalisé | CRUD/refus, snapshots, copie des versions, clavier/mobile, thèmes/palettes et E2E ; 2026-10-08 |
| PASS-001 — Passer et réviser les évaluations planifiées | Réalisé | reprise, finalisation, provenance, révision Admin et tableau ; scope revérifié à la mutation, sauvegarde avant navigation ; 2026-10-05 |
| RESULT-001 — Comparer les dernières passations des équipes sur un radar | Réalisé | snapshots, récence métier, scope, sélection React et E2E ; 2026-10-05 |
| RESULT-002 — Suivre les observations historiques d’un critère | Réalisé | lignée explicite, migration conservatrice, observations snapshotées, API/UI/E2E ; 2026-10-06 |
| STEER-001 — Piloter la couverture et les échéances des équipes actives | Réalisé | API/UI cloisonnées, attentes en retard, snapshots, drill-down Results et E2E ; 2026-10-06 |
| NOTIF-001 — Remettre les notifications de planification par courriel | Réalisé | confirmation, échéance et récurrence ; 2026-09-28 |
| JOURNAL-001 — Consulter les activités métier réussies | Réalisé | journal cloisonné et testé ; 2026-09-28 |
| JOURNAL-002 — Consulter les logs applicatifs | Réalisé | capture HTTP exhaustive, contexte sûr, dix filtres et cloisonnement ; extension 2026-10-05 |

## Écarts et décisions encore ouverts

- `ARB-ORG-005` doit décider le traitement des équipes, modèles et planifications avant de rétablir `ORG-004`.
- `ARB-ORG-008` est résolu : dernier Admin actif protégé, transitions explicites et aucune suppression physique métier.
- `ARB-ORG-010` reste ouvert pour un éventuel partage de modèles ; le code ne livre qu’un périmètre strictement local.
- `ARB-ORG-006`, `ARB-ORG-007` et `ARB-ORG-013` restent ouverts pour historique des rattachements, transfert d’équipe et partage/agrégation.
- partage, historique général, calculs d’évolution/tendance, alertes et pilotage élargi restent non réalisés.
- la notification livrée est un courriel direct sans état durable de remise, préférence de canal ni déduplication métier historisée.

## Matrices CRUD réellement protégées par le backend

| Objet | `Superadmin` | `Admin` | `Coach` | `Viewer` |
| --- | --- | --- | --- | --- |
| Organisation | CRUD global | lecture/mise à jour de son organisation | aucun endpoint Organisation | aucun endpoint Organisation |
| Équipe | création/liste/mise à jour/archivage global | mêmes actions dans son organisation | aucune lecture d’équipe par API | aucune lecture d’équipe par API |
| Utilisateur | liste/édition/désactivation/réactivation hors soi-même | Coach/Viewer de son organisation | Viewers de son organisation, fonction inchangée | refus |
| Modèle/planification | gestion globale | gestion dans son organisation | aucune gestion | aucune gestion |
| Passation | accès global, complétion et révision | mêmes actions dans son organisation | ses assignations dans son organisation ; complétions read-only | refus |
| Résultats | lecture globale | lecture organisationnelle | ses passations assignées | COMPLETED de son organisation, lecture seule |
| Dashboard | profil personnel, activité globale contextualisée | profil, activité organisationnelle | profil, activité assignée | profil, activité COMPLETED organisationnelle sans auteurs ni administration |
| Pilotage | lecture d’une organisation choisie | lecture de son organisation imposée | refus | refus |
| Journaux | lecture globale | lecture de son organisation | refus | refus |

## Scoring global

| Indicateur | Valeur |
| --- | ---: |
| Nombre d’Epics | 11 |
| Nombre de Features | 41 |
| Features raffinées | 22 |
| Features non raffinées | 19 |
| Nombre total de PBIs | 34 |
| PBIs ouverts | 8 |
| PBIs en cours | 0 |
| PBIs bloqués | 1 |
| PBIs non réalisés | 9 |
| PBIs réalisés | 25 |
| Avancement global | 74 % |
