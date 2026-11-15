# Dépendances de préparation, séparées de la cible

[Index](README.md). Aucun outil de cette page n’est ajouté aux dépendances runtime du produit.

## Build normal du produit — acquis conservés

Poste de contrôle : Windows NT 10.0.26200 AMD64, Node 24.20.0, npm 11.19.0,
CPython 3.12.10, pip 25.0.1, packaging 26.3. Ce relevé n’est pas le profil cible.
Le build normal reste `npm ci --prefix frontend`, puis `npm run build --prefix frontend`, à réaliser par MEP-058.
Node/npm/TypeScript/Vite et compilateurs éventuels sont nécessaires à la préparation, jamais à l’usage cible.
Les manifests et lockfiles actuels sont réutilisés sans mise à jour de dépendance.

| Lock suivi | Entrées directes/transitives, variantes comprises | SHA-256 |
| --- | --- | --- |
| `package-lock.json` | 25 | `9188cb60b9a124c8b82750c06b19e0050c1bac066cd2ef7ec8fbb709f9318c92` |
| `frontend/package-lock.json` | 273 | `f248fa0f8e1e020d42b187ffb63992e2e2f779aedef031178bb0d6bc6ac9f724` |

Chaque entrée `packages` nomme chemin, version exacte, `resolved`, `integrity` SRI et licence déclarée.
Les variantes optionnelles OS/CPU ne sont pas toutes installées ; le lock les distingue explicitement.
`package.json` fournit les racines et scripts, le lock fournit la fermeture : ne pas utiliser les plages du manifest pour une distribution.
Les [inventaires légaux MEP-006](../../legal/third-party.md) et le [rapport npm courant](../../quality/ci-npm-20261106/README.md)
restent applicables. Les outils absents du runtime n’acquièrent pas de droits de redistribution par cette séparation.
Aucun avis npm ni dérogation existante n’est requalifié par cet inventaire documentaire.

## Entrées source Swagger — aucune compilation exécutée

Source upstream : Swagger UI 5.35.0, archive et lock exacts dans [artifacts.md](artifacts.md).
Le lock amont comporte 2126 entrées : 201 non-dev et 1925 dev.
Les 201 entrées non-dev, y compris leurs variantes imbriquées, sont conservées comme sur-ensemble d’entrées source
pouvant contribuer aux assets ; types et `@scarf/scarf` sont des éléments de préparation, pas des scripts cible.
Les [deux tables non-dev](swagger-components-1.md) apportent SHA-256, provenance et preuve de licence.
Les 801 compléments outillage liés par l’index fixent les empreintes/licences absentes du lock source.
Tous les autres champs restent ceux du lock upstream haché ; aucune nouvelle résolution par plages n’est requise.
Les empreintes SRI de ces outils proviennent du registre à la version exacte ; elles ne prétendent pas que leurs octets ont tous été téléchargés ici.

Les sept outils anciens `argv@0.0.2`, `cli-table@0.3.11`, `esprima@1.2.5`, `humanize@0.0.9`,
`memorystream@0.3.1`, `rechoir@0.6.2`, `svg-tags@1.0.0` ne déclarent pas de licence dans les métadonnées consultées.
Leurs droits de redistribution ne sont donc pas établis : **refus de les inclure dans le package**.
Ils ne sont pas des dépendances du JavaScript cible ; l’inventaire de préparation n’est pas une permission de redistribuer l’outillage.
Aucune décision d’architecture ou de reconstruction des bundles Swagger n’est prise : le précompilé est écarté et les sources exactes sont disponibles pour traiter cet écart en préparation.

## Préparation Python et composants hôte

`requirements-dev.txt` fournit pytest, pytest-cov, pytest-django, Ruff et packaging transitif :
ils ne sont pas requis pour API/workers. Leurs plages de développement ne servent pas de verrou runtime.
La fermeture cible est uniquement [python.md](python.md) ; `typing_extensions@4.16.0`, PSF-2.0,
est un auxiliaire du poste 3.12, exclu sur cible 3.13 par le marqueur de referencing.
Pip intervient sur le poste de préparation/installation ; l’API et les workers ne l’importent pas.
Le choix et l’installation d’un pip éventuellement livré appartiennent au candidat en aval, sans supposer qu’il existe dans le ZIP embarquable.
Caddy fournit son propre runtime Go compilé, sans compilateur Go ni bibliothèques à résoudre sur cible.
PowerShell/Planificateur sont des capacités de l’hôte pour les futures procédures et tâches ; aucun module PowerShell tiers requis à ce SHA.
Git et gh sont des outils de contribution/publication ; Chromium/Playwright, pytest et Vitest servent aux tests.
Aucun de ces outils n’est ajouté implicitement à la distribution.
