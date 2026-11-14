# Registre canonique MESS — EPIC-013 — Installation et exploitation MESS

Section du [registre canonique unique](pbis.md), selon la [gouvernance](../governance.md).
Les repères E/F et NN.NN sont des alias de navigation, pas de nouveaux identifiants.
Les tailles sont des recommandations XS/S ; aucun modèle n’est affecté.
Ouvert ne signifie pas prêt : consulter les dépendances de la source et le [plan](../planning/pre-mep.md).
Aptitudes et ordre : recommandations du plan, sans nouveau statut ni prérequis implicite ; dates et preuves conservées.
MEP-055 est Ouvert/N/A sur décision explicite du 2026-11-14 ; aucune clôture. D01–D09 sont des axes
d’analyse du profil de référence, sans approbations externes obligatoires. C11 relève des opérations
et mesures définies par le projet ; C12 reste une option. [Aptitude des PBI](../planning/mess-dependances.md).

| Repère | PBI et source | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage ou preuve | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10.01 | [MEP-054 — Définir le contrat de configuration unique](../source/mess/f10.md) | FEAT-058 — Configuration unique MESS | S | À définir | Ouvert | Prêt : MEP-036 acquis ; schéma paramétrable sur REF-WIN-01, sans attente MEP-055 | N/A |
| 10.02 | [MEP-021 — Charger et valider la configuration unique](../source/mess/f10.md) | FEAT-058 — Configuration unique MESS | S | À définir | Ouvert | Non prêt : attend le schéma MEP-054 ; chargement commun et refus avant effet, MEP-009 acquis | N/A |
| 11.01 | [MEP-055 — Définir les prérequis d’installation](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | XS | À définir | Ouvert | Ouverture approuvée explicitement par le responsable produit le 2026-11-14 : Bloqué→Ouvert, réalisation N/A ; profil de référence à vérifier, aucune clôture ni qualification du site MESS | N/A |
| 11.02 | [MEP-022 — Définir les opérations d’exploitation](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | S | À définir | Ouvert | Prêt : MEP-042 acquis ; opérations/rôles/protocole de référence, sans accord externe ni attente 055/054 | N/A |
| 11.03 | [MEP-023 — Actualiser le README et l’architecture](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | XS | À définir | Ouvert | Non prêt : entrées publiques du contrat après MEP-021/022 ; ne pas annoncer les outils futurs livrés | N/A |
| 11.04 | [MEP-056 — Actualiser le backlog](../source/mess/f11.md) | FEAT-059 — Contrat d’installation et d’exploitation | XS | À définir | Ouvert | Non prêt : cohérence sources/registre/synthèse après MEP-021/022 ; C12 facultatif, aucun nouveau rapport | N/A |
| 12.01 | [MEP-057 — Inventorier les dépendances nécessaires à la distribution](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | Prêt : MEP-006 acquis ; inventaire versions/ABI/empreintes/licences du profil, sans attendre 055/054 | N/A |
| 12.02 | [MEP-058 — Préparer le frontend compilé pour la distribution](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | Non prêt : build normal et assets locaux après MEP-057, parallèle à Python ; actualiser au candidat | N/A |
| 12.03 | [MEP-059 — Préparer les dépendances Python hors ligne](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | Non prêt : wheelhouse compatible et installation sans réseau après MEP-057, parallèle au frontend | N/A |
| 12.04 | [MEP-024 — Assembler le package autonome](../source/mess/f12.md) | FEAT-060 — Distribution autonome hors ligne | S | À définir | Ouvert | Non prêt : assemblage reproductible après 058/059/021/022 ; réassembler avec les outils effectivement livrés | N/A |
| 13.01 | [MEP-060 — Préparer les répertoires et les paramètres d’installation](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | Non prêt : préflight du package 024 et de la configuration 021, refus avant effet destructif | N/A |
| 13.02 | [MEP-061 — Installer les composants et dépendances](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | Non prêt : pose locale après MEP-060, sans faux succès ni résolution réseau | N/A |
| 13.03 | [MEP-062 — Initialiser SQLite et les données nécessaires](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | Non prêt : migrations/bootstrap production après MEP-061, persistance et relance sans perte | N/A |
| 13.04 | [MEP-025 — Vérifier l’installation et diagnostiquer les échecs](../source/mess/f13.md) | FEAT-061 — Installation automatisée | S | À définir | Ouvert | Non prêt : diagnostic après MEP-062 ; commandes workers vérifiées avant automatisation 063 | N/A |
| 14.01 | [MEP-063 — Automatiser le démarrage et l’arrêt de l’application](../source/mess/f14.md) | FEAT-062 — Cycle d’exploitation | S | À définir | Ouvert | Non prêt : services après MEP-025 ; SMTP acquis, pas de double worker ni processus résiduel | N/A |
| 14.02 | [MEP-026 — Automatiser la mise à jour de l’application](../source/mess/f14.md) | FEAT-062 — Cycle d’exploitation | S | À définir | Ouvert | Non prêt : upgrade après MEP-063/064, parallèle à restauration sur clone distinct | N/A |
| 15.01 | [MEP-064 — Réaliser une sauvegarde cohérente de SQLite](../source/mess/f15.md) | FEAT-063 — Sauvegarde et réversibilité | S | À définir | Ouvert | Non prêt : sauvegarde après MEP-021/022 ; n’attend plus l’installateur 025 | N/A |
| 15.02 | [MEP-027 — Restaurer les données SQLite](../source/mess/f15.md) | FEAT-063 — Sauvegarde et réversibilité | S | À définir | Ouvert | Non prêt : restauration après MEP-064/063 ; point récupéré et durée mesurés, données en place protégées | N/A |
| 15.03 | [MEP-065 — Revenir à la version précédente après une mise à jour](../source/mess/f15.md) | FEAT-063 — Sauvegarde et réversibilité | S | À définir | Ouvert | Non prêt : rollback du couple version/schéma après MEP-026/027 | N/A |
