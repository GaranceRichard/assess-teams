## EPIC-001 — Identités, coachs et habilitations

### FEAT-001 — Accéder de manière authentifiée au produit

- **Intention métier :** garantir que chaque action sensible est attribuable à une identité reconnue.
- **Acteur concerné :** utilisateur, coach, administrateur.
- **Description :** permettre la connexion, la déconnexion et la reprise contrôlée d’une session selon l’état du compte.
- **Critères d’acceptation principaux :**
  - un compte actif muni d’informations valides accède aux capacités autorisées et peut se déconnecter ;
  - des informations invalides, un compte désactivé ou une session expirée ne donnent aucun accès ;
  - les actions métier sensibles conservent l’identité de leur auteur.
- **Dépendances éventuelles :** aucune.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
### FEAT-002 — Administrer le cycle de vie d’un utilisateur

- **Intention métier :** maîtriser qui peut participer au dispositif sans effacer son passé.
- **Acteur concerné :** administrateur.
- **Description :** créer un utilisateur, mettre à jour ses informations utiles et activer ou désactiver son accès.
- **Critères d’acceptation principaux :**
  - une identité unique et valide peut être créée puis corrigée par un administrateur habilité ;
  - la désactivation bloque les nouvelles connexions sans supprimer les actions historiques ;
  - une identité en doublon ou des données obligatoires invalides sont refusées.
- **Dépendances éventuelles :** `FEAT-001`, `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
### FEAT-003 — Qualifier et superviser un coach

- **Intention métier :** distinguer les personnes pouvant accompagner des équipes et connaître leur disponibilité.
- **Acteur concerné :** administrateur.
- **Description :** associer à un utilisateur un profil de coach, son statut actif et les informations nécessaires à sa supervision.
- **Critères d’acceptation principaux :**
  - un utilisateur éligible peut devenir coach actif et apparaît dans les choix d’affectation ;
  - un coach désactivé ne reçoit plus de nouvelle affectation, sans perdre son historique ;
  - un utilisateur inexistant, désactivé ou déjà coach ne peut pas recevoir un profil incohérent.
- **Dépendances éventuelles :** `FEAT-002`, `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
### FEAT-004 — Appliquer les rôles et permissions métier

- **Intention métier :** limiter chaque décision aux acteurs responsables.
- **Acteur concerné :** administrateur, coach, utilisateur.
- **Description :** définir les capacités accessibles selon le rôle et, lorsque nécessaire, selon le lien de l’acteur avec l’équipe.
- **Critères d’acceptation principaux :**
  - un administrateur gère le dispositif et un coach n’agit que sur les équipes qui lui sont confiées ;
  - toute action interdite est refusée sans modifier l’état métier ni divulguer d’information protégée ;
  - un changement de rôle prend effet sans altérer la traçabilité passée.
- **Dépendances éventuelles :** `FEAT-001`, `FEAT-002`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
