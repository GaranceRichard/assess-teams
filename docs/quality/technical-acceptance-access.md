# MEP-031 — Authentification, permissions et isolation

[Index](technical-acceptance.md) · [P0, jeux G, R0 et PV](technical-acceptance-protocol.md).
Reprendre une requête nominale observée et son schéma réel, changer seulement l'élément testé.
Pour un refus de droit ou de scope, conserver session et CSRF valides afin d'exercer la bonne frontière.

## TEC-06

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-06 — Qualifier les surfaces de connexion et empêcher élévation de privilège ou action d'un rôle interdit. |
| Références | [Authentification MEP-001](../architecture/login-security.md), [permissions MEP-037](../architecture/role-permissions.md), [preuves existantes](../architecture/role-permissions-validation.md), [FON-01 à 04](functional-acceptance-admin.md). |
| Préconditions | P0 ; recette et comptes G-A, Superadmin pour relecture ; paramètres LOGIN effectifs relevés, liste des pairs LOGIN cohérente avec les pairs HTTP. Clone pour limitation, sans bloquer le compte de l'exploitant. |
| Données | G-A ; comptes actif/inactif/invité/inconnu ; identifiant fictif réservé aux refus répétés ; requête nominale d'invitation/édition et état cible enregistrés. |
| Procédure | 1. Exercer login produit, admin et exception Basic `/api/users/` selon leur contrat. 2. Faire les échecs de connexion jusqu'aux limites LOGIN effectivement retenues ; observer refus du bon mot de passe pendant restriction et retour après expiration sans prolongation. 3. Contrôler menus et routes collées pour les quatre rôles, puis appels API réels de la matrice MEP-037. 4. Rejouer invitation/PUT avec un seul champ forgé (`is_superuser`, `is_staff`, `groups`, `user_permissions`, `role_id` ou `organizations`). 5. Modifier légitimement un rôle via Superadmin et vérifier ses droits dans la session déjà ouverte. |
| Injection | Credentials invalides, compte inactif, route/API interdite au Coach/Viewer ; champs de privilège hors contrat. Pour chaque variante, prouver au préalable que le nominal autorisé fonctionne. |
| Attendu | Login produit 401 générique pour credentials invalides, 429 avec Retry-After pour restriction ; CSRF absent 403 sans comptabilisation. Droits API : 403 rôle interdit ; champs forgés : 400 sans appliquer même les champs valides. Basic et admin conservent leurs contrats propres. Changement de rôle réévalué sans reconnexion forcée pour masquer un défaut. |
| Seuil | Paramètres LOGIN du candidat, avec défauts documentés 5/30/900 s seulement s'ils sont effectivement retenus ; ce sont des règles d'authentification, pas une charge MESS. Adaptation au NAT/proxy à approuver dans MEP-022/D05, pas un seuil nouveau de ce cahier. |
| Refus | Aucun nouveau privilège, compte, modification, Journal de succès ou intention mail pour le perdant ; état métier/M2M comparé avant/après par acteur autorisé. Logs HTTP de refus légitimes conservés. Erreur 500, filtre d'interface seul ou CSRF invalide ne prouve pas une permission correcte. |
| Preuves | Matrice acteur/méthode/route/variante, statut/corps sûr, Retry-After et temps observé, paramètres non secrets, états et compteurs, captures navigation et refus API, corrélations. |
| Remise en état | R0 ; attendre expiration selon contrat, restaurer le rôle par acteur autorisé, fermer sessions de test. Ne pas effacer les compteurs pour fabriquer le retour nominal. |
| Consommateur / verdict | MEP-034 — **Non exécuté**. |

## TEC-07

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-07 — Empêcher lecture/mutation interorganisationnelle, y compris par identifiant connu, filtre, lien et session ancienne. |
| Références | [MEP-011 : matrice/scopes](../architecture/organization-isolation.md), [preuves](../architecture/organization-isolation-validation.md), [MEP-038 : accès indirects/exports](../architecture/indirect-access.md), [preuves](../architecture/indirect-access-validation.md). |
| Préconditions | P0 ; G-A/G-S/G-J, clones dédiés pour changement d'appartenance ; Admin Alpha/Beta et Superadmin pour vérification, Coach/Viewer pour lectures bornées. Les surfaces absentes, dont export métier et détail TEAM-003, ne sont pas supposées livrées ni développées ici. |
| Données | IDs locaux et étrangers existants, ID inexistant, organisation/famille/équipe/critère incompatibles ; comptes déplacés Alpha → Beta avec session Alpha conservée ; historiques/archives inchangés à comparer. |
| Procédure | 1. Exercer toutes les catégories de la matrice MEP-011 : lectures directes, collections/recherche/pagination, mutations et références liées. 2. Remplacer un ID local par un ID Beta puis inexistant ; comparer les réponses. 3. Suivre liens Pilotage/Dashboard → Results, versions/lignées/équipes, `next/previous` et filtres Logs selon MEP-038. 4. Déplacer un Coach puis un Viewer via la gestion des membres autorisée ; réutiliser la session ancienne sur les API Alpha/Beta et consulter l'historique Alpha via son Admin. 5. Inspecter les champs courants masqués et snapshots conservés, puis les effets d'une échéance avec assigné devenu étranger. |
| Injection | ID étranger réel, sélection d'équipes mixte, paramètre relationnel étranger, requête directe après changement de scope ; ne pas créer un export absent ou rouvrir un contrat de consultation. |
| Attendu | 403 pour rôle interdit, 404 pour objet masqué, 400 pour référence invalide selon la route ; collections filtrées Logs peuvent répondre 200 vide. Sélection Results mixte refusée entièrement même pour Superadmin. Ancien scope retiré immédiatement ; nouveau scope autorisé selon rôle ; noms courants étrangers masqués, snapshots historiques inchangés. |
| Seuil | Zéro donnée courante étrangère exposée et zéro mutation interdite ; codes/matrices canoniques, pas un code universel pour toutes les routes. |
| Refus | Chaque refus attendu doit laisser objets, M2M, notes, versions, historique, Journal métier et intentions mail inchangés, hors événement légitime de rattachement. Un lien d'interface caché ne prouve pas le refus API ; 500 inattendu, liste étrangère ou référence révélant une identité = échec. |
| Preuves | Relevé route/rôle/ID local-étranger-inexistant, statuts et projections expurgées, pagination/compteurs, états avant/après, historique et champs nullables, traces des appels indirects sans cookies. |
| Remise en état | R0 ; restaurer les rattachements autorisés et vérifier les scopes ; ne pas réécrire les snapshots ou supprimer les anciens liens pour rendre le test passant. |
| Consommateur / verdict | MEP-034 — **Non exécuté**. |
