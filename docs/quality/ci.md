# CI parallèle et gates

`npm run quality:full` reste le gate local canonique et le pre-push bloquant.
La CI utilise ses scopes partagés, sans second passage global. `test:all` reste
séquentiel localement ; chaque scope appelle uniquement sa propre suite.

## Répartition

| Job | Scope | Contrôles bloquants |
| --- | --- | --- |
| Repository constraints | repository | 200 lignes, secrets, cohérence Git, README, workflow documentaire, tests qualité/bootstrap/scopes/agrégation |
| Backend quality | backend | Ruff lint/format, migrations, pytest complet avec branch coverage >= 90 %, contrats/OpenAPI inclus |
| Frontend quality | frontend | ESLint, Prettier, seuils Vitest, typecheck/build, tests avec coverage >= 90 % sur les quatre métriques |
| Playwright E2E | e2e | Tous les parcours existants, backend réel avec migrations et fixtures, Vite et Chromium |
| Full quality gate | agrégation | Succès obligatoire des quatre jobs, y compris si un job échoue, est annulé, ignoré ou absent |

Les quatre contrôles partent en parallèle. Playwright utilise Vite, sans artefact
de build ; aucun résultat de lint, coverage ou tests unitaires n'est son prérequis.
Son job prépare ses runtimes et navigateur avant de lancer les serveurs existants.
Le worker unique SQLite, les retries et `forbidOnly` restent inchangés.
Le build/typecheck était absent du gate automatisé audité ; il est désormais
explicite dans le gate complet local et le scope frontend.

## Déclencheurs et caches

La CI tourne sur chaque PR et sur les pushes de `main`. Une branche de travail
est contrôlée dès l'ouverture de sa PR ; ses pushes ne déclenchent plus une seconde
suite identique. `concurrency` annule les runs obsolètes de la même PR ou référence,
avec un groupe propre au workflow. Aucun filtre de chemins ne saute un gate.

`setup-node` conserve les téléchargements npm selon le lockfile frontend ; `npm ci`
réinstalle toujours les packages. `setup-python` conserve les téléchargements pip
selon les deux requirements ; le bootstrap installe et valide un `.venv` physique
avant les contrôles. Le serveur E2E réutilise ce runtime validé, évitant une deuxième
installation dans un autre environnement. Ni `.venv`, ni `node_modules`, ni SQLite,
ni résultats de tests ne sont restaurés depuis un cache.

Les requirements conservent leurs plages de versions existantes : le cache pip
ne constitue pas un lockfile Python. La résolution reste celle du bootstrap local.

Seul Chromium headless est installé, avec ses dépendances système. Le cache de
navigateurs n'est pas ajouté sans gain démontré : [Playwright](https://playwright.dev/docs/ci)
indique que sa restauration peut coûter autant que le téléchargement, et les
dépendances système restent à installer. [L'option `--only-shell`](https://playwright.dev/docs/browsers#installing-browsers)
évite Chromium complet dans cette configuration sans `channel`.
Les traces d'échec sont conservées sept jours comme artefacts.

## Required checks et action administrative

L'identifiant `quality` et le nom exact **Full quality gate** sont conservés.
Son `always()` garantit l'évaluation après chaque résultat des jobs dépendants ;
le script exige explicitement `success` pour chacun, sans accepter `skipped`.
Les nouveaux noms sont `Repository constraints`, `Backend quality`,
`Frontend quality` et `Playwright E2E`. Ils servent au diagnostic ; l'agrégation
suffit comme required check bloquant pour l'ensemble.

Audit GitHub du 7 octobre 2026 : l'API de protection de `main` répond
`Branch not protected` (404), et l'API des rulesets retourne `[]`.
Aucun required check actuel ne nécessite donc de renommage ou migration.
Pour activer cette protection, un administrateur doit, après un premier run,
ajouter **Full quality gate** aux required status checks dans Settings → Rules
ou Branches, selon la politique choisie. Cette optimisation ne modifie pas les
protections ni les droits GitHub. Une future règle portant sur les anciens noms
doit être vérifiée avant tout renommage ; voir [GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## Audit et mesures

Run de référence réussi [37620176556](https://github.com/GaranceRichard/assess-teams/actions/runs/37620176556),
SHA `80292c22f629e260cc09fd9fc51dc9799bfb48b9` : 11 min 31 s du lancement
à la fin ; job de 11 min 22 s, dont installation Playwright 54 s,
pytest 349,41 s (449 tests), Vitest 47,44 s et E2E environ 164 s (35 tests).
Le run du SHA initial `9141204`, [37622374097](https://github.com/GaranceRichard/assess-teams/actions/runs/37622374097),
confirme 11 min 15 s, installation Playwright 51 s, pytest 346,14 s,
Vitest 45,83 s et E2E environ 156 s, avec les mêmes effectifs.
Le run réussi [37500819134](https://github.com/GaranceRichard/assess-teams/actions/runs/37500819134)
durait 9 min 05 s, avec 51 s d'installation Playwright : les runners varient.
Après intégration d'un autre chantier, la référence comparable sur `a29119a`,
[37623953532](https://github.com/GaranceRichard/assess-teams/actions/runs/37623953532),
passe en 11 min 50 s : pytest 381,66 s (480 tests), Vitest 44,60 s
(65 fichiers), E2E environ 164 s (36 tests), installation Playwright 47 s.
Le chemin critique attendu sur ce socle devient plutôt ~6 min 45 s.

Goulot principal : addition des suites indépendantes. Les tests applicatifs
étaient déjà exécutés une seule fois ; les relancer dans un job agrégé aurait
annulé le gain. Le workflow installait tous les navigateurs alors que la
configuration ne sélectionne que Chromium. Il n'avait ni cache pip ni annulation
des runs obsolètes. Le backend était installé globalement alors que le serveur
E2E impose son propre `.venv` : le bootstrap unique par job harmonise ce prérequis.

À durées de suites identiques au run de référence, le chemin critique attendu
est le backend (~6 min avec préparation), au lieu de la somme (~11 min 30 s).
Cette estimation n'est pas une mesure après publication. Comparer les prochains
runs réussis (froids puis chauds), leurs temps d'attente et durées par job :

```powershell
gh run list --workflow quality.yml --limit 10
gh run view <run-id> --json createdAt,updatedAt,jobs
```

## Validation et revue documentaire

Les tests des scopes exécutent les orchestrateurs sur des runtimes simulés :
chaque contrôle et suite doit tourner une fois, le scope E2E doit rester isolé,
un build ou E2E échoué doit retourner un échec. Les tests Node de l'agrégation
couvrent succès, échec, annulation, skip, résultat absent et JSON invalide.
Les tests backend chargent le YAML réel pour protéger le graphe, les installations,
les clés de cache, les déclencheurs et le check stable.

README, règles des agents, charte, DoD, stratégie et commandes de tests sont
adaptés à la répartition CI. Architecture et contrat API sont revus sans changement
de comportement produit, d'endpoint, de modèle ou de migration.

## Publication de la démo

Le [workflow Pages](../../.github/workflows/demo-pages.yml) publie le build DEMO isolé uniquement après un Quality gate réussi pour le SHA main concerné. Le scope E2E valide aussi cette démo statique sans backend ; voir [architecture et limites](../architecture/public-demo.md).
