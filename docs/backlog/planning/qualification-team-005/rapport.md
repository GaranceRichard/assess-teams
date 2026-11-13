# TEAM-005 — Qualification initiale et contrat approuvé

Date : 2026-11-12 (America/Toronto). Constat initial des phases 1 et 2, conservé comme preuve avant correction.
Base récupérée par `git fetch origin main`, puis confirmée par `git ls-remote` :
`2fedab80cdcff42325c6c1bfc06f5650c702c2ae` (`origin/main`).
Branche : `team-005-archive-refusal`.
Worktree : `C:\Users\garan\Desktop\Projets\Assess-teams-worktrees\team-005-archive-refusal`.
À la qualification initiale : aucune modification applicative, de test versionné, de README ou de CI, aucun commit/push.
Le 2026-11-12, l’utilisateur a explicitement approuvé ce rapport et le contrat, puis autorisé développement et publication.
[Exécution après accord et preuves](preuves.md). Aucun statut canonique modifié.

## Autorités et état canonique

- [Source TEAM-005 / FEAT-010](../../source/02-equipes.md) : transition logique unique,
  conservation de l'identité et de l'historique, second refus explicite.
- [Suivi](../../tracking/pbis.md) : TEAM-005 **Ouvert**, date **N/A**.
- [Fiche historique](../audit-20261027/fiches/TEAM-005.md) et
  [écarts](../../source/08-ecarts-et-qualifications.md) : second DELETE 404 à corriger.
- [TEAM-003 livré](../qualification-team-003/preuves.md) : GET actif/archivé minimal
  Admin/Superadmin disponible ; son PBI reste Ouvert pour C04, sans blocage de ce correctif limité.
- [API Équipes](../../../architecture/teams-api.md), [API backend](../../../architecture/backend-api.md),
  [isolation](../../../architecture/organization-isolation.md) et
  [permissions](../../../architecture/role-permissions.md) confrontés au code publié.
- Règles agents, DoD, charte et stratégie de tests relues : aucun gate abaissé.

## Protocole exécuté et preuves

Sonde extérieure au dépôt : `C:\Users\garan\AppData\Local\Temp\assess-team-005-qualification\probe.py`.
Exécution avec le Python du worktree depuis `backend`, SQLite de test en mémoire migrée,
APIClient avec sessions réelles et contrôle CSRF. Base détruite après exécution ; aucune base produit utilisée.
La sonde importe les helpers existants sans modifier leur code. **32 observations**, assertions réussies.

Répertoire de preuves temporaires : `C:\Users\garan\AppData\Local\Temp\assess-team-005-qualification`.

| Repère | Artefact et contenu |
| --- | --- |
| P1 | `results.json` : statut, corps JSON, absence d'effet métier et contexte Log des 32 observations. |
| P2 | `admin-before.json`, `admin-after-first.json`, `admin-after-second.json` : snapshots ORM complets. |
| P3 | `superadmin-before.json`, `superadmin-after-first.json`, `superadmin-after-second.json` : même protocole global. |
| P4 | `admin-writes.json`, `superadmin-writes.json` : SQL d'écriture capturé pour les deux DELETE successifs. |
| P5 | `baseline-tests.txt` : **59 passed in 22.43s**, code de sortie 0. |
| P6 | `probe.py` : protocole reproductible, sans modification applicative. |

Snapshots : organisation et membres, équipe et M2M Coachs, toutes les tables du module assessments,
activités métier. Chaque jeu contient une famille, une évaluation validée, deux questions, une planification,
une passation complétée avec deux questions/résultats et son activité antérieure.
La première transition ne change que `Team.is_active` et ajoute une activité `team_archived`.
Les activités antérieures, valeurs, identifiants et rattachements restent strictement identiques.
La seconde demande conserve le snapshot métier intégral ; seule une insertion Log HTTP est observée.

Commande de référence des tests existants, depuis `backend` :

```powershell
.venv/Scripts/python.exe -m pytest tests/test_teams.py tests/test_team_detail.py tests/test_team_detail_integrity.py tests/test_team_detail_openapi.py tests/test_log_team_options.py tests/test_http_logs.py tests/test_openapi.py --basetemp "$env:TEMP/assess-team-005-qualification/pytest-baseline" -q
```

Ce succès inclut génération stricte `spectacular(validate=True, fail_on_warn=True)`, `/api/schema/`
et `/api/docs/`. Il décrit l'existant, dont des tests attendent encore le second 404 ; il ne prouve
pas la satisfaction du nouveau contrat ni la DoD d'une correction encore non développée.

## Matrice contradictoire

