# Assess teams

## Objectif

**Assess teams** est une application destinée à soutenir l'évaluation des équipes. Le périmètre fonctionnel détaillé sera défini au fil de la conception du produit.

## Architecture cible

- Backend : Django et Django REST Framework.
- Frontend : React et TypeScript.
- Base de données initiale : SQLite.

Le squelette Django/React n'est pas encore créé. Ce dépôt définit d'abord son cadre qualité ; il ne contient à ce stade aucun code applicatif.

## Travail en cours

- **Périmètre :** mise en place du socle d'automatisation des quality gates.
- **Sujet :** commandes qualité communes, hooks Git versionnés et CI GitHub.
- **Évolution attendue :** fournir un contrôle rapide et informatif au commit, puis un contrôle complet et bloquant avant le push et dans GitHub Actions.
- **Hors périmètre :** aucune feature métier et aucun bootstrap Django ou React.

Ce README est mis à jour avant le début de tout développement, correction, refactoring ou changement technique afin d'annoncer le travail entrepris. L'ordre temporel ne peut pas être prouvé de manière fiable par un script ; le gate automatisé vérifie donc qu'un changement applicatif est accompagné d'une modification du README dans le même ensemble de changements.

## Approche quality-first

Le projet traite la qualité comme une condition de livraison : Clean Code, fichiers source limités à 200 lignes, tests à plusieurs niveaux, coverage backend et frontend d'au moins 90 %, sécurité et documentation à jour.

Le workflow attendu est :

```text
README mis à jour avant travail
        ↓
Développement
        ↓
Commit → quality gate rapide et informatif
        ↓
Push → full quality gate bloquant
        ↓
GitHub → CI full quality gate bloquante
```

## Commandes qualité

Depuis PowerShell à la racine du dépôt :

```powershell
# quality:quick — informatif, retourne toujours 0 après les contrôles
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\quality.ps1 quick

# quality:full — exhaustif, retourne 1 dès que le résultat global est non conforme
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\quality.ps1 full
```

PowerShell 7 (`pwsh`) peut remplacer `powershell.exe`. Les résultats utilisent les statuts `PASS`, `WARNING`, `FAIL informatif`, `FAIL` et `NON APPLICABLE`.

Active les hooks versionnés une fois par clone :

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-hooks.ps1
```

Le `pre-commit` lance `quality:quick` sans bloquer le commit. Le `pre-push` lance `quality:full` et bloque le push en cas d'échec. Le workflow [GitHub Actions](.github/workflows/quality.yml) appelle exactement le même script en mode `full`, ce qui rend `--no-verify` sans effet sur le contrôle distant.

## Activation progressive

En l'absence actuelle des squelettes applicatifs, les contrôles du socle qualité, de documentation, de taille, de cohérence et de secrets sont actifs ; les groupes backend, frontend et E2E sont `NON APPLICABLE`.

Après bootstrap, le backend est détecté par `backend/manage.py` ou `backend/pyproject.toml` et doit fournir Ruff, pytest et pytest-cov. Le frontend est détecté par `frontend/package.json` et doit fournir les scripts npm `lint`, `format:check`, `test:quick`, `test:coverage` et `test:e2e`. La configuration Vitest doit fixer à au moins 90 % les seuils de branches, fonctions, lignes et statements. Un projet détecté mais incomplet échoue : il n'est jamais traité comme non applicable.

## Documents qualité

- [Fondamentaux architecturaux](ARCHITECTURE.md)
- [Règles des agents](AGENTS.md)
- [Charte qualité](QUALITY_CHARTER.md)
- [Definition of Done](DEFINITION_OF_DONE.md)
- [Stratégie de tests](TEST_STRATEGY.md)
