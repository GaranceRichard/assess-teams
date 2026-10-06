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

Pour des validations simultanées dans plusieurs worktrees, attribuer une paire de ports libres
à chaque exécution. Les valeurs par défaut restent 8100/5180 ; aucun serveur existant n’est réutilisé.
La configuration de développement autorise uniquement l’origine locale E2E choisie pour le contrôle CSRF.

```powershell
$env:ASSESS_E2E_BACKEND_PORT = "8194"
$env:ASSESS_E2E_FRONTEND_PORT = "5194"
npm.cmd run quality:full
```

Ces variables s’appliquent aussi au pre-push et à `test:e2e`. Les retirer à la fin de la session dédiée.
