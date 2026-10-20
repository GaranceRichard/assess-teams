# CI sélective, nightly et qualification MESS

## Intégration actuelle et limite explicite

L’[audit MEP-012 du 20 octobre 2026](mep-012/README.md), avec réponses API datées, confirme
`Branch not protected` pour `main`, aucun ruleset ni check obligatoire. Le PBI reste Bloqué ;
les écarts pour MEP-043 et l’inventaire Apps refusé sont explicités dans la matrice.
Le compte connecté dispose de droits admin, mais le circuit autorisé du dépôt exige le push direct
branche de chantier → main. Activer une obligation de PR sans modifier ce circuit le bloquerait.
Aucune protection ni méthode de publication n'est donc changée silencieusement.

**La CI exécutée après ce push ne protège pas l'intégration.** La barrière avant intégration est le
pré-push local obligatoire : garde d'isolation/branche/SHA/propreté puis contrôles requis par le diff réel.
Ce circuit reste dépendant de postes coopératifs ; GitHub ne peut pas empêcher un autre client de le contourner.
`npm run publish` attend en plus la réussite CI du SHA publié avant d'annoncer une livraison réussie.
Un échec post-push laisse main synchronisé, rend la livraison non terminée et nécessite une correction.

Pour obtenir une véritable barrière distante, il faut adopter explicitement :

1. Publication de la branche de chantier puis PR, en remplaçant les gardes direct-main et le script `publish`.
2. Protection de main exigeant PR, branche à jour ou merge queue et le check `Required impact gate`.
3. Absence de bypass des administrateurs/automates ; vérifier les permissions du token de publication.
4. Si merge queue retenue, ajouter `merge_group` et qualifier son SHA de fusion réel.
5. Test réel d'une PR rouge refusée et d'une PR verte fusionnable, puis mise à jour des règles agents.

Cette migration nécessite une décision de workflow explicite. Le compte a les droits de configuration,
mais la mission conserve le circuit direct demandé tant que son remplacement n'est pas adopté et testé.

## CI ordinaire

[`quality.yml`](../../.github/workflows/quality.yml) calcule son plan à partir du SHA de base PR ou du
`before` du push et du candidat réellement exécuté (`github.sha`, merge synthétique pour les PR).
Pas de filtre de chemins GitHub susceptible de laisser un required check indéfiniment absent.
Le plan JSON est archivé. Base introuvable : échec bloquant, jamais sélection documentaire implicite.

La même fonction `planImpact` pilote pré-push et CI. Les jobs hors plan sont explicitement skipped.
Le gate final `Required impact gate` utilise `always()` et exige succès de chaque job requis,
refuse échec/annulation/absence et n'accepte que les skips justifiés par ce plan.
La CI ne fait confiance à aucune empreinte locale : elle exécute ses contrôles avec `CI` actif.
Elle constitue une vérification indépendante, même lorsque les preuves locales sont réutilisées.

Un changement documentaire n'installe ni Django, ni le frontend, ni Chromium et ne lance aucun test applicatif.
Un changement local exécute ses contrôles de domaine et ses parcours requis.
Les changements sensibles internes utilisent le backend complet ; les contrats produit ajoutent frontend/E2E.
Les changements transversaux et inconnus appellent le workflow exhaustif réutilisable.
Métriques JSONL, rapports frontend et traces E2E sélectionnées sont archivés même en cas d'échec.
La publication Pages reste conditionnée au workflow Quality gate réussi pour son SHA exact.

## Exhaustif indépendant

[`exhaustive.yml`](../../.github/workflows/exhaustive.yml) se déclenche chaque jour à **07:23 UTC** sur main,
ou manuellement, avec un SHA complet facultatif (par défaut le SHA de main au déclenchement).
Le workflow sélectif peut également l'appeler pour un changement large.
Il ne réutilise pas les preuves locales et n'est pas annulé par une nouvelle publication.
Le job identity vérifie le SHA immuable et le publie dans son résumé ; tous les checkouts utilisent ce SHA.

