## EPIC-001 — Identités, coachs et habilitations

Cet Epic applique les définitions canoniques d’[Organisation et des rôles métier](00-concepts-transverses.md). Il porte l’identité, l’accès et les capacités, tandis que `FEAT-037` et `FEAT-038` portent les rattachements organisationnels des `Admin` et des `Coach`. Toute lecture de donnée métier exige une identité authentifiée.

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

#### AUTH-001 — Ouvrir et fermer une session produit

- **Identifiant / Feature parente :** `AUTH-001` / `FEAT-001`.
- **Nature :** régularisation documentaire du parcours livré le 2026-09-22.
- **User story :** en tant qu’utilisateur actif, je veux ouvrir, reprendre et fermer ma session afin d’accéder uniquement aux routes autorisées à ma fonction.
- **Périmètre livré :** login, session courante, logout avec CSRF, refus des identifiants invalides ou comptes inactifs, menus et accès directs par rôle, invitation signée et choix initial du mot de passe.
- **Critères d’acceptation :** une session valide restitue l’identité et la fonction effectives ; la déconnexion invalide la session ; une invitation valide permet de définir un mot de passe une seule fois ; aucun refus n’ouvre le produit.
- **Principaux cas de refus :** session absente, CSRF absent, identifiants invalides, compte inactif, invitation expirée ou déjà consommée, route interdite.
- **Dépendances / priorité :** aucune / P0.
- **Valeur apportée :** attribue les actions à une identité et ferme l’accès après déconnexion ou refus.
- **Preuves :** endpoints `/api/session/*` et `/api/invitations/*`, tests API, React et E2E du parcours authentifié.

`FEAT-001` est aussi raffinée par [DASH-001 — accueil personnel](01a-dashboard.md), sans extension des habilitations.

### FEAT-002 — Administrer le cycle de vie d’une identité

- **Intention métier :** maîtriser qui peut participer au dispositif sans effacer son passé.
- **Acteurs concernés :** `Superadmin` technique ou `Admin` autorisé selon `FEAT-004`.
- **Description :** créer une identité, consulter et mettre à jour ses informations utiles, puis désactiver et éventuellement réactiver son accès, sans confondre ce cycle de vie avec son rattachement organisationnel.
- **Critères d’acceptation principaux :**
  - une identité unique et valide comprend `nom`, `prénom`, `mail` et exactement une fonction métier parmi `Admin`, `Coach` et `Viewer` ;
  - toute opération applique la matrice de `FEAT-004` au demandeur, à la fonction courante de la cible et, lors d’une création, à la fonction demandée ;
  - la désactivation bloque connexions et sessions existantes sans supprimer l’historique ; la réactivation reste explicite ;
  - une identité en doublon, des données obligatoires invalides ou une opération interdite sont refusées sans effet partiel.
