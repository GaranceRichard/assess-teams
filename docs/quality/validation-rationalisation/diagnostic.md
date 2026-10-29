# Dépendances, escalades et preuves

## Périmètre inspecté

`impact-classification`, `impact`, `impact-runner`, `validation-inputs`, `runtime-inputs`,
`validate`, `selective`, `targeted`, `quick`, `qualification`, hooks, `publish.ps1`,
workflows ordinaires/exhaustifs/promotion et tests des politiques.
La politique auditée n'a pas changé entre `713acd1` et la base `029857a` dans ces scripts/hooks.
Le replay utilise donc cette dernière base, pas une politique historique supposée.

## Carte des escalades avant correction

| Déclencheur | Décision et propagation | Dépendance prouvée / défaut |
| --- | --- | --- |
| Regex `transverse` : scripts, hooks, CI, manifests, noms contenant `config` | `full` absorbe toutes les autres classifications → repository/backend/frontend/E2E | Justifié pour moteur commun et livraison ; Playwright n'est chargé ni par pytest ni par Django |
| Helper E2E non `.spec.ts` | Inconnu → `full` | Chargé par Playwright, parfois par les configs TypeScript ; pas par les tests SQLite |
| `frontend/demo-e2e/*.spec.ts` | Inconnu → `full` | Consommateur navigateur de démo ; build statique nécessaire, pas pytest |
| `frontend/src/test` et `src/demo` | `full` | Vitest, build et consommateurs navigateur ; pas de consommateur Python |
| PNG/WebM de recette | Inconnu → `full` | Sorties documentaires ; ni fixtures ni ressources Vite ; défaut confirmé sur cinq fichiers inventoriés |
| UI non cartographiée | Vitest related + tous E2E | Aucun backend complet par cette règle seule ; prudence maintenue pour CSS global/focus/overlays |
| Source/backend sensible ou contrat | Backend complet ; consommateurs frontend/E2E selon frontière | Autorisations, refus, sessions, données, contrats ; maintenu |
| Migrations/config backend, suppression applicative, type/inconnu | `full` | Dépendances non bornées et risque production ; maintenu |

Une cause `full` suffit pour imposer les quatre domaines. Les raisons sont individuelles `[WHY]`,
mais le message générique « infrastructure transverse » ne démontrait pas la dépendance backend.
Les nouvelles raisons nomment le chargeur, les contrôles conservés et l'absence de consommateur pytest.
La recherche dans les tests Python trouve bien des consommateurs YAML dans `test_ci_workflow.py`,
`test_backend_workflow.py` et `test_impact_workflow.py` : la CI reste transverse. Elle ne trouve pas
de lecture de Playwright/Vite/tsconfig/ESLint ou des helpers frontend par pytest.
`frontend/src/demo/config.test.ts` importe en revanche Vite : le frontend complet est conservé pour Vite.
Les tests de consolidation du repository utilisaient seulement des rapports simulés. Pour rendre la
réduction navigateur sûre, `browserGates.test.ts` charge les vraies configs app/démo/merge et les fonctions
de rapports : local/CI, shards 1/2 et 2/2, shard invalide refusé, sorties disjointes, services et diagnostics.
Ce test Vitest est explicitement sélectionné en plus des statiques et de tous les E2E pour chaque
changement d'outillage navigateur ; aucun import de ce fichier par l'application ou le build distribué.
Les contrats bornent aussi le lanceur effectif : aucun canal, exécutable ou navigateur connecté externe
ne peut remplacer discrètement les Chromium empreintés ; ce changement exige une revue de la politique runtime.

## Ce qui est réellement exécuté