| Contrôle | Exécution exhaustive |
| --- | --- |
| Dépôt | Lignes, secrets, README, cohérence, règles, tests qualité/bootstrap/licences/validation |
| Statiques backend | Ruff lint/format et migrations manquantes |
| Backend | Huit partitions pytest, tous les tests, contrats/OpenAPI/sécurité/transactions/SQLite/exploitation existants |
| Couverture backend | Fusion des données et collections disjointes/exhaustives ; branch coverage global >= 90 % |
| Frontend | Lint, format, typecheck/build, tous les Vitest, quatre seuils >= 90 % |
| E2E | Deux shards isolés ; tous les parcours réels et démo, build de démo inclus |
| Rapport final | Fusion HTML et inventaires E2E exhaustifs, tous les jobs requis réussis |

Le moteur partagé `backend.yml` sert aussi le backend complet sélectif ; voir le [diagnostic MEP-037](backend-ci-performance.md). Le partitionnement conserve ses garanties : fichiers pytest entiers sauf les cas autonomes de conflits SQLite, poids conservateurs pour les nouveaux,
`fail-fast: false`, union sans omissions/doublons et mêmes seuils. Les fusions ne relancent pas les suites.
SQLite, ports, installations et temporaires restent propres à chaque runner ; un worker E2E par shard.
Les caches pip/npm accélèrent les téléchargements, sans partager les runtimes ni les verdicts.
Les artefacts backend (JUnit/manifests/couverture), frontend et Playwright permettent d'analyser les échecs.
La preuve `qualification/qualification.json` n'est produite qu'après succès des contrôles ET des fusions.
Elle contient SHA, run ID, provenance GitHub, portée exhaustive et horodatage ; rétention 30 jours.
Un run rouge reste rouge et ne produit pas de preuve de promotion exploitable.

## Candidat MESS et promotion

```powershell
npm run quality:qualify -- <SHA_COMPLET>
gh workflow run exhaustive.yml -f candidate=<SHA_COMPLET>
npm run quality:promote -- <SHA_COMPLET> <RUN_ID_REUSSI>
```

Le premier contrôle local exige le checkout propre exact et exécute toute la campagne fraîche.
Sa preuve locale sert au diagnostic ; le gate de promotion exige une preuve GitHub indépendante.
`MESS promotion gate` fournit la même vérification par déclenchement manuel (`promotion.yml`).
Il interroge le résultat réel du run, exige le workflow exhaustif déclenché manuellement ou par schedule,
télécharge son artefact et refuse tout SHA, run ID, provenance ou statut incohérent.
Une nightly antérieure n'est utilisable que pour **le même SHA exact**, jamais pour un candidat différent.
Un artefact expiré ou absent refuse la promotion. Relancer alors la qualification exhaustive.

Il n'existe pas encore de déploiement production automatisé dans ce dépôt : ce gate autorise la remise,
il ne distribue pas un paquet MESS. Tout futur export/déploiement doit dépendre de ce gate avant transfert.
Un transfert manuel hors dépôt reste une responsabilité opérationnelle explicite, pas une protection GitHub inventée.
Django/DRF, React/TypeScript, SQLite permanent et distribution autonome hors ligne restent inchangés.
Aucune dépendance d'exploitation supplémentaire n'est imposée au MESS.

## Mesures et références

Les hooks `.githooks/*` sont versionnés exécutables (`100755`). Sous Linux, leur installation
par `setup-hooks.ps1` conserve ainsi les modes du candidat ; le garde de propreté après E2E reste
bloquant. Le test `scripts/bootstrap/tests/worktree.tests.ps1` vérifie modes Git et installation
sans modification du checkout de fixture. Voir le [défaut bloquant révélé par MEP-011](../architecture/organization-isolation-validation.md#défaut-ci-bloquant-révélé-après-publication).

L'audit et les comparaisons de cette refonte sont dans [les mesures](validation-measurements.md).
Les anciennes mesures des shards restent dans [le bilan CI](ci-performance.md).
Pour inspection : `gh run list --workflow quality.yml`, `gh run view RUN_ID --json jobs`.
