# Registre canonique MESS — EPIC-011 — Sécurité et robustesse

Section du [registre canonique unique](pbis.md), selon la [gouvernance](../governance.md).
Les repères E/F et NN.NN sont des alias de navigation, pas de nouveaux identifiants.
Les tailles sont des recommandations XS/S ; aucun modèle n’est affecté.
Ouvert ne signifie pas prêt : consulter les dépendances de la source et le [plan](../planning/pre-mep.md).
Aucun blocage supplémentaire constaté ; les arbitrages métier existants restent dans leur registre.

| Repère | PBI et source | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage ou preuve | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01.01 | [MEP-036 — Inventorier les paramètres sensibles et les valeurs par défaut](../source/mess/f01.md) | FEAT-049 — Sécurité de production | XS | À définir | Réalisé | [inventaire et preuves MEP-036](../../operations/configuration/README.md) ; 91 noms rapprochés, refus vérifiés, full gate réussi | 2026-10-14 |
| 01.02 | [MEP-009 — Sécuriser les secrets et vérifier la configuration au démarrage](../source/mess/f01.md) | FEAT-049 — Sécurité de production | S | À définir | Réalisé | [démarrage, secrets, rotation et preuves MEP-009](../../operations/configuration/startup-validation.md) ; refus confidentiels et protections HTTP réutilisées | 2026-10-15 |
| 01.03 | [MEP-011 — Contrôler l’isolation des accès entre organisations](../source/mess/f01.md) | FEAT-049 — Sécurité de production | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 01.04 | [MEP-037 — Renforcer les permissions selon les rôles](../source/mess/f01.md) | FEAT-049 — Sécurité de production | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 01.05 | [MEP-038 — Sécuriser les accès indirects et les exports](../source/mess/f01.md) | FEAT-049 — Sécurité de production | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 02.01 | [MEP-039 — Définir les paramètres de concurrence SQLite](../source/mess/f02.md) | FEAT-050 — SQLite en exploitation | XS | À définir | Réalisé | [référence et 126 mesures sur fichier](../../operations/sqlite/README.md) ; PRAGMA, processus API/workers, refus et acquis MEP-003 vérifiés ; full gate réussi | 2026-10-15 |
| 02.02 | [MEP-010 — Gérer les verrous et les transactions concurrentes](../source/mess/f02.md) | FEAT-050 — SQLite en exploitation | S | À définir | Réalisé | [preuves MEP-010 et CI du SHA intégré](../../operations/sqlite/contention-validation.md) ; 22 cas multiprocessus, reprises bornées, refus sûrs, atomicité/Journal, pré-push exhaustif et CI verte | 2026-10-16 |
| 02.03 | [MEP-040 — Gérer les conflits sur les opérations critiques](../source/mess/f02.md) | FEAT-050 — SQLite en exploitation | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 03.02 | [MEP-042 — Configurer les durées de conservation des journaux](../source/mess/f03.md) | FEAT-051 — Journalisation et conservation | XS | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 03.03 | [MEP-020 — Automatiser la purge des journaux](../source/mess/f03.md) | FEAT-051 — Journalisation et conservation | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 04.01 | [MEP-012 — Vérifier les protections de branche et les contrôles CI](../source/mess/f04.md) | FEAT-052 — Gouvernance Git et intégration continue | XS | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |
| 04.02 | [MEP-043 — Mettre en place les protections manquantes](../source/mess/f04.md) | FEAT-052 — Gouvernance Git et intégration continue | S | À définir | Ouvert | aucun blocage constaté ; prérequis dans la source | N/A |

03.01 est un acquis référencé : JOURNAL-001/002 restent au registre fonctionnel, avec leurs dates/parents.
[MEP-041 — ancien alias consolidé](mess-doublons-historique.md) reste archivé, hors du dénominateur MESS.
