# Lifecycle des identités — USER-004

## Audit préalable de main

Base auditée : `51574e0` (2026-10-06). `User` hérite de `AbstractUser` ; `is_active` existe déjà.
Le Superadmin est `is_superuser=True`, sans rôle métier ; les rôles sont Admin, Coach et Viewer.
`Organization.users` et `Team.coaches` sont des M2M, sans historique d’affectation dédié.
Les trois rôles métier appartiennent au plus à une organisation ; zéro reste permis.
L’Organisation ne possède aucun état d’activation : toutes les organisations présentes sont concernées.

| Zone auditée | Comportement antérieur / conséquence de `user.delete()` |
| --- | --- |
| Utilisateurs | DELETE physique ; PUT pouvait modifier `is_active` sans protéger le dernier Admin |
| Organisations | Suppression des lignes M2M ; l’édition protégeait un dernier Admin sans considérer son activation |
| Équipes | Suppression du lien M2M Coach, perte de l’attribution courante |
| Planifications | `assignee` SET_NULL, calendrier conservé sans responsable |
| Passations | `assignee`, `completed_by`, `revised_by` SET_NULL, y compris COMPLETED |
| Provenance | Les noms/date/questions figés restaient présents, mais les identifiants des personnes disparaissaient |
| Journal/Logs | FK acteur SET_NULL ; snapshots et descriptions conservés |
| Results/Pilotage | Projections de passations/équipes, aucune suppression de résultat par FK User directe |
| Dashboard | Placeholder générique ; session Coach expose organisation et noms d’équipes actives |
| Sessions | ModelBackend rejette `is_active=False` dans authenticate **et** get_user pour une session existante |
| Invitations | Unicité applicative case-insensitive sur username/mail ; acceptation ne vérifiait pas `is_active` |
| Notifications | Destinataires actifs filtrés, mais fallback vers les autres Coachs possible |
| Django Admin | User n’était pas enregistré ; l’auth Group ne fournit pas de mutation du User personnalisé |
| Backlog | USER-004 bloqué, FEAT-002 partiel, ARB-ORG-008 ouvert et matrice cible divergente du code |

Les droits réellement livrés étaient : Superadmin global sauf son compte ; Admin sur Coach/Viewer de
son organisation ; Coach sur Viewer de son organisation, sans changement de fonction ; Viewer interdit.
Cette politique est conservée. Un Admin n’administre aucun Admin, même inactif.

L’intégration sur `80292c2` a ajouté l’audit du Dashboard personnel désormais livré : projection
read-only issue des mêmes passations, auteurs snapshotés conservés après désactivation, session inactive
refusée. Son compteur d’assignations réalisables exclut les planifications suspendues, même après
réactivation ; les attentes restent consultables dans la liste des passations.

## Contrat et invariants livrés

`is_active` porte `Actif → Désactivé → Réactivé`. ID, username, nom/prénom Django, mail, rôle,
organisation, Coachs d’équipes, FK historiques et snapshots restent intacts lors d’une désactivation.
Les noms/prénoms existent en base mais leur saisie produit reste hors USER-004 (USER-002/003 ouverts).

- `POST /api/admin/users/{id}/deactivate/` et `reactivate/` : sans corps, 200 avec ManagedUser.
- 400 : invariant métier ; 403 : session, CSRF ou autorité refusée ; 404 : cible inconnue/hors scope.
- Les répétitions sont idempotentes, sans nouveau Journal ni mail.
- DELETE historique retourne 204 et **désactive** : alias déprécié OpenAPI, aucune suppression physique.
  Le frontend migre aux POST ; retirer l’alias lors d’une prochaine rupture de contrat après migration des clients.
- PUT conserve `is_active` pour compatibilité et applique exactement les mêmes invariants.
- Réactivation : rôle valide, au plus une organisation et aucun conflit username/mail case-insensitive.
  L’absence d’organisation reste compatible avec le socle ; elle ne donne aucun droit organisationnel.
- Une identité inactive n’est pas proposée pour une nouvelle responsabilité ou appartenance.
  La liste des comptes inactifs est limitée aux cibles administrables par l’acteur.

