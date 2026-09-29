# Registre canonique des métadonnées PBI

Ce registre est la source canonique de suivi définie par la [gouvernance](../governance.md). Les détails fonctionnels, les libellés et les rattachements restent dans les [sources du backlog](../README.md#source-fonctionnelle-détaillée) et sont reproduits ici sans reformulation.

Les valeurs sont explicites : aucune ne doit être complétée depuis le code ou une synthèse. Une date `N/A` signifie que le PBI n’est pas réalisé. Les colonnes `Taille` et `Modèle Codex` contiennent uniquement des **recommandations de préparation**, pas des estimations décidées ni des affectations de modèle. Leur présence dans ce registre n’en fait pas des décisions implicites. Les blocages renvoient au [registre des arbitrages Organisation](../source/00-arbitrages-organisations.md), à une Feature prérequise ou à un PBI déjà bloqué.

| PBI | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-001 — Ouvrir et fermer une session produit | FEAT-001 — Accéder de manière authentifiée au produit | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-22 |
| USER-001 — Créer un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Réalisé | aucun ; dépend de `FEAT-001` et de la matrice de `FEAT-004` | 2026-09-21 |
| USER-002 — Consulter les utilisateurs | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Ouvert | liste livrée ; détail et `nom`/`prénom` absents | N/A |
| USER-003 — Modifier un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Ouvert | édition livrée mais contrat des champs et de l’identifiant divergent | N/A |
| USER-004 — Supprimer un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Bloqué | `ARB-ORG-008` ; le code supprime physiquement au lieu de désactiver | N/A |
| ORG-001 — Créer une organisation | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-24 |
| ORG-002 — Consulter les organisations | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Ouvert | lecture Superadmin/Admin livrée ; Coach/Viewer absents | N/A |
| ORG-003 — Modifier une organisation | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-24 |
| ORG-004 — Supprimer une organisation | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Bloqué | `ARB-ORG-005` rouvert pour les données dépendantes | N/A |
| ORG-005 — Gérer le rattachement courant des Admins | FEAT-037 — Rattacher un Admin à une organisation | M | Sol — puissance élevée | Réalisé | aucun dans le périmètre courant | 2026-09-28 |
| ORG-006 — Gérer le rattachement courant d’un Coach | FEAT-038 — Rattacher un Coach à une organisation | M | Sol — puissance élevée | Réalisé | aucun dans le périmètre courant | 2026-09-28 |
| TEAM-001 — Créer une équipe | FEAT-005 — Constituer une équipe | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-27 |
| TEAM-002 — Lister les équipes | FEAT-007 — Consulter les équipes | S | Sol — puissance moyenne | Ouvert | liste Admin/Superadmin livrée ; Coach/Viewer absents | N/A |
| TEAM-003 — Consulter une équipe | FEAT-007 — Consulter les équipes | S | Sol — puissance moyenne | Ouvert | endpoint de détail absent | N/A |
| TEAM-004 — Modifier une équipe | FEAT-006 — Faire évoluer les informations d’une équipe | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-27 |
| TEAM-005 — Archiver une équipe | FEAT-010 — Gérer la sortie et la reprise du suivi actif | M | Sol — puissance élevée | Ouvert | archivage livré ; détail archivé et second refus explicite absents | N/A |
| TEAM-006 — Consulter les équipes archivées | FEAT-010 — Gérer la sortie et la reprise du suivi actif | S | Sol — puissance moyenne | Ouvert | capacité absente | N/A |
| TEAM-007 — Réactiver une équipe | FEAT-010 — Gérer la sortie et la reprise du suivi actif | M | Sol — puissance élevée | Ouvert | capacité absente | N/A |
| COACH-001 — Affecter les Coachs courants d’une équipe | FEAT-008 — Affecter un coach à une équipe | M | Sol — puissance élevée | Réalisé | aucun dans le périmètre courant | 2026-09-27 |
| EVAL-001 — Administrer un modèle local et ses questions ordonnées | FEAT-011 — Composer un modèle d’évaluation ordonné | M | Sol — puissance élevée | Réalisé | aucun dans le périmètre local | 2026-09-28 |
| PLAN-001 — Planifier un modèle local pour une équipe | FEAT-017 — Configurer la fréquence et la première échéance | L | Sol — puissance élevée | Réalisé | aucun dans le périmètre courant | 2026-09-29 |
| NOTIF-001 — Remettre les notifications de planification par courriel | FEAT-030 — Remettre une notification sans coupler le métier au canal | M | Sol — puissance élevée | Réalisé | aucun dans le périmètre courriel | 2026-09-28 |
| JOURNAL-001 — Consulter les activités métier réussies | FEAT-039 — Consulter le Journal d’activité | M | Sol — puissance moyenne | Réalisé | aucun | 2026-09-28 |
| JOURNAL-002 — Consulter les logs applicatifs | FEAT-040 — Consulter les Logs | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-29 |

`USER-001` conserve son statut historique `Réalisé`. L’ajout canonique de `nom`, `prénom` et `mail` révèle un écart avec le contrat livré, consigné dans sa source détaillée et à traiter par une évolution distincte.

`AUTH-001`, `ORG-005`, `ORG-006`, `COACH-001`, `EVAL-001`, `PLAN-001`, `NOTIF-001`,
`JOURNAL-001` et `JOURNAL-002` sont des régularisations documentaires de comportements déjà livrés. Leurs
sources limitent explicitement leur portée ; elles ne déclarent pas réalisées les Features plus larges.
