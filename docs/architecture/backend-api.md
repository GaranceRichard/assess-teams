# API backend et OpenAPI

## Frontière HTTP

Django REST Framework est l'adapter HTTP de référence du backend. Il traduit les requêtes et réponses sans porter de logique métier significative. Le domaine et l'application restent indépendants de HTTP, des serializers et de la génération documentaire.

## Contrat permanent

`drf-spectacular` produit le contrat OpenAPI de référence de l'API :

- schéma OpenAPI : `/api/schema/` ;
- Swagger UI : `/api/docs/`.

Tout endpoint backend nouveau ou modifié documente, selon ce qui s'applique :

- la méthode HTTP et le chemin ;
- les paramètres de chemin, de requête et d'en-tête ;
- le corps de requête ;
- le schéma de chaque réponse ;
- les codes HTTP ;
- les erreurs de validation et refus métier ;
- l'authentification et les permissions ;
- des exemples utiles lorsque le contrat le justifie.

Le contrat est versionné avec l'implémentation. Le schéma complet doit rester générable, syntaxiquement valide et cohérent avec le comportement exposé. Une évolution d'API est inachevée si son contrat est absent, invalide ou incohérent.

## Création d'utilisateur — USER-001

`POST /api/users/` accepte un objet JSON contenant exactement `username`, `password` et `role`. `role` vaut
`Admin`, `Coach` ou `Viewer`. Une création réussie retourne `201` avec l'identifiant stable, le nom
d'utilisateur, la fonction unique et l'état actif ; le mot de passe n'est jamais retourné.

L'endpoint accepte l'authentification HTTP Basic et la session Django. Il retourne `401` si l'appelant est
anonyme, mal authentifié ou inactif, `403` si sa fonction ou la fonction demandée est interdite, et `400` si
les données sont invalides ou l'identité existe déjà. Seul un Superadmin Django peut utiliser cet endpoint
pour créer les trois fonctions. L'Admin utilise l'invitation organisationnelle des Coachs et Viewers.

Le Superadmin reste créé par `manage.py createsuperuser`, sans fonction métier. Cet endpoint initial ne crée
ni superuser, ni rattachement organisationnel et n'expose aucune opération de lecture, modification ou
suppression.

## Session produit et navigation autorisée

`POST /api/session/login/` accepte exactement un `username` et un `password` avec le jeton CSRF initialisé par
`GET /api/session/`. Une identité active et valide
reçoit une session Django et sa représentation produit (`id`, `username`, rôle effectif, indicateur technique
de Superadmin). Un refus retourne `401` sans indiquer lequel des deux identifiants est incorrect. Un
Superadmin est représenté avec le rôle effectif `Admin` sans modifier son identité ni définir un quatrième rôle.
Un jeton CSRF absent ou invalide est refusé avec `403`.

Les réponses de session contiennent aussi `organization_name` : le nom de l’unique organisation du Coach ou
Viewer ou Admin rattaché, et `null` pour un utilisateur sans rattachement ou un Superadmin. `team_names`
contient, pour un Coach, les noms triés de ses équipes actives dans son organisation actuelle et vaut `[]` pour les autres cas. Le tableau de
bord affiche le contexte de tous les rôles métier et, uniquement pour le Coach, ses équipes affectées.

`GET /api/session/` restitue cette représentation pour une session active et dépose le cookie CSRF nécessaire
aux écritures authentifiées. Une requête anonyme est refusée avec `403`. `POST /api/session/logout/` exige la
session et son jeton CSRF, invalide la session puis retourne `204`; une session ou un jeton absent est refusé
avec `403`.

Le frontend n’affiche que les menus associés à la fonction ; aucun menu Équipes n’est présenté au Coach. La permission de route applique la hiérarchie de
capacités `Admin > Coach > Viewer`, y compris lors d’un accès direct. Viewer accède au tableau de bord et aux Résultats, jamais à Utilisateurs ni Équipes. Utilisateurs, Organisations, Équipes,
Modèles, Planification, Évaluations, Résultats, Pilotage et Journaux ont des pages réelles ; le [dashboard personnel](dashboard-api.md) expose profil, apparence, activité et raccourcis.

Le [contrat Results](results-api.md) expose les versions avec complétions et les dernières passations
complétées par équipe, sur une version radar automatique par famille/organisation, puis les observations longitudinales d’un critère
par lignée explicite, dans le scope des passations pour Superadmin/Admin/Coach et des COMPLETED
de son organisation pour Viewer, sans agrégation ni droit d’écriture.

