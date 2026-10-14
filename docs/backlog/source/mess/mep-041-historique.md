> **Archive de consolidation du 2026-10-14.** MEP-041 est retiré du suivi actif comme doublon documentaire de JOURNAL-001/002. Son ancien parent, son statut et sa date restent tracés ; aucun travail livré n’est rouvert. [Audit](../../planning/mess-audit.md).

## MEP-041 — Séparer les journaux HTTP des événements métier

- **Identifiant / repère cible / Feature parente :** MEP-041 / 03.01 / FEAT-051 — Journalisation et conservation.
- **User story :** en tant que Admin, Superadmin et exploitant MESS, je veux séparer les journaux HTTP des événements métier afin de garantir une traçabilité exploitable sans accumulation incontrôlée.
- **Intention / description :** Reconnaître les deux collections déjà livrées, capture HTTP, activités réussies, filtres et confidentialité par les preuves existantes ; aucun développement restant pour cette séparation.
- **Origine / limite :** 2.4 / JOURNAL-001 / JOURNAL-002 ; acquis et périmètre de cette Feature conservés. La [correspondance](../../planning/pre-mep-rapprochements.md) explicite le découpage.
- **Critères d’acceptation :** Reconnaître les deux collections déjà livrées, capture HTTP, activités réussies, filtres et confidentialité par les preuves existantes ; aucun développement restant pour cette séparation.
- **Vrais cas de refus :** Dupliquer un collecteur, replanifier la séparation ou déplacer JOURNAL-001/002 hors de leurs Features est refusé.
- **Dépendances / priorité :** JOURNAL-001, JOURNAL-002 / P1.
- **Valeur :** Garantir une traçabilité exploitable sans accumulation incontrôlée.
- **Taille recommandée / statut / date :** [entrée MEP-041 du registre canonique](../../tracking/mess-e01.md).

Régularisation documentaire : séparation déjà livrée, date tirée de l’extension HTTP du 2026-10-05 ; aucun développement ni recette MESS prétendu réalisé par cette fiche. Preuves : [source JOURNAL-001/002](../06-journaux.md) et [contrat et tests des journaux](../../../architecture/journals-api.md).
