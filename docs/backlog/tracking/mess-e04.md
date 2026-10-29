# Registre canonique MESS — EPIC-014 — Documentation, transfert et recette

Section du [registre canonique unique](pbis.md), selon la [gouvernance](../governance.md).
Les repères E/F et NN.NN sont des alias de navigation, pas de nouveaux identifiants.
Les tailles sont des recommandations XS/S ; aucun modèle n’est affecté.
Ouvert ne signifie pas prêt : consulter les dépendances de la source et le [plan](../planning/pre-mep.md).
Ordres U/I/C : recommandations du plan, sans statut ni dépendance technique supplémentaire ; dates et preuves conservées.
Guides/cahier : F (D si seuils manquants) ; PV : E, distincts de tests locaux ou développement. [Entrées, refus et passages](../planning/audit-20261027/trajectoire.md) ; ARB-ORG-005 pour 033, C11 pour charge/reprise, D01–D09 selon consommateurs.

| Repère | PBI et source | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage ou preuve | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 16.01 | [MEP-028 — Rédiger le guide d’installation](../source/mess/f16.md) | FEAT-064 — Documentation et transfert | XS | À définir | Ouvert | Guide préparé pendant I5, clôture après MEP-025/023, avant MEP-032 | N/A |
| 16.02 | [MEP-066 — Rédiger le guide d’exploitation](../source/mess/f16.md) | FEAT-064 — Documentation et transfert | XS | À définir | Ouvert | Guide préparé pendant I6–I8, clôture après MEP-020/026/065/023, avant GO | N/A |
| 16.03 | [MEP-029 — Documenter le transfert, le fork et la licence Apache 2.0](../source/mess/f16.md) | FEAT-064 — Documentation et transfert | XS | À définir | Ouvert | Transfert/fork préparé en amont, clôture après MEP-006/024 ; migration du dépôt distincte | N/A |
| 17.01 | [MEP-030 — Définir les scénarios de recette fonctionnelle](../source/mess/f17.md) | FEAT-065 — Préparation des recettes | S | À définir | Réalisé | [Cahier FON-01 à FON-18](../../quality/functional-acceptance.md), jeux fictifs, vrais refus et preuves ; [revue DoD](../../quality/functional-acceptance-review.md). Aucun PV cible exécuté | 2026-10-22 |
| 17.02 | [MEP-067 — Définir les scénarios de recette UX](../source/mess/f17.md) | FEAT-065 — Préparation des recettes | XS | À définir | Réalisé | [Cahier UX-01 à UX-09](../../quality/ux-acceptance.md), mesures/refus/preuves et tests existants ; [revue DoD](../../quality/ux-acceptance-review.md). MEP-053/019 peuvent démarrer ; aucun PV applicatif anticipé | 2026-10-21 |
| 17.03 | [MEP-031 — Définir les scénarios de recette technique](../source/mess/f17.md) | FEAT-065 — Préparation des recettes | S | À définir | Ouvert | I3b : préparer la trame, clôturer après MEP-022 ; MEP-039 acquis | N/A |
| 18.01 | [MEP-032 — Installer Assess Teams sur un environnement vierge](../source/mess/f18.md) | FEAT-066 — Recette d’installation hors ligne | S | À définir | Ouvert | C1 : recette du candidat final vierge après MEP-025/028/031 | N/A |
| 18.02 | [MEP-068 — Vérifier le fonctionnement sans connexion Internet](../source/mess/f18.md) | FEAT-066 — Recette d’installation hors ligne | S | À définir | Ouvert | C2 : autonomie hors Internet après MEP-032/063/030 | N/A |
| 19.01 | [MEP-033 — Vérifier les parcours d’administration](../source/mess/f19.md) | FEAT-067 — Recette fonctionnelle et UX | S | À définir | Ouvert | C3a : administration après MEP-068 et cahiers ; ARB-ORG-005 à résoudre ou limiter effectivement | N/A |
| 19.02 | [MEP-069 — Vérifier les parcours d’évaluation et de notation](../source/mess/f19.md) | FEAT-067 — Recette fonctionnelle et UX | S | À définir | Ouvert | C3a : notation après MEP-068, cahiers et correctifs UX requis ; parallèle aux autres recettes | N/A |
| 19.03 | [MEP-070 — Vérifier les parcours de consultation des résultats](../source/mess/f19.md) | FEAT-067 — Recette fonctionnelle et UX | S | À définir | Ouvert | C3a : résultats après MEP-068, cahiers et correctifs UX requis ; parallèle aux autres recettes | N/A |
| 20.01 | [MEP-034 — Vérifier la sécurité et l’isolation des organisations](../source/mess/f20.md) | FEAT-068 — Recette technique et reprise après incident | S | À définir | Ouvert | C3b : sécurité du candidat après MEP-068/031 et acquis ; attente MEP-043 retirée, F04 reste au GO | N/A |
| 20.02 | [MEP-071 — Vérifier la concurrence et la stabilité SQLite](../source/mess/f20.md) | FEAT-068 — Recette technique et reprise après incident | S | À définir | Ouvert | C3b : SQLite cible après MEP-068/031 et capacités requises ; données isolées | N/A |
| 20.03 | [MEP-072 — Exercer la sauvegarde, la restauration et le rollback](../source/mess/f20.md) | FEAT-068 — Recette technique et reprise après incident | S | À définir | Ouvert | C3b : reprise après MEP-068/031 et sauvegarde/restauration/rollback ; instance isolée | N/A |
