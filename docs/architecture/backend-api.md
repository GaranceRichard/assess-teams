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
les données sont invalides ou l'identité existe déjà. Un Superadmin Django peut créer les trois fonctions ;
un Admin peut créer uniquement Coach ou Viewer. Aucun autre champ d'état ou de privilège n'est accepté.

Le Superadmin reste créé par `manage.py createsuperuser`, sans fonction métier. Cet endpoint initial ne crée
ni superuser, ni rattachement organisationnel et n'expose aucune opération de lecture, modification ou
suppression.

## Session produit et navigation autorisée

`POST /api/session/login/` accepte exactement un `username` et un `password` avec le jeton CSRF initialisé par
`GET /api/session/`. Une identité active et valide
reçoit une session Django et sa représentation produit (`username`, rôle métier effectif, indicateur technique
de Superadmin). Un refus retourne `401` sans indiquer lequel des deux identifiants est incorrect. Un
Superadmin est représenté avec le rôle effectif `Admin` sans modifier son identité ni définir un quatrième rôle.
Un jeton CSRF absent ou invalide est refusé avec `403`.

`GET /api/session/` restitue cette représentation pour une session active et dépose le cookie CSRF nécessaire
aux écritures authentifiées. Une requête anonyme est refusée avec `403`. `POST /api/session/logout/` exige la
session et son jeton CSRF, invalide la session puis retourne `204`; une session ou un jeton absent est refusé
avec `403`.

Le frontend n'affiche que les menus associés à la fonction. La permission de route applique la hiérarchie de
capacités `Admin > Coach > Viewer`, y compris lors d'un accès direct. Les pages livrées dans ce parcours ne
contiennent des données métier que pour les gestions Utilisateurs et Organisations.

## Gestion hiérarchique des identités

`GET /api/admin/users/` exige une session active et autorise le Superadmin, l'Admin et le Coach à consulter la
même liste complète. `POST` sur cette collection, puis `PUT` et `DELETE /api/admin/users/{user_id}/`, exigent
en plus le jeton CSRF et appliquent les autorisations côté serveur ; masquer un bouton ne constitue jamais le
contrôle d'accès. La colonne « Identifiant » correspond à `username` et reste distincte du mail.

Le Superadmin invite des Admins, Coachs ou Viewers et administre tous les comptes sauf le sien. L'Admin invite,
modifie et supprime uniquement des Coachs ou Viewers ; lors d'une modification, il peut choisir l'une de ces
deux fonctions. Le Coach ne crée aucun compte et peut uniquement modifier ou supprimer un Viewer, sans changer
sa fonction. Toute tentative hors de cette hiérarchie retourne `403`.

Une invitation crée un compte actif portant exactement le rôle Admin, Coach ou Viewer, mais doté d'un mot de
passe inutilisable. Le champ `pending` reste vrai jusqu'à la définition du mot de passe. Le lien signé envoyé
par e-mail appelle `POST /api/invitations/{uid}/{token}/`; un lien invalide, expiré ou déjà consommé retourne
`400`. En cas de changement d'adresse, l'ancienne adresse reçoit une information sans lien et la nouvelle
reçoit un message distinct. La modification et la suppression du compte connecté du Superadmin sont refusées
avec `403`.

## Création, consultation, renommage et membres des organisations

`GET /api/admin/organizations/` liste les organisations et leurs utilisateurs affectés. `POST` sur la même
collection accepte exactement `name` et `user_ids`. Le nom est obligatoire et la liste contient au moins un
identifiant utilisateur existant. La création de l’organisation et de tous ses rattachements est atomique.

Ces opérations exigent une session active de Superadmin ou d’Admin ; tout autre acteur reçoit `403`. Une
réponse de création retourne `201` avec l’identifiant stable, le nom et les utilisateurs. Les données invalides
retournent `400` sans persistance partielle. La relation est plusieurs-à-plusieurs : une identité peut figurer
dans plusieurs organisations.

`PUT /api/admin/organizations/{organization_id}/` accepte exactement `name` et renomme l’organisation sans
modifier son identifiant ni ses membres. Le nom est nettoyé de ses espaces périphériques et reste obligatoire.
Le Superadmin agit sur toute organisation ; un Admin agit uniquement sur une organisation dont il est membre.
Une cible hors périmètre retourne `404`, tandis qu’un rôle non autorisé reçoit `403`.

`PUT /api/admin/organizations/{organization_id}/members/` remplace atomiquement la liste courante des membres.
Le Superadmin peut agir sur toute organisation ; un Admin agit uniquement sur une organisation dont il est
membre. La liste doit contenir au moins une identité et ne peut pas retirer le dernier Admin existant. Un refus,
un utilisateur inconnu ou une organisation hors périmètre ne modifie aucun rattachement.
