# Assess teams

## Documentation du produit

La documentation est restructurée sous `docs/` par responsabilité afin de centraliser l’architecture, la qualité et le backlog. Le backlog détaillé reste la source de vérité fonctionnelle ; sa gouvernance et ses synthèses explicites n’en modifient pas le périmètre.

## Objectif

**Assess teams** est une application destinée à soutenir l'évaluation des équipes. Le périmètre fonctionnel détaillé sera défini au fil de la conception du produit.

## Socle technique

- Backend : Python 3.12+, Django 5.2, Django REST Framework 3.16 et SQLite.
- Frontend : React 19, TypeScript 5.9 et Vite 8.
- Tests : pytest, Vitest, React Testing Library et Playwright.
- Qualité : Ruff, ESLint, Prettier et coverage bloquant à 90 %.

Le dépôt contient uniquement le socle technique et un health check `GET /api/health/`. Aucun domaine métier n'est encore implémenté.

## Installation

Prérequis : Python 3.12 ou 3.13, Node.js 22 ou 24, npm et PowerShell.

Depuis PowerShell à la racine du dépôt :

```powershell
python -m venv .\backend\.venv
& .\backend\.venv\Scripts\python.exe -m pip install -r .\backend\requirements-dev.txt
npm.cmd ci
npm.cmd ci --prefix frontend
& .\frontend\node_modules\.bin\playwright.cmd install chromium
```

Le backend utilise `backend/db.sqlite3`, créé localement et ignoré par Git. Les migrations sont appliquées automatiquement par la commande de développement backend.

## Lancement en développement

L'environnement complet se lance hors VS Code avec :

```powershell
npm.cmd run dev
```

Les commandes séparées sont :

```powershell
npm.cmd run dev:backend
npm.cmd run dev:frontend
```

- Django écoute sur `http://127.0.0.1:8000`.
- Vite écoute sur `http://127.0.0.1:5173`.
- Vite transmet `/api/*` à Django sur le port `8000`.
- Le health check est disponible sur `http://127.0.0.1:8000/api/health/`.

Dans VS Code, `Ctrl+Shift+B` lance la tâche par défaut `Dev: all`. Elle démarre `Dev: backend` et `Dev: frontend` en parallèle dans deux terminaux identifiables. Les trois tâches versionnées utilisent `${workspaceFolder}` et les mêmes scripts PowerShell que les commandes ci-dessus.

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

Le backend couvre le health check nominal, le refus d'une méthode non supportée, SQLite et le contrat JSON. Le frontend couvre le shell, le client API, les états nominal et d'erreur. Playwright couvre le smoke technique navigateur → Vite → Django → SQLite et vérifie que le backend applique les migrations avant de servir. Les tests unitaires backend et les tests de non-régression sont actuellement `NON APPLICABLE`, faute de logique isolée ou de bug corrigé.

## Approche quality-first

Le projet traite la qualité comme une condition de livraison : Clean Code, fichiers maintenus limités à 200 lignes, tests à plusieurs niveaux, coverage backend et frontend d'au moins 90 %, sécurité et documentation à jour.

Le workflow attendu est :

```text
README / documentation préalable si nécessaire
        ↓
Travail
        ↓
Tests et contrôles
        ↓
Full quality gate
        ↓
Commit → quality gate rapide et informatif
        ↓
Pre-push → full quality gate bloquant
        ↓
Push GitHub → CI full quality gate bloquante
        ↓
Vérification finale
```

Sauf instruction explicite contraire dans le prompt, une tâche Codex terminée est validée, commitée puis poussée sur la branche distante correspondante. Les [règles de travail des agents](docs/quality/agent-rules.md) définissent la procédure complète et ses exceptions.

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

Le `pre-commit` lance `quality:quick` sans bloquer le commit. Le `pre-push` lance `quality:full` et bloque le push en cas d'échec. Le workflow [GitHub Actions](.github/workflows/quality.yml) appelle exactement le même script en mode `full`, ce qui rend `--no-verify` sans effet sur le contrôle distant.

`quality:quick`, `quality:full` et la CI réutilisent tous `npm run check:lines`. Le gate rapide produit réellement les coverages backend et frontend courants, tout en restant informatif. `quality:full` réutilise aussi l'orchestrateur `test:all` : il n'existe donc qu'une définition de la suite complète. Il ajoute les contrôles de secrets, cohérence, documentation, lint, formatage et migrations.

## État actuel

- Le backend Django/DRF et SQLite sont opérationnels.
- Le frontend React/Vite consomme le health check via le proxy local.
- Les tests et les seuils de coverage backend/frontend sont actifs.
- Le smoke test Playwright est actif.
- Les quality gates détectent les deux applications et échouent si leur configuration est incomplète.
- Aucun domaine ni aucune feature métier n'est implémenté.

## Documentation

L’[index de la documentation](docs/README.md) donne accès à l’ensemble des références :

- [synthèse du backlog](docs/backlog/synthese.md) — point d’entrée du suivi d’avancement ;
- [architecture](docs/architecture/fundamentals.md) ;
- [qualité](docs/README.md#qualité) ;
- [backlog et gouvernance](docs/backlog/README.md).