Les réponses de session et de connexion exposent aussi `interface_palette`, parmi `green`, `blue`, `pink`,
`red`, `indigo`, `violet`, `orange`, `amber`, `emerald`, `turquoise`, avec défaut `green`. `PATCH /api/session/` accepte uniquement ce champ obligatoire et modifie
l’utilisateur authentifié : `200` avec profil actualisé, `400` pour une valeur ou des champs invalides,
`403` sans session ou CSRF. Le [contrat des palettes personnelles](interface-palettes.md) décrit stockage,
restauration et isolation. Aucun identifiant cible, rôle, organisation ou CSS libre n’est accepté.

## Gestion du mot de passe

Le [contrat de récupération et modification](password-management.md) décrit les POST publics
`/api/password/recovery/` et `/api/password/reset/`, et `/api/session/password/` pour son propre compte.
Les trois exigent CSRF, validateurs Django et limites persistées ; récupération sans énumération,
remise différée, changement conservant la seule session courante et réinitialisation les invalidant toutes.

## Gestion hiérarchique des identités

`GET /api/admin/users/` exige une session active. Le Superadmin consulte la liste complète ; un Admin ou Coach
consulte uniquement les membres de son organisation et reçoit une liste vide sans rattachement. Viewer reçoit `403`.
Chaque résultat expose `organizations`, les rattachements du compte et toujours `[]` pour un Superadmin. Le menu Utilisateurs affiche cette liste à ses visiteurs Admin et Superadmin.
Viewer n’a aucun accès à l’écran Utilisateurs. `POST` sur la collection, puis `PUT` et `DELETE` sur
`/api/admin/users/{user_id}/`, exigent le jeton CSRF et restent interdits au Viewer. Masquer un bouton ne
constitue jamais le contrôle d'accès. La colonne « Identifiant » correspond à `username` et reste distincte du mail.

Le Superadmin invite des Admins, Coachs ou Viewers et administre tous les comptes sauf le sien. L'Admin invite
des Coachs ou Viewers automatiquement rattachés à son organisation, puis modifie, désactive ou réactive
uniquement ces deux fonctions. Le Coach ne crée aucun compte et peut uniquement modifier, désactiver ou réactiver un Viewer de sa propre
organisation, sans changer sa fonction. Une cible hors organisation retourne `404` sans révéler son existence ;
toute autre tentative hors de cette hiérarchie retourne `403`.

Une invitation crée un compte actif portant exactement le rôle Admin, Coach ou Viewer, mais doté d'un mot de
passe inutilisable. Le champ `pending` reste vrai jusqu'à la définition du mot de passe. Le lien signé envoyé
par e-mail appelle `POST /api/invitations/{uid}/{token}/`; un lien invalide, expiré ou déjà consommé retourne
`400`. En cas de changement d'adresse, l'ancienne adresse reçoit une information sans lien et la nouvelle
reçoit un message distinct. La modification et la suppression du compte connecté du Superadmin sont refusées
avec `403`.

Les actions explicites `POST /api/admin/users/{user_id}/deactivate/` et `reactivate/` exigent
session/CSRF, sans corps : 200 identité conservée ; 400 invariant ; 403 droit ; 404 cible/scopes.
DELETE est un alias déprécié de désactivation (204), jamais une suppression physique ; PUT applique
les mêmes invariants. Le [lifecycle et son audit](user-lifecycle.md) précise transactions, dernier Admin
actif, historique, invitations, comptes inactifs administrables et planifications à réaffecter.

## Création, consultation, renommage, suppression et membres des organisations

`GET /api/admin/organizations/` liste les organisations et leurs utilisateurs affectés. `POST` sur la même
collection accepte exactement `name` et `user_ids`. Le nom est obligatoire et la liste contient au moins un
identifiant utilisateur actif existant, dont au moins un Admin métier actif. La création de l’organisation et de tous ses rattachements est atomique.

La lecture exige une session active de Superadmin ou d’Admin ; l'Admin ne reçoit que son organisation. La
création est réservée au Superadmin et retourne `201`. Un Admin, Coach ou Viewer appartient au plus à une
organisation ; une création qui enfreint cette cardinalité retourne `400` sans persistance partielle.
Le Superadmin est global et ne peut jamais être membre : création et remplacement de membres refusent
son identifiant avec `400` et une erreur `user_ids`, sans écriture partielle. Les réponses de membres
excluent les Superadmins ; renommer une organisation ne crée aucun rattachement.

`GET /api/admin/organizations/{organization_id}/` applique le même scope que la collection. `PUT` accepte
exactement `name` et renomme l’organisation sans
modifier son identifiant ni ses membres. Le nom est nettoyé de ses espaces périphériques et reste obligatoire.
Le Superadmin agit sur toute organisation ; un Admin agit uniquement sur une organisation dont il est membre.
Une cible hors périmètre retourne `404`, tandis qu’un rôle non autorisé reçoit `403`.