- **Dépendances éventuelles :** `FEAT-001`, `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.

#### USER-001 — Créer un utilisateur

- **Identifiant :** `USER-001`.
- **Feature parente :** `FEAT-002`.
- **Titre :** Créer un utilisateur.
- **User story :** en tant que `Superadmin` technique, je veux créer un utilisateur avec la fonction `Admin`, `Coach` ou `Viewer` afin de donner accès au produit aux personnes correspondant aux fonctions attendues.
- **Intention métier :** établir une identité authentifiable avec une fonction explicite, sans étendre implicitement son périmètre organisationnel.
- **Description :** créer un compte utilisateur actif à partir de `nom`, `prénom`, `mail`, des données techniques d’accès nécessaires et d’exactement une fonction métier. Le rattachement à une organisation et le périmètre du `Viewer` restent portés par leurs capacités dédiées.
- **Critères d’acceptation :**
  - un `Superadmin` peut créer un utilisateur de fonction `Admin`, `Coach` ou `Viewer` ;
  - un `Admin` invite uniquement un `Coach` ou `Viewer` par le parcours qui le rattache automatiquement à son organisation ;
  - un `Coach` ou un `Viewer` ne peut créer aucun utilisateur ;
  - une création valide produit une seule identité active, munie d’un identifiant stable, de `nom`, `prénom`, `mail` et de la fonction demandée ;
  - la création d’une identité ne crée aucun rattachement organisationnel implicite et ne suffit pas à autoriser des opérations exigeant un tel rattachement ;
  - le premier `Superadmin` est créé exclusivement par le mécanisme de bootstrap Django ; ni ce PBI ni son interface ne permettent de créer un superuser ;
  - une fonction absente, multiple, inconnue ou interdite, une identité en doublon ou des données obligatoires invalides sont refusées sans création partielle.
- **Principaux cas de refus :** demande non authentifiée ou compte demandeur inactif ; appel de création technique par un rôle métier ; tentative de créer un superuser ; données invalides ou identité déjà existante.
- **Dépendances :** `FEAT-001` ; `FEAT-004` pour l’autorisation.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
- **Valeur apportée :** permet d’ouvrir un accès avec une fonction contrôlée et sans privilège implicite.
- **Notes d’implémentation :** le bootstrap Django du premier `Superadmin` est un mécanisme opératoire, pas un rôle métier ni un PBI supplémentaire. `USER-001` reste historiquement `Réalisé` pour le contrat livré le 2026-09-21 ; ce contrat ne couvre pas encore `nom`, `prénom` et `mail`. Cet écart produit explicite doit faire l’objet d’une évolution à raffiner sans réécrire la livraison passée. La relation entre `mail` et `username` reste une décision technique ultérieure.

#### USER-002 — Consulter les utilisateurs

- **Identifiant :** `USER-002`.
- **Feature parente :** `FEAT-002`.
- **Titre :** Consulter les utilisateurs.
- **User story :** en tant qu’utilisateur authentifié, je veux lister les utilisateurs visibles dans mon périmètre afin de connaître les comptes avec lesquels je collabore.
- **Intention métier :** rendre le parc de comptes lisible sans exposer de secrets ni franchir un périmètre d’autorisation.
- **Description :** proposer des listes distinctes des `Superadmin`, `Admin`, `Coach` et `Viewer`, une liste de tous les utilisateurs accessibles avec leur fonction ou capacité technique, et une consultation par identifiant. Les comptes actifs et désactivés sont distingués.
- **Critères d’acceptation :**
  - un `Superadmin` peut consulter la liste des `Superadmin`, des `Admin`, des `Coach`, des `Viewer`, la liste globale et le détail de chacun de ces comptes ;
  - un `Admin` consulte uniquement les identités de son organisation d'affectation ;
  - un `Coach` consulte uniquement les utilisateurs rattachés à son organisation ;
  - sans organisation, un `Coach` reçoit une liste vide ;
  - le `Viewer` ne peut consulter, créer, modifier ni supprimer un utilisateur ;
  - le menu des `Admin` et `Superadmin` indique les organisations de chaque utilisateur ; un `Superadmin` est présenté comme affecté à toutes les organisations existantes ;
  - chaque résultat accessible expose au minimum l’identifiant stable, `nom`, `prénom`, `mail`, la fonction métier et l’état actif ou désactivé ; un `Superadmin` est signalé comme capacité technique sans recevoir une quatrième fonction métier ;
  - la liste « tous les utilisateurs » est globale pour un `Superadmin` et cloisonnée par organisation pour tous les rôles métier ;
  - un identifiant inexistant ou inaccessible ne révèle aucune donnée utilisateur, et aucune consultation n’expose de secret d’authentification.
- **Principaux cas de refus :** demande non authentifiée ou compte demandeur inactif ; consultation ou écriture demandée par un `Viewer` ; identifiant absent, mal formé, inexistant ou hors du périmètre organisationnel applicable.
- **Décision produit bloquante :** aucune ; l'organisation unique de l'Admin détermine son périmètre.
- **Capacité prérequise :** le rattachement organisationnel unique est matérialisé par `ORG-001`.
- **Dépendances :** `USER-001` ; `FEAT-004` pour l’autorisation ; `FEAT-037` pour le périmètre organisationnel de l’`Admin`.
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
- **Description :** modifier `nom`, `prénom` et `mail` d’une identité. L’identifiant stable, la fonction métier, les rattachements organisationnels et les traces historiques ne sont pas modifiables par ce PBI. La relation éventuelle entre `mail` et `username` n’est pas décidée par ce PBI.
- **Critères d’acceptation :**
  - un `Superadmin` peut modifier un utilisateur de fonction `Admin`, `Coach` ou `Viewer` ;
  - un `Admin` peut modifier un `Coach` ou un `Viewer` de son organisation active, mais ne peut modifier aucun `Admin` ;
  - un `Coach` ou un `Viewer` ne peut modifier aucun autre utilisateur ; la modification de son propre profil n’entre pas dans ce PBI ;
  - une modification valide met à jour `nom`, `prénom` ou `mail`, conserve l’identifiant et l’historique, et aucun refus ne produit de modification partielle ;
  - aucun utilisateur, y compris un `Superadmin`, ne peut modifier un compte `Superadmin` par ce PBI.
- **Principaux cas de refus :** rôle demandeur interdit ; cible `Superadmin` ; `Admin` ciblant un `Admin` ou une autre organisation ; cible inexistante ; données invalides ; tentative de modifier l’identifiant, la fonction ou un rattachement organisationnel.
- **Décisions produit bloquantes :** aucune ; la dépendance à `USER-002` reste nécessaire.
- **Dépendances :** `USER-002` ; `FEAT-004` pour l’autorisation et le périmètre.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
- **Valeur apportée :** maintient des comptes exacts sans permettre d’élévation de privilège indirecte.
- **Notes d’implémentation :** la mise à jour doit être atomique.

#### USER-004 — Désactiver et réactiver un utilisateur

- **Identifiant :** `USER-004`.
- **Feature parente :** `FEAT-002`.
- **Titre :** Désactiver et réactiver un utilisateur.
- **User story :** retirer puis éventuellement rendre l’accès d’une identité autorisée sans effacer son passé.
- **Intention métier :** `Actif → Désactivé → Réactivé`, ID et historique conservés intégralement.
- **Description :** `is_active` bloque connexions et sessions existantes, sans suppression ni réécriture historique.
- **Critères d’acceptation :**
  - Superadmin : gestion globale sauf soi ; seul cet acteur administre les Admins ;
  - Admin : Coach/Viewer de son organisation, jamais Admin ; Coach : Viewer de son organisation, sans changer la fonction ; Viewer : refus ;
  - désactivation et réactivation explicites, idempotentes et auditées avec acteur/cible/organisation ;
  - dernier Admin actif protégé contre désactivation, rétrogradation et retrait, atomiquement et sous concurrence ;
  - réactivation validant rôle, cardinalité, organisation et absence de conflit d’identité/mail ;
  - aucun lien supprimé entre-temps n’est restauré, aucune responsabilité réattribuée automatiquement ;
  - identité inactive exclue des nouveaux candidats ; planifications non closes à réaffecter explicitement ;
  - FK, COMPLETED, auteurs/dates, révisions, résultats et snapshots préservés.
- **Principaux refus :** droit ou scope, cible inconnue, dernier Admin actif, conflit mail/identité, appartenance multiple.
- **Arbitrage :** `ARB-ORG-008` résolu avec la règle conservatoire de l’Admin actif.
- **Dépendances :** `FEAT-001`, `FEAT-004` ; les détails/noms de `USER-002/003` restent ouverts.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.
- **Notes d’implémentation :** [audit, API, concurrence et responsabilités](../../architecture/user-lifecycle.md).
  DELETE est temporairement un alias déprécié de désactivation ; le produit utilise des POST sémantiques.
  Le lifecycle Organisation, la rétention et l’anonymisation définitive restent hors périmètre.

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
  | Consulter | tous les comptes | membres actifs et comptes inactifs administrables de son organisation | membres actifs et Viewers inactifs de son organisation | refus |
  | Modifier | tous sauf soi | `Coach`, `Viewer` de son organisation | `Viewer` de son organisation, fonction inchangée | refus |
  | Désactiver / réactiver | tous sauf soi | `Coach`, `Viewer` de son organisation | `Viewer` de son organisation | refus |

  Le bootstrap Superadmin reste système ; les capacités de gestion préexistantes sont conservées, sans auto-modification ni suppression physique. Toutes ses opérations exigent une identité authentifiée. Tout refus intervient avant écriture et ne produit aucun effet partiel.
- **Décisions produit bloquantes pour la matrice Utilisateurs :** `ARB-ORG-011` porte le choix du périmètre actif ; `ARB-ORG-008` est résolu pour `USER-004`. Le rattachement multiple initial est matérialisé par `ORG-001`.
- **Dépendances éventuelles :** `FEAT-001`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.

### Dépendances internes du Sprint 1

```text
USER-001 + FEAT-037
└── USER-002
    ├── USER-003
    └── USER-004
```
