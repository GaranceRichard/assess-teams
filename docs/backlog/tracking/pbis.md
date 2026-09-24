# Registre canonique des métadonnées PBI

Ce registre est la source canonique de suivi définie par la [gouvernance](../governance.md). Les détails fonctionnels, les libellés et les rattachements restent dans les [sources du backlog](../README.md#source-fonctionnelle-détaillée) et sont reproduits ici sans reformulation.

Les valeurs sont explicites : aucune ne doit être complétée depuis le code ou une synthèse. Une date `N/A` signifie que le PBI n’est pas réalisé. Les colonnes `Taille` et `Modèle Codex` contiennent uniquement des **recommandations de préparation**, pas des estimations décidées ni des affectations de modèle. Leur présence dans ce registre n’en fait pas des décisions implicites. Les blocages renvoient au [registre des arbitrages Organisation](../source/00-arbitrages-organisations.md), à une Feature prérequise ou à un PBI déjà bloqué.

| PBI | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- |
| USER-001 — Créer un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Réalisé | aucun ; dépend de `FEAT-001` et de la matrice de `FEAT-004` | 2026-09-21 |
| USER-002 — Consulter les utilisateurs | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Bloqué | dépend de `FEAT-037` ; `USER-001` est réalisé | N/A |
| USER-003 — Modifier un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Bloqué | dépend de `USER-002` | N/A |
| USER-004 — Supprimer un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Bloqué | `ARB-ORG-008` ; dépend de `USER-002` | N/A |
| ORG-001 — Créer une organisation | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-24 |
| ORG-002 — Consulter les organisations | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Bloqué | détail par identifiant et périmètre métier multi-organisation à compléter | N/A |
| ORG-003 — Modifier une organisation | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Bloqué | dépend de `ORG-002` | N/A |
| ORG-004 — Supprimer une organisation | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Bloqué | dépend de `ORG-002` ; `ARB-ORG-005` | N/A |
| TEAM-001 — Créer une équipe | FEAT-005 — Constituer une équipe | M | Sol — puissance élevée | Bloqué | `ARB-ORG-005`, `ARB-ORG-009` et socle `FEAT-036`–`FEAT-037` | N/A |
| TEAM-002 — Lister les équipes | FEAT-007 — Consulter les équipes | S | Sol — puissance moyenne | Bloqué | dépend de `TEAM-001` ; `ARB-ORG-012` | N/A |
| TEAM-003 — Consulter une équipe | FEAT-007 — Consulter les équipes | S | Sol — puissance moyenne | Bloqué | dépend de `TEAM-001` ; `ARB-ORG-012` | N/A |
| TEAM-004 — Modifier une équipe | FEAT-006 — Faire évoluer les informations d’une équipe | M | Sol — puissance élevée | Bloqué | dépend de `TEAM-003` ; `ARB-ORG-009` | N/A |
| TEAM-005 — Archiver une équipe | FEAT-010 — Gérer la sortie et la reprise du suivi actif | M | Sol — puissance élevée | Bloqué | dépend de `TEAM-003` | N/A |
| TEAM-006 — Consulter les équipes archivées | FEAT-010 — Gérer la sortie et la reprise du suivi actif | S | Sol — puissance moyenne | Bloqué | dépend de `TEAM-005` ; `ARB-ORG-012` | N/A |
| TEAM-007 — Réactiver une équipe | FEAT-010 — Gérer la sortie et la reprise du suivi actif | M | Sol — puissance élevée | Bloqué | dépend de `TEAM-005` | N/A |

`USER-001` conserve son statut historique `Réalisé`. L’ajout canonique de `nom`, `prénom` et `mail` révèle un écart avec le contrat livré, consigné dans sa source détaillée et à traiter par une évolution distincte.
