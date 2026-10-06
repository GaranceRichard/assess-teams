# Assess teams

## Vision produit

**Assess Teams** vise à transformer l’évaluation ponctuelle des équipes en un dispositif continu d’évaluation, d’accompagnement et de pilotage de leur progression dans le temps.
Des modèles maîtrisés et versionnés, des évaluations planifiées et traçables et un historique fiable doivent aider les Coachs et chaque Organisation à agir sur des résultats observables, sans réduire une équipe à un score. La [Vision produit](docs/product/vision.md) fixe cette direction et la distingue du socle livré.

## Cadre actuel

[Pilotage P0 — STEER-001](docs/architecture/steering-api.md) livre `/steering` pour Admin/Superadmin :
équipes actives, complétions, retards et liens Results, via une projection backend read-only.
Aucun score global, classement ou indicateur de performance individuelle n’est calculé.

Le produit fait de l'Organisation la frontière d'administration : le Superadmin est global ; un Admin rattaché à une organisation unique administre ses membres non-Admin, ses équipes et ses modèles, jamais les Admins pairs. Le bandeau de navigation vertical associe une icône à chaque entrée et peut être replié puis déplié ; les icônes repliées révèlent leur libellé au survol.
Le Journal d’activité conserve l’audit métier ; les Logs applicatifs INFO, WARNING et ERROR restent read-only et cloisonnés, avec les logs système globaux réservés au Superadmin.

Les Logs capturent toutes les réponses HTTP applicatives GET/POST/PUT/PATCH/DELETE et proposent dix filtres structurés, avec contexte sûr et isolation par organisation. Les données sensibles restent exclues ; le Journal métier reste séparé.

Les [Résultats longitudinaux](docs/architecture/results-api.md) prolongent le radar par organisation et famille sur la dernière version ayant des résultats, puis ouvrent à la demande les observations historiques d’un critère. La continuité inter-version exige une lignée explicite, sans agrégation ni rapprochement implicite des questions.

## Socle technique

- Backend : Python 3.12+, Django 5.2, Django REST Framework 3.16, `drf-spectacular` et SQLite.
- Frontend : React 19, TypeScript 5.9 et Vite 8.
- Tests : pytest, Vitest, React Testing Library et Playwright.
- Qualité : Ruff, ESLint, Prettier et coverage bloquant à 90 %.

Le bootstrap distingue `development` et `production`, réconcilie les identités sans doublon et permet d'afficher ou masquer le mot de passe sans l'altérer.

## Périmètres livrés — identités et accès

L'endpoint initial de création d'identité est réservé au Superadmin. Dans l'espace produit, un Admin invite
uniquement des Coachs ou Viewers, automatiquement rattachés à son organisation unique.

Une identité active peut ouvrir une session produit, reprendre sur le tableau de bord depuis la racine puis accéder aux pages autorisées par sa fonction.
Les menus et accès directs appliquent la hiérarchie `Admin > Coach > Viewer`. Le Superadmin Django obtient
l'espace Admin sans devenir un rôle métier supplémentaire. Sans menu Équipes, le Coach retrouve sur son tableau
de bord son organisation et ses équipes actives ; le Viewer y retrouve son organisation. La déconnexion invalide la session.
La page Utilisateurs du Superadmin administre les identités et leurs invitations par e-mail. Un toggle illustré
soleil/lune conserve le mode jour/nuit. Le sélecteur [Couleurs](docs/architecture/interface-palettes.md) propose vert (par défaut), bleu, rose et rouge, persistés par utilisateur dans la session backend. Le chargement initial de la planification ignore les réponses obsolètes.

La gestion actuelle des utilisateurs suit la hiérarchie : le Superadmin gère les autres comptes sans agir sur le sien,
l'Admin gère uniquement les Coachs et Viewers de son organisation, le Coach gère les Viewers de son
organisation. Le Viewer consulte uniquement les résultats COMPLETED de son organisation, sans accès Utilisateurs ni Équipes. Seul le Superadmin crée, affecte, modifie ou supprime un Admin.
Sans organisation, un Coach ne voit aucun utilisateur et un Viewer aucun résultat ; le Coach ne peut jamais changer une fonction. Les écrans manipulent encore `username`/e-mail plutôt que `nom`/`prénom`, et `DELETE` supprime physiquement le compte : les PBIs complets restent donc ouverts ou bloqués.

## Périmètre livré — gestion des organisations et équipes

Le Superadmin crée et supprime physiquement les organisations. Un Admin consulte et renomme uniquement son organisation,
et peut en gérer les Coachs et Viewers sans jamais modifier les Admin qui y sont rattachés.
Le menu Équipes permet de choisir une organisation accessible, puis de créer, renommer, archiver ses équipes et de leur affecter un ou plusieurs Coachs de cette organisation. Les archives ne sont pas encore consultables ou réactivables. Une organisation utilisée par une passation commencée est protégée contre la suppression ; les autres dépendances restent soumises à l’arbitrage produit.

## Périmètre livré — modèle d’évaluation

