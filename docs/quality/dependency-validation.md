# Validation par dépendances — préparation et audit global

## Préparation du changement — généralisation du moteur existant

- Périmètre : analyser tous les modules Django et React et leurs consommateurs de tests et de parcours navigateur.
- Objectif : remplacer les élargissements par appartenance au dépôt par des relations démontrées et explicables.
- Effets attendus : unir tests des composants, intégrations, contrats et parcours concernés dans le plan partagé.
- Risques : imports dynamiques, registres Django, fixtures et navigation implicite peuvent masquer des consommateurs nécessaires.
- Vérification : fixtures positives et négatives, inventaires réels, plans comparés pour chaque domaine et livraison exhaustive.
- Fichier : `scripts/quality/impact-classification.mjs`
- Fichier : `scripts/quality/frontend-impact.mjs`
- Fichier : `scripts/quality/impact.mjs`
- Fichier : `scripts/quality/impact-runner.mjs`
- Fichier : `scripts/quality/dependency-graph.mjs`
- Fichier : `scripts/quality/frontend-dependencies.mjs`
- Fichier : `scripts/quality/journey-dependencies.mjs`
- Fichier : `scripts/quality/backend_dependencies.py`
- Fichier : `scripts/quality/backend_routes.py`
- Fichier : `scripts/quality/backend_imports.py`
- Fichier : `scripts/quality/backend_fixtures.py`
- Fichier : `scripts/quality/backend_test_symbols.py`
- Fichier : `scripts/quality/backend_boundaries.py`
- Fichier : `scripts/quality/backend-impact.mjs`
- Fichier : `scripts/quality/dependency-context.mjs`
- Fichier : `scripts/quality/compare-dependencies.mjs`
- Fichier : `scripts/quality/dependency-measurements.mjs`
- Fichier : `scripts/quality.ps1`
- Fichier : `scripts/quality/tests/scopes.tests.ps1`
- Fichier : `scripts/quality/tests/validation-policy.test.mjs`
- Fichier : `scripts/quality/tests/dependency-graph.test.mjs`
- Fichier : `scripts/quality/tests/dependency-refusals.test.mjs`
- Fichier : `scripts/quality/tests/dependency-backend.test.mjs`
- Fichier : `scripts/quality/tests/dependency-frontend.test.mjs`
- Fichier : `scripts/quality/tests/dependency-plan.test.mjs`
- Fichier : `scripts/quality/tests/dependency-execution.test.mjs`
- Fichier : `scripts/quality/tests/impact-execution.test.mjs`
- Fichier : `scripts/quality/tests/dependency-fixtures.mjs`
- Fichier : `scripts/quality/tests/impact.test.mjs`
- Fichier : `scripts/quality/tests/sensitive-impact.test.mjs`
- Fichier : `scripts/quality/tests/proportionality-boundaries.test.mjs`

Le mandat global remplace le pilote initial interrompu avant qualification. La préparation Radar
a précédé ses premiers changements ; cette préparation globale précède toute extension technique.
La liste sera ajustée avant toute extension supplémentaire. Aucun changement produit n'est prévu.

## Audit préalable du dispositif

- `quality:targeted` sans sélecteur, `quality:check`, le hook et la CI utilisent déjà `planImpact`.
  Les sélecteurs explicites sont un feedback de développement, jamais une exemption du pré-push.
- Le frontend emploie déjà `vitest related --run` : les importeurs transitifs sont analysés par Vitest.
  Quatre chemins ont une carte E2E manuelle ; les autres UI déclenchent tous les parcours.
- Les tests backend isolés sont ciblés ; les sources ordinaires prennent toute la suite sauf les filtres Logs.
  Les adapters/domaines sont assimilés à un contrat global frontend/E2E sans examen des consommateurs.
- Django enregistre ses vues dans `config/urls.py`, `results_urls.py` et `identity_urls.py`.
  Traverser ces registres comme des modules ordinaires confondrait toutes les routes.