Une organisation doit conserver un **Admin métier actif** ; un Superadmin technique ne le remplace pas.
Création d’organisation et remplacement des membres exigent un Admin actif. Désactivation, rétrogradation
et retrait du dernier Admin actif sont refusés avec « Affectez ou activez d’abord un autre Admin ».
Les organisations historiques déjà sans Admin actif ne sont pas réparées par attribution arbitraire :
un Superadmin doit leur affecter explicitement un Admin actif avant une modification des membres.
Aucune suppression/archivage/transfert d’organisation n’est traité ; ARB-ORG-005 reste ouvert.

## Transactions et concurrence

Activation, rôle, invitation/acceptation et appartenance s’exécutent dans `transaction.atomic`.
Le verrou est pris avant les lectures métier : SQLite obtient son verrou d’écriture par un UPDATE
neutre des organisations ; les moteurs à verrouillage ligne utilisent les organisations ordonnées
avec `select_for_update`, puis le User. Les opérations d’identités sont donc sérialisées globalement,
un compromis conservatoire adapté au socle actuel. Les erreurs annulent identité, affectations et Journal.
Le test sur SQLite fichier exécute deux désactivations, rétrogradation/désactivation et retrait/désactivation
concurrents : un succès, un refus, un Admin actif restant. Aucun retry ne contourne les refus.

## Responsabilités et historique

Les liens Coach/équipes restent présents, libellés « Désactivé » ; pas de remplacement automatique.
Ils peuvent être conservés ou retirés explicitement lors d’une édition, jamais ajoutés quand inactifs.
Une réactivation ne recrée aucun lien supprimé entre-temps.

`EvaluationSchedule.requires_reassignment` signale durablement les planifications non closes de la cible.
La migration signale aussi les planifications déjà liées à un compte inactif ou sans assigné, sans inventer d’identité.
Les récurrences sont aussi signalées lorsqu’une occurrence précédente est COMPLETED. Une planification
ponctuelle déjà complétée reste seulement historique. Ni assignee, ni échéance, ni passation ne sont réécrits.
Tant que le signal persiste : pas de nouvelle attente, pas de notification d’échéance, pas d’avancement
calendaire ni de mutation d’une passation inachevée, même par un Admin. Consultation historique conservée.
La réactivation seule ne l’enlève pas. Un Admin/Superadmin doit modifier explicitement le planning avec
un responsable actif (éventuellement le même après réactivation) pour reprendre.
Le modèle existant met à jour l’assigné d’une attente NOT_STARTED lors de cette **édition explicite** ;
il conserve celui d’une IN_PROGRESS ou COMPLETED. Pour une IN_PROGRESS, l’Admin peut ensuite compléter
à la place de l’assigné historique. Les réponses/snapshots sont conservés ; aucun transfert silencieux.

COMPLETED, auteur/date de complétion, dernière révision, questions et notes restent byte-for-byte identiques
lors de la désactivation. Results radar/longitudinal et Pilotage conservent leurs sources et calculs ;
les attentes suspendues restent visibles comme travail à traiter et les résultats restent consultables.

## Authentification, invitations et audit

Django ModelBackend bloque nouvelle connexion (401) et session déjà ouverte (endpoints protégés : 403).
Les tests utilisent une vraie session, sans `force_authenticate`, et vérifient aussi une mutation refusée.
La réactivation permet une nouvelle connexion avec le mot de passe existant ; elle n’en change pas la valeur.
Les identités restent uniques dans les invitations : adresse/username existant, actif ou désactivé,
retourne 400 avec une indication de réactivation ; aucun doublon ni activation automatique.
L’acceptation d’un ancien lien est refusée tant que son identité est désactivée.

Le Journal consigne les transitions réussies avec acteur, cible stable (`target_user`), snapshot du nom,
organisation et description. Les nouvelles colonnes sont nulles/vides pour les anciennes entrées :
aucune reconstitution ni réécriture. Les refus restent des Logs HTTP opérationnels, conformément au socle ;
pas de faux succès métier. Les notifications de lifecycle suivent le commit, sans mail de suppression.

## Exploitation et limites

Django Admin présente les User en lecture seule : ajout, édition et suppression standard/bulk refusés.
La maintenance exceptionnelle exige un opérateur via shell/ORM, sauvegarde et analyse des dépendances
ci-dessus ; aucune action produit ou bouton ne l’expose. L’ORM reste une capacité système, comme les
fixtures de tests et la réconciliation des comptes fictifs de développement, pas un workflow métier.
Ne jamais employer ces commandes de données locales sur des identités métier de production.
L’anonymisation réglementaire, la rétention et le lifecycle Organisation restent à définir séparément.
