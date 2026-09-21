## EPIC-001 — Identités, coachs et habilitations

Cet Epic applique les définitions canoniques d’[Organisation et des rôles métier](00-concepts-transverses.md). Il porte l’identité, l’accès et les capacités, tandis que `FEAT-037` et `FEAT-038` portent les rattachements organisationnels des `Admin` et des `Coach`. La consultation sans compte n’est ni un rôle ni une variante du `Viewer` authentifié ; son éventuel accès en lecture seule à des résultats publiés relève des Features de consultation et de `ARB-ORG-014`, sans implémentation d’authentification dans ce backlog.

`FEAT-002` est raffinée par `USER-001` à `USER-004`. Ces PBIs portent le cycle de vie des identités ; leur matrice d’autorisation est canonique dans `FEAT-004`. Le `Superadmin` qu’ils citent désigne le superuser Django défini dans les concepts transverses, jamais un quatrième rôle métier. La création, la consultation, la modification ou le retrait d’une identité ne crée, ne change ni ne supprime implicitement un rattachement organisationnel.

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
- **Acteurs concernés :** `Superadmin` technique ou `Admin` autorisé selon `FEAT-004`.
- **Description :** créer une identité, consulter et mettre à jour ses informations utiles, puis désactiver son accès lorsqu’elle doit être retirée, sans confondre ce cycle de vie avec son rattachement organisationnel.
- **Critères d’acceptation principaux :**
  - une identité unique et valide porte exactement une fonction métier parmi `Admin`, `Coach` et `Viewer` ;
  - toute opération applique la matrice de `FEAT-004` au demandeur, à la fonction courante de la cible et, lors d’une création, à la fonction demandée ;
  - la désactivation bloque les nouvelles connexions sans supprimer les actions historiques ;
  - une identité en doublon, des données obligatoires invalides ou une opération interdite sont refusées sans effet partiel.
