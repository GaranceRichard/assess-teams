# Inventaire — scripts, environnement et outillage

[Conventions](README.md#lecture-de-linventaire). Ces outils préparent le développement/la livraison.
Ils ne sont pas l'installateur MESS hors ligne : aucun service de production, compte de service,
répertoire MESS, fichier de configuration central ni script de sauvegarde/restauration n'est livré ici.
La colonne Production qualifie l'usage dans le **service** ; le build et les validations restent hors cible.

## Variables consommées par le dépôt

| Paramètre | Source | Défaut public / comportement | Sens. | Production |
| --- | --- | --- | --- | --- |
| `ASSESS_BACKEND_URL` | [Vite](../../../frontend/vite.config.ts), [Playwright](../../../frontend/playwright.config.ts) | `http://127.0.0.1:8000`, proxy dev `/api` ; E2E surcharge avec URL backend isolée | C | Interdit comme routage production ; API same-origin |
| `ASSESS_E2E_BACKEND_PORT` | [urls.ts](../../../frontend/e2e/urls.ts) | 8100 directement ; gate : calcul worktree | P | Interdit |
| `ASSESS_E2E_FRONTEND_PORT` | urls.ts, settings D | 5180 E2E ; 5173 URL mail D ; CSRF D inclut 5180 ; gate : calcul worktree | C | Interdit ; différences de défaut R04 |
| `ASSESS_E2E_DEMO_PORT` | [Playwright démo](../../../frontend/playwright.demo.config.ts) | 4175 directement ; gate : calcul worktree | P | Interdit |
| `ASSESS_E2E_SHARD` | [test-all](../../../scripts/test-all.ps1), [reports.ts](../../../frontend/e2e/reports.ts), [collection](../../../scripts/quality/e2e_collection.mjs), [validate](../../../scripts/quality/validate.mjs) | absent : exhaustif ; CI E2E : 1/2 ou 2/2, refus hors scope/CI | P | Interdit |
| `ASSESS_E2E_DB` | settings D, [isolation](../../../scripts/quality/isolation.mjs) | gate : `backend/.cache/e2e.sqlite3` ; CI : fichier par shard ; explicite préservé | I | Interdit ; risques si chemin test pointe vers DB réelle |
| `TMPDIR` / `TMP` / `TEMP` | isolation | gate remplace par `.cache/tmp`, sous-dossier shard éventuel | I | N/A outillage, aucun secret dans diagnostic |
| `CI` | validate, Playwright réel/démo | absent local ; valeur non vide : fresh, forbidOnly ; app : retries 2, sinon 0 | P | N/A outillage |
| `QUALITY_DIFF_BASE` | [check-documentation](../../../scripts/quality/check-documentation.ps1), [workflow](../../../.github/workflows/quality.yml) | absent : upstream ou HEAD ; CI : SHA base PR / précédent push | P | N/A outillage |
| `QUALITY_JOB_RESULTS` | [complete-ci](../../../scripts/quality/complete-ci.mjs) | aucun défaut, JSON `needs` obligatoire pour agrégation CI | P | N/A outillage |
| `COVERAGE_FILE` | [backend_shards](../../../scripts/quality/backend_shards.py) | écrit `backend/coverage/.coverage.<shard>` en CI | I | N/A outillage |
| `DEMO_BASE` | [Vite démo](../../../frontend/vite.demo.config.ts), [Pages](../../../.github/workflows/demo-pages.yml) | `/assess-teams/` ; CI : nom du dépôt | P | Interdit comme build du produit MESS |
| `import.meta.env.BASE_URL` | [LegalLink](../../../frontend/src/LegalLink.tsx) | `/` build normal ; base démo pour mentions légales | P | Fixe build ; pas un secret embarqué |
| `OS` | bootstrap/common/backend, dev-backend, setup-hooks | Windows_NT sélectionne `.cmd`, Scripts/python.exe et workers masqués ; sinon bin/python | P | N/A scripts locaux |
| `npm_*`, `GIT_REFLOG_ACTION`, `GIT_PREFIX` | [validation-inputs](../../../scripts/quality/validation-inputs.mjs) | métadonnées npm/Git exclues de l'empreinte selon regex ; autres entrées hashées en mémoire | I | N/A ; preuves ne stockent que hash/statut/temps |
| `.env`, `.env.*` | validation-inputs, `.gitignore`, Vite standard | fichiers ignorés sauf `.env.example` ; hashés si présents ; pas de chargeur dotenv Django | S | Exploitation : ne pas confondre fichier et environnement du processus ; R05 |
| `DJANGO_SUPERUSER_USERNAME` / `DJANGO_SUPERUSER_EMAIL` | commande Django `createsuperuser --noinput` utilisée via manage.py | pas de valeur fournie par scripts ; mode interactif dans README | I | Conditionnel bootstrap non interactif ; valeurs réelles omises |
| `DJANGO_SUPERUSER_PASSWORD` | même commande Django | aucun défaut ; mot de passe externe/saisie interactive | S | Conditionnel bootstrap non interactif ; jamais dans le package |

Les variables produit Django/SMTP/HTTP/LOGIN_* sont recensées dans les autres pages, sans duplication.
Aucune variable `VITE_*` personnalisée ni secret client n'est consommé dans le code React suivi.
Vite peut charger les fichiers locaux selon son mécanisme standard ; toute donnée exposée au build client
est publique. Les outils héritent aussi de l'environnement standard Python/Node/Git/pip/npm (PATH,
registres, proxies HTTP et magasins CA système) ; aucun credential de registre/proxy n'est fixé par le dépôt.
Ces entrées externes, si configurées lors de la préparation, restent privées et hors package MESS.

