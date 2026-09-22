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

Le Superadmin reste créé par `manage.py createsuperuser`, sans fonction métier. L'API ne crée ni
superuser, ni rattachement organisationnel, et n'expose aucune opération de lecture, modification ou
suppression d'utilisateur.

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
contiennent que des placeholders et n'exposent aucune donnée métier.
