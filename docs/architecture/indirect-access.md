# Accès indirects et exports — MEP-038

Audit du socle `d54909c`, le 2026-10-18, selon la
[source canonique](../backlog/source/mess/f01.md) et la DoD.
Les protections [MEP-011](organization-isolation.md) et [MEP-037](role-permissions.md)
restent les autorités pour les scopes et capacités. [Preuves](indirect-access-validation.md).

## Inventaire des sorties existantes

| Surface | Source inspectée | Données et contrôle |
| --- | --- | --- |
| Export métier CSV, XLSX, PDF ou téléchargement | Routes `backend/config`, vues API, adapters React, parcours E2E | Aucun export métier existant. Results, Dashboard et Pilotage rendent du JSON scopé ; aucun export ajouté. |
| OpenAPI et Swagger publics | `SpectacularAPIView`, `SpectacularSwaggerView` | Description de contrat sans enregistrement métier ; exception MEP-008 explicite. |
| Notices Python | `scripts/legal/python_inventory.py` | Licences et métadonnées des distributions installées ; aucune requête ORM ni lecture des bases métier. |
| Notices npm et assets `legal/` | `scripts/legal/{export-npm,npm-notices,vite-legal}.mjs` | Manifests, notices tierces, documents publics du dépôt ; liste explicite des assets servis, aucune donnée de session. |
| Démo publique | `frontend/src/demo`, `public-demo.md` | Données fictives embarquées et état local ; aucun backend ni accès aux organisations réelles. |
| Administration Django | `identities/admin.py`, `notifications/admin.py` | Identités en consultation selon permissions Django ; files notification/récupération exclusivement Superadmin ; aucun export enregistré. |

Recherche sur routes et implémentations : `download`, `csv`, `xlsx`, `pdf`,
`Content-Disposition`, `Blob`, `createObjectURL`, puis scripts d’export juridique.
Le mot TypeScript `export` n’est pas assimilé à un téléchargement de données.
Sauvegardes et distribution MESS à construire restent dans leurs PBI d’exploitation.

## Matrice des accès indirects

Tous les chemins d’API ci-dessous commencent par `/api/`.

| Voie | Protection avant restitution | Preuve principale |
| --- | --- | --- |
| Recherche utilisateurs, comptes inactifs | `visible_managed_users` avant recherche, compte et pagination ; hiérarchie MEP-037 pour cible | `test_isolation_reads`, `test_managed_user_scope`, `test_managed_user_permissions` |
| Modèles/planning filtrés par `organization_id` | `visible_evaluations` / `visible_schedules` avant `collection_response` ; filtre ajouté au scope | `test_indirect_access_filters`, `test_isolation_reads` |
| Organisation → utilisateurs ; équipes → Coachs | Parent accessible, membres courants ; ancien lien M2M vers Coach étranger sans divulgation de son identité courante | `test_indirect_access_history`, `test_isolation_regressions` |
| Modèle → questions ; run → questions/repères | Parent scopé ; question étrangère refusée à l’écriture ; lecture des snapshots | `test_isolation_reads`, `test_isolation_mutations`, `test_evaluation_taking_permissions` |
| Planning → modèle/famille/équipe/responsable | Parent scopé, quatre références validées ; ID historique conservé, nom/rôle courant masqués après départ | `test_isolation_mutations`, `test_indirect_access_history` |
| Versions/familles Results | `completed_results_for` avant famille/version/dernière complétion ; Coach assigné, Viewer organisation courante | `test_results_security`, `test_result_longitudinal_security` |
| Famille → critère → équipes → observations | Lignée explicite et équipes éligibles ; sélection mixte refusée entièrement ; points dans le même scope | `test_indirect_access_history`, `test_result_longitudinal_security` |
| Pilotage/Dashboard → résultats/passations | Scopes des runs/résultats réutilisés ; Coachs courants seulement ; auteurs Dashboard masqués au Viewer | `test_steering_security`, `test_dashboard_security`, `test_indirect_access_history` |
| Journal/Logs, filtres relationnels | Scope avant filtres et pagination ; snapshots historiques ; Logs globaux Superadmin uniquement | `test_indirect_access_filters`, `test_indirect_access_history`, `test_logs_api` |
| Liens `next` / `previous` | Collection déjà scopée ; chaque requête revérifie droits et parent | `test_indirect_access_filters` |
| `/results?organization_id=…&family_id=…&team_id=…` | Entiers positifs sûrs sans doublons par `readResultIntent` ; `useResultSelection` vérifie les réponses accessibles ; API indépendante | `ResultsIntent.test.tsx`, `steering.test.ts`, `indirect-access.spec.ts` |
| Routes produit collées directement | `ProductShell`/`canAccess` et API indépendants ; /teams Admin, aucune administration Viewer | `permissions.spec.ts`, `viewer-results.spec.ts`, preuves MEP-037 |

Les filtres non contractuels ignorés n’élargissent pas le queryset initial.
Un paramètre ambigu ne vaut jamais autorisation, même si un serializer prend sa dernière valeur.
403 : rôle interdit ; 404 : ressource hors scope/inexistante ; 400 : validation métier.
Certaines collections filtrées retournent 200 vide.
Superadmin garde son accès global, sans rendre une équipe étrangère éligible dans une famille locale.

## Historique et identifiants forgés

Deux organisations SQLite réelles, sessions/CSRF réels, données fictives : IDs étrangers existants
et inexistants, équipes autorisées/étrangères mélangées, UUID étranger, IDs répétés,
modèles/équipes archivés, rattachement changé sans nouveau cookie, anciens liens M2M.
Les snapshots et références restent persistés. Aucun modèle métier, notification ni Journal
n’est changé par les refus ; les Logs HTTP de tentative restent permis.

Le navigateur ouvre un lien sur une version archivée autorisée, déplace l’utilisateur vers B,
recharge la même URL, constate l’absence de résultats A et les refus 404 des quatre API A.
L’autorisation initiale, sa révocation et la conservation de l’historique sont distinctes.

## Diagnostic et limites

Aucune fuite ni défaut de contrôle démontré sur les opérations existantes examinées.
Le chantier ajoute des preuves et tests de qualification sans correction applicative,
nouvel export, partage, rôle, migration ni règle d’historisation.
Les protections MEP-011/037 ne sont pas réimplémentées.

ARB-ORG-005/006/007/010/013, capacités absentes et qualification complète du candidat MESS
restent dans leurs registres. Cet audit ne qualifie pas l’infrastructure déployée
ni des partages/exports futurs, qui exigeront leurs propres contrôles.
