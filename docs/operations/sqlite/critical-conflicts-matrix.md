# MEP-040 — Matrice des conflits métier

[Diagnostic et invariants](critical-conflicts.md) ; [scénarios exécutables](critical-conflicts-validation.md).
« Compatible » décrit le métier ; SQLite peut néanmoins refuser une contention technique.
Toutes les écritures métier et activités ci-dessous partagent leur transaction.

## Ressources et effets

| Opération | Ressources lues | Ressources modifiées | Invariant et point de détection | Succès / refus |
| --- | --- | --- | --- | --- |
| Finaliser une passation | Run courant, assignation/appartenance, signal de réaffectation, questions/notes | Run état/auteur/date, activité `evaluation_completed` ou `evaluation_completed_by_admin` | Scope et complétude relus dans atomic ; upgrade concurrent refusé par SQLite avant commit contradictoire | Une provenance initiale et une activité ; rollback total ou répétition idempotente sans activité supplémentaire |
| Sauver une note | Run courant et question snapshotée | Note seulement, aucune activité | `in_progress` dans la même transaction que l'UPDATE | 204 si encore admissible ; 400 état obsolète ou 500 BUSY, note précédente conservée |
| Copier une version | Source courante, famille/compteur, organisation, questions/lignées/repères | Compteur, nouveau modèle/numéro/index, nouvelles questions, activité `evaluation_version_created` | UPDATE organisation avant lecture, compteur atomique, relecture source et contraintes d'unicité | 201 copie cohérente ; 404 source disparue ou 500 BUSY, compteur/copie/Journal annulés |
| Valider une version | Brouillon courant, questions, active précédente | Archivage précédent, nouveau statut actif, activités `evaluation_archived` et `evaluation_validated` | Verrou d'écriture partagé avant lectures ; état DRAFT et complétude ; contrainte d'une active | 200 remplacement atomique ; 400 transition invalide, ancienne active conservée |
| Modifier/supprimer un brouillon | Modèle/question courant | Nom/questions ou suppression, activité existante | Verrou partagé avant contrôle DRAFT | Mutation et activité ensemble ; 400 si devenu immuable, rien n'est écrasé |
| Désactiver ou rétrograder un Admin | User courant, appartenance, Admins actifs de chaque organisation concernée | User, signal des responsabilités si désactivation, activité cible/acteur, intention de mail | `lock_identity_changes` avant toutes les lectures, puis `validate_user_transition` | 200 ou DELETE 204 ; 400 dernier Admin, aucun effet métier/Journal/mail du refus |
| Retirer un Admin des membres | Membres courants, rôle/activation des membres demandés | Liens M2M, activité `member_removed` | Même verrou préalable ; serializer exige encore un Admin actif | 200 retrait valide ; 400 dernier Admin, liens et Journal inchangés |

## Combinaisons qualifiées

| Combinaison | Compatibilité métier | Détection / résultat durable attendu |
| --- | --- | --- |
| Deux finalisations du même run | Deux premières mutations incompatibles ; répétition idempotente compatible | Sous chevauchement de snapshots : un commit, un BUSY ; après commit : 200 même auteur/date, une seule activité |
| Finalisation / note du même run | Note après finalisation incompatible ; note avant finalisation admissible | BUSY annule l'upgrade concurrent ; relecture après commit refuse note 400 ; note antérieure reste dans la complétion |
| Finalisation / copie du modèle | Compatible pour une passation commencée | Deux succès possibles après attente du verrou ; FK historique et snapshots intacts |
| Deux copies d'une même source | Compatible selon EVAL-003 | Deux succès 201, deux numéros successifs distincts, questions et activités propres |
| Validation / copie de cette version | Compatible | Copie de l'état cohérent désormais validé, nouveau brouillon ; une seule active |
| Validation / copie d'une ancienne version | Compatible, y compris source devenue ARCHIVED | Nouveau numéro global, source historique inchangée, aucun refus artificiel de « version trop ancienne » |
| Deux validations du même brouillon | Incompatible | Une validation 200, seconde 400 ; archivage précédent et Journal uniques |
| Validation / édition du même brouillon | Incompatible lorsque validation engagée d'abord | Éditeur attend le verrou puis constate l'immutabilité : 400, aucun renommage |
| Renommage / copie d'un brouillon | Compatible si sérialisé | Copieur relit le nouveau nom ; aucune copie mêlant deux états |
| Suppression de source / copie déjà préparée par HTTP | Incompatible si source disparue avant engagement du service | 404 après relecture ; aucun numéro consommé ni copie/activité partielle |
| Deux désactivations, deux rétrogradations, désactivation / rétrogradation avec deux Admins | Incompatible ensemble, chacune valide initialement | Un succès et un 400 ; un Admin actif, une activité et une notification du seul succès |
| Retrait / désactivation ; DELETE / rétrogradation avec deux Admins | Incompatible ensemble | Même invariant après verrou ; aucun lien, rôle, signal ou mail partiel pour le refus |
| Deux désactivations avec trois Admins | Compatible | Deux 200, un Admin actif, deux activités et deux intentions distinctes |
| Verrou d'écrivain prolongé | Contention technique, indépendamment de la compatibilité métier | BUSY borné, aucun retry HTTP ni double effet |
| Lecteur empêchant le commit d'une copie déjà écrite | Contention technique au commit | Rollback copie/questions/compteur/Journal, source et passation antérieures intactes |

Une erreur de validation (note incorrecte, questions manquantes) ou un refus d'autorisation
(rôle/session/CSRF/scope) reste indépendant de cette matrice : aucun conflit ne donne de permission.
Les tests existants de ces refus et des révisions complètent les scénarios multiprocessus.
Cette qualification ne crée ni ETag obligatoire, ni fusion, ni nouveau statut ou transition métier.
