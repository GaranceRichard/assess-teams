# Registre canonique MESS — EPIC-014 — Documentation, transfert et recette

Section du [registre canonique unique](pbis.md), selon la [gouvernance](../governance.md).
Les repères E/F et NN.NN sont des alias de navigation, pas de nouveaux identifiants.
Les tailles sont des recommandations XS/S ; aucun modèle n’est affecté.
Ouvert ne signifie pas prêt : consulter les dépendances de la source et le [plan](../planning/pre-mep.md).
Aptitudes et ordre : recommandations du plan, sans nouveau statut ni prérequis implicite ; dates et preuves conservées.
Guides et cahier consomment les sorties réelles ; les PV restent distincts du développement.
[Entrées et preuves par PBI](../planning/mess-dependances.md) ; profil de référence et site réel séparés,
ARB-ORG-005 applicable à 033, protocole d’exploitation MEP-022 applicable aux mesures.

| Repère | PBI et source | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage ou preuve | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 16.01 | [MEP-028 — Rédiger le guide d’installation](../source/mess/f16.md) | FEAT-064 — Documentation et transfert | XS | À définir | Ouvert | Non prêt : guide des commandes d’installation après MEP-025 ; attente MEP-023 supprimée | N/A |
| 16.02 | [MEP-066 — Rédiger le guide d’exploitation](../source/mess/f16.md) | FEAT-064 — Documentation et transfert | XS | À définir | Ouvert | Non prêt : guide des opérations après MEP-026/065 et 020 acquis ; attente MEP-023 supprimée | N/A |
| 16.03 | [MEP-029 — Documenter le transfert, le fork et la licence Apache 2.0](../source/mess/f16.md) | FEAT-064 — Documentation et transfert | XS | À définir | Ouvert | Non prêt : fork et reconstruction du package après MEP-024 ; 006 acquis, transfert d’hébergement distinct | N/A |
| 17.01 | [MEP-030 — Définir les scénarios de recette fonctionnelle](../source/mess/f17.md) | FEAT-065 — Préparation des recettes | S | À définir | Réalisé | [Cahier FON-01 à FON-18](../../quality/functional-acceptance.md), jeux fictifs, vrais refus et preuves ; [revue DoD](../../quality/functional-acceptance-review.md). Aucun PV cible exécuté | 2026-10-22 |
| 17.02 | [MEP-067 — Définir les scénarios de recette UX](../source/mess/f17.md) | FEAT-065 — Préparation des recettes | XS | À définir | Réalisé | [Cahier UX-01 à UX-09](../../quality/ux-acceptance.md), mesures/refus/preuves et tests existants ; [revue DoD](../../quality/ux-acceptance-review.md). MEP-053/019 peuvent démarrer ; aucun PV applicatif anticipé | 2026-10-21 |
| 17.03 | [MEP-031 — Définir les scénarios de recette technique](../source/mess/f17.md) | FEAT-065 — Préparation des recettes | S | À définir | Ouvert | Prêt : MEP-022 et MEP-039 réalisés ; finaliser le cahier avec les protocoles publiés, aucun PV cible déduit | N/A |
| 18.01 | [MEP-032 — Installer Assess Teams sur un environnement vierge](../source/mess/f18.md) | FEAT-066 — Recette d’installation hors ligne | S | À définir | Ouvert | Non prêt : MEP-025/028/031 et environnement vierge disponible ; PV du profil effectivement testé | N/A |
| 18.02 | [MEP-068 — Vérifier le fonctionnement sans connexion Internet](../source/mess/f18.md) | FEAT-066 — Recette d’installation hors ligne | S | À définir | Ouvert | Non prêt : MEP-032/063 et environnement ; MEP-030 acquis, usage sans Internet à démontrer | N/A |
| 19.01 | [MEP-033 — Vérifier les parcours d’administration](../source/mess/f19.md) | FEAT-067 — Recette fonctionnelle et UX | S | À définir | Ouvert | Non prêt : MEP-068/environnement et politique ARB-ORG-005 décidée et appliquée ; chantier ORG-004 protégé | N/A |
| 19.02 | [MEP-069 — Vérifier les parcours d’évaluation et de notation](../source/mess/f19.md) | FEAT-067 — Recette fonctionnelle et UX | S | À définir | Ouvert | Non prêt : MEP-068/environnement ; cahiers et UX acquis, recette de notation sur candidat distincte | N/A |
| 19.03 | [MEP-070 — Vérifier les parcours de consultation des résultats](../source/mess/f19.md) | FEAT-067 — Recette fonctionnelle et UX | S | À définir | Ouvert | Non prêt : MEP-068/environnement ; cahiers et UX acquis, recette Results sur candidat distincte | N/A |
| 20.01 | [MEP-034 — Vérifier la sécurité et l’isolation des organisations](../source/mess/f20.md) | FEAT-068 — Recette technique et reprise après incident | S | À définir | Ouvert | Non prêt : MEP-068/031 et environnement ; prérequis sécurité acquis, F04 au GO sans attente 043 | N/A |
| 20.02 | [MEP-071 — Vérifier la concurrence et la stabilité SQLite](../source/mess/f20.md) | FEAT-068 — Recette technique et reprise après incident | S | À définir | Ouvert | Non prêt : MEP-068/031/063 et environnement ; protocole du projet, intégrité et limites mesurées | N/A |
| 20.03 | [MEP-072 — Exercer la sauvegarde, la restauration et le rollback](../source/mess/f20.md) | FEAT-068 — Recette technique et reprise après incident | S | À définir | Ouvert | Non prêt : MEP-068/031/064/027/065 et clone isolé ; point et durée de reprise mesurés sans garantie MESS inventée | N/A |