## Arguments et constantes des scripts

| Paramètre | Source | Défaut public / comportement | Sens. | Production |
| --- | --- | --- | --- | --- |
| `Root` | [bootstrap](../../../scripts/bootstrap-worktree.ps1), scripts dev/setup-hooks/publish et checks | checkout déduit de PSScriptRoot, override possible | I | N/A outillage ; ne pas le confondre avec répertoire de données |
| `NpmCommand` | [root](../../../scripts/bootstrap/root.ps1), [frontend bootstrap](../../../scripts/bootstrap/frontend.ps1), [dev frontend](../../../scripts/dev-frontend.ps1) | absent : npm.cmd Windows, npm ailleurs | P | Interdit dans service MESS sans Node/npm |
| `QuietIfReady` / `Quiet` | bootstrap / [setup-hooks](../../../scripts/setup-hooks.ps1) | False ; supprime annonce lorsque prêt / hooks silencieux | P | N/A outillage |
| `Port` / `NoReload` | [dev-backend](../../../scripts/dev-backend.ps1) | 8000 / False ; runserver 127.0.0.1 ; E2E fournit port + NoReload | C | Interdit : serveur de développement |
| settings/migrations/seed au démarrage dev | dev-backend | impose settings D, migrate --noinput, seed_development_users, deux workers --watch | C | Interdit ; ne jamais l'utiliser pour démarrer P |
| `DEVELOPMENT_CREDENTIAL` | [seed_development_users](../../../backend/development_data/management/commands/seed_development_users.py) | credential fictif public, valeur volontairement omise | S | Interdit ; application absente de P et refus hors D |
| `DEVELOPMENT_IDENTITIES` / `LEGACY_IDENTIFIERS` | même source | Admin/Coach/Viewer réservés ; anciens admin.dev@assess-teams.local, coach.dev@assess-teams.local, viewer.dev@assess-teams.local réconciliés | I | Interdit ; aucun Superadmin créé par seed |
| environnement Python / dépendances | [backend bootstrap](../../../scripts/bootstrap/backend.ps1) | `backend/.venv`, Python 3.12/3.13, requirements-dev.txt, pip check ; peut recréer son propre venv | I | N/A outil de préparation, pas installation hors ligne |
| dépendances Node / stamp / lockfile | [common bootstrap](../../../scripts/bootstrap/common.ps1) | node_modules physiques par checkout, npm ci selon lock/inventaire, stamps locaux `.assess-teams-bootstrap.json` | I | Interdit dans service ; préparation seulement |
| serveur Vite : host / port / strictPort | vite.config | 127.0.0.1 / 5173 / True | P | Interdit ; servir frontend compilé |
| Playwright : workers / reuseExistingServer / timeout | configs réel/démo | 1 / False ; réel 30000 ms, démo défaut Playwright | P | N/A tests |
| ports calculés / reset E2E | isolation | hash chemin modulo 3000 ; 20000 + slot×3 + offset(0,1,2) ; seule DB jetable canonique réinitialisée | I | N/A tests ; chemin explicite jamais effacé par prepareE2E |
| `Scope` | [test-all](../../../scripts/test-all.ps1), quality.ps1, validate | all ; scopes repository/backend/backend-static/frontend/e2e selon orchestrateur | P | N/A gates ; complet obligatoire avant push |
| `Mode` / `--fresh` / durée preuve | [quality.ps1](../../../scripts/quality.ps1), validate, validation-inputs | quick / False hors CI / 8 h ; repository toujours frais | P | N/A ; aucun contournement du pre-push |
| `ChangedFiles` / `ChangedFilesList` | check-documentation | auto Git ; liste explicite possible pour tests de gate | P | N/A contrôle documentaire |
| `RemoteName` / `PushUpdates` | [contribution workflow](../../../scripts/quality/check-contribution-workflow.ps1) | origin / lignes du protocole pre-push | P | N/A ; branche/worktree dédiés, destination main |
| verrou / branche destination publication | [publish](../../../scripts/publish.ps1) | `.git/assess-integration.lock`, destination main, rebase origin/main, ff-only principal | C | N/A livraison ; verrou sans suppression de son inode |
| seuils/tests/build | [pyproject](../../../backend/pyproject.toml), [coverage](../../../.coveragerc), vite.config, workflows | pytest settings D ; >=90 % backend/front ; 3 shards backend, 2 E2E | P | N/A gates ; données fictives exclusivement |
| sortie démo / permissions Pages | Vite démo, workflow Pages | build/demo, contents read ; publication attend Quality gate réussi | P | N/A MESS ; démo distincte du produit |

Les ports E2E explicites sont validés comme entiers de 1 à 65535 par `e2e/port.ts`.

Les paramètres standards `--settings`, `--noinput` et la saisie de `createsuperuser` suivent Django ;
aucun mot de passe de production n'est créé automatiquement par les scripts du dépôt.
Les utilitaires de mesure CI/licences et fixtures des tests ne pilotent pas la configuration du service.