- Les tests API emploient `reverse`, des URL, des helpers et des commandes nommées :
  un graphe limité aux imports explicites manquerait ces intégrations.
- Les fixtures partagées de `conftest.py` sont nommées, sans autouse global actuel ;
  leurs utilisateurs doivent être associés aux arguments de tests, sans relier toute la suite.
- Notifications : transport → delivery → queue/on_commit, workers, invitations et planification.
  Les imports locaux dans les fonctions doivent être conservés ; SMTP n'a pas de consommateur Radar direct.
- Teams : modèles partagés et permissions restent sensibles ; vues, sérialisation et clients Teams
  ont des consommateurs identifiables par routes. La proximité de fichiers n'est pas une preuve.
- React compose les pages dans ProductShell et la démo dans DemoApp ; la navigation décrit chemins et titres.
  Les primitives communes, styles globaux et sécurité peuvent atteindre tous ces consommateurs.
- Les chemins de parcours sont parfois portés par des helpers, tableaux ou liens textuels :
  une navigation non résolue exige une sélection conservatrice, jamais un parcours silencieusement absent.

## Frontières de l'analyse prévue

Imports Python analysés par AST standard, imports React et CSS, références de modules dans les chaînes,
routes Django nommées/URL, fixtures et commandes alimentent le même plan existant.
L'inventaire est recalculé : nouveaux tests, composants et consommateurs ne sont pas figés dans des comptes.
Une erreur de lecture/analyse, un import local non résolu, une sélection vide ou un effet dynamique
non maîtrisé élargit le plan. Les modèles/configurations, permissions, sessions, transactions internes
et frontières de sécurité gardent leurs validations renforcées.

## Plan de validation préalable global

1. Tests Node du graphe, de ses analyses et de la composition du plan ; cas réels et fixtures de refus.
2. Contrats d'exécution des sélecteurs et cohérence développement/hook/CI, sans exécuter de produit à ce stade.
3. Collections Vitest/pytest/Playwright et plans avant/après pour identités, organisations, Teams,
   évaluations/modèles, planification, passations, Results, pilotage, journaux, notifications et infrastructure.
4. Mesures ciblées représentatives réellement exécutées ; distinguer plans, collections et campagnes.
5. Pré-push complet du changement transverse, CI indépendante du SHA exact ; nightly 10/5, seuils
   et qualification MESS inchangés. Aucune campagne complète répétée sans entrée modifiée ou échec.

## Revue documentaire à terminer avec les résultats

Le propriétaire est la qualité. README, contrats produit et architecture applicative ne changent pas
de responsabilité. La matrice, la stratégie de tests et les explications CI seront revues selon le
résultat effectif ; aucune approbation humaine n'est présumée.
### Constat complémentaire avant correction

Le motif transverse actuel reconnaît aussi `frontend/src/resultRadarConfig.ts` à cause de
son nom « Config », bien qu'il soit un module applicatif Chart.js. Il déclenche donc les
quatre domaines, y compris pytest. La correction distinguera les sources applicatives des
configurations d'outillage, en conservant leurs véritables consommateurs Radar/historique/thèmes.
Avant le découpage technique de l'analyse AST : séparer imports, visibilité des fixtures et
frontières de persistance/callback dans des helpers standards permet de conserver des responsabilités
lisibles sous 200 lignes, y compris après formatage. Ces helpers servent le même moteur et les mêmes tests.
### Refus des sélections vides — constat avant correction du runner

Le code CLI installé de Vitest 5.0.3 définit `argv.passWithNoTests ??= true` pour
`related`. L'absence d'option permissive dans notre runner ne suffit donc pas.
Le runner imposera explicitement `--no-passWithNoTests` ; son contrat et un vrai appel
sans test vérifieront le refus. Les collections de mesure seront résolues par Vitest
lui-même, dans un helper de reporting, sans exécuter les cas ni créer un autre moteur.
### Affinement préparé — helpers de tests Python