| Critère | État initial | Action | Attendu | Observé | Preuve | Écart |
| --- | --- | --- | --- | --- | --- | --- |
| 1 — nominal Admin | Équipe active locale avec historique complété | DELETE | 204, inactif, identité/liens conservés, une activité | Conforme ; seul is_active change, une activité ajoutée | P1/P2/P4 | Aucun sur le jeu |
| 1 — nominal Superadmin | Équipe active, acteur sans organisation | DELETE | Même transition globale autorisée | 204, mêmes invariants | P1/P3/P4 | Aucun sur le jeu |
| 1/6 — relecture | Équipe venant d'être archivée | GET | 200, quatre champs exacts, is_active=false | Conforme Admin/Superadmin, identité inchangée | P1/P2/P3/P5 | Aucun |
| 1 — liste active | Archive persistée | GET collection | Équipe absente | 200, liste vide locale | P1/P5 | Aucun |
| 2 — second refus | Même archive accessible | DELETE répété | Refus explicite déjà archivée, sans succès | 404, detail « No Team matches the given query. » | P1 | Refus métier explicite absent |
| 2/5 — absence d'effet | Historique après premier archivage | Second DELETE | Aucun changement ni seconde activité | Snapshots identiques ; un seul team_archived ; seule écriture Log HTTP | P2/P3/P4 | Aucun effet indésirable observé |
| 3 — isolation | Admin A ; équipes B active et archivée | DELETE B / ID absent | Même refus sans révélation | Même 404 et même JSON ; aucun contexte d'équipe B | P1 | Aucun |
| 4 — rôles | Coach affecté et Viewer ; actifs/archives | DELETE existant / absent | 403 avant recherche, aucun effet | Même 403 par acteur ; snapshot inchangé ; Log sans équipe | P1 | Aucun |
| 4 — session | Admin inactif et anonyme ; actifs/archives | DELETE existant / absent | Authentification existante, aucun effet | 403 identique par acteur ; aucune donnée métier | P1 | Aucun |
| 4 — CSRF | Admin actif, jeton absent | DELETE | 403, aucun effet | 403 « CSRF token missing. », snapshot inchangé | P1 | Aucun |
| 5 — patrimoine | Coach, modèle, questions, planning, résultats, activité antérieure | Premier puis second DELETE | Conservation intégrale hors transition attendue | Égalité de toutes les tables et relations concernées | P2/P3/P4 | Aucun sur ces historiques |
| 6 — TEAM-003 | Deux états, rôles, scopes | Suite détail existante | Projection/refus inchangés | Tests verts, GET post-archive conforme | P1/P5 | Aucun |
| 7 — PUT archive | Archive accessible | PUT nom/Coachs | Refus existant conservé | 404 ; aucune mutation | P1/P5 | Aucun |
| 7 — autres acquis | Création/liste/édition/filtre Logs | Suites existantes | Contrats inchangés | 59 tests verts sur sélection | P5 | E2E et suites complètes à exécuter après correction |

## Conventions HTTP vérifiées

`docs/architecture/role-permissions.md` définit explicitement : invariants métier **400**,
refus de rôle **403**, cible absente/hors périmètre **404**.
`ArchiveEvaluationView.post` refuse une évaluation non VALIDATED via `ValidationError` avant sauvegarde.
La sonde appelle cette route sur une évaluation déjà archivée : **400**,
`["Seule une évaluation validée peut être archivée."]`, sans effet métier (P1).
`ValidateEvaluationView` et les gardes de passation suivent également `ValidationError`.
Le gestionnaire partagé ne transforme pas les erreurs DRF usuelles.
La recherche backend ne trouve aucun usage métier de `409` ou `HTTP_409_CONFLICT`.

**Recommandation soumise à décision : 400**, corps JSON liste de messages comme le lifecycle existant :

```json
["Équipe déjà archivée."]
```

Le refus est explicite et distinct d'une absence ; une réponse DELETE de refus reste une réponse non réussie.
Un 409 demanderait l'introduction d'une convention nouvelle : ce choix n'est pas retenu dans la proposition.

## Contrat proposé puis approuvé explicitement le 2026-11-12

Route inchangée : `DELETE /api/admin/teams/{team_id}/`, session active et CSRF existants, sans body.
Le contrôle du rôle et de l'organisation précède l'observation de l'état archivé.

| Code HTTP | Corps JSON | Permission | Scope | Effet métier | Journal |
| --- | --- | --- | --- | --- | --- |
| 204 | Aucun corps | Superadmin ou Admin actif | Toute organisation pour Superadmin ; organisation courante pour Admin ; équipe active | is_active=false uniquement ; identité/historique conservés | Une ActivityEntry team_archived et un Log HTTP |
| 400 | `["Équipe déjà archivée."]` | Même permission | Équipe archivée accessible, après filtrage organisationnel | Aucun changement, sauvegarde ou nouvelle transition | Aucune ActivityEntry ; un Log HTTP 400 avec contexte autorisé |
| 404 | `{"detail":"No Team matches the given query."}` | Même permission | ID absent ou hors organisation, active comme archivée | Aucun | Aucune ActivityEntry ; un Log HTTP sans équipe étrangère |
| 403 | `{"detail":"Cette opération est interdite pour votre fonction."}` | Coach/Viewer refusés | Aucun objet équipe chargé | Aucun | Aucune ActivityEntry ; Log HTTP sans équipe |
| 403 | `{"detail":"Informations d'authentification non fournies."}` | Session absente ou compte inactif | Aucune recherche métier | Aucun | Aucune ActivityEntry ; Log HTTP sans équipe |
| 403 | `detail` CSRF existant, selon cause | Session active sans jeton valable | Avant recherche métier | Aucun | Aucune ActivityEntry ; Log HTTP technique existant |

