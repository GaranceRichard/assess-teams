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

La définition unique associe [`impact-classification.mjs`](../../scripts/quality/impact-classification.mjs) et le plan [`impact.mjs`](../../scripts/quality/impact.mjs).
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
| SQLite/transactions/workers internes, tests sensibles | Dépôt et backend complet, couverture >= 90 %, intégration et multiprocessus inclus ; pas de frontend/E2E automatique |
| Permissions techniques `/api/users/` | Dépôt et backend complet : autorisations, refus sans effet, rôles/rattachements, sessions et contrats |
| Sécurité ou contrat backend produit, adapters API, domaines et modèles | Dépôt, backend complet, frontend complet et tous les E2E ; dépendances UI non bornées |
| Sécurité/contrat frontend | Dépôt, frontend complet et tous les E2E |
| Configuration backend et migrations | Exhaustif, sauf helper interne `config/sqlite_contention.py` audité ci-dessous |
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
les types et modes locaux, les `.env*`, les manifests et les octets des dépendances installées,
Python/Node, SQLite, PowerShell/npm, `pip freeze --all`, OS/architecture et l'environnement.
La politique d'empreinte est explicitement versionnée (`fingerprintPolicy = 3`) ; scripts et règles
exécutables restent inclus dans chaque domaine. Les valeurs sensibles ne sont jamais persistées :
seules leurs empreintes contribuent à la clé ; les preuves/métriques ne contiennent pas l'environnement.
Les arbres npm et Python sont relus sans confiance dans leurs dates ou seules versions déclarées.
Seuls `__pycache__` et les caches générés Vite à la racine de node_modules sont exclus des arbres installés.
Les navigateurs Chromium/headless réellement sélectionnés et leurs bibliothèques sont inclus en E2E.
La prose auditée est exclue des entrées applicatives ; les documents juridiques restent inclus.
Les contrôles backend excluent le frontend, et réciproquement ; scripts, configuration et documents distribués
restent inclus dans les deux domaines. Les E2E conservent toutes les entrées applicatives et transversales.
L'empreinte inclut le contrôle et les sélecteurs : élargir une sélection invalide sa preuve.
Les métadonnées npm de lifecycle, Git de navigation et `QUALITY_DIFF_BASE` ne changent pas les entrées applicatives.
Une resynchronisation modifiant seulement le SHA ou la prose peut donc réutiliser les preuves.
Une preuve réussie reste réutilisable sans limite d'âge si toutes ces entrées sont identiques.
Le format v3 exige version, provenance `assess-teams/local-validation`, scope, clé et horodatages
cohérents (début <= fin <= maintenant). Une ancienne preuve sans ce format est incompatible.
Un changement de code, test, dépendance, runtime, configuration, environnement, règle ou sélection
applicable invalide la preuve ; l'évolution de la politique invalide les anciennes clés.
Le frontend ne dépend pas du runtime Python : ses empreintes n'interrogent plus Python/pip.
Le backend conserve tout son arbre et les outils partagés ; aucune nouvelle réduction intra-domaine.
Les E2E conservent backend + frontend + outils ; les contrats ne sont pas assimilés à une feuille isolée.
Les chargeurs externes (`NODE_OPTIONS`, `NODE_PATH`, `PYTHONPATH`, `PYTHONHOME`, préchargement de
bibliothèques), installations Python éditables ou `.pth` non audités imposent une exécution fraîche
sans preuve réutilisable, car leurs entrées externes ne sont pas suffisamment bornées.
Les seuls `.pth` audités sont ceux de setuptools, coverage et pytest-cov ; une configuration
coverage externe (`COVERAGE_PROCESS_*`, `COV_CORE_*`) impose aussi une validation fraîche.

Échec, absence, corruption, format/provenance incohérents ou horodatage futur imposent une nouvelle exécution.
Une preuve antérieure est supprimée avant réexécution ; les entrées sont revérifiées après chaque contrôle
et à la fin du plan. Le hook vérifie aussi que HEAD et le checkout n'ont pas changé.
`CI` et `--fresh` ne consultent ni ne produisent de preuve locale réutilisable.
Forcer le plan quotidien : `npm run quality:targeted -- --fresh` ; un domaine complet :
`npm run quality:full -- -Scope backend --fresh`. La qualification MESS reste toujours fraîche.
Les contraintes documentaires et de dépôt restent fraîches. Aucun partage de preuve entre worktrees ou machines.
Le cache accélère le travail ; il n'est pas une attestation de sécurité contre un utilisateur local malveillant.

## Limites vérifiées des changements sensibles

La catégorie est justifiée dans chaque diagnostic `[WHY]`. La présence du mot `transaction` ou
`permission` ne suffit plus à imposer les quatre domaines. La suite backend entière reste obligatoire,
sans carte pytest partielle inventée : elle couvre notamment `test_transaction_*`, `test_sqlite_*`,
les 22 scénarios développement/production de `test_sqlite_contention_operational`, Journal, refus API,
rôles/rattachements et sessions. Aucun filtre de marqueur n'exclut les tests multiprocessus.

L'exception SQLite est le helper DB-only `backend/config/sqlite_contention.py` : aucune vue ni
sérialisation n'y est définie. Une modification d'adapter API, modèle, configuration globale ou contrat
reste élargie. Changer `CONTENTION_FAILED` ou introduire une réponse API dans le helper élargit aussi le plan. `/api/users/` utilise `CanCreateUser`, sans consommateur dans `frontend/src` ou
`frontend/e2e` ; les permissions `/api/admin/users/` utilisées par `managedUsers.ts` restent élargies.
Toute création de consommateur ou modification de frontière doit mettre à jour cette carte et ses tests.
Les dépendances transversales/inconnues, suppressions et types non ordinaires restent exhaustifs.

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