La comparaison révèle encore un faux lien SMTP → Results : `taking_helpers` importe
seulement `csrf_post`, mais l'analyse du fichier entier lui attribue aussi `invitation_route`.
Avant correction, prévoir des nœuds de fonctions pour les helpers de tests, leurs imports
nommés et appels locaux. Un import de module ou étoilé conserve toutes les fonctions ;
les fixtures restent liées à leurs utilisateurs. Une modification du helper entier conserve
tous ses consommateurs. Le test de refus vérifiera qu'importer une autre fonction ne suffit
jamais à exclure une dépendance réellement appelée.
Les fabriques de fixtures, plugins et hooks pytest non analysés, ainsi que les imports dynamiques
aliasés, doivent refuser le ciblage : leurs consommateurs globaux ne sont pas démontrés.
Cette garde sera qualifiée avant de figer le moteur et de lancer les gates exhaustifs.
## Comparaison avant/après — plans simulés et sélections résolues

Base immuable : `c14e60cf26885e10f7acaf699d4bd521657f2e96`. Collectes réelles :
1 771 cas pytest, 510 Vitest, 155 Playwright applicatifs et 10 de démo ; aucun cas exécuté par ces collectes.
Les scénarios simulent un fichier modifié sans patch sensible. Vitest résout ses propres sélections ;
les nombres ci-dessous comptent les cas collectés dans les fichiers retenus, pas des campagnes passées.
Les [plans complets](dependency-validation-plans.jsonl) contiennent chemins, contrôles, raisons et durées de calcul.

| Domaine/scénario | Backend avant → après | Frontend avant → après | E2E app + démo avant → après | Calcul après (ms) |
| --- | ---: | ---: | ---: | ---: |
| identites-backend | 1771 → 1771 | 510 → 510 | 155+10 → 155+10 | 0,8 |
| identites-ui | 0 → 0 | 98 → 98 | 155+10 → 58+10 | 188,5 |
| organisations-backend | 1771 → 1771 | 510 → 510 | 155+10 → 155+10 | 0,5 |
| organisations-ui | 0 → 0 | 99 → 99 | 155+10 → 57+10 | 252,7 |
| teams-api | 1771 → 868 | 510 → 175 | 155+10 → 83+4 | 2291,9 |
| teams-ui | 0 → 0 | 89 → 89 | 155+10 → 53+10 | 243,2 |
| modeles-api | 1771 → 1096 | 510 → 292 | 155+10 → 141+10 | 2303,3 |
| modeles-ui | 0 → 0 | 94 → 94 | 155+10 → 51+10 | 239,2 |
| planification-backend | 1771 → 1771 | 0 → 510 | 0+0 → 155+10 | 2073,7 |
| planification-ui | 0 → 0 | 119 → 119 | 155+10 → 61+10 | 232,2 |
| passations-backend | 1771 → 1771 | 0 → 510 | 0+0 → 155+10 | 2126,9 |
| passations-ui | 0 → 0 | 124 → 124 | 155+10 → 101+4 | 254,9 |
| results-backend | 1771 → 708 | 0 → 191 | 0+0 → 155+10 | 2451,6 |
| results-radar | 0 → 0 | 131 → 131 | 155+10 → 79+9 | 252,9 |
| results-config | 1771 → 0 | 510 → 141 | 155+10 → 80+9 | 275,0 |
| pilotage-backend | 1771 → 660 | 0 → 108 | 0+0 → 61+4 | 2446,4 |
| pilotage-ui | 0 → 0 | 93 → 93 | 155+10 → 61+4 | 258,7 |
| journaux-backend | 1771 → 1506 | 0 → 349 | 0+0 → 151+10 | 2502,2 |
| journaux-ui | 0 → 0 | 107 → 107 | 155+10 → 50+10 | 256,8 |
| notifications-smtp | 1771 → 1132 | 0 → 0 | 0+0 → 0+0 | 2217,6 |
| infrastructure | 1771 → 1771 | 510 → 510 | 155+10 → 155+10 | 0,1 |
| permissions | 1771 → 1771 | 510 → 510 | 155+10 → 155+10 | 0,0 |
| sessions | 1771 → 1771 | 510 → 510 | 155+10 → 155+10 | 0,0 |
| styles-partages | 0 → 0 | 32 → 376 | 155+10 → 155+10 | 238,9 |
| inconnu | 1771 → 1771 | 510 → 510 | 155+10 → 155+10 | 0,0 |
| nightly | 1771 → 1771 | 510 → 510 | 155+10 → 155+10 | 0,0 |

