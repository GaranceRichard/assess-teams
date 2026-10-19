# Registre canonique MESS — EPIC-013 — Installation et exploitation MESS

Section du [registre canonique unique](pbis.md), selon la [gouvernance](../governance.md).
Les repères E/F et NN.NN sont des alias de navigation, pas de nouveaux identifiants.
Les tailles sont des recommandations XS/S ; aucun modèle n’est affecté.
Ouvert ne signifie pas prêt : consulter les dépendances de la source et le [plan](../planning/pre-mep.md).
MEP-055 attend la validation MESS du contrat des prérequis (D01–D09) ; les arbitrages métier existants restent dans leur registre.

| Repère | PBI et source | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage ou preuve | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10.01 | [MEP-054 — Définir le contrat de configuration unique](../source/mess/f10.md) | FEAT-058 — Configuration unique MESS | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 10.02 | [MEP-021 — Charger et valider la configuration unique](../source/mess/f10.md) | FEAT-058 — Configuration unique MESS | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 11.01 | [MEP-055 — Définir les prérequis d’installation](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | XS | À définir | Bloqué | [Contrat préparé, décisions MESS D01–D09 en attente](../../operations/installation-prerequisites-validation.md) ; critère « définis avec MESS » non satisfait, aucune cible qualifiée | N/A |
| 11.02 | [MEP-022 — Définir les opérations d’exploitation](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 11.03 | [MEP-023 — Actualiser le README et l’architecture](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | XS | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 11.04 | [MEP-056 — Actualiser le backlog](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | XS | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 12.01 | [MEP-057 — Inventorier les dépendances nécessaires à la distribution](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 12.02 | [MEP-058 — Préparer le frontend compilé pour la distribution](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 12.03 | [MEP-059 — Préparer les dépendances Python hors ligne](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 12.04 | [MEP-024 — Assembler le package autonome](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 13.01 | [MEP-060 — Préparer les répertoires et les paramètres d’installation](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 13.02 | [MEP-061 — Installer les composants et dépendances](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 13.03 | [MEP-062 — Initialiser SQLite et les données nécessaires](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 13.04 | [MEP-025 — Vérifier l’installation et diagnostiquer les échecs](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 14.01 | [MEP-063 — Automatiser le démarrage et l’arrêt de l’application](../source/mess/f14.md) | FEAT-062 — Cycle d’exploitation | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 14.02 | [MEP-026 — Automatiser la mise à jour de l’application](../source/mess/f14.md) | FEAT-062 — Cycle d’exploitation | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 15.01 | [MEP-064 — Réaliser une sauvegarde cohérente de SQLite](../source/mess/f15.md) | FEAT-063 — Sauvegarde et réversibilité | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 15.02 | [MEP-027 — Restaurer les données SQLite](../source/mess/f15.md) | FEAT-063 — Sauvegarde et réversibilité | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 15.03 | [MEP-065 — Revenir à la version précédente après une mise à jour](../source/mess/f15.md) | FEAT-063 — Sauvegarde et réversibilité | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
