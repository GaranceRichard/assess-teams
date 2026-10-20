# CI sélective, nightly et qualification MESS

## Intégration par PR et protections

MEP-043 met en œuvre les [décisions D1–D5 approuvées le 2026-10-20](mep-043/README.md).
L’[audit MEP-012](mep-012/README.md) et ses preuves restent l’acquis historique inchangé.
La [transition et les refus](mep-043/transition.md) distinguent préparation, activation et conformité démontrée.

`npm run publish` conserve l’isolation et le verrou commun jusqu’à la fin de publication :
fetch, resynchronisation, pré-push obligatoire, push de la branche dédiée, PR vers main, CI indépendante,
fusion sous ruleset actif et sans bypass, synchronisation locale sûre, CI du SHA intégré et dernier rattrapage.
Une branche déjà distante est mise à jour sans force-push, par merge de main puis push fast-forward.
`npm run publish -- -Prepare` valide sa PR sans la fusionner ; il ne déclare jamais une livraison terminée.
Le push direct vers main est refusé par la garde locale et doit être interdit côté GitHub.

Le ruleset cible `refs/heads/main` : PR obligatoire, branche à jour, conversations résolues, zéro approbation
humaine obligatoire, force-push/suppression interdits et bypass vide, administrateurs/automates compris.
Le check obligatoire est `Required impact gate`, producteur GitHub Actions observé, ID `15368`.
`Full quality gate` conserve son rôle exhaustif/MESS ; il n’est pas un required check universel.
Le publisher vérifie PR/head/base, workflow, check/suite/App, plan archivé du merge synthétique et règles
actives avant fusion avec HEAD attendu. L’arbre intégré doit correspondre à celui testé.
Aucune merge queue ni `merge_group` requis dans le circuit strict retenu.

L’absence de bypass ne retire pas au propriétaire son pouvoir de reconfiguration administrative.
L’inventaire des acteurs et credentials est une preuve distincte : [état G05](mep-043/README.md).
CI rouge/annulée/absente, règles incomplètes, main avancé, mauvais SHA ou checkout principal sale/divergent
refusent la livraison. Aucun fallback direct-main, `--admin`, force-push ou désactivation temporaire.

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
