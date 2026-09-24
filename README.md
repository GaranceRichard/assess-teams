# Assess teams

## Objectif

**Assess teams** est une application destinée à soutenir l'évaluation des équipes. Le périmètre fonctionnel détaillé sera défini au fil de la conception du produit.

## Socle technique

- Backend : Python 3.12+, Django 5.2, Django REST Framework 3.16, `drf-spectacular` et SQLite.
- Frontend : React 19, TypeScript 5.9 et Vite 8.
- Tests : pytest, Vitest, React Testing Library et Playwright.
- Qualité : Ruff, ESLint, Prettier et coverage bloquant à 90 %.

Le dépôt contient le socle technique, `USER-001`, le health check, le schéma OpenAPI et Swagger UI. Le
premier parcours d'accès produit livre une connexion par session, une navigation filtrée selon la fonction
Admin, Coach ou Viewer, des routes protégées et la déconnexion. La documentation formalise aussi
les arbitrages du socle Organisation et exige une authentification pour toute lecture de donnée métier, sans
franchissement implicite d’un périmètre organisationnel.

Le bootstrap local distingue les réglages `development` et `production` et fournit en développement trois identités
réconciliées sous `Admin`, `Coach` et `Viewer` sans doublon au redémarrage. La connexion permet d'afficher ou masquer le mot de passe sans l'altérer.

## Périmètres livrés — identités et accès

L'endpoint initial permet à un Superadmin ou à un Admin autorisé de créer une identité active avec
une fonction métier unique (`Admin`, `Coach` ou `Viewer`). Ce chantier inclut uniquement l'authentification
minimale nécessaire à l'appel, les permissions de création et le contrat OpenAPI ; aucun rattachement
organisationnel n'est ajouté.

Une identité active peut ouvrir une session produit, reprendre sur le tableau de bord depuis la racine puis accéder aux placeholders autorisés par sa fonction.
Les menus visibles suivent exactement les espaces Admin, Coach et Viewer ; les accès directs appliquent aussi
la hiérarchie de capacités `Admin > Coach > Viewer`. Le Superadmin Django obtient l'espace Admin sans devenir
un rôle métier supplémentaire. La déconnexion invalide la session et ramène à l'écran de connexion.
La page Utilisateurs du Superadmin administre les identités et leurs invitations par e-mail. Un toggle illustré
soleil/lune permet de choisir l'affichage jour ou nuit, sans ajouter de quatrième rôle métier.

La gestion des utilisateurs suit la hiérarchie des fonctions : le Superadmin
gère les autres comptes sans modifier ni supprimer le sien, l'Admin gère uniquement les Coachs et Viewers,
et le Coach gère uniquement les Viewers sans pouvoir changer leur fonction.

## Périmètre livré — gestion des organisations

Le menu Organisations est accessible aux Superadmins et aux Admins. Il permet de créer et renommer une organisation,
d’ajouter ou retirer ses membres ; le Superadmin peut la supprimer, un Admin être multi-organisation, un Coach ou Viewer appartenir au plus à une organisation.

## Installation

Prérequis : Python 3.12 ou 3.13, Node.js 22 ou 24, npm et PowerShell, sous Windows, macOS ou Linux.

Le lancement prépare automatiquement les dépendances propres au checkout. Il crée ou répare `backend/.venv`,
synchronise `backend/requirements-dev.txt` et exécute `npm ci` à la racine ou dans `frontend` lorsque leur lockfile
l'exige. Chaque nouveau worktree bénéficie du même mécanisme, sans lien ni installation manuelle. Les
[réglages et credentials fictifs locaux](docs/development-environments.md) sont documentés séparément.

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
- La création d'utilisateur est disponible par `POST /api/users/` avec authentification Basic ou session.
- La session produit utilise `POST /api/session/login/`, `GET /api/session/` et
  `POST /api/session/logout/` ; la déconnexion exige le jeton CSRF fourni avec la session.
- La gestion des organisations utilise la collection `/api/admin/organizations/` et ses routes de modification avec une session Admin.

Le premier Superadmin est créé exclusivement avec le bootstrap Django :

