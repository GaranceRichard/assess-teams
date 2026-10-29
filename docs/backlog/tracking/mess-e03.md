# Registre canonique MESS — EPIC-013 — Installation et exploitation MESS

Section du [registre canonique unique](pbis.md), selon la [gouvernance](../governance.md).
Les repères E/F et NN.NN sont des alias de navigation, pas de nouveaux identifiants.
Les tailles sont des recommandations XS/S ; aucun modèle n’est affecté.
Ouvert ne signifie pas prêt : consulter les dépendances de la source et le [plan](../planning/pre-mep.md).
Ordres U/I/C : recommandations du plan, sans statut ni dépendance technique supplémentaire ; dates et preuves conservées.
MEP-055 attend D01–D09 ; C11 fixe objectifs/responsabilités d’exploitation et C12 le maintien/absorption de MEP-056. [Natures, livrables et passages par PBI](../planning/audit-20261027/trajectoire.md) ; aucune configuration cible ou clôture supposée.

| Repère | PBI et source | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage ou preuve | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10.01 | [MEP-054 — Définir le contrat de configuration unique](../source/mess/f10.md) | FEAT-058 — Configuration unique MESS | S | À définir | Ouvert | I1 : prochain lancement installation après décisions MEP-055 | N/A |
| 10.02 | [MEP-021 — Charger et valider la configuration unique](../source/mess/f10.md) | FEAT-058 — Configuration unique MESS | S | À définir | Ouvert | I2 : chargement commun après MEP-054 | N/A |
| 11.01 | [MEP-055 — Définir les prérequis d’installation](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | XS | À définir | Bloqué | [Contrat préparé, décisions MESS D01–D09 en attente](../../operations/installation-prerequisites-validation.md) ; critère « définis avec MESS » non satisfait, aucune cible qualifiée | N/A |
| 11.02 | [MEP-022 — Définir les opérations d’exploitation](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | S | À définir | Ouvert | I2 : contrat d’exploitation après MEP-055/054 ; seuils et responsables MESS à convenir | N/A |
| 11.03 | [MEP-023 — Actualiser le README et l’architecture](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | XS | À définir | Ouvert | I3b : README/architecture après MEP-021/022, sans attendre le package | N/A |
| 11.04 | [MEP-056 — Actualiser le backlog](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | XS | À définir | Ouvert | I3b : suivi du contrat après MEP-021/022 ; non réalisé par la présente refonte | N/A |
| 12.01 | [MEP-057 — Inventorier les dépendances nécessaires à la distribution](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | I2 : inventaire après MEP-055/054 ; préparation possible, cible non supposée | N/A |
| 12.02 | [MEP-058 — Préparer le frontend compilé pour la distribution](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | I3a : build après MEP-057, parallèle à Python ; actualiser au candidat final | N/A |
| 12.03 | [MEP-059 — Préparer les dépendances Python hors ligne](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | I3a : wheelhouse après MEP-057, parallèle au frontend | N/A |
| 12.04 | [MEP-024 — Assembler le package autonome](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | I4 : assembler après MEP-058/059/021/022 ; réassembler le candidat convergé | N/A |
| 13.01 | [MEP-060 — Préparer les répertoires et les paramètres d’installation](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | I5 : préflight après MEP-024/021 | N/A |
| 13.02 | [MEP-061 — Installer les composants et dépendances](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | I5 : composants après MEP-060 | N/A |
| 13.03 | [MEP-062 — Initialiser SQLite et les données nécessaires](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | I5 : SQLite/bootstrap après MEP-061 | N/A |
| 13.04 | [MEP-025 — Vérifier l’installation et diagnostiquer les échecs](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | I5 : diagnostic après MEP-062 | N/A |
| 14.01 | [MEP-063 — Automatiser le démarrage et l’arrêt de l’application](../source/mess/f14.md) | FEAT-062 — Cycle d’exploitation | S | À définir | Ouvert | I6 : services après MEP-025, parallèle à sauvegarde | N/A |
| 14.02 | [MEP-026 — Automatiser la mise à jour de l’application](../source/mess/f14.md) | FEAT-062 — Cycle d’exploitation | S | À définir | Ouvert | I7 : upgrade après MEP-063/064, parallèle à restauration | N/A |
| 15.01 | [MEP-064 — Réaliser une sauvegarde cohérente de SQLite](../source/mess/f15.md) | FEAT-063 — Sauvegarde et réversibilité | S | À définir | Ouvert | I6 : sauvegarde après MEP-025/022, parallèle aux services | N/A |
| 15.02 | [MEP-027 — Restaurer les données SQLite](../source/mess/f15.md) | FEAT-063 — Sauvegarde et réversibilité | S | À définir | Ouvert | I7 : restauration après MEP-064/063, parallèle à upgrade | N/A |
| 15.03 | [MEP-065 — Revenir à la version précédente après une mise à jour](../source/mess/f15.md) | FEAT-063 — Sauvegarde et réversibilité | S | À définir | Ouvert | I8 : rollback après MEP-026/027 | N/A |
