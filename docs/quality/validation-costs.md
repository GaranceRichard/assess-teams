# Validation selon l'impact

## Commandes et responsabilités

| Niveau | Commande | Portée |
| --- | --- | --- |
| Développement normal | `npm run quality:targeted` ou `npm run quality:check` | Plan automatique du diff `origin/main` + index, travail local et fichiers non ignorés |
| Tests explicites | `npm run quality:targeted -- backend tests/test_health.py` | Feedback choisi par le développeur, sans escalade exhaustive automatique |
| Plan lisible | `npm run quality:plan -- --base origin/main --head HEAD` | Classification, contrôles et exclusions, sans exécution |
| Pré-push | hook obligatoire | SHA candidat et SHA distant annoncés par Git ; garde de contribution puis plan sélectif bloquant |
| CI ordinaire | `quality.yml` | Même plan sur le diff publié ; exécution indépendante sans preuves locales |
| Exhaustif | `npm run quality:full -- --fresh` | Dépôt, backend, frontend et E2E réels/démo ; seuils inchangés |
| Nightly et qualification distante | `exhaustive.yml` | Tous les contrôles ; trois shards backend, deux E2E, rapports et preuve du SHA exact |
| Qualification MESS locale | `npm run quality:qualify -- SHA_COMPLET` | Checkout propre du SHA, campagne exhaustive fraîche et preuve locale |
| Promotion MESS | `npm run quality:promote -- SHA_COMPLET RUN_ID` | Refus sans qualification GitHub exhaustive réussie et artefact correspondant exactement au candidat |

Les changements applicatifs localisés conservent les contraintes documentaires/structurelles du dépôt,
sans rejouer ses tests d’outillage. Ces derniers sont requis lors des changements transversaux et en exhaustif.

Les tests explicites utilisent des chemins relatifs au domaine (`backend`, `frontend`, `e2e`).
Ils ne remplacent pas le plan obligatoire de publication. Un échec applicable bloque toujours.
`quality:quick` reste informatif au commit ; son plan statique ne lance aucun test applicatif.
Pour la prose seule, il reste documentaire sans statiques backend/frontend.

## Matrice exécutable

La définition unique est [`impact.mjs`](../../scripts/quality/impact.mjs).
Les tests `impact*.test.mjs` et les invariants YAML en protègent les décisions.

| Changement | Contrôles obligatoires |
| --- | --- |
| Prose README/AGENTS ou Markdown dans les emplacements documentaires audités | `documentation` : lignes, secrets, conflits, README et cohérence des règles ; aucun test applicatif ni test des outils |
| Test backend ordinaire isolé | Dépôt, Ruff/format/migrations, fichier pytest modifié |
| Filtrage local des journaux | Dépôt, statiques backend, tests filtres/journal/logs/OpenAPI explicitement cartographiés |
| Autre Python backend non sensible | Dépôt et backend complet avec couverture ; dépendants inconnus, donc sélection plus large |
| Test frontend ordinaire isolé | Dépôt, lint/format/typage frontend, test Vitest modifié |
| Feuilles frontend auditées | Dépôt, statiques frontend, tests dépendants transitifs via `vitest related --run` |
| Autre source frontend, composant ou CSS | Statiques et tests dépendants ; parcours cartographiés ou tous les E2E si inconnus ; build et parcours démo pour les composants partagés |
| Test E2E isolé | Dépôt et parcours explicite, sans autre suite applicative |
| Authentification, permissions, contrats, modèles, transactions, SQLite, migrations | Exhaustif |
| Configuration, dépendances, hooks, scripts, CI, documents juridiques distribués | Exhaustif |
| Suppression applicative, fichier/type inconnu, lien symbolique ou sous-module | Exhaustif ; type non ordinaire sans réutilisation de preuve |

Les emplacements de prose sont explicitement bornés, pas déduits de la seule extension.
`frontend/src/README.md`, un Markdown arbitraire ou `docs/legal/*` ne sont pas de la prose sans impact.
Les deux côtés d'un renommage sont examinés ; un déplacement de documentation vers le runtime élargit le plan.
Le diff inclut les modes et les ajouts de déclarations critiques connues, même dans un fichier au nom anodin.
Une nouvelle dépendance applicative vers un document doit modifier cette matrice et ses tests dans le même lot.
La carte reste volontairement prudente : elle n'infère pas automatiquement tous les imports Python dynamiques.
Aucun `--passWithNoTests` n'est accepté : une sélection frontend sans test échoue.
Les tests ciblés n'appliquent pas un seuil global à une couverture partielle ; les seuils globaux de 90 %
restent appliqués aux campagnes exhaustives et aux scopes applicatifs complets.

## Preuves et resynchronisation

Chaque contrôle ciblé possède une preuve distincte, liée à sa sélection exacte.
Le SHA seul et l'âge seul ne constituent jamais une preuve suffisante.
L'empreinte SHA-256 couvre le contenu des entrées suivies/non ignorées, ajouts/suppressions,
les types et modes locaux, les `.env*`, les manifests npm installés, Python/Node,
`pip freeze --all`, OS/architecture et l'environnement pertinent.
La prose auditée est exclue des entrées applicatives ; les documents juridiques restent inclus.
Les contrôles backend excluent le frontend, et réciproquement ; scripts, configuration et documents distribués
restent inclus dans les deux domaines. Les E2E conservent toutes les entrées applicatives et transversales.
L'empreinte inclut le contrôle et les sélecteurs : élargir une sélection invalide sa preuve.
Les métadonnées npm de lifecycle, Git de navigation et `QUALITY_DIFF_BASE` ne changent pas les entrées applicatives.
Une resynchronisation modifiant seulement le SHA ou la prose peut donc réutiliser les preuves.
Une modification de dépendance pertinente les invalide, même pendant la validité de huit heures.

Échec, absence, corruption, expiration ou horodatage futur imposent une nouvelle exécution.
Une preuve antérieure est supprimée avant réexécution ; les entrées sont revérifiées après chaque contrôle
et à la fin du plan. Le hook vérifie aussi que HEAD et le checkout n'ont pas changé.
`CI` et `--fresh` ne consultent ni ne produisent de preuve locale réutilisable.
Les contraintes documentaires et de dépôt restent fraîches. Aucun partage de preuve entre worktrees ou machines.
Le cache accélère le travail ; il n'est pas une attestation de sécurité contre un utilisateur local malveillant.

## Isolation, publication et exploitation

Ports dérivés du chemin, temporaires et SQLite restent isolés par worktree/shard.
Les overrides `ASSESS_E2E_*` restent disponibles ; une base E2E explicitement choisie impose une exécution fraîche.
Seule la base jetable canonique est réinitialisée. Deux gates simultanés dans le même worktree sont refusés.
Après arrêt brutal, vérifier le PID de `.cache/quality/running.lock` avant de retirer uniquement ce verrou.

`npm run publish` conserve verrou OS commun, fetch/rebase, garde de contribution, pré-push bloquant,
push direct de la branche dédiée vers main et fast-forward sûr du checkout principal.
Il attend ensuite la CI du SHA exact : échec, annulation, absence ou délai dépassé refusent le succès de livraison.
Le push existe alors déjà ; aucune réécriture distante n'est tentée. Corriger par un nouveau chantier.
Le suivi GitHub requiert `gh` authentifié sur le poste de contribution, sans dépendance d'exploitation MESS.
Les limites de protection avant intégration et la transition PR sont dans [CI](ci.md).
Les [mesures reproductibles](validation-measurements.md) distinguent temps local, chemin CI et coût cumulé runners.