- **Dépendances éventuelles :** `FEAT-001`, `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.

#### USER-001 — Créer un utilisateur

- **Identifiant :** `USER-001`.
- **Feature parente :** `FEAT-002`.
- **Titre :** Créer un utilisateur.
- **User story :** en tant que `Superadmin` technique ou `Admin` autorisé, je veux créer un utilisateur avec la fonction `Admin`, `Coach` ou `Viewer` selon mes droits afin de donner accès au produit aux personnes correspondant aux fonctions attendues.
- **Intention métier :** établir une identité authentifiable avec une fonction explicite, sans étendre implicitement son périmètre organisationnel.
- **Description :** créer un compte utilisateur actif à partir de données d’identité valides et d’exactement une fonction métier. Le rattachement à une organisation et le périmètre du `Viewer` restent portés par leurs capacités dédiées.
- **Critères d’acceptation :**
  - un `Superadmin` peut créer un utilisateur de fonction `Admin`, `Coach` ou `Viewer` ;
  - un `Admin` peut créer un utilisateur de fonction `Coach` ou `Viewer`, mais ne peut pas créer un `Admin` ;
  - un `Coach` ou un `Viewer` ne peut créer aucun utilisateur ;
  - une création valide produit une seule identité active, munie d’un identifiant stable et de la fonction demandée ;
  - la création d’une identité ne crée aucun rattachement organisationnel implicite et ne suffit pas à autoriser des opérations exigeant un tel rattachement ;
  - le premier `Superadmin` est créé exclusivement par le mécanisme de bootstrap Django ; ni ce PBI ni son interface ne permettent de créer un superuser ;
  - une fonction absente, multiple, inconnue ou interdite, une identité en doublon ou des données obligatoires invalides sont refusées sans création partielle.
- **Principaux cas de refus :** demande anonyme ou compte demandeur inactif ; `Admin` demandant la fonction `Admin` ; demande d’un `Coach` ou d’un `Viewer` ; tentative de créer un superuser ; données invalides ou identité déjà existante.
- **Dépendances :** `FEAT-001` ; `FEAT-004` pour l’autorisation.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
- **Valeur apportée :** permet d’ouvrir un accès avec une fonction contrôlée et sans privilège implicite.
- **Notes d’implémentation :** le bootstrap Django du premier `Superadmin` est un mécanisme opératoire, pas un rôle métier ni un PBI supplémentaire.

#### USER-002 — Consulter les utilisateurs

- **Identifiant :** `USER-002`.
- **Feature parente :** `FEAT-002`.
- **Titre :** Consulter les utilisateurs.
- **User story :** en tant que `Superadmin` technique ou utilisateur autorisé, je veux lister et consulter les utilisateurs par fonction afin de connaître les comptes présents dans le dispositif et leur fonction.
- **Intention métier :** rendre le parc de comptes lisible sans exposer de secrets ni franchir un périmètre d’autorisation.
- **Description :** proposer des listes distinctes des `Superadmin`, `Admin`, `Coach` et `Viewer`, une liste de tous les utilisateurs accessibles avec leur fonction ou capacité technique, et une consultation par identifiant. Les comptes actifs et désactivés sont distingués.
- **Critères d’acceptation :**
  - un `Superadmin` peut consulter la liste des `Superadmin`, des `Admin`, des `Coach`, des `Viewer`, la liste globale et le détail de chacun de ces comptes ;
  - un `Admin` peut consulter les listes et le détail des `Admin`, `Coach` et `Viewer` de son périmètre organisationnel applicable, mais ni la liste ni le détail des `Superadmin` ;
  - un `Coach` ou un `Viewer` n’accède à aucune liste d’utilisateurs ni au détail d’un autre utilisateur par ce PBI ; la consultation de son propre profil n’entre pas dans ce périmètre ;
  - chaque résultat accessible expose au minimum l’identifiant stable, la fonction métier et l’état actif ou désactivé ; un `Superadmin` est signalé comme capacité technique sans recevoir une quatrième fonction métier ;
  - la liste « tous les utilisateurs » respecte le même périmètre : globale pour un `Superadmin`, limitée aux fonctions métier et organisations accessibles pour un `Admin` ;
  - un identifiant inexistant ou inaccessible ne révèle aucune donnée utilisateur, et aucune consultation n’expose de secret d’authentification.
- **Principaux cas de refus :** demande anonyme ou compte demandeur inactif ; demande d’un `Coach` ou d’un `Viewer` ; consultation d’un `Superadmin` par un `Admin` ; identifiant absent, mal formé, inexistant ou hors du périmètre organisationnel applicable.
- **Décisions produit bloquantes :** `ARB-ORG-001`, `ARB-ORG-012` et, si la multi-appartenance est retenue, `ARB-ORG-011`. Le chemin `Admin` ne peut être contractualisé définitivement avant leur résolution.
- **Dépendances :** `USER-001` ; `FEAT-004` pour l’autorisation et le périmètre.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
- **Valeur apportée :** donne une vue fiable des accès existants et de leur état.
- **Notes d’implémentation :** la pagination, la recherche textuelle et le filtrage combiné ne sont pas inclus dans ce PBI.

#### USER-003 — Modifier un utilisateur

- **Identifiant :** `USER-003`.
- **Feature parente :** `FEAT-002`.
- **Titre :** Modifier un utilisateur.
- **User story :** en tant que `Superadmin` technique ou `Admin` autorisé, je veux modifier un utilisateur selon mes droits afin de maintenir ses informations à jour.
- **Intention métier :** corriger les informations d’identité sans contourner la hiérarchie d’autorisation ni altérer les faits passés.
- **Description :** modifier les informations utiles d’une identité. L’identifiant stable, la fonction métier, les rattachements organisationnels et les traces historiques ne sont pas modifiables par ce PBI.
- **Critères d’acceptation :**
  - un `Superadmin` peut modifier un utilisateur de fonction `Admin`, `Coach` ou `Viewer` ;
  - un `Admin` peut modifier un `Coach` ou un `Viewer` de son périmètre applicable, mais ne peut modifier aucun `Admin` ;
  - un `Coach` ou un `Viewer` ne peut modifier aucun autre utilisateur ; la modification de son propre profil n’entre pas dans ce PBI ;
  - une modification valide conserve l’identifiant et l’historique, et aucun refus ne produit de modification partielle ;
  - aucun utilisateur, y compris un `Superadmin`, ne peut modifier un compte `Superadmin` par ce PBI.
- **Principaux cas de refus :** rôle demandeur interdit ; cible `Superadmin` ; `Admin` ciblant un `Admin` ou une autre organisation ; cible inexistante ; données invalides ; tentative de modifier l’identifiant, la fonction ou un rattachement organisationnel.
- **Décisions produit bloquantes :** `ARB-ORG-001`, `ARB-ORG-012` et, si la multi-appartenance est retenue, `ARB-ORG-011`.
- **Dépendances :** `USER-002` ; `FEAT-004` pour l’autorisation et le périmètre.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
- **Valeur apportée :** maintient des comptes exacts sans permettre d’élévation de privilège indirecte.
- **Notes d’implémentation :** la mise à jour doit être atomique.

#### USER-004 — Supprimer un utilisateur

- **Identifiant :** `USER-004`.
- **Feature parente :** `FEAT-002`.
- **Titre :** Supprimer un utilisateur.
- **User story :** en tant que `Superadmin` technique ou `Admin` autorisé, je veux retirer un utilisateur selon mes droits afin d’empêcher un compte qui ne doit plus participer au dispositif de continuer à agir.
- **Intention métier :** retirer l’accès courant tout en conservant l’identité nécessaire à la traçabilité du dispositif.
- **Description :** la suppression demandée est une désactivation logique : elle bloque les nouvelles connexions et opérations sans suppression physique de l’identité, de ses actions, de ses rattachements ni de son historique.
- **Critères d’acceptation :**
  - un `Superadmin` peut désactiver un utilisateur de fonction `Admin`, `Coach` ou `Viewer` ;
  - un `Admin` peut désactiver un `Coach` ou un `Viewer` de son périmètre applicable, mais ne peut désactiver aucun `Admin` ;
  - un `Coach` ou un `Viewer` ne peut supprimer ni désactiver aucun utilisateur ;
  - une désactivation valide interdit toute nouvelle connexion ou action du compte, le conserve consultable comme désactivé selon `USER-002` et préserve ses faits historiques ;
  - aucun utilisateur, y compris un `Superadmin`, ne peut supprimer ou désactiver un compte `Superadmin` par ce PBI ;
  - un compte déjà désactivé ne subit pas de nouvelle transition et tout refus laisse l’ensemble des données inchangé ;
  - le retrait du dernier `Admin` d’une organisation respecte la décision restant à prendre dans `ARB-ORG-008`.
- **Principaux cas de refus :** rôle demandeur interdit ; cible `Superadmin` ; `Admin` ciblant un `Admin` ou une autre organisation ; cible inexistante ou déjà désactivée ; retrait du dernier `Admin` tant que `ARB-ORG-008` n’est pas résolu.
- **Décisions produit bloquantes :** `ARB-ORG-001`, `ARB-ORG-008`, `ARB-ORG-012` et, si la multi-appartenance est retenue, `ARB-ORG-011`.
- **Dépendances :** `USER-002` ; `FEAT-001` pour l’effet sur l’accès ; `FEAT-004` pour l’autorisation et le périmètre.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
- **Valeur apportée :** empêche un ancien participant d’agir sans détruire la preuve de son activité passée.
- **Notes d’implémentation :** aucune suppression physique ni cascade destructive n’appartient à ce PBI ; une éventuelle réactivation devra être raffinée séparément avant implémentation.

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
- **Matrice d’autorisation de `USER-001` à `USER-004` :**

  | Opération | `Superadmin` technique | `Admin` | `Coach` | `Viewer` |
  | --- | --- | --- | --- | --- |
  | Créer | `Admin`, `Coach`, `Viewer` | `Coach`, `Viewer` | refus | refus |
  | Consulter | tous les comptes, dont les `Superadmin` | `Admin`, `Coach`, `Viewer` dans le périmètre applicable ; aucun `Superadmin` | refus | refus |
  | Modifier | `Admin`, `Coach`, `Viewer` | `Coach`, `Viewer` dans le périmètre applicable | refus | refus |
  | Supprimer logiquement | `Admin`, `Coach`, `Viewer` | `Coach`, `Viewer` dans le périmètre applicable | refus | refus |

  Cette matrice ne permet jamais de créer, modifier ou supprimer un `Superadmin` par les PBIs fonctionnels. Tout refus intervient avant écriture et ne produit aucun effet partiel.
- **Hors périmètre :** la consultation sans compte n’acquiert aucun rôle ou permission authentifiée par cette Feature.
- **Décisions produit bloquantes pour la matrice Utilisateurs :** `ARB-ORG-001`, `ARB-ORG-008`, `ARB-ORG-012` et, si la multi-appartenance est retenue, `ARB-ORG-011`. `USER-002` à `USER-004` ne sont pas prêts à implémenter avant leur résolution.
- **Dépendances éventuelles :** `FEAT-001`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.

### Dépendances internes du Sprint 1

```text
USER-001
└── USER-002
    ├── USER-003
    └── USER-004
```
