# Synthèse du backlog

Cette page est la vue dérivée du suivi courant. Les [sources fonctionnelles](README.md#source-fonctionnelle-détaillée)
font autorité pour le périmètre ; le [registre canonique](tracking/pbis.md) fait autorité pour les statuts et dates.
Les PBIs signalés comme régularisations décrivent des comportements déjà livrés sans prétendre qu’ils avaient été
planifiés avant leur implémentation. L’avancement mesure les PBIs raffinés, pas la complétude du produit entier.

## Produit réellement disponible au 2026-10-13

- session par login/logout, reprise de session, invitations et choix du mot de passe ;
- récupération publique et modification personnelle depuis Mon profil, avec politique des sessions et remise différée ;
- liste et administration hiérarchique des comptes, avec désactivation/réactivation et écarts restant dans `USER-002/003` ;
- organisations : création, liste/détail Admin-Superadmin, renommage et gestion des membres ;
- équipes : liste active Admin-Superadmin, création, renommage, archivage et Coachs courants ;
- modèles locaux : brouillon modifiable, validation immuable, archive, versions et repères facultatifs par question/score ;
- planification locale : équipe, modèle, responsable, immédiat/ponctuel/mensuel/trimestriel et échéances ;
- [courriels fiables — MEP-004](../architecture/email-notifications.md) : file locale durable, reprises SMTP bornées, suivi et distinction du succès métier ;
- passation locale persistante avec notation explicite, tableau et révision Admin avec provenance conservée ;
- Journal d’activité et Logs distincts, filtrables, paginés et en lecture seule ;
- health check, réglages development/production, [HTTPS et proxy de confiance](../architecture/http-security.md), OpenAPI et quality gates.

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
| EPIC-011 — Sécurité et robustesse MESS | 4 | 12 | 11 | 92 % |
| EPIC-012 — Expérience utilisateur MESS | 5 | 17 | 5 | 29 % |
| EPIC-013 — Installation et exploitation MESS | 6 | 19 | 0 | 0 % |
| EPIC-014 — Documentation, transfert et recette MESS | 5 | 14 | 2 | 14 % |

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
| EPIC-011 — Sécurité et robustesse MESS | `FEAT-049` à `FEAT-052` | aucune |
| EPIC-012 — Expérience utilisateur MESS | `FEAT-053` à `FEAT-057` | aucune |
| EPIC-013 — Installation et exploitation MESS | `FEAT-058` à `FEAT-063` | aucune |
| EPIC-014 — Documentation, transfert et recette MESS | `FEAT-064` à `FEAT-068` | aucune |

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
| EVAL-004 — Configurer les repères d’appréciation par question | Réalisé | repères facultatifs 0–10, versions/snapshots, API/UI/mobile/démo ; 2026-10-08 |
| PASS-001 — Passer et réviser les évaluations planifiées | Réalisé | reprise, finalisation, provenance, révision Admin et tableau ; scope revérifié à la mutation, sauvegarde avant navigation ; 2026-10-05 |
| RESULT-001 — Comparer les dernières passations des équipes sur un radar | Réalisé | snapshots, récence métier, scope, sélection React et E2E ; 2026-10-05 |
| RESULT-002 — Suivre les observations historiques d’un critère | Réalisé | lignée explicite, migration conservatrice, observations snapshotées, API/UI/E2E ; 2026-10-06 |
| STEER-001 — Piloter la couverture et les échéances des équipes actives | Réalisé | API/UI cloisonnées, attentes en retard, snapshots, drill-down Results et E2E ; 2026-10-06 |
| NOTIF-001 — Remettre les notifications de planification par courriel | Réalisé | confirmation, échéance et récurrence ; 2026-09-28 |
| JOURNAL-001 — Consulter les activités métier réussies | Réalisé | journal cloisonné et testé ; 2026-09-28 |
| JOURNAL-002 — Consulter les logs applicatifs | Réalisé | capture HTTP exhaustive, contexte sûr, dix filtres et cloisonnement ; extension 2026-10-05 |

## Préparation MESS — suivi au 2026-10-23

La [référence opérationnelle](source/07-pre-mep.md) porte quatre Epics, vingt Features raffinées et
62 PBI actifs après audit du 2026-10-14 ; les 63 points initiaux restent couverts, dont 03.01 acquis. Les Epics/Features fonctionnels généraux restent conservés.
Le [suivi des vingt capacités et de leurs PBI](tracking/pre-mep-view.md) est dérivé des sections canoniques.
**MEP-067 réalisé : [cahier UX](../quality/ux-acceptance.md)**. [MEP-019 (contrastes clairs)](../quality/light-theme.md), MEP-052 et MEP-053 réalisés : F09 complète.
MEP-014 réalisé le 2026-10-23 : [contexte et provenance des Résultats, preuves avant/après](../quality/results-hierarchy.md) ; vingt apparences, formats UX, pre-push et CI complète du SHA publié verts ; F06 atteint 1 PBI sur 4.
Prochain : MEP-013 (curseur et sélection), puis corrections notation/résultats/dashboard/responsive/interactions.
En parallèle : décisions D01–D09 de MEP-055, puis configuration, distribution hors ligne et exploitation.
Le [plan pilotable jusqu’à MEP-035](planning/pre-mep.md) donne ordre, parallèles et critères de passage.
[Suivi F04, dépendances et MEP-043 livré](planning/mess-dependances.md) : pas de nouveau chantier Git/CI,
GO non autorisé si conformité nécessaire non démontrée. MEP-030 définit le [cahier fonctionnel FON-01 à FON-18](../quality/functional-acceptance.md) le 2026-10-22 ; seul ce PBI documentaire est clôturé par cette livraison, aucun PV cible anticipé.
MEP-036 — [Inventaire des paramètres](../operations/configuration/README.md) est réalisé le 2026-10-14 ; MEP-009 — [Secrets et démarrage](../operations/configuration/startup-validation.md) le 2026-10-15 : configuration dangereuse refusée, diagnostics confidentiels et rotation documentée.
MEP-039 — [Paramètres de concurrence SQLite](../operations/sqlite/README.md) est réalisé le 2026-10-15 : référence DELETE/FULL, timeout 5 s, connexions et limites mesurées. MEP-010 — [Verrous et transactions concurrentes](../operations/sqlite/contention-validation.md) est réalisé le 2026-10-16 : 22 cas multiprocessus, reprises bornées, refus sûrs et CI verte.
MEP-011 — [Isolation organisationnelle](../architecture/organization-isolation-validation.md) est réalisé le 2026-10-17 : matrice et 39 cas API réels, refus sans effet, historique conservé, exceptions Superadmin bornées, pré-push et CI exhaustive du SHA intégré verts.
MEP-037 — [Permissions par rôle](../architecture/role-permissions-validation.md) est réalisé le 2026-10-18 : matrice API/navigation, refus sans effet, champs forgés et route Équipes corrigés ; pré-push et CI du SHA intégré verts.
MEP-040 — [Conflits des opérations critiques](../operations/sqlite/critical-conflicts-validation.md) est réalisé le 2026-10-18 : finalisation, versions et dernier Admin qualifiés par 42 cas multiprocessus sur fichier, provenance et Journal cohérents, 1 300 tests backend et CI verte ; FEAT-050 atteint 3 PBI réalisés sur 3.
MEP-038 — [Accès indirects et exports](../architecture/indirect-access-validation.md) est réalisé le 2026-10-18 : filtres, liens profonds, relations imbriquées et historique qualifiés ; aucun défaut démontré ni export métier existant ; pré-push et CI du SHA intégré verts. FEAT-049 atteint 5 PBI réalisés sur 5.
MEP-042 — [Conservation des journaux](../operations/configuration/journal-retention-validation.md) est réalisé le 2026-10-19 : configuration par type validée au démarrage, refus des durées invalides et des échéances métier non autorisées, périmètres et arbitrages explicites ; pré-push et CI verte du SHA `72477e4`.
MEP-020 — [Purge des journaux](../operations/journal-purge-validation.md) est réalisé le 2026-10-19 : simulation, purge technique planifiable et bornée, intégrité, reçus et reprise transactionnelle ; preuves métier protégées ; pré-push exhaustif et CI verte du SHA `28a78ac`. FEAT-051 atteint 2 PBI réalisés sur 2.

| Périmètre | PBI | Réalisés | Ouverts | En cours | Bloqués | Avancement |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| MESS actif — E01 à E04 | 62 | 18 | 42 | 0 | 2 | 29 % |
| Historique Job 1 — MEP-001 à MEP-008 | 8 | 8 | 0 | 0 | 0 | 100 % historique |

03.01 référence les acquis JOURNAL-001/002, sans PBI supplémentaire ; MEP-041 reste archivé avec sa date du 2026-10-05.
Les [huit réalisations historiques](tracking/mess-historique.md) restent prouvées et ne sont pas relancées.
Les [correspondances MEP et acquis CI](planning/pre-mep-rapprochements.md) conservent décisions et limites.
[MEP-035 — Décision GO/NO-GO](tracking/mess-jalon.md) : Ouvert, N/A, décision non rendue ; jalon hors PBI.
GO dépend des preuves du candidat livré, des gates et des arbitrages pertinents ; aucun GO déduit du scoring.
Les rapports d’audit externes ne sont pas disponibles localement ; aucun défaut n’est présumé par leur intitulé.

MEP-055 — [Prérequis d’installation](../operations/installation-prerequisites-validation.md) : Bloqué, N/A ; contrat préparé, validation MESS D01–D09 absente, aucune cible qualifiée. Aucun PBI supplémentaire réalisé.

MEP-012 — [Protections GitHub et CI](../quality/mep-012/README.md) : Bloqué, N/A ; audit distant du 2026-10-20, aucune protection/check obligatoire, pré-push local distinct de la CI après push et inventaire Apps refusé. Constat historique conservé ; [MEP-043 livré selon critères révisés et réserve G05 acceptée](../quality/mep-043/closure.md). L’écart entre son récit de clôture de MEP-012 et le statut canonique encore Bloqué est [signalé](planning/mess-dependances.md), sans nouvelle clôture déduite.

## Écarts et décisions encore ouverts

- `ARB-ORG-005` doit décider le traitement des équipes, modèles et planifications avant de rétablir `ORG-004`.
- `ARB-ORG-008` est résolu : dernier Admin actif protégé, transitions explicites et aucune suppression physique métier.
- `ARB-ORG-010` reste ouvert pour un éventuel partage de modèles ; le code ne livre qu’un périmètre strictement local.
- `ARB-ORG-006`, `ARB-ORG-007` et `ARB-ORG-013` restent ouverts pour historique des rattachements, transfert d’équipe et partage/agrégation.
- partage, historique général, calculs d’évolution/tendance, alertes et pilotage élargi restent non réalisés.
- les préférences de canal et les nouveaux types de notifications restent hors du périmètre livré.

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
| Nombre d’Epics | 15 |
| Nombre de Features | 61 |
| Features raffinées | 42 |
| Features non raffinées | 19 |
| Nombre total de PBIs | 96 |
| PBIs ouverts | 50 |
| PBIs en cours | 0 |
| PBIs bloqués | 3 |
| PBIs non réalisés | 53 |
| PBIs réalisés | 43 |
| Avancement global | 45 % |

Scoring recalculé depuis le registre : 34 PBI fonctionnels + 62 PBI MESS ; 43 réalisés (25 fonctionnels et 18 MESS, dont MEP-014, MEP-044, MEP-019, MEP-030, MEP-067, MEP-052 et MEP-053). Les anciens totaux globaux omettaient quatre réalisations fonctionnelles déjà canoniques ; MEP-055 et MEP-012 restent Bloqués. MEP-043 est Réalisé selon les [critères explicitement révisés le 2026-10-21](../quality/mep-043/closure.md) : protections compatibles et push direct validés, limite CI après intégration acceptée, réserve G05 non vérifiée (403) non bloquante ; la publication du backlog est libérée. MEP-041 est un alias archivé non compté. Les huit PBI historiques du Job 1,
FEAT-042 à FEAT-048 archivées et le jalon MEP-035 sont exclus des indicateurs actifs selon la gouvernance.
La consolidation corrige un double comptage documentaire ; aucune réalisation ni couverture fonctionnelle n’est retirée.

[Audit contradictoire, écarts et couverture des 63 points](planning/mess-audit.md).
