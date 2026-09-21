# Registre canonique des métadonnées PBI

Ce registre est la source canonique de suivi définie par la [gouvernance](../governance.md). Les détails fonctionnels, les libellés et les rattachements restent dans la [source du backlog](../source/02-equipes.md) et sont reproduits ici sans reformulation.

Les valeurs sont explicites : aucune ne doit être complétée depuis le code ou une synthèse. Une date `N/A` signifie que le PBI n’est pas réalisé. Les colonnes `Taille` et `Modèle Codex` contiennent uniquement des **recommandations de préparation**, pas des estimations décidées ni des affectations de modèle. Leur présence dans ce registre n’en fait pas des décisions implicites. Les blocages renvoient au [registre des arbitrages Organisation](../source/00-arbitrages-organisations.md) ou à un PBI déjà bloqué.

| PBI | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- |
| TEAM-001 — Créer une équipe | FEAT-005 — Constituer une équipe | M | Sol — puissance élevée | Bloqué | `ARB-ORG-005`, `ARB-ORG-009` et socle `FEAT-036`–`FEAT-037` | N/A |
| TEAM-002 — Lister les équipes | FEAT-007 — Consulter les équipes | S | Sol — puissance moyenne | Bloqué | dépend de `TEAM-001` ; `ARB-ORG-012` via `FEAT-004` | N/A |
| TEAM-003 — Consulter une équipe | FEAT-007 — Consulter les équipes | S | Sol — puissance moyenne | Bloqué | dépend de `TEAM-001` ; `ARB-ORG-012` via `FEAT-004` | N/A |
| TEAM-004 — Modifier une équipe | FEAT-006 — Faire évoluer les informations d’une équipe | M | Sol — puissance élevée | Bloqué | `ARB-ORG-009` et dépend de `TEAM-003` | N/A |
| TEAM-005 — Archiver une équipe | FEAT-010 — Gérer la sortie et la reprise du suivi actif | M | Sol — puissance élevée | Bloqué | dépend de `TEAM-003` | N/A |
| TEAM-006 — Consulter les équipes archivées | FEAT-010 — Gérer la sortie et la reprise du suivi actif | S | Sol — puissance moyenne | Bloqué | dépend de `TEAM-005` | N/A |
| TEAM-007 — Réactiver une équipe | FEAT-010 — Gérer la sortie et la reprise du suivi actif | M | Sol — puissance élevée | Bloqué | dépend de `TEAM-005` | N/A |