`quality:targeted` sans argument et le pre-push passent par `selective` sur le diff réel.
Le plan choisit les commandes ; `impact-runner` ne transforme pas un test ciblé en test métier complet.
Les commandes explicites de `targeted` restent du feedback de développement, sans preuve de publication.
`repository` inclut structure, secrets, README, règles et tests des outils/bootstrap ; `documentation`
garde structure/secrets/documentation frais, sans tests applicatifs ni suites d'outillage.
`backend` inclut Ruff, migrations, pytest entier, concurrence et couverture globale ; `frontend`
inclut lint/format/seuils, typecheck/build et Vitest entier ; `e2e` inclut application et démo construite.

`publish.ps1` ne lance pas directement une seconde qualification : verrou commun, fetch/rebase,
vérification des protections puis `git push branche:main` déclenchent le hook. Un refus de verrou
précède fetch et tests : les tentatives de verrou ne sont pas des campagnes applicatives.
Le hook impose worktree/branche, propreté, ascendance, diff annoncé par Git et gate bloquant.
`selective` revérifie HEAD et propreté après le plan. Aucun contournement ni PR n'est ajouté.

La CI recalcule le plan avec `CI` frais, répartit les domaines et refuse les skips non requis.
Nightly/MESS gardent les quatre domaines, huit shards backend avec fusion globale et deux E2E.
La promotion exige workflow exhaustif indépendant réussi, SHA/run exacts et artefact GitHub.
Une CI sélective verte ou une collection de preuves locales ne satisfait pas ce contrat.

## Causes d'invalidation

| Entrée | Comportement antérieur | Correction / décision |
| --- | --- | --- |
| Image/vidéo UX hors Markdown | Entrée de backend, frontend et E2E ; changement invalide les trois clés | Cinq sorties nommées exclues si régulières/non exécutables ; gate documentaire frais |
| `debug.log` Chromium au voisinage du binaire | Contenu installé changé pendant le test → E2E refusé malgré assertions réussies | Exclusion exacte du fichier régulier non exécutable à la racine navigateur ; pas une exclusion `.log` générale |
| Sélecteur E2E | Backend exclu par `frontend/`, frontend et E2E invalidés | Pas de réduction intra-frontend : lint/format/tsconfig incluent tests et configs ; plan ciblé évite la campagne Vitest entière |
| Helper/config navigateur | Backend exclu des octets frontend mais campagne backend exigée par `full` | Repository + statiques + contrats Vitest des vraies configs + E2E entiers ; pas pytest |
| Changement SHA/rebase/prose seul | SHA et `QUALITY_DIFF_BASE` hors clé applicative | Réutilisation déjà possible ; aucune expiration temporelle à retirer |
| Identifiants CODEX_TOOL_CALL_ID / SESSION_ID | Provenance de l'agent incluse dans toutes les clés ; nouvel appel invalide sans changement produit | Ces deux identifiants seuls sont exclus ; THREAD_ID, capacités, PATH et variables inconnues gardés ; non attribuable rétrospectivement aux anciens runs |
| Règle commune, dépendance, `.env`, runtime ou sélection | Clé différente, preuve insuffisante | Maintenu ; politique 5 invalide volontairement les anciennes clés une fois |
| Échec/entrées modifiées durant ou après contrôle | Ancienne preuve supprimée, aucune nouvelle preuve réussie | Maintenu ; succès d'assertions insuffisant si entrées instables |
| Chargeur externe/installation non bornée, CI, `--fresh`, DB E2E explicite | Exécution fraîche, sans preuve locale réutilisable | Maintenu |

Le nouveau gate vérifie signatures PNG/WebM, fin PNG, liens documentaires et interdit un consommateur
explicite du dossier UX dans les sources/backend/frontend/outillage de packaging audités.
Il ne décode pas chaque frame, ne certifie pas la provenance ni l'acceptation visuelle : revue humaine requise.
Une nouvelle preuve n'est pas classée par extension ; elle reste inconnue jusqu'à revue de l'inventaire.
Les SVG, JSON de fixtures, ressources sous frontend/public/src et docs/legal restent hors de cette exception.
Un lien, sous-module, fichier exécutable ou suppression applicative garde le traitement conservateur.

## Coût des empreintes