`DELETE /api/admin/organizations/{organization_id}/` effectue une suppression physique réservée au
Superadmin et retourne `204`. Les rattachements plusieurs-à-plusieurs disparaissent avec l’organisation, mais
les identités restent présentes. Un Admin, un Coach ou un Viewer reçoit `403` ; une cible inexistante retourne
`404`. Les dépendances sans passation commencée sont supprimées par cascade. Une passation commencée protège
son organisation et ses références : leur suppression retourne `400`. `ARB-ORG-005` reste ouvert pour les autres dépendances.

`PUT /api/admin/organizations/{organization_id}/members/` remplace atomiquement la liste courante des membres.
Le Superadmin peut agir sur toute organisation ; un Admin agit uniquement sur son organisation. La liste doit
contenir au moins une identité et refuse tout membre déjà rattaché ailleurs. Pour un Admin, l'ensemble des Admin
de l'organisation est immuable : tout ajout ou retrait est refusé. Un refus, un utilisateur inconnu ou une organisation
hors périmètre ne modifie aucun rattachement. Un Admin actif doit rester ; les membres inactifs existants
peuvent être conservés mais ne peuvent être nouvellement affectés.

La migration d'invariant s'interrompt en listant les Admins historiquement rattachés à plusieurs organisations.
Elle ne choisit ni ne supprime aucun rattachement. Ces conflits doivent être résolus explicitement avant reprise.

## Gestion des équipes d’une organisation

`GET /api/admin/organizations/{organization_id}/teams/` liste les équipes actives de l’organisation sélectionnée.
Le paramètre optionnel `include_archived=true` inclut aussi les équipes archivées pour les sélecteurs des Logs,
sans modifier la liste active par défaut ni son scope. Une valeur invalide retourne `400`.
`POST` sur la même route accepte exactement `name` et `coach_ids`, crée une équipe rattachée à cette seule
organisation et peut lui affecter plusieurs Coachs. Le nom nettoyé est obligatoire et unique sans tenir compte
de la casse dans l’organisation, y compris parmi les équipes archivées ; une autre organisation peut réutiliser
ce nom. Chaque Coach sélectionné doit être actif et membre de l’organisation, sinon la requête retourne `400`.

`PUT /api/admin/teams/{team_id}/` remplace le nom et la liste courante des Coachs sans changer l’organisation.
`DELETE` archive l’équipe et retourne `204` : elle disparaît de la liste active sans suppression physique. Les
deux opérations retournent `404` pour une équipe inexistante, archivée ou hors périmètre.

Ces routes exigent une session active de Superadmin ou d’Admin. Le Superadmin agit dans toute organisation ;
l’Admin agit uniquement dans une organisation dont il est membre. Un Coach ou Viewer reçoit `403`. Le sélecteur
du menu Équipes fournit explicitement `organization_id` et ne mélange jamais plusieurs organisations.

## Modèles, questions et planification

Le [contrat des évaluations et planifications](evaluations-api.md) décrit les brouillons, la validation,
l’immutabilité, l’archivage logique et les planifications réservées aux versions validées.
Le [contrat de versionnement](evaluation-versioning.md) précise familles, création de versions et migration.

## Passation des évaluations planifiées

Le [contrat de passation](evaluation-taking.md) décrit `/api/evaluations/`, la reprise, les notes, la finalisation et la révision Admin, avec provenance durable et scopes backend.

## Dashboard personnel

Le [contrat Dashboard](dashboard-api.md) décrit `GET /api/dashboard/` : accueil read-only pour toutes
les sessions actives, provenance EvaluationRun et scopes Results sans données administratives au Viewer.

## Pilotage P0

Le [contrat Steering](steering-api.md) décrit `GET /api/steering/` et sa liste d’organisations dédiée :
Admin/Superadmin uniquement, projection cohérente des actifs, complétions et attentes en retard, sans score.

## Journal d’activité et Logs

Le [contrat des journaux](journals-api.md) décrit les deux collections administratives, leurs filtres distincts, la capture HTTP exhaustive et le contexte sûr des Logs.

Les [collections produit](product-layout.md#collections-et-contrats) acceptent une pagination serveur optionnelle ; OpenAPI décrit page, filtres et variantes de réponse.


Les [repères facultatifs par score](score-guides.md) étendent POST/PUT des questions avec `score_guides`
et les réponses de détail de passation avec le snapshot read-only du même contrat `ScoreGuide`.
