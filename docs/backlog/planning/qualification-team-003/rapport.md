# TEAM-003 — Qualification et découpage soumis à décision

Date : 2026-11-06. Base publiée récupérée par `git fetch origin` :
`550efa5e52648c3ae934421b29c10121eb091471` (`origin/main`).
Branche : `qual/team-003-consultation`.
Worktree : `C:\Users\garan\AppData\Local\Temp\assess-teams-team-003`.
Rapport initial de phase 1 : aucun développement, commit ou push à sa rédaction.
Découpage approuvé explicitement le 2026-11-06 ; [exécution et preuves](preuves.md).
Les statuts, dates, décisions et indicateurs canoniques restent inchangés.

## Confrontation au code publié

| Élément | Constat vérifié |
| --- | --- |
| Route | `backend/config/urls.py:155` : `/api/admin/teams/<int:team_id>/`, nom `team-detail`. |
| Vue | `backend/teams/adapters/api/views.py:93` : PUT et DELETE ; aucun GET détail. |
| Périmètre de mutation | `backend/teams/adapters/api/scope.py:7` : organisation filtrée avant recherche, `is_active=True`. |
| Permission | `CanManageOrganizations` : acteur actif Superadmin Django ou Admin ; Coach et Viewer refusés. |
| Projection existante | `TeamSerializer` restitue aussi `coaches`, au-delà des quatre champs demandés. |
| Archive | `Team.is_active=False` ; aucune suppression par le DELETE existant. |
| Liste | GET organisationnel actif ; `include_archived=true` déjà disponible pour les Logs. |
| Schéma | Le chemin détail généré contient seulement `put` et `delete`. |
| Précédent réutilisable | GET Organisation : même permission, lecture de scope puis contexte HTTP autorisé. |

Le diagnostic initial reste exact. La liste enrichie des archives, le Dashboard Coach et Results
ne constituent pas une consultation d'équipe par ID et ne décident pas C04.

## Observations exécutées sur la base publiée

Commande dans `backend` :
`.\.venv\Scripts\python.exe -m pytest tests/test_teams.py tests/test_log_team_options.py tests/test_openapi.py -q`

Résultat : **18 passed in 7.56s**. Couverture de l'existant : création/édition/archivage,
isolation, rôles, Coachs éligibles, filtre Logs, génération/validation stricte du schéma et Swagger.
Ces résultats ne prouvent pas les critères du futur GET.

Sondes complémentaires sans fichier applicatif, SQLite en mémoire migrée, six acteurs :
Superadmin, Admin A, Coach A, Viewer A, Admin inactif et anonyme.
Jeu : équipe active A, archivée A, active B, ID inexistant, entier `10**40`, `abc`, `-1`, `1.5`, ID vide.

| Requête actuelle | Résultat observé |
| --- | --- |
| ID entier, Superadmin/Admin | 405 JSON, quelle que soit l'existence ou l'organisation. |
| ID entier, Coach/Viewer | 403 JSON, message de permission identique quel que soit l'ID. |
| ID entier, inactif/anonyme | 403 JSON, authentification non fournie. |
| ID mal formé ou vide | 404 de routage, réponse non JSON en configuration développement. |
| Journal métier | Aucune nouvelle `ActivityEntry` pendant les 54 GET. |
| Logs techniques | 54 entrées HTTP ; capture existante conservée. |
| `manageable_team`, Superadmin | Actif trouvé ; archive, absent et entier hors plage : Http404. |

## Découpage minimal proposé

Un seul lot technique Admin/Superadmin, limité au backend et à sa documentation :

1. Mettre à jour préalablement le README après approbation, avant tout développement.
2. Ajouter `get` à `TeamDetailView`, avec les permissions et l'authentification Session existantes.
3. Ajouter dans `scope.py` une lecture dédiée, par exemple `readable_team`, incluant actifs et archives.
   Superadmin global ; Admin limité aux organisations dont il est membre, comme l'existant.
   Filtrer avant recherche par ID ; ne pas rechercher globalement puis refuser après découverte.
4. Ajouter un sérialiseur de détail minimal à quatre champs, sans changer `TeamSerializer`.
5. Enrichir le contexte HTTP seulement après lecture autorisée, sans événement métier, verrou ni sauvegarde.
6. Ajouter tests API/ORM, refus et contrat OpenAPI ; conserver les handlers PUT/DELETE et leur helper.

Les fichiers actuels offrent de la place : vue 155 lignes, scope 11, sérialiseurs 107.
Créer un fichier de tests détail dédié ; `test_teams.py` a 159 lignes, `test_openapi.py` 186.
Chaque fichier maintenu restera sous 200 lignes, sans compaction artificielle.
Aucun modèle, migration, nouvelle route, écran ou dépendance nécessaire.

## Contrat proposé à approuver

`GET /api/admin/teams/{team_id}/` ; paramètre de chemin entier obligatoire, aucun body.
Réponse 200 JSON, objet unique sans enveloppe ni champ supplémentaire :

