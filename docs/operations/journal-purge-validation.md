# MEP-020 — Preuves et revue DoD

Campagne du 2026-10-19 ; [procédure](journal-purge.md), [source F03](../backlog/source/mess/f03.md).
Prérequis vérifié avant code : MEP-042 réalisé dans `origin/main` à `e81e85f`, avec
[CI verte du SHA d'implémentation](configuration/journal-retention-validation.md).
Toutes les durées, références et données de tests sont synthétiques.

## Critères et refus permanents

| Critère / vrai refus | Preuve reproductible dans `backend/tests` |
| --- | --- |
| Simulation sans suppression ; exécution explicite | `test_journal_purge.py` : ORM réel, comptes distincts, échéance stricte à la microseconde, global et SET_NULL ; activités et relations métier intactes |
| Durées/périmètres inchangés | Suites MEP-042 rejouées ; `test_journal_purge_refusals.py` : keep, policy métier finie, surcharge booléenne, scope métier/inconnu refusés sans effet |
| Purge avant échéance interdite | Test des trois bornes : avant l'échéance éligible, égalité et date récente conservées ; aucune option pour forcer date ou durée |
| Bornage et fenêtre stable | Plafond de lignes/lots, nouveau log hors borne d'identifiant, reprise idempotente, durée maximale sans sous-dépassement calendrier |
| Traçabilité sans divulgation | Reçus séparés et sorties JSON ; entrées invalides/erreurs SQL et inattendues confidentielles ; aucune sortie de contenu ni faux état completed, y compris reprise d'un reçu terminé sous politique modifiée |
| Intégrité et protection des preuves | `test_journal_purge_integrity.py` : quick_check/FK refusés ; détails de cascade inattendus et relation inverse refusés ; échec du dernier contrôle annule lot et reçu |
| Interruption maîtrisée | `test_journal_purge_recovery.py` : interruption dans la suppression, reprise exacte, budget épuisé non nul, mode/politique/horloge/compteurs/cutoff altérés refusés |
| Arrêt brutal et concurrence réelle | `test_journal_purge_processes.py` : SQLite sur fichier, processus tué après un lot validé pendant le suivant ; rollback, reprise, intégrité et preuve métier intacte ; writer concurrent refusé puis reprise sûre, development et production |
| Planification | Commande courte sans daemon, options bornées et code non nul supervisable ; procédure Windows/Linux, approbation et recette de l'instance explicites |

## Revue documentaire et applicabilité

README modifié avant développement. Règles agents, charte, DoD, stratégie de tests, fondamentaux,
API/OpenAPI, journaux, configuration MEP-042, inventaire MEP-036, démarrage MEP-009 et suivi F03 relus.
Contrats journaux/conservation, navigation architecturale et procédures mis à jour dans ce lot.
Règles et seuils qualité inchangés. Nouvelle table interne avec migration additive, sans nouvelle dépendance.
Les collecteurs JOURNAL-001/002, endpoints, permissions et parcours React ne sont pas modifiés.
Aucun nouveau contrat HTTP ni parcours E2E spécifique ; leur non-régression reste requise par le plan.
Le schéma OpenAPI et la cohérence des migrations sont contrôlés par les suites existantes.
Il s'agit d'une nouvelle capacité, sans correction de bug historique à attribuer.

L'autorisation réelle du ticket, les ACL, le créneau, le volume/la durée sur une installation MESS,
les gels ciblés et la conservation des preuves métier/sauvegardes restent sous leurs responsabilités
et arbitrages MEP-042. Aucun test synthétique ne prétend approuver ces décisions ni installer une tâche réelle.

## Validation et livraison

Campagne ciblée du candidat stabilisé : **110 tests réussis** (48 purge et 62 MEP-042), Ruff/format
et migrations conformes. Elle inclut SIGTERM, arrêt brutal, concurrence et absence de résultat anticipé
avant revalidation. Liens locaux des documents modifiés vérifiés.
Les résultats exhaustifs finaux seront consignés après les gates obligatoires.
MEP-020 reste ouvert tant que la CI du commit intégré n'est pas verte.
