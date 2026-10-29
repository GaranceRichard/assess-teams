# Matrice de risque et comparaison des plans

## Reproduction

```powershell
node scripts/quality/compare-policy.mjs
npm run quality:benchmark -- plans
```

Le premier charge les modules de la base immuable `029857a` par `git show` et applique les deux
politiques au même jeu de chemins puis aux diffs parent→commit de neuf commits UX.
Il n'exécute pas de tests applicatifs, ne change pas Git et ne fabrique pas de timings.
Le contrefactuel suppose la politique et ses nouveaux tests livrés ensemble : `browserGates.test.ts`
n'existait pas dans les anciens commits UX. Un plan qui le sélectionne sans ce fichier échoue ;
le replay ne prétend pas avoir exécuté ces nouveaux contrôles dans un checkout historique.
[Sortie JSONL conservée](plans.md). `retained`/`removed` comparent les noms de scopes strictement :
remplacer `frontend` par `frontend-static` conserve réellement lint/format/typecheck, détaillés ci-dessous.
Le benchmark existant expose aussi CSS/navigation/Playwright/preuve/démo avec la politique courante.

`D` = documentation/structure/secrets/intégrité frais ; `R` ajoute tests des outils/configs/bootstrap.
`S` = lint, format et typecheck frontend ; `V` = Vitest dépendants ; `F` = frontend complet avec
build et couverture globale ; `B` = backend complet, statiques/migrations/concurrence/couverture.
`E` = tous les E2E applicatifs et build + E2E démo ; `Et` = specs applicatives nommées ;
`Edt` = build démo et specs démo nommées. `Tout` = R+B+F+E.
`Vc` = neuf contrats Vitest chargeant les vraies configurations Playwright et les variantes de shards.
Les E2E applicatifs continuent de charger le vrai backend ; retirer B ne supprime pas l'intégration.

## Avant/après représentatif

Les durées sont des observations UX de campagnes voisines, **pas** des mesures A/B du même environnement.
Quand aucune durée de sélection n'existe, « non mesurée » évite une estimation inventée.