La réponse 404 existante de DELETE est conservée exactement, y compris son libellé anglais.
Le GET conserve sa réponse 404 française et sa projection exacte : aucun changement TEAM-003/C04.
Le PUT conserve sa sélection des seules équipes actives, donc son 404 sur archive.
Le 500 sûr et la corrélation restent gérés par le dispositif partagé existant.
La non-divulgation compare les codes, corps et contextes exposés ; les corrélations restent propres à chaque appel.
Aucune garantie nouvelle d'égalité temporelle des réponses n'est prétendue.

## Suite conditionnée à l'accord explicite

1. Mettre à jour préalablement README, puis créer les tests attendus ; capturer leurs échecs réels.
2. Étendre localement la sélection du DELETE aux archives du seul scope autorisé, en gardant
   `manageable_team` actif par défaut pour PUT ; refuser l'archive avant tout save/activité métier.
3. Documenter le nouveau 400 dans OpenAPI avec son schéma liste de chaînes et son exemple exact.
4. Protéger API/ORM, permissions, identité/historique, absence de seconde activité et écritures SQL.
   Étendre le parcours E2E archive→GET→second refus avec la session/CSRF du navigateur réel.
5. Recalculer le plan réel ; exécuter tous les gates requis, couvertures complètes, lint/formatage,
   limite 200 lignes, build/typecheck, migrations, OpenAPI, sécurité et E2E.
6. Resynchroniser depuis le dernier origin/main, préserver les corrections entrantes, publier via
   `npm run publish`, attendre la CI du SHA exact et synchroniser main par fast-forward sûr.
7. Nettoyer uniquement ce worktree/branche après livraison réussie ; proposer ensuite la clôture.

Fichiers actuels : vue 179 lignes, scope 23, serializers 120 ; l'ajout restera borné à 200 lignes
ou sera séparé selon une responsabilité cohérente. Aucun modèle/migration nécessaire à ce stade.
Aucun test/helper de contention SQLite ni workflow CI modifié ; autre worktree laissé intact.
La sonde est séquentielle : elle ne qualifie pas deux appels concurrents. Aucun mécanisme de verrouillage
nouveau n'est proposé sans défaut démontré et test préalable, conformément à la demande.
Les résultats de qualification ne remplacent aucune preuve rouge/verte future ni CI de publication.
TEAM-005 reste Ouvert / N/A. Aucune clôture, décision MESS ou approbation implicite.

**Décision reçue le 2026-11-12 : « GO — TEAM-005 : contrat d'archivage approuvé ».**
HTTP 400 et `["Équipe déjà archivée."]` approuvés, développement et publication autorisés.
TEAM-005 reste Ouvert / N/A ; sa clôture exige une nouvelle approbation explicite.


## Préparation du changement — TEAM-005

- Périmètre : limiter le correctif au second archivage accessible, à ses contrats et aux preuves de non-régression.
- Objectif : remplacer le 404 ambigu reproduit par le refus métier explicitement approuvé par le mainteneur.
- Effets attendus : retourner 400 avec la liste exacte de messages, sans sauvegarde métier ni seconde activité.
- Risques : préserver les scopes organisationnels, les permissions, la consultation TEAM-003 et les historiques existants.
- Vérification : exécuter les tests rouges puis verts API/ORM/OpenAPI/E2E, puis tous les gates du plan réel.
- Fichier : `backend/teams/adapters/api/scope.py`
- Fichier : `backend/teams/adapters/api/serializers.py`
- Fichier : `backend/teams/adapters/api/views.py`
- Fichier : `backend/tests/test_openapi.py`
- Fichier : `backend/tests/test_team_archive.py`
- Fichier : `backend/tests/test_team_archive_openapi.py`
- Fichier : `backend/tests/test_team_detail_integrity.py`
- Fichier : `backend/tests/test_team_detail_openapi.py`
- Fichier : `frontend/e2e/teams.spec.ts`

Revue de contenu de l’agent le 2026-11-13 : ce rapport est le document propriétaire du contrat
TEAM-005 et de sa qualification. Sa proposition et sa matrice ont été préparées puis approuvées
le 2026-11-12 avant le code ; le README a ensuite annoncé le chantier selon la règle alors applicable.
Le présent bloc au nouveau format et sa liste exhaustive sont ajoutés le 2026-11-13, après les travaux,
pour la traçabilité de la politique prospective ; ils ne sont pas présentés comme un préalable antérieur.
La préparation réelle est celle des sections initiales ci-dessus, pas une chronologie reconstruite.
Le nouvel accueil produit de main est conservé : ce delta de refus API relève du contrat Équipes,
sans nouvelle proposition de valeur, parcours de découverte ou information d’installation à y annoncer.
Aucune préparation technique ou règle de validation n’est modifiée dans un autre domaine.
La pertinence finale reste soumise à la revue humaine, distincte du succès du contrôle automatique.
