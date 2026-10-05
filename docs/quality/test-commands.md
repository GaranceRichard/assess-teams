# Commandes de tests ciblées

La suite globale reste `npm run test:all` à la racine ; `npm run quality:full` ajoute les contrôles bloquants.

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