Chaque contrôle réutilisable calcule sa clé avant, après et à la fin du plan, y compris un hit.
Chaque calcul relit les octets npm/Python et, en E2E, les deux navigateurs ; outils, `pip freeze`,
environnement, fichiers suivis/non ignorés, modes, suppressions et sélection exacte contribuent à la clé.
Les sorties TypeScript/Vite et `__pycache__` déjà auditées restent exclues, pas les caches arbitraires.
Ces lectures répétées sont coûteuses mais protègent les mutations entre contrôles. Aucun cache par mtime
ou version déclarée ne les remplace ici : aucune sûreté n'a été démontrée pour cette réduction.
Le scope E2E ciblé de démo conserve l'empreinte conservatrice E2E des deux arbres/runtimes ; seule son
exécution est isolée. Scinder cette preuve demanderait un contrat de runtime distinct, laissé en suivi.
Les dépendances système externes aux arbres installés n'ont pas de manifeste binaire complet ; cette
limite préexistante n'est pas résolue par une version d'OS seule. CI/MESS restent indépendantes et fraîches.
Une sonde locale a aussi comparé l'environnement direct et un hook Git sans afficher de valeur :
Git Bash modifie notamment `PATH`, `GIT_DIR`, `GIT_EXEC_PATH`, `HOME` et la casse de variables Windows.
Ces différences restent conservatrices : elles ne sont pas toutes de simples identifiants d'appel.
Une preuve produite dans un autre shell peut donc nécessiter un nouveau passage ; aucune équivalence
de chargeur ou de résolution d'outils n'a été supposée pour éviter ce coût.
La recherche dans les sources et runtimes installés trouve `CODEX_THREAD_ID` dans la détection d'agent
de Vite et de `std-env` : il est conservé intégralement, même si les consommateurs observés testent
seulement sa présence. Aucun consommateur des deux identifiants exclus n'a été trouvé.

## Incident d'invocation du prévol Windows

Incident de commande constaté pendant le prévol de cette revue sous Windows : fournir les références
par pipeline à `npm run quality:check -- --pre-push` fait passer l'appel dans la branche `$input` de
`npm.ps1`. Le séparateur est absorbé et npm interprète l'option comme sa configuration : avertissement
`Unknown cli config --pre-push`, script sans argument, plan avec « travail local » et variables
`npm_config_*` (`pre_push`, `all`, `long`, `parseable`, `yes`) différentes. Cela explique la nouvelle campagne
de ce prévol, pas rétrospectivement celles du chantier UX dont l'environnement n'est pas archivé.
Le hook du dépôt appelle déjà `node scripts/quality/selective.mjs --pre-push` directement : il n'est
pas affecté. Le prévol corrigé reprend cet appel Node et vérifie le plan des références commitées.
Aucun paramètre npm supplémentaire n'est exclu des empreintes pour masquer l'erreur d'invocation.

## Choix par risque

| Proposition | Risque maîtrisé | Décision |
| --- | --- | --- |
| Bornes frontend/navigateur explicites | Dépendance supprimée seulement vers pytest ; frontend et navigateurs conservés | Appliquée, tests de plans et échecs bloquants |
| Inventaire documentaire de cinq sorties | Confusion avec ressource distribuée, fixture ou exécutable | Appliquée avec intégrité fraîche et refus de consommateur |
| Journal Chromium exact | Ignorer une bibliothèque ou un chargeur déguisé | Appliquée uniquement au journal régulier non exécutable, au bon niveau |
| Cartographier davantage de CSS/animations partagés | Sélecteurs globaux, focus et copies visuelles touchent d'autres routes | Refus de réduction ; tous les E2E conservés |
| Réduire API/permissions/migrations ou outils de livraison | Consommateurs dynamiques, données et sécurité | Aucune réduction sans preuve supplémentaire |
| Mutualiser les lectures d'arbres installés entre barrières | Mutation cachée pendant un contrôle | Différé ; coût décrit, aucune dépendance supprimée |
