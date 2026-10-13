# MESS — instantané canonique historique avant refonte

Instantané du registre à `ec850ba`, conservé le 2026-10-13. Ces lignes sont reproduites sans modification.
Ce fichier archive les anciens rattachements, recommandations, statuts et dates ; il ne fait pas autorité
pour le suivi courant des PBI redistribués. Le [registre principal](pbis.md) désigne leurs entrées actives.
MEP-001 à MEP-008 restent huit réalisations historiques du Job 1, sans relance.
MEP-009 à MEP-034 sont conservés dans les fiches actives indiquées par la [correspondance](../planning/pre-mep-rapprochements.md).
MEP-035 est désormais le [jalon décisionnel séparé](mess-jalon.md), hors décompte des PBI.
FEAT-042 à FEAT-048 sont retirées de la planification active et jamais réutilisées.

| PBI | Feature parente historique | Taille recommandée historique | Modèle Codex historique | Statut historique | Blocage ou preuve historique | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- |
| MEP-001 — Sécurisation de l’authentification | FEAT-042 — Fondations | À définir | À définir | Réalisé | [limites compte/origine, expiration, proxies et preuves](../../architecture/login-security.md) | 2026-10-12 |
| MEP-002 — HTTPS, proxy, cookies et CSRF | FEAT-042 — Fondations | À définir | À définir | Réalisé | aucun dans le périmètre applicatif ; recette TLS MESS distincte | 2026-10-12 |
| MEP-003 — Intégrité des transactions SQLite | FEAT-042 — Fondations | À définir | À définir | Réalisé | aucun dans le périmètre demandé ; [preuves SQLite](../../architecture/sqlite-transactions.md) | 2026-10-12 |
| MEP-004 — Fiabilisation SMTP et reprises | FEAT-042 — Fondations | M | Codex | Réalisé | aucun dans le périmètre ; exploitation SMTP documentée | 2026-10-12 |
| MEP-005 — Accessibilité des modales | FEAT-042 — Fondations | À définir | À définir | Réalisé | aucun ; preuves dans [le contrat des dialogues](../../architecture/dialog-accessibility.md) | 2026-10-12 |
| MEP-006 — Licence Apache 2.0 | FEAT-042 — Fondations | À définir | À définir | Réalisé | aucun ; LICENSE/NOTICE, mentions publiques et audit tiers documentés | 2026-10-11 |
| MEP-007 — Notation explicite sans valeur présélectionnée | FEAT-042 — Fondations | À définir | À définir | Réalisé | aucun dans le périmètre demandé ; notation explicite, reprise et refus de complétude validés | 2026-10-12 |
| MEP-008 — Permissions DRF restrictives | FEAT-042 — Fondations | À définir | À définir | Réalisé | aucun dans le périmètre demandé | 2026-10-11 |
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