Statiques de chaque domaine sélectionné, documentation, secrets, conflits et règle des 200 lignes restent requis.
Les contrats, écritures persistantes et styles partagés peuvent élargir la sélection : une hausse documentée corrige
une ancienne omission ; elle ne constitue pas un gain. Les temps affichés mesurent le calcul local du plan uniquement.
Aucun gain de durée de campagne, de pré-push ou de CI ne peut être déduit de cette table.

## Cartographie Results / Radar

`ResultsRadar` importe Chart.js, react-chartjs-2, `resultRadarConfig`, types results/theme et son CSS.
`ResultsViews` le consomme dans ResultsPage/ProductShell et DemoResults/DemoApp ; le callback critère ouvre l'historique.
Vitest conserve Interaction, Presentation et les intégrations Results ; les E2E couvrent sélection, lecture, géométrie,
thèmes, accès, historique et démo. Le Config partagé conserve aussi ses consommateurs historique/contraste.

## Limites et revue documentaire

L'analyse Python reste conservative au niveau des modules applicatifs ; les helpers de tests distinguent les fonctions.
Les imports dynamiques, plugins/hooks/fixtures non bornés, mutations et lecteurs ORM inconnus refusent la réduction.
La navigation non résolue reste sélectionnée ; une page commune et les CSS calculés peuvent conserver beaucoup de parcours.
Les identités, permissions, sessions, modèles et infrastructure gardent les validations fortes : aucun domaine exclu.
README, règles agents, charte, DoD, stratégie, architecture et contrat API ont été revus ; aucune modification produit/API.
La matrice, la CI et la stratégie sont actualisées. Préparation réelle préalable et adéquation au domaine qualité confirmées ;
aucune approbation humaine n'est présumée. Nightly 10/5, seuils, fusions et qualification MESS du SHA exact sont inchangés.

## Qualification exécutée
Le premier gate dépôt a refusé deux contrats historiques : liste exacte des commandes et composant fictif
sans dépendances. Les corrections préparées conservent les assertions de refus ; leurs tests ciblés passent.

### Préparation de la garde finale — notifications internes
La revue finale exige de limiter l'exception des écritures internes aux fichiers déjà audités :
un futur producteur ou endpoint dans le dossier notifications ne peut hériter de cette exemption.
Un fichier exposé dans les routes API conserve les contrôles de contrat, même sous un nom audité.
Les cas positifs/négatifs correspondants seront vérifiés avant le pré-push complet du candidat final.

Campagne exhaustive locale initiale : 1 771 pytest passent en 1 858,08 s, couverture 97,41 % ;
510 Vitest en 63,68 s, seuils globaux tous >= 90 % (statements 94,97 ; branches 93,55 ; fonctions 96,47 ; lignes 95,81).
Playwright : 155 parcours applicatifs en 23,2 min et 10 démo en 39,8 s. Contrôles mesurés, empreintes incluses :
dépôt 123,755 s ; backend 1 883,336 s ; frontend 109,522 s ; E2E 1 462,238 s. Aucun gain avant/après de durée extrapolé.
La garde finale a deux vrais refus reproduits avant correction ; 15 tests ciblés passent après correction.
Le pré-push et la CI indépendants restent obligatoires sur le candidat final ; les preuves ne sont pas forcées.
