## EPIC-001 — Identités, coachs et habilitations

Cet Epic applique les définitions canoniques d’[Organisation et des rôles métier](00-concepts-transverses.md). Il porte l’identité, l’accès et les capacités, tandis que `FEAT-037` et `FEAT-038` portent les rattachements organisationnels des `Admin` et des `Coach`. La consultation sans compte n’est ni un rôle ni une variante du `Viewer` authentifié ; son éventuel accès en lecture seule à des résultats publiés relève des Features de consultation et de `ARB-ORG-014`, sans implémentation d’authentification dans ce backlog.

### FEAT-001 — Accéder de manière authentifiée au produit

- **Intention métier :** garantir que chaque action sensible est attribuable à une identité reconnue.
- **Acteurs concernés :** `Viewer`, `Coach`, `Admin`, tous authentifiés.
- **Description :** permettre la connexion, la déconnexion et la reprise contrôlée d’une session selon l’état du compte.
- **Critères d’acceptation principaux :**
  - un compte actif muni d’informations valides accède aux capacités autorisées et peut se déconnecter ;
  - des informations invalides, un compte désactivé ou une session expirée ne donnent aucun accès ;
  - les actions métier sensibles conservent l’identité de leur auteur.
- **Dépendances éventuelles :** aucune.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
### FEAT-002 — Administrer le cycle de vie d’une identité

- **Intention métier :** maîtriser qui peut participer au dispositif sans effacer son passé.
- **Acteur concerné :** `Admin` dans son organisation.
- **Description :** créer une identité, mettre à jour ses informations utiles et activer ou désactiver son accès, sans confondre ce cycle de vie avec son rattachement organisationnel.
- **Critères d’acceptation principaux :**
  - une identité unique et valide peut être créée puis corrigée par un `Admin` habilité dans l’organisation applicable ;
  - la désactivation bloque les nouvelles connexions sans supprimer les actions historiques ;
  - une identité en doublon ou des données obligatoires invalides sont refusées.
- **Dépendances éventuelles :** `FEAT-001`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
### FEAT-003 — Qualifier et superviser un coach

- **Intention métier :** distinguer les personnes pouvant accompagner des équipes et connaître leur disponibilité.
- **Acteur concerné :** `Admin` dans son organisation.
- **Description :** associer à une identité un profil de `Coach`, son statut actif et les informations nécessaires à sa supervision, dans l’organisation de rattachement définie par `FEAT-038`.
- **Critères d’acceptation principaux :**
  - une identité éligible peut devenir `Coach` actif et apparaît uniquement dans les choix d’affectation de son organisation ;
  - un `Coach` désactivé ne reçoit plus de nouvelle affectation, sans perdre son historique ;
  - une identité inexistante, désactivée, déjà qualifiée comme `Coach` ou sans rattachement organisationnel applicable ne peut pas recevoir un profil incohérent.
- **Dépendances éventuelles :** `FEAT-002`, `FEAT-004`, `FEAT-038`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
### FEAT-004 — Appliquer les rôles et permissions métier

- **Intention métier :** limiter chaque décision aux acteurs responsables.
- **Acteurs concernés :** `Admin`, `Coach`, `Viewer`, tous authentifiés.
- **Description :** appliquer la hiérarchie de capacités canonique selon le rôle, l’organisation applicable et, lorsque nécessaire, le lien de l’acteur avec l’équipe.
- **Critères d’acceptation principaux :**
  - `Admin` possède les fonctions `Admin`, `Coach` et `Viewer` ; `Coach` possède les fonctions `Coach` et `Viewer` ; `Viewer` possède uniquement les fonctions de consultation ;
  - un `Coach` n’agit que sur les équipes qui lui sont confiées lorsque l’affectation est une précondition de la Feature ;
  - toute action interdite par le rôle, le lien contextuel ou le périmètre organisationnel est refusée sans modifier l’état métier ni divulguer d’information protégée ;
  - un changement de rôle prend effet sans altérer la traçabilité passée.
- **Hors périmètre :** la consultation sans compte n’acquiert aucun rôle ou permission authentifiée par cette Feature.
- **Dépendances éventuelles :** `FEAT-001`, `FEAT-002`, `FEAT-037`, `FEAT-038`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
