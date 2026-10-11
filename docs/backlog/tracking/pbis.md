# Registre canonique des métadonnées PBI

Ce registre est la source canonique de suivi définie par la [gouvernance](../governance.md). Les détails fonctionnels, les libellés et les rattachements restent dans les [sources du backlog](../README.md#source-fonctionnelle-détaillée) et sont reproduits ici sans reformulation.

Les valeurs sont explicites : aucune ne doit être complétée depuis le code ou une synthèse. Une date `N/A` signifie que le PBI n’est pas réalisé. Les colonnes `Taille` et `Modèle Codex` contiennent uniquement des **recommandations de préparation**, pas des estimations décidées ni des affectations de modèle. Leur présence dans ce registre n’en fait pas des décisions implicites. Les blocages renvoient au [registre des arbitrages Organisation](../source/00-arbitrages-organisations.md), à une Feature prérequise ou à un PBI déjà bloqué.

| PBI | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-001 — Ouvrir et fermer une session produit | FEAT-001 — Accéder de manière authentifiée au produit | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-22 |
| AUTH-002 — Récupérer son accès après oubli du mot de passe | FEAT-001 — Accéder de manière authentifiée au produit | À définir | À définir | Réalisé | aucun dans le périmètre demandé | 2026-10-08 |
| AUTH-003 — Modifier son mot de passe depuis Mon profil | FEAT-001 — Accéder de manière authentifiée au produit | À définir | À définir | Réalisé | aucun dans le périmètre demandé | 2026-10-08 |
| DASH-001 — Accueillir l’utilisateur sur son tableau de bord personnel | FEAT-001 — Accéder de manière authentifiée au produit | À définir | À définir | Réalisé | aucun dans le périmètre demandé | 2026-10-06 |
| USER-001 — Créer un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Réalisé | aucun ; dépend de `FEAT-001` et de la matrice de `FEAT-004` | 2026-09-21 |
| USER-002 — Consulter les utilisateurs | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Ouvert | liste livrée ; détail et `nom`/`prénom` absents | N/A |
| USER-003 — Modifier un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Ouvert | édition livrée mais contrat des champs et de l’identifiant divergent | N/A |
| USER-004 — Désactiver et réactiver un utilisateur | FEAT-002 — Administrer le cycle de vie d’une identité | M | Sol — puissance élevée | Réalisé | aucun ; ARB-ORG-008 résolu, historique et concurrence couverts | 2026-10-06 |
| ORG-001 — Créer une organisation | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-24 |
| ORG-002 — Consulter les organisations | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Ouvert | lecture Superadmin/Admin livrée ; Coach/Viewer absents | N/A |
| ORG-003 — Modifier une organisation | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-24 |
| ORG-004 — Supprimer une organisation | FEAT-036 — Gérer le cycle de vie d’une organisation | M | Sol — puissance élevée | Bloqué | `ARB-ORG-005` rouvert pour les données dépendantes | N/A |
| ORG-005 — Gérer le rattachement courant des Admins | FEAT-037 — Rattacher un Admin à une organisation | M | Sol — puissance élevée | Réalisé | aucun dans le périmètre courant | 2026-09-28 |
| ORG-006 — Gérer le rattachement courant d’un Coach | FEAT-038 — Rattacher un Coach à une organisation | M | Sol — puissance élevée | Réalisé | aucun dans le périmètre courant | 2026-09-28 |
| TEAM-001 — Créer une équipe | FEAT-005 — Constituer une équipe | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-27 |
| TEAM-002 — Lister les équipes | FEAT-007 — Consulter les équipes | S | Sol — puissance moyenne | Ouvert | liste Admin/Superadmin livrée ; Coach absent, Viewer exclu des écrans Équipes | N/A |
| TEAM-003 — Consulter une équipe | FEAT-007 — Consulter les équipes | S | Sol — puissance moyenne | Ouvert | endpoint de détail absent | N/A |
| TEAM-004 — Modifier une équipe | FEAT-006 — Faire évoluer les informations d’une équipe | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-27 |
| TEAM-005 — Archiver une équipe | FEAT-010 — Gérer la sortie et la reprise du suivi actif | M | Sol — puissance élevée | Ouvert | archivage livré ; détail archivé et second refus explicite absents | N/A |
| TEAM-006 — Consulter les équipes archivées | FEAT-010 — Gérer la sortie et la reprise du suivi actif | S | Sol — puissance moyenne | Ouvert | archives disponibles pour le filtre Logs ; écran dédié absent | N/A |
| TEAM-007 — Réactiver une équipe | FEAT-010 — Gérer la sortie et la reprise du suivi actif | M | Sol — puissance élevée | Ouvert | capacité absente | N/A |
| COACH-001 — Affecter les Coachs courants d’une équipe | FEAT-008 — Affecter un coach à une équipe | M | Sol — puissance élevée | Réalisé | aucun dans le périmètre courant | 2026-09-27 |
| EVAL-001 — Administrer un modèle local et ses questions ordonnées | FEAT-011 — Composer un modèle d’évaluation ordonné | M | Sol — puissance élevée | Réalisé | aucun dans le périmètre local | 2026-09-28 |
| PLAN-001 — Planifier un modèle local pour une équipe | FEAT-017 — Configurer la fréquence et la première échéance | L | Sol — puissance élevée | Réalisé | aucun dans le périmètre courant | 2026-09-29 |
| EVAL-002 — Sécuriser le cycle de vie des modèles locaux | FEAT-013 — Publier ou retirer un modèle | N/A | N/A | Réalisé | aucun dans le périmètre local demandé | 2026-10-05 |
| EVAL-003 — Versionner les modèles d’évaluation | FEAT-014 — Versionner un modèle sans réécrire le passé | N/A | N/A | Réalisé | aucun dans le périmètre local demandé | 2026-10-05 |
| EVAL-004 — Configurer les repères d’appréciation par question | FEAT-012 — Définir les modalités de notation | À définir | À définir | Réalisé | aucun dans le périmètre demandé | 2026-10-08 |
| PASS-001 — Passer et réviser les évaluations planifiées | FEAT-023 — Finaliser et tracer une évaluation | À définir | À définir | Réalisé | aucun ; dépend de `EVAL-002` ; versionnement hors PBI | 2026-10-05 |
| RESULT-001 — Comparer les dernières passations des équipes sur un radar | FEAT-041 — Comparer les dernières passations de plusieurs équipes | À définir | À définir | Réalisé | aucun ; dépend de `EVAL-003` et `PASS-001` | 2026-10-05 |
| RESULT-002 — Suivre les observations historiques d’un critère | FEAT-025 — Comparer des évaluations compatibles | À définir | À définir | Réalisé | aucun dans le périmètre demandé ; dépend de `RESULT-001`, `EVAL-003`, `PASS-001` | 2026-10-06 |
| STEER-001 — Piloter la couverture et les échéances des équipes actives | FEAT-035 — Obtenir une vue globale du dispositif | À définir | À définir | Réalisé | aucun dans le périmètre P0 demandé | 2026-10-06 |
| NOTIF-001 — Remettre les notifications de planification par courriel | FEAT-030 — Remettre une notification sans coupler le métier au canal | M | Sol — puissance élevée | Réalisé | aucun dans le périmètre courriel | 2026-09-28 |
| JOURNAL-001 — Consulter les activités métier réussies | FEAT-039 — Consulter le Journal d’activité | M | Sol — puissance moyenne | Réalisé | aucun | 2026-09-28 |
| JOURNAL-002 — Consulter les logs applicatifs | FEAT-040 — Consulter les Logs | M | Sol — puissance élevée | Réalisé | aucun | 2026-09-29 |

`USER-001` conserve son statut historique `Réalisé`. L’ajout canonique de `nom`, `prénom` et `mail` révèle un écart avec le contrat livré, consigné dans sa source détaillée et à traiter par une évolution distincte.

`AUTH-001`, `ORG-005`, `ORG-006`, `COACH-001`, `EVAL-001`, `PLAN-001`, `NOTIF-001`,
`JOURNAL-001` et `JOURNAL-002` sont des régularisations documentaires de comportements déjà livrés. Leurs
sources limitent explicitement leur portée ; elles ne déclarent pas réalisées les Features plus larges.

`JOURNAL-002` conserve sa date initiale ; son extension du 2026-10-05 ajoute la capture HTTP exhaustive,
les dix filtres structurés, le contexte Évaluation et les preuves de confidentialité et d’isolation.

## Compléments pré-MEP — EPIC-011

Les jobs sont une planification, pas de nouveaux états : un prérequis de vague non achevé ne transforme pas automatiquement un PBI Ouvert en Bloqué. Un vrai blocage doit être renseigné ici. Les dépendances et rapprochements sont dans les [sources pré-MEP](../source/07-pre-mep.md).

| PBI | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- |
| MEP-001 — Sécurisation de l’authentification | FEAT-042 — Fondations | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-002 — HTTPS, proxy, cookies et CSRF | FEAT-042 — Fondations | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-003 — Intégrité des transactions SQLite | FEAT-042 — Fondations | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-004 — Fiabilisation SMTP et reprises | FEAT-042 — Fondations | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-005 — Accessibilité des modales | FEAT-042 — Fondations | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-006 — Licence Apache 2.0 | FEAT-042 — Fondations | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-007 — Notation explicite sans valeur présélectionnée | FEAT-042 — Fondations | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-008 — Permissions DRF restrictives | FEAT-042 — Fondations | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-009 — Secrets et paramètres de production | FEAT-043 — Robustesse | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-010 — Concurrence et verrouillage SQLite | FEAT-043 — Robustesse | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-011 — Isolation inter-organisations et rôles | FEAT-043 — Robustesse | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-012 — Protection GitHub et CI | FEAT-043 — Robustesse | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-013 — Ergonomie de la passation et du curseur de notation | FEAT-044 — UI/UX | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-014 — Lisibilité et compréhension des résultats | FEAT-044 — UI/UX | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-015 — Ergonomie du radar et des comparaisons | FEAT-044 — UI/UX | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-016 — Simplification du vocabulaire et des indicateurs de pilotage | FEAT-044 — UI/UX | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-017 — Responsive et ergonomie tactile | FEAT-044 — UI/UX | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-018 — Cohérence des interactions, états vides, erreurs et chargements | FEAT-044 — UI/UX | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-019 — Cohérence visuelle des thèmes, contrastes et typographie | FEAT-044 — UI/UX | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-020 — Conservation et purge des journaux | FEAT-045 — Exploitation et contrat de déploiement | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-021 — Configuration unique MESS | FEAT-045 — Exploitation et contrat de déploiement | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-022 — Contrat d’installation et d’exploitation | FEAT-045 — Exploitation et contrat de déploiement | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-023 — Actualisation README, backlog et architecture | FEAT-045 — Exploitation et contrat de déploiement | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-024 — Construction du package hors ligne | FEAT-046 — Packaging et installation | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-025 — Installation automatisée | FEAT-046 — Packaging et installation | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-026 — Démarrage, arrêt et mise à jour | FEAT-046 — Packaging et installation | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-027 — Sauvegarde, restauration et rollback | FEAT-046 — Packaging et installation | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-028 — Documentation d’installation et d’exploitation | FEAT-047 — Documentation et transfert | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-029 — Documentation de transfert et fork Apache 2.0 | FEAT-047 — Documentation et transfert | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-030 — Préparation de la recette fonctionnelle | FEAT-047 — Documentation et transfert | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-031 — Préparation de la recette technique | FEAT-047 — Documentation et transfert | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-032 — Installation hors ligne sur environnement vierge | FEAT-048 — Recette préproduction | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-033 — Recette fonctionnelle et UX | FEAT-048 — Recette préproduction | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-034 — Recette technique et reprise après incident | FEAT-048 — Recette préproduction | À définir | À définir | Ouvert | aucun blocage constaté ; prérequis de vague dans la source | N/A |
| MEP-035 — Décision GO/NO-GO | FEAT-048 — Recette préproduction | À définir | À définir | Ouvert | GO après satisfaction des jobs 1–7 ; NO-GO possible sur blocage | N/A |
