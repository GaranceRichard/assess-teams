# Commandes de tests ciblées

La suite globale reste `npm run test:all` à la racine ; `npm run quality:full` ajoute les contrôles bloquants.

Les commandes [CI par scope](ci.md) exécutent exactement leur domaine :
`npm run quality:full -- -Scope repository`, `backend`, `backend-static`, `frontend` ou `e2e`
(remplacer la valeur après `-Scope`). Sans scope, la commande garde tous les contrôles.
Le scope frontend inclut `npm run build` (typecheck TypeScript puis Vite).
`backend-static` vérifie uniquement Ruff, format et migrations ; `backend` conserve aussi tous les tests.

Tests backend seuls, avec coverage :

```powershell
Push-Location backend
& .\.venv\Scripts\python.exe -m pytest --cov=. --cov-config=../.coveragerc --cov-report=term-missing
Pop-Location
```

Reproduire les shards CI depuis la racine (avec les trois runtimes backend préparés en CI) :

```powershell
& backend/.venv/Scripts/python.exe scripts/quality/backend_shards.py 1
& backend/.venv/Scripts/python.exe scripts/quality/backend_shards.py 2
& backend/.venv/Scripts/python.exe scripts/quality/backend_shards.py 3
Push-Location backend
& .venv/Scripts/python.exe ../scripts/quality/combine_backend_coverage.py coverage
Pop-Location
```

Sous Linux, remplacer `Scripts/python.exe` par `bin/python`. Les shards ne valident pas
le seuil individuellement : la fusion exhaustive est obligatoire. Ne pas les utiliser seuls
comme gate local ; `npm run quality:full` reste la référence sans sharding.
Pour rafraîchir les poids : `python scripts/quality/backend_test_timings.py <junit-1.xml> <junit-2.xml> <junit-3.xml> --source <run-id>`.

Tests frontend seuls, avec coverage, puis E2E :

```powershell
npm.cmd run test:coverage --prefix frontend
npm.cmd run test:e2e --prefix frontend
```

Les wrappers qualité attribuent trois ports par worktree. Pour les commandes Playwright directes,
les valeurs par défaut restent 8100/5180 et 4175 ; fournir des ports libres pour les exécutions
simultanées. Les overrides restent disponibles dans les wrappers ; aucun serveur existant n’est réutilisé.
La configuration de développement autorise uniquement l’origine locale E2E choisie pour le contrôle CSRF.

```powershell
$env:ASSESS_E2E_BACKEND_PORT = "8194"
$env:ASSESS_E2E_FRONTEND_PORT = "5194"
npm.cmd run quality:full
```

Ces variables s’appliquent aussi au pre-push et à `test:e2e`. Les retirer à la fin de la session dédiée.

## Validation proportionnée

Le [dispositif de validation](validation-costs.md) définit rapide, ciblé et complet,
les preuves locales bornées, l’isolation des worktrees et `npm run publish`.
Repository reste frais ; la CI exécute tous les jobs sans réutilisation locale.
Les tests, seuils de 90 %, migrations, contrats et sécurité restent obligatoires.

En CI, `ASSESS_E2E_SHARD=1/2` ou `2/2` transmet le shard natif aux deux
campagnes du scope E2E. Les runners isolent base, trois ports et temporaires.
Localement, retirer cette variable : `quality:full` reste exhaustif sans shard.
Les inventaires et résultats sont contrôlés par le gate final ; une campagne
partielle seule n’est jamais une preuve complète de validation.