Les modèles suivent le cycle irréversible `DRAFT → VALIDATED → ARCHIVED` : validation et archivage explicites,
immutabilité du modèle et de ses questions après validation, planification limitée aux modèles validés.
Les Superadmins administrent les évaluations de toutes les organisations ; les Admins administrent uniquement celles de leur organisation.
Les index des évaluations et questions sont attribués automatiquement, sans champ de saisie pour l’utilisateur.
Ils planifient pour une équipe un modèle immédiat, fixe, mensuel ou trimestriel, notifié par e-mail. Chaque planification peut être confiée à un Coach ou à un Admin actif de la même organisation ; le Superadmin peut aussi se désigner lui-même. Chaque ligne suit `ORGANISATION - ÉVALUATION - ÉQUIPE - RESPONSABLE` et ouvre la modification et la suppression. Une référence existante reste visible après archivage ; sa modification exige un modèle validé. Les modèles sont regroupés en familles organisationnelles avec versions linéaires : création v1 brouillon, copie explicite en nouvelle version, archivage automatique de l’ancienne version active lors de la validation. Le planning affiche famille/version ; les passations conservent leur référence historique et leurs snapshots. La [stratégie de versionnement](docs/architecture/evaluation-versioning.md) précise migration et concurrence. Le radar Résultats utilise la dernière version ayant des résultats ; le longitudinal suit les lignées explicites ; Pilotage lit couverture et échéances sans recalculer Results.

## Périmètre livré — passation des évaluations planifiées

La route `/evaluations` propose un parcours de passation persistante des modèles planifiés : l’assigné répond aux questions ordonnées, reprend un brouillon et finalise ses notes de 0 à 10. Le tableau distingue l’assigné de l’auteur réel de la complétion. Dans son organisation, un Admin peut compléter à la place de l’assigné puis réviser une évaluation finalisée sans altérer l’auteur ni la date initiaux ; la dernière révision reste attribuée et datée. Les finalisations et révisions significatives alimentent le Journal d’activité existant. Après une passation ponctuelle complétée, une équipe peut replanifier le même modèle : une nouvelle passation indépendante conserve l’historique et les anciens résultats. Les planifications encore actives bloquent les doublons.

## Installation

Prérequis : Python 3.12 ou 3.13, Node.js 22 ou 24, npm et PowerShell, sous Windows, macOS ou Linux.

Le lancement prépare les dépendances du checkout : il crée ou répare `backend/.venv`, synchronise les requirements
et exécute `npm ci` lorsque le lockfile l'exige. Chaque worktree bénéficie de ce mécanisme sans installation
manuelle. Les [réglages et credentials fictifs locaux](docs/development-environments.md) sont documentés séparément.

Le backend utilise `backend/db.sqlite3`, créé localement et ignoré par Git. Les migrations sont appliquées automatiquement par la commande de développement backend.

## Lancement en développement

Le parcours nominal complet hors VS Code est :

```powershell
npm.cmd run dev:all
```

`Ctrl+Shift+B` offre le même résultat dans VS Code, avec deux terminaux dédiés. Les commandes séparées restent disponibles :

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\dev-backend.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\dev-frontend.ps1
```

- Django écoute sur `http://127.0.0.1:8000`.
- Vite écoute sur `http://127.0.0.1:5173`.
- Vite transmet `/api/*` à Django sur le port `8000`.
- Le health check est disponible sur `http://127.0.0.1:8000/api/health/`.
- Le schéma OpenAPI est disponible sur `http://127.0.0.1:8000/api/schema/`.
- Swagger UI est disponible sur `http://127.0.0.1:8000/api/docs/`.
- La création technique d'utilisateur est disponible au seul Superadmin par `POST /api/users/`.
- La session produit utilise `POST /api/session/login/`, `GET /api/session/` et
  `POST /api/session/logout/` ; la déconnexion exige le jeton CSRF fourni avec la session.
- La gestion des organisations utilise `/api/admin/organizations/` : collection globale pour le Superadmin,
  organisation unique pour l'Admin.
- Les modèles d’évaluation utilisent `/api/admin/evaluations/` et les questions leurs routes imbriquées.

Le premier Superadmin est créé exclusivement avec le bootstrap Django :

```powershell
Push-Location backend
& .\.venv\Scripts\python.exe manage.py createsuperuser --settings=config.settings_development
Pop-Location
```

Au premier lancement, chaque terminal affiche la préparation de son runtime avant de démarrer le service. Les
lancements suivants restent quasi immédiats sur chaque plateforme ; une erreur explicite arrête le service concerné.

## Tests et coverages

La commande de référence pour tous les tests du dépôt est :

```powershell
npm.cmd run test:all
```

Elle délègue à `scripts/test-all.ps1`, exécute successivement backend, frontend et E2E, affiche leur résultat séparément et retourne `0` uniquement si tout ce qui est applicable passe. Elle contrôle les seuils backend et frontend de 90 % et indique explicitement les niveaux non applicables. En CI ou avec PowerShell 7, le même orchestrateur peut être appelé par `pwsh ./scripts/test-all.ps1`.

