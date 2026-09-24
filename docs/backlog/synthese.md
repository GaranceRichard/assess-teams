# Synthèse du backlog

Cette page est le point d’entrée humain du suivi courant. Elle est une vue dérivée des [sources fonctionnelles](README.md#source-fonctionnelle-détaillée) et du [registre canonique des PBIs](tracking/pbis.md), qui restent les sources faisant autorité. Les tailles et modèles Codex affichés sont des **recommandations de préparation**, pas des décisions.

Un état `Raffinée` indique uniquement la présence d’au moins un PBI. Il ne signifie pas « prêt à implémenter » : les blocages produit sont suivis séparément ci-dessous.

## Sprint 1 — Backend Utilisateurs

| Ordre | PBI | Feature porteuse | Statut |
| ---: | --- | --- | --- |
| 1 | USER-001 — Créer un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | Réalisé |
| 2 | USER-002 — Consulter les utilisateurs | FEAT-002 — Administrer le cycle de vie d’une identité | Bloqué |
| 3 | USER-003 — Modifier un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | Bloqué |
| 3 | USER-004 — Supprimer un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | Bloqué |

Les autorisations de ces quatre PBIs sont portées par la matrice de `FEAT-004`. Le premier `Superadmin`, c’est-à-dire le superuser Django, est créé par le bootstrap et reste une capacité technique, pas un quatrième rôle métier. Le détail de l’ordre et des conditions d’entrée est dans la [planification](planning/ordonnancement.md#sprint-1--backend-utilisateurs).

## Vue d’ensemble

| Epic | Features | PBI | Réalisés | Avancement |
| --- | ---: | ---: | ---: | ---: |
| EPIC-001 — Identités, coachs et habilitations | 4 | 4 | 1 | 25 % |
| EPIC-002 — Gestion des équipes | 4 | 7 | 0 | 0 % |
| EPIC-002A — Accompagnement des équipes | 2 | 0 | 0 | N/A |
| EPIC-003 — Référentiel des modèles d’évaluation | 4 | 0 | 0 | N/A |
| EPIC-004 — Affectations et planification des évaluations | 5 | 0 | 0 | N/A |
| EPIC-005 — Passation et preuve d’évaluation | 4 | 0 | 0 | N/A |
| EPIC-006 — Suivi longitudinal | 4 | 0 | 0 | N/A |
| EPIC-007 — Notifications du dispositif | 3 | 0 | 0 | N/A |
| EPIC-008 — Pilotage du dispositif | 5 | 0 | 0 | N/A |
| EPIC-009 — Gestion des organisations | 3 | 4 | 0 | 0 % |

## Détail par Epic

### EPIC-001 — Identités, coachs et habilitations

| Feature | État | Nb PBI | Réalisés | Avancement |
| --- | --- | ---: | ---: | ---: |
| FEAT-001 — Accéder de manière authentifiée au produit | Non raffinée | 0 | 0 | N/A |
| FEAT-002 — Administrer le cycle de vie d’une identité | Raffinée | 4 | 1 | 25 % |
| FEAT-003 — Qualifier et superviser un coach | Non raffinée | 0 | 0 | N/A |
| FEAT-004 — Appliquer les rôles et permissions métier | Non raffinée | 0 | 0 | N/A |

### EPIC-002 — Gestion des équipes

| Feature | État | Nb PBI | Réalisés | Avancement |
| --- | --- | ---: | ---: | ---: |
| FEAT-005 — Constituer une équipe | Raffinée | 1 | 0 | 0 % |
| FEAT-006 — Faire évoluer les informations d’une équipe | Raffinée | 1 | 0 | 0 % |
| FEAT-007 — Consulter les équipes | Raffinée | 2 | 0 | 0 % |
| FEAT-010 — Gérer la sortie et la reprise du suivi actif | Raffinée | 3 | 0 | 0 % |

### EPIC-002A — Accompagnement des équipes

| Feature | État | Nb PBI | Réalisés | Avancement |
| --- | --- | ---: | ---: | ---: |
| FEAT-008 — Affecter un coach à une équipe | Non raffinée | 0 | 0 | N/A |
| FEAT-009 — Retracer les affectations de coachs | Non raffinée | 0 | 0 | N/A |

### EPIC-003 — Référentiel des modèles d’évaluation

| Feature | État | Nb PBI | Réalisés | Avancement |
| --- | --- | ---: | ---: | ---: |
| FEAT-011 — Composer un modèle d’évaluation ordonné | Non raffinée | 0 | 0 | N/A |
| FEAT-012 — Définir les modalités de notation | Non raffinée | 0 | 0 | N/A |
| FEAT-013 — Publier ou retirer un modèle | Non raffinée | 0 | 0 | N/A |
| FEAT-014 — Versionner un modèle sans réécrire le passé | Non raffinée | 0 | 0 | N/A |

### EPIC-004 — Affectations et planification des évaluations

| Feature | État | Nb PBI | Réalisés | Avancement |
| --- | --- | ---: | ---: | ---: |
| FEAT-015 — Associer des modèles à une équipe | Non raffinée | 0 | 0 | N/A |
| FEAT-016 — Retracer les associations équipe–modèle | Non raffinée | 0 | 0 | N/A |
| FEAT-017 — Configurer la fréquence et la première échéance | Non raffinée | 0 | 0 | N/A |
| FEAT-018 — Calculer la prochaine échéance | Non raffinée | 0 | 0 | N/A |
| FEAT-019 — Identifier les évaluations en retard | Non raffinée | 0 | 0 | N/A |

### EPIC-005 — Passation et preuve d’évaluation

| Feature | État | Nb PBI | Réalisés | Avancement |
| --- | --- | ---: | ---: | ---: |
| FEAT-020 — Démarrer l’évaluation attendue | Non raffinée | 0 | 0 | N/A |
| FEAT-021 — Renseigner et reprendre un brouillon | Non raffinée | 0 | 0 | N/A |
| FEAT-022 — Valider la complétude et les résultats | Non raffinée | 0 | 0 | N/A |
| FEAT-023 — Finaliser et tracer une évaluation | Non raffinée | 0 | 0 | N/A |

### EPIC-006 — Suivi longitudinal

| Feature | État | Nb PBI | Réalisés | Avancement |
| --- | --- | ---: | ---: | ---: |
| FEAT-024 — Parcourir l’historique des évaluations | Non raffinée | 0 | 0 | N/A |
| FEAT-025 — Comparer des évaluations compatibles | Non raffinée | 0 | 0 | N/A |
| FEAT-026 — Mesurer l’évolution par critère et globale | Non raffinée | 0 | 0 | N/A |
| FEAT-027 — Visualiser les tendances | Non raffinée | 0 | 0 | N/A |

### EPIC-007 — Notifications du dispositif

| Feature | État | Nb PBI | Réalisés | Avancement |
| --- | --- | ---: | ---: | ---: |
| FEAT-028 — Préparer les rappels d’évaluations à venir | Non raffinée | 0 | 0 | N/A |
| FEAT-029 — Alerter sur les évaluations en retard | Non raffinée | 0 | 0 | N/A |
| FEAT-030 — Remettre une notification sans coupler le métier au canal | Non raffinée | 0 | 0 | N/A |

### EPIC-008 — Pilotage du dispositif

| Feature | État | Nb PBI | Réalisés | Avancement |
| --- | --- | ---: | ---: | ---: |
| FEAT-031 — Gérer les paramètres métier du dispositif | Non raffinée | 0 | 0 | N/A |
| FEAT-032 — Superviser la charge et la situation des coachs | Non raffinée | 0 | 0 | N/A |
| FEAT-033 — Superviser le portefeuille d’équipes | Non raffinée | 0 | 0 | N/A |
| FEAT-034 — Superviser les échéances | Non raffinée | 0 | 0 | N/A |
| FEAT-035 — Obtenir une vue globale du dispositif | Non raffinée | 0 | 0 | N/A |

### EPIC-009 — Gestion des organisations

| Feature | État | Nb PBI | Réalisés | Avancement |
| --- | --- | ---: | ---: | ---: |
| FEAT-036 — Gérer le cycle de vie d’une organisation | Raffinée | 4 | 3 | 75 % |
| FEAT-037 — Rattacher un Admin à une organisation | Non raffinée | 0 | 0 | N/A |
| FEAT-038 — Rattacher un Coach à une organisation | Non raffinée | 0 | 0 | N/A |

## Blocages produit et dépendances

Les arbitrages sont détaillés dans leur [registre canonique](source/00-arbitrages-organisations.md) et les dépendances dans les sources fonctionnelles et le registre PBI. Cette vue ne transforme aucune Feature non raffinée en PBI.

| Périmètre bloqué | Blocages directs | Conséquence actuelle |
| --- | --- | --- |
| `USER-002` à `USER-004` — Sprint 1 Backend Utilisateurs | `FEAT-037` pour `USER-002` ; dépendance à `USER-002` pour les deux suivants ; `ARB-ORG-008` en plus pour `USER-004` | Les trois PBIs sont `Bloqué` ; `USER-001` reste historiquement `Réalisé` et son écart `nom`/`prénom`/`mail` est une évolution à raffiner |
| `ORG-002` et parcours dépendants | `ARB-ORG-008`, `ARB-ORG-011` et dépendances propres aux PBIs | `ORG-001`, `ORG-003`, `ORG-004`, les rattachements multiples et l’édition des membres courants sont livrés ; la consultation métier complète reste à compléter |
| `TEAM-001` à `TEAM-007` | `ARB-ORG-009`, `ARB-ORG-012`, dépendances au socle | 7 PBIs Équipes raffinés au statut canonique `Bloqué` |
| `FEAT-011` à `FEAT-016`, puis parcours dépendants | `ARB-ORG-010` | Portée des modèles non prête à raffiner ou implémenter |
| Consultation authentifiée multi-organisation | `ARB-ORG-011` | Sélection du périmètre actif restant à arbitrer |
| `FEAT-031`, `FEAT-035` et règles dépendantes | `ARB-ORG-013` | Partage de paramètres et vues multi-organisation non prêts à raffiner |
| Tout futur transfert d’équipe et continuités concernées | `ARB-ORG-007` | Aucun PBI de transfert créé ; capacité non prête à raffiner |

## Matrices CRUD — Organisations et Équipes

| Objet | Action | `Superadmin` | `Admin` | `Coach` | `Viewer` |
| --- | --- | --- | --- | --- | --- |
| Organisation | CREATE | Oui | Oui | Non | Non |
| Organisation | READ | Toutes | Toutes dans l’administration | Périmètre autorisé | Périmètre autorisé |
| Organisation | UPDATE | Toutes | Organisations accessibles | Non | Non |
| Organisation | DELETE | Toutes | Non | Non | Non |
| Équipe | CREATE | Toutes les organisations | Organisations accessibles | Non | Non |
| Équipe | READ | Toutes les organisations | Organisations accessibles | Périmètre autorisé | Périmètre autorisé |
| Équipe | UPDATE | Toutes les organisations | Organisations accessibles | Non | Non |
| Équipe | DELETE | Toutes les organisations | Organisations accessibles | Non | Non |

Pour une Organisation, `DELETE` réalise une suppression physique réservée au Superadmin et conserve les identités. Pour une Équipe, `DELETE` réalise l’archivage canonique de `TEAM-005`. Toute lecture de donnée métier exige une identité authentifiée.

## PBIs raffinés

### FEAT-002 — Administrer le cycle de vie d’une identité

| PBI | Taille recommandée | Modèle Codex recommandé | Statut | Date de réalisation |
| --- | --- | --- | --- | --- |
| USER-001 — Créer un utilisateur | M | Sol — puissance élevée | Réalisé | 2026-09-21 |
| USER-002 — Consulter les utilisateurs | M | Sol — puissance élevée | Bloqué | N/A |
| USER-003 — Modifier un utilisateur | M | Sol — puissance élevée | Bloqué | N/A |
| USER-004 — Supprimer un utilisateur | M | Sol — puissance élevée | Bloqué | N/A |

### EPIC-009 — PBIs Organisations

| PBI | Statut | Blocage |
| --- | --- | --- |
| ORG-001 — Créer une organisation | Réalisé | Aucun — livré le 2026-09-24 |
| ORG-002 — Consulter les organisations | Bloqué | détail par identifiant et périmètre métier multi-organisation à compléter |
| ORG-003 — Modifier une organisation | Réalisé | Aucun — renommage livré le 2026-09-24 |
| ORG-004 — Supprimer une organisation | Réalisé | Aucun — suppression Superadmin livrée le 2026-09-24 |

### EPIC-002 — PBIs Équipes

| PBI | Statut | Blocage |
| --- | --- | --- |
| TEAM-001 — Créer une équipe | Bloqué | socle Organisation, `ARB-ORG-005`, `ARB-ORG-009` |
| TEAM-002 — Lister les équipes | Bloqué | `TEAM-001`, `ARB-ORG-012` |
| TEAM-003 — Consulter une équipe | Bloqué | `TEAM-001`, `ARB-ORG-012` |
| TEAM-004 — Modifier une équipe | Bloqué | `TEAM-003`, `ARB-ORG-009` |
| TEAM-005 — Archiver une équipe | Bloqué | `TEAM-003` |
| TEAM-006 — Consulter les équipes archivées | Bloqué | `TEAM-005`, `ARB-ORG-012` |
| TEAM-007 — Réactiver une équipe | Bloqué | `TEAM-005` |

## Scoring global

| Indicateur | Valeur |
| --- | ---: |
| Nombre d’Epics | 10 |
| Nombre de Features | 38 |
| Features raffinées | 6 |
| Features non raffinées | 32 |
| Nombre total de PBIs | 15 |
| PBIs ouverts | 0 |
| PBIs en cours | 0 |
| PBIs bloqués | 14 |
| PBIs non réalisés | 14 |
| PBIs réalisés | 1 |
| Avancement global | 7 % |
