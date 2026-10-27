# Permissions par rôle — MEP-037

## Référentiel et limites

Audit de origin/main à b6be4c8, le 2026-10-17. Les décisions viennent des
[concepts transverses](../backlog/source/00-concepts-transverses.md), de
[FEAT-004 et USER-004](../backlog/source/01-identites.md), des contrats
[AUTH-002/003](../backlog/source/01b-passwords.md), [passations](evaluation-taking.md),
[Results](results-api.md), [Pilotage](steering-api.md) et [journaux](journals-api.md).
Les [règles communes MESS](../backlog/source/07-pre-mep.md#contrat-commun-des-pbi)
imposent de qualifier les acquis puis de corriger seulement les écarts démontrés.

Admin, Coach et Viewer sont les trois rôles métier. Superadmin désigne is_superuser,
sans rôle ni appartenance ; la session le représente par le rôle effectif Admin.
Les autorisations ci-dessous restent soumises à une identité active et aux scopes
[MEP-011](organization-isolation.md). Le rôle ne suffit jamais à ouvrir une autre organisation.
CSRF reste obligatoire pour les écritures de session, y compris les parcours publics concernés.

Légende : **A** autorisé ; **C** autorisé sous condition précisée ; **I** interdit ;
**P** exception publique explicite MEP-008. Chaque chemin commence par /api/.
Les regroupements listent exclusivement des méthodes et opérations existantes.
GET implique HEAD ; OPTIONS ne donne ni données métier ni droit de mutation.

## Matrice des opérations privées

| Endpoint | Méthodes / opération | Superadmin | Admin | Coach | Viewer | Condition / protection et règle |
| --- | --- | --- | --- | --- | --- | --- |
| session/ | GET identité ; PATCH palette personnelle | A | A | A | A | IsAuthenticated ; PATCH accepte uniquement interface_palette, jamais rôle/cible. |
| session/logout/ | POST déconnexion | A | A | A | A | IsAuthenticated ; fermeture de sa session. |
| session/password/ | POST mot de passe personnel | C | C | C | C | AUTH-003 : ancien mot de passe, confirmation, validateurs ; aucune cible tierce. |
| dashboard/ | GET accueil | C | C | C | C | IsAuthenticated + dashboard_projection, scopes Results et dix événements maximum. |
| users/ | POST création technique | A | I | I | I | CanCreateUser ; uniquement Admin/Coach/Viewer, jamais superuser ou appartenance. |
| admin/users/ | GET liste | A | C | C | I | CanViewManagedUsers + visible_managed_users ; membres actifs, inactifs seulement administrables. |
| admin/users/ | POST invitation | A | C | I | I | can_invite_managed_user ; Admin invite Coach/Viewer dans son organisation unique. |
| admin/users/{id}/ | PUT identité, rôle, activation | C | C | C | I | can_manage_user ; Superadmin hors soi ; Admin sur Coach/Viewer ; Coach sur Viewer sans changer sa fonction. |
| admin/users/{id}/ | DELETE alias de désactivation | C | C | C | I | Même hiérarchie ; change_activation ; aucune suppression physique. |
| admin/users/{id}/deactivate/, reactivate/ | POST lifecycle | C | C | C | I | Même hiérarchie ; invariants USER-004, aucun rôle/identifiant fourni dans le corps ne remplace la cible URL. |
| admin/organizations/ | GET liste | A | C | I | I | CanManageOrganizations + visible_organizations ; Admin voit seulement son organisation. |
| admin/organizations/ | POST création | C | I | I | I | can_create_organizations ; Admin actif requis, cardinalité, Superadmin jamais membre. |
| admin/organizations/{id}/ | GET fiche ; PUT renommage | A | C | I | I | CanManageOrganizations + manageable_organization. |
| admin/organizations/{id}/ | DELETE suppression | C | I | I | I | Contrôle is_superuser ; passation commencée protégée ; autres dépendances selon contrat existant. |
| admin/organizations/{id}/members/ | PUT rattachements | C | C | I | I | UpdateOrganizationMembersSerializer : ensemble des Admin immuable pour Admin ; dernier Admin actif conservé. |
| admin/organizations/{id}/teams/ | GET actifs/filtre archives ; POST création | C | C | I | I | CanManageOrganizations ; organisation accessible, Coachs membres et éligibles. |
| admin/teams/{id}/ | PUT nom/Coachs ; DELETE archivage | C | C | I | I | Même permission ; équipe active accessible, organisation immuable. Aucune réactivation disponible. |
| admin/evaluations/ | GET liste ; POST brouillon | C | C | I | I | CanManageEvaluations + visible_evaluations ; organisation accessible. |
| admin/evaluations/{id}/ | PUT édition ; DELETE brouillon | C | C | I | I | Même permission et scope ; état DRAFT requis. |
| admin/evaluations/{id}/validate/, archive/, versions/ | POST transition/copie | C | C | I | I | Même permission ; lifecycle et versionnement existants, une version validée par famille. |
| admin/evaluations/{id}/questions/ | GET liste ; POST création | C | C | I | I | CanManageEvaluations ; parent accessible, mutation DRAFT. |
| admin/questions/{id}/ | PUT édition ; DELETE suppression | C | C | I | I | Même permission ; question dans un brouillon accessible. |
| admin/planning/ | GET liste ; POST création | C | C | I | I | CanManageEvaluations + scope ; équipe active, version validée, assigné Admin/Coach actif local ; Superadmin peut se désigner. |
| admin/planning/{id}/ | PUT modification ; DELETE suppression | C | C | I | I | Même permission ; références scopées, provenance des passations préservée. |
| evaluations/ | GET passations | A | C | C | I | CanTakeEvaluations + evaluation_runs_for ; Admin organisation, Coach assigné et membre courant. |
| evaluations/{id}/ | GET consultation ; POST démarrer/reprendre | C | C | C | I | Même permission/scope ; modèle validé au démarrage, snapshots conservés, réaffectation si nécessaire. |
| evaluations/{id}/responses/{question}/ | PUT note | C | C | C | I | Même permission/scope revérifié sur ligne verrouillée ; question du run, brouillon, note entière 0–10. |
| evaluations/{id}/finalize/ | POST finalisation | C | C | C | I | Même permission/scope ; notes complètes, auteur déterminé par serveur. |
| evaluations/{id}/revision/ | PUT révision | C | C | I | I | CanTakeEvaluations puis is_evaluation_admin ; COMPLETED ; provenance initiale intacte. |
| results/organizations/, versions/, families/ | GET sélections | C | C | C | C | IsAuthenticated + projections scopées ; COMPLETED seulement, Coach assigné, Viewer organisation courante. |
| results/versions/{id}/, families/{id}/, families/{id}/criteria/{uuid}/ | GET résultats/radar/historique | C | C | C | C | Même scope ; version exacte sélectionnable, archives comprises, équipes et lignées explicites ; aucune écriture. |
| steering/organizations/, steering/ | GET Pilotage | C | C | I | I | CanManageEvaluations ; organisation choisie par Superadmin, imposée pour Admin ; lecture seule. |
| admin/activity-journal/, admin/logs/ | GET journaux | C | C | I | I | Permission administrative + scope ; logs système globaux Superadmin uniquement ; lecture seule. |

Les refus de rôle donnent 403 ; une ressource inexistante/hors scope donne 404.
Un Admin pair inactif est exclu du scope administrable : 404, sans révélation.
Les invariants métier (dont rattachement protégé des Admin) donnent 400.
Les demandes de rôle inexistant ou champs non contractuels donnent 400.
Ces codes distincts ne constituent aucune délégation supplémentaire.

## Exceptions publiques MEP-008

| Endpoint / méthode métier | Superadmin, Admin, Coach, Viewer et anonyme | Limite maintenue |
| --- | --- | --- |
| health/ GET | P | Statut/SQL minimal, aucune donnée métier. |
| session/login/ POST | P | Identifiants actifs, CSRF, limites MEP-001 ; rôle fourni ne change pas l'identité authentifiée. |
| password/recovery/ POST | P | CSRF, limites, réponse non énumérante ; aucune session obligatoire. |
| password/reset/ POST | P | CSRF, token dédié/expirant/unique, validateurs et invalidation des sessions. |
| invitations/{uid}/{token}/ POST | P | CSRF, compte actif en attente, token signé/unique ; seul son mot de passe est écrit. |
| schema/, docs/ GET | P | OpenAPI/Swagger existants, aucun enregistrement métier. |

AllowAny est explicite et l'inventaire MEP-008 demeure inchangé. Les méthodes métier absentes
retournent 405 après CSRF valide ; elles n'ouvrent aucune opération administrative.
Un identifiant/token forgé reste soumis au contrat public. Une invitation valide n'ouvre
aucune session et ignore les champs de rôle/cible : ils ne sont jamais utilisés pour une mutation.

## Correspondance navigation et actions

| Route / interface | Superadmin | Admin | Coach | Viewer |
| --- | --- | --- | --- | --- |
| /dashboard : profil, palette, mot de passe personnel | A | A | A | A |
| /results : consultation scopée | C | C | C | C |
| /users : liste et actions par cible selon la matrice | C | C | C | I |
| /organization, /teams, /templates, /planning | C | C | I | I |
| /evaluations : consultation/passation | C | C | C | I |
| Bouton Réviser les notes | C | C | I | I |
| /steering, /activity-journal, /logs | C | C | I | I |
| Connexion, récupération, reset, invitation | P | P | P | P |

ProductSidebar utilise menuFor, ProductShell vérifie canAccess à chaque rendu.
UserManagementPermissions restreint création et actions aux cibles administrables ; les membres
Admin sont verrouillés pour un Admin ; OrganizationPage réserve création/suppression au Superadmin.
Les boutons de cycle modèle/planning sont dans les routes Admin ; la révision suit can_revise du serveur.
Le backend recharge le rôle effectif à chaque requête ; recharger l'application relit la session.
Aucune synchronisation instantanée entre navigateurs n'est ajoutée : une interface déjà ouverte
peut conserver son ancien menu jusqu'au rechargement ; l'API refuse immédiatement le rôle retiré.

## Diagnostic et corrections bornées

Les classes de permissions, scopes MEP-011, hiérarchie, lifecycle, révisions et exceptions
publiques étaient conformes. Aucun contrôle d'isolation n'est réécrit.
Deux écarts reproduits puis corrigés :

- /teams avait minimumRole Coach malgré menu et API Admin ; il exige maintenant Admin.
- POST/PUT des utilisateurs ignoraient les champs supplémentaires et pouvaient donc modifier
  des attributs valides malgré une demande forgée de privilèges. Les serializers refusent
  désormais tout champ non contractuel avant création, modification, Journal ou notification.
  Aucune élévation effective par ces champs ignorés n'a été constatée.

Les droits Superadmin, invitations légitimes, mutations personnelles du Viewer et droits
du Coach sur Viewer restent conservés. « Viewer en lecture seule » concerne les ressources métier,
pas sa palette, son mot de passe ou sa déconnexion.

USER-002/003 restent ouverts pour leurs champs fonctionnels ; la matrice FEAT-004/USER-004
fait autorité pour les capacités préexistantes. Aucun arbitrage nouveau n'est requis ici.
ARB-ORG-005/006/007/010/013 restent ouverts selon MEP-011 ; exports/liens indirects MEP-038,
conflits concurrents MEP-040 et fonctionnalités absentes restent hors chantier.
[Tests, preuves et revue documentaire](role-permissions-validation.md).