Les [commandes ciblées backend, frontend et E2E](docs/quality/test-commands.md) complètent cette suite.

Le backend couvre le health check, SQLite, le contrat OpenAPI, la gestion Superadmin, les organisations et le cycle de session : règles de fonction, authentification, permissions, validations, CSRF, atomicité et persistance. Le frontend
couvre le client de session, les menus par rôle, les routes autorisées et refusées et les états d'erreur.
Playwright couvre connexion, refus, navigation protégée, gestion d'utilisateurs, création, renommage et suppression d’organisation, puis
vérifie que le backend applique les migrations avant de servir. La non-régression des fixtures E2E vérifie
leur réinitialisation avec des passations protégées, sans affecter une autre organisation de test.

## Approche quality-first

Le projet traite la qualité comme une condition de livraison : Clean Code, fichiers maintenus limités à 200 lignes, tests à plusieurs niveaux, coverage backend et frontend d'au moins 90 %, sécurité et documentation à jour.

Le workflow attendu part du dernier `origin/main` dans une branche et un worktree dédiés, annonce le périmètre
dans le README, valide puis committe le changement et le resynchronise. Le Pre-push vers main exécute le gate
complet avant la publication et le nettoyage du chantier.

Le checkout principal reste stable dans VS Code. Chaque chantier utilise son worktree hors du dépôt,
publie dès qu’il est prêt depuis le dernier `origin/main`, puis nettoie uniquement sa branche et son worktree.
Aucun changement de dossier VS Code ni workspace multi-root n’est demandé.

Sauf instruction explicite contraire dans le prompt, une tâche Codex terminée est validée, commitée puis poussée
sur `main` selon ce flux asynchrone. [`AGENTS.md`](AGENTS.md) est la règle permanente d'entrée ; les
[règles détaillées de travail des agents](docs/quality/agent-rules.md) définissent la procédure complète et ses
exceptions.

## Commandes qualité

Depuis PowerShell à la racine du dépôt :

```powershell
# limite de 200 lignes — commande utilisateur de référence
npm run check:lines

# quality:quick — informatif, retourne toujours 0 après les contrôles
npm run quality:quick

# quality:full — exhaustif, retourne 1 dès que le résultat global est non conforme
npm run quality:full
```

`check:lines` contrôle tous les fichiers maintenus manuellement, sans liste blanche d’extensions. `scripts/quality/files.ps1` est la définition exécutable unique des exclusions : métadonnées Git ; dépendances et environnements locaux ; répertoires nommés de build, coverage, rapports E2E et caches ; migrations Django, fichiers minifiés et source maps ; lock files explicitement reconnus ; fichiers binaires détectés par extension ou contenu.

PowerShell 7 (`pwsh`) peut remplacer `powershell.exe`. Les résultats utilisent les statuts `PASS`, `WARNING`, `FAIL informatif`, `FAIL` et `NON APPLICABLE`.

Active les hooks versionnés une fois par clone :

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-hooks.ps1
```

Le premier lancement backend effectue aussi cette activation. Des dispatchers physiques dans le répertoire Git
commun permettent au `post-checkout` cible de préparer ses runtimes sans partage, junction ni lien symbolique.

Le `pre-commit` lance `quality:quick` sans bloquer le commit. Pour une publication, le `pre-push` impose d'abord
la branche et le worktree dédiés, l'état entièrement commité, la destination `main` et la resynchronisation sur
le SHA distant annoncé par Git. Il lance ensuite `quality:full` et bloque le push en cas d'échec. Le workflow
[GitHub Actions](.github/workflows/quality.yml) appelle exactement le même script en mode `full`, ce qui rend
`--no-verify` sans effet sur le contrôle distant.

`quality:quick`, `quality:full` et la CI réutilisent tous `npm run check:lines`. Le gate rapide produit réellement les coverages backend et frontend courants, tout en restant informatif. `quality:full` réutilise aussi l'orchestrateur `test:all` : il n'existe donc qu'une définition de la suite complète. Il ajoute les contrôles de secrets, cohérence, documentation, lint, formatage et migrations.

## État actuel

- Le backend Django/DRF avec SQLite et le frontend React/Vite sont opérationnels.
- Les tests, seuils de coverage et quality gates bloquants couvrent les deux applications.
- `USER-001` expose la création contrôlée d'identités ; le parcours authentifié applique les accès par fonction.
- Les Admins et Superadmins gèrent organisations, équipes, modèles/questions et planifications ; les deux journaux administratifs sont consultables en lecture seule.
- La passation persistante, son tableau et la révision Admin sont livrés ; Résultats associe radar courant et historique des critères par lignée ; Pilotage restitue couverture et retards des actifs.

## Documentation

L’[index de la documentation](docs/README.md) donne accès à l’ensemble des références :

- [synthèse du backlog](docs/backlog/synthese.md) — point d’entrée du suivi d’avancement ;
- [architecture](docs/architecture/fundamentals.md) ;
- [qualité](docs/README.md#qualité) ;
- [backlog et gouvernance](docs/backlog/README.md).