```powershell
Push-Location backend
& .\.venv\Scripts\python.exe manage.py createsuperuser --settings=config.settings_development
Pop-Location
```

`Ctrl+Shift+B` lance la tâche par défaut `Dev: all`. Elle démarre `Dev: backend` et `Dev: frontend` en parallèle dans deux terminaux identifiables. Les trois tâches versionnées utilisent `${workspaceFolder}` et les mêmes scripts PowerShell que les commandes ci-dessus.

Au premier lancement, chaque terminal affiche la préparation de son runtime avant de démarrer le service. Les
lancements suivants restent quasi immédiats sur chaque plateforme ; une erreur explicite arrête le service concerné.

## Tests et coverages

La commande de référence pour tous les tests du dépôt est :

```powershell
npm.cmd run test:all
```

Elle délègue à `scripts/test-all.ps1`, exécute successivement backend, frontend et E2E, affiche leur résultat séparément et retourne `0` uniquement si tout ce qui est applicable passe. Elle contrôle les seuils backend et frontend de 90 % et indique explicitement les niveaux non applicables. En CI ou avec PowerShell 7, le même orchestrateur peut être appelé par `pwsh ./scripts/test-all.ps1`.

Tests backend seuls, avec coverage :

```powershell
Push-Location backend
& .\.venv\Scripts\python.exe -m pytest --cov=. --cov-config=../.coveragerc --cov-report=term-missing
Pop-Location
```

Tests frontend seuls, avec coverage, puis E2E :

```powershell
npm.cmd run test:coverage --prefix frontend
npm.cmd run test:e2e --prefix frontend
```

Le backend couvre le health check, SQLite, le contrat OpenAPI, la gestion Superadmin, les organisations et le cycle de session :
règles de fonction, authentification, permissions, validations, CSRF, atomicité et persistance. Le frontend
couvre le client de session, les menus par rôle, les routes autorisées et refusées et les états d'erreur.
Playwright couvre connexion, refus, navigation protégée, gestion d'utilisateurs, création, renommage et suppression d’organisation, puis
vérifie que le backend applique les migrations avant de servir. Les tests de non-régression restent
`NON APPLICABLE`, faute de bug corrigé.

## Approche quality-first

Le projet traite la qualité comme une condition de livraison : Clean Code, fichiers maintenus limités à 200 lignes, tests à plusieurs niveaux, coverage backend et frontend d'au moins 90 %, sécurité et documentation à jour.

Le workflow attendu part du dernier `origin/main` dans une branche et un worktree dédiés, annonce le périmètre
dans le README, valide puis committe le changement et le resynchronise. Le Pre-push vers main exécute le gate
complet avant la publication et le nettoyage du chantier.

Le checkout principal reste stable et ouvert dans VS Code. Chaque chantier s'exécute dans un worktree interne
distinct, créé hors du dépôt principal et annoncé pour traçabilité ; aucun workspace multi-root, changement de
dossier VS Code ou ouverture manuelle du worktree n'est demandé. Le premier chantier prêt publie sans attendre
les autres. Chaque chantier retardataire repart du dernier `origin/main`, valide cet état final, pousse vers
`main`, puis nettoie exclusivement sa propre branche et son propre worktree.

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

- Le backend Django/DRF et SQLite sont opérationnels.
- Le frontend React/Vite consomme le health check via le proxy local.
- Les tests et les seuils de coverage backend/frontend sont actifs.
- Les quality gates détectent les deux applications et échouent si leur configuration est incomplète.
- `USER-001` expose la création contrôlée d'identités sans rattachement organisationnel implicite.
- Le parcours produit authentifié applique les menus et routes correspondant à Admin, Coach et Viewer.
- La page Organisations permet aux Superadmins et Admins de créer un périmètre avec plusieurs utilisateurs.

## Documentation

L’[index de la documentation](docs/README.md) donne accès à l’ensemble des références :

- [synthèse du backlog](docs/backlog/synthese.md) — point d’entrée du suivi d’avancement ;
- [architecture](docs/architecture/fundamentals.md) ;
- [qualité](docs/README.md#qualité) ;
- [backlog et gouvernance](docs/backlog/README.md).