| Changement | Ancien plan | Nouveau plan | Contrôles conservés | Contrôles retirés | Justification | Durée observée ou estimée |
| --- | --- | --- | --- | --- | --- | --- |
| CSS d'animation seul, transitions.css | D+S+V+E | D+S+V+E | Statiques, dépendants, navigateurs réels/démo | Aucun | Ce CSS est partagé ; effet global, focus et copie sortante interdisent une sélection visuelle arbitraire | E app UX 16,4–17,1 min ; V de ce cas non mesuré |
| Composant de navigation ProductSidebar | D+S+V+Et+démo | Identique | Trois specs sidebar/logo/shell, Vitest dépendants et tous E2E démo | Aucun | Frontière déjà auditée ; chemin exact prévient la collision d'homonymes | Sélection non mesurée ; aucun backend autrefois requis pour ce seul fichier |
| Sélecteur transitions.spec.ts | D+S+Et | Identique | Spec entière, assertions métier et vrai backend | Aucun | Déjà proportionné ; les relances UX provenaient du diff cumulé | Matrices ciblées UX 2,5–3,2 min pour plusieurs specs, pas le seul sélecteur |
| Sélecteur démo date-presentation.spec.ts | Tout | D+S+Edt | Documentation, statiques, build et scénario réel | Pytest, Vitest métier, autres specs navigateur | Test consommateur, aucun runtime Django dans l'exécution démo | Nouveau plan réellement exécuté : 33,006 s ; un scénario vert, base backend inchangée |
| Playwright config / reports.ts | Tout | R+S+Vc+E | Configurations réelles/shards/rapports/diagnostics, statiques et tous navigateurs | Pytest/SQLite, build normal et Vitest métier | Chargement par Playwright et tsconfig.node, pas par pytest | Vc : 2,06 s observées pour les neuf tests ; E app UX 16,4–17,1 min + démo/build ; B observé voisin 19–26 min retiré |
| Config frontend Vite/ESLint/tsconfig | Tout | R+F+E | Builds, seuils, Vitest entier, navigateurs et tests des gates | Backend exhaustif | Chargeurs frontend et proxy consommés en E2E ; dépendances applicatives non réduites | Nouveau total non mesuré |
| Image/vidéo UX inventoriée | Tout | D | Structure, secrets, liens, signature ; revue de la preuve | Suites backend/frontend/E2E et tests d'outillage | Sortie régulière non exécutable, ni ressource distribuée ni fixture | Gate documentaire de ce cas non mesuré ; aucun gain global extrapolé |
| Code backend métier non cartographié, notifications/errors.py | D+B | Identique | Backend entier, couverture, intégration et refus | Aucun | Pas de carte pytest fine suffisamment prouvée | Sept campagnes B UX : temps pytest 19,36–26,10 min |
| API sensible, assessments/adapters/api/views.py | D+B+F+E | Identique | Contrats, intégration, consommateurs, seuils et E2E | Aucun | Consommateurs produit non bornés | Nouveau total non mesuré ; coût assumé |
| Permissions produit admin_permissions.py | D+B+F+E | Identique | Sécurité, rôles, refus, sessions, UI et E2E | Aucun | Risque de divulgation/mutation et navigation | Nouveau total non mesuré |
| SQLite interne sqlite_contention.py | D+B | Identique | Backend entier, rollback/Journal, multiprocessus, couverture | Aucun | Frontière DB déjà auditée ; changement de contrat élargit encore | Sept temps pytest historiques ; aucun budget réduit inventé |
| Migration ou configuration production backend | Tout | Identique | Toutes garanties, migrations et contrats | Aucun | Données, démarrage et dépendances possibles en production | Exhaustif non benchmarké pour économiser un run artificiel |
| Moteur de gates / CI / livraison réellement transverse | Tout | Identique | Toutes garanties locales et CI indépendante | Aucun | La politique affecte tous les domaines ; ce chantier est dans ce cas | Mesure locale du chantier dans validation.md |
| Candidat final MESS | Tout, frais indépendant SHA exact | Identique | Nightly/qualification, unions de shards, seuils et preuve GitHub exacte | Aucun | Aucune union de validations locales ne peut remplacer le workflow qualifiant | Coût exhaustif assumé par candidat ; non exécuté pour cet audit |

Une animation **réellement isolée** conserve S+V et les parcours visuels concernés quand cette frontière
est prouvée. Aucun nouveau CSS global n'est arbitrairement rattaché à un seul écran ici.
Un log produit dans les sorties ignorées n'a pas d'impact produit ; le `debug.log` installé bénéficie
de l'exception exacte. Un `.log` arbitraire versionné reste inconnu, car il pourrait servir de fixture.

## Rejeu des changements UX conservés

| Commit / diff parent | Avant | Après | Origine de l'escalade retirée |
| --- | --- | --- | --- |
| 37ea6d7, première animation | Tout | R+S+V+E | Vidéo et helper de mesure inconnus |
| 09c8c09, mesures documentaires | D | D | Aucune ; le pre-push historique voyait aussi les commits non publiés |
| 6c3a608, baselines de tests | D+S+Et | D+S+Et | Aucune en isolation |
| 483c962, zoom natif | D+S+Et | D+S+Et | Aucune ; ne pas attribuer un backend à ce commit seul |
| c7efd22, continuité et sorties | Tout | R+F+E | Captures, helpers E2E, tests et CSS de démo |
| 618e9a8, dates démo/diagnostics | Tout | R+S+Vc+E | Test de démo, helpers et configurations navigateur |
| 0544f1e, trois PNG | Tout | D | Images documentaires non reconnues |
| eede631, lancement Chromium | Tout | R+S+Vc+E | Helpers/configs navigateur |
| 029857a, padding desktop/preuves | Tout | D+S+V+E | PNG/WebM ; CSS partagé garde tous E2E |

Cette table décrit neuf diffs de commits, pas neuf exécutions. Le [bilan des campagnes](campagnes-ux.md)
compte séparément runs terminés, inférences et interruptions. Une tentative répétée sur le même SHA
ne prouve ni nouvelle exécution pytest ni stabilité de l'environnement.