```json
{"id": 42, "name": "Alpha", "organization_id": 7, "is_active": true}
```

Après archivage, mêmes ID, nom et organisation ; `is_active` vaut `false`.
Types : `id` et `organization_id` entiers, `name` chaîne, `is_active` booléen.
Les quatre champs sont présents et en lecture seule ; aucune projection des Coachs ou de l'organisation.

| Condition | Réponse proposée |
| --- | --- |
| Superadmin actif, équipe existante de toute organisation | 200, active ou archivée. |
| Admin actif, équipe de son organisation | 200, active ou archivée. |
| Admin hors organisation / ID inexistant | Même 404 JSON `detail`, proposé : « Équipe introuvable. ». |
| Coach ou Viewer | 403 JSON `detail`, permission existante ; aucun lookup d'équipe. |
| Anonyme ou compte inactif | 403 selon SessionAuthentication existante, sans ouverture Basic/JWT. |
| ID `0` ou entier hors plage | 404 sans erreur serveur ; à tester dans le futur handler. |
| ID absent, texte, négatif ou décimal | 404 du routeur ; pas de normalisation JSON globale dans ce lot. |
| Erreur interne imprévue | 500 sûr déjà géré et documenté ; aucun traceback ou contenu métier. |

L'ID absent vise `/api/admin/teams/` ou `/api/admin/teams//`, pas la collection organisationnelle valide.
Le refus hors scope et l'absence doivent partager corps, statut et absence de contexte étranger.
« Sans mutation » signifie aucune mutation métier ; la capture HTTP technique obligatoire reste active.
PUT et DELETE continuent à refuser une archive par 404, y compris après un GET réussi de cette archive.

## OpenAPI et preuves à livrer après accord

- Ajouter seulement l'opération GET au chemin existant, sans requestBody ni filtre `include_archived`.
- Documenter `cookieAuth`, rôles, scope, états, paramètre obligatoire et projection minimale dédiée.
- Déclarer 200/403/404 ; conserver le 500 ajouté par le hook partagé `journals.schema.operation_errors`.
- Documenter les 404 de routage sans prétendre qu'ils ont tous un corps JSON DRF.
- Vérifier les quatre propriétés requises du composant et l'absence de `coaches` ; préserver PUT/DELETE.
- Génération stricte `spectacular --validate --fail-on-warn`, `/api/schema/` et `/api/docs/` vérifiés.
- Matrice API : deux rôles autorisés × deux états ; Admin sans rattachement ; étranger actif/archivé ;
  absent/0/hors plage/mal formé/vide ; Coach affecté ou non, Viewer, anonyme et inactif.
- Comparer les données métier et liens avant/après GET : équipe, organisation, affectations,
  planifications/passations conservées et `ActivityEntry` inchangées ; un seul Log HTTP sûr par GET.
- Régression : POST/liste/PUT/DELETE, archives toujours non modifiables, second DELETE toujours 404,
  historiques et filtre Logs inchangés. Aucun correctif TEAM-005 anticipé dans ce lot.

Le moteur d'impact existant classe les trois fichiers API proposés en `backend-contract` :
documentation, backend complet, frontend complet et E2E sont requis, même sans écran ajouté.
Cette simulation de chemins ne remplace pas `npm run quality:targeted` sur le diff réel après développement.
Appliquer lint, formatage, limite 200 lignes et couvertures complètes >= 90 %, selon les gates existants.
Revue documentaire : README, contrat API, isolation/journaux, règles, charte, DoD, stratégie et architecture.

## C04, exclusions et décision attendue

Le lot Coach reste différé jusqu'à décision produit C04 : équipes affectées ou autre périmètre,
conditions d'appartenance courante et accès aux archives, y compris après fin d'affectation.
Les droits Dashboard/Results et les anciens liens ne valent pas cette décision.
L'approbation du lot Admin/Superadmin ne tranche pas C04 ; Coach reste refusé dans ce lot.
Après C04 : préciser les scénarios et le périmètre Coach, puis faire approuver l'extension concernée.

TEAM-005 pourra consommer la relecture archivée ; son second refus explicite reste un écart distinct.
TEAM-006 (liste dédiée d'archives), TEAM-007 (réactivation/C05), historiques et enrichissements sont exclus.
TEAM-003 reste ouvert tant que C04 ou un critère canonique n'est pas satisfait et la clôture approuvée.

Décision demandée : approuver ce lot GET minimal Admin/Superadmin, ses quatre champs et ses refus,
avec maintien du refus Coach en attente de C04. Aucun développement avant cet accord explicite.
Après accord et validations : commit, `npm run publish`, CI verte du SHA exact, preuves et écarts,
fast-forward sûr du main principal et nettoyage de ce seul worktree/branche après publication réussie.
La décision sollicitée dans ce rapport a été reçue avant développement ; aucune clôture canonique accordée.
