# MEP-048 — validations et limites des preuves

> Historique de qualification : les réserves et restrictions de cette phase sont conservées.
> Voir le [rapport consolidé](rapport.md) pour la correction et la proposition actuelles.

Candidat : `2d9b6c3c5c960e94630c93ce6c523bbcc6a0badd`.
Auteur Codex, Windows, 2026-11-01. Sources/suites existantes inchangées.
Python 3.12.10, Django 5.2.18, SQLite 3.49.1 ; Node 24.20.0, npm 11.19.0.
Playwright 1.63.0 : projet Chromium. Les lockfiles et le relevé local identifient les dépendances.
Preuves brutes conservées sous `.cache/mep-048/` dans ce worktree.

## Exécutions retenues

Les références historiques ne démontraient pas l’identité complète runtime/données/shell/sélection.
Seules les suites existantes couvrant les critères/refus 048 ont été rejouées.
Aucune campagne exhaustive, couverture globale ou qualification MESS revendiquée.

| ID | Commande / sélection | Résultat | Preuve locale |
| --- | --- | --- | --- |
| B1–B2 | Depuis backend : `.venv/Scripts/python.exe -m pytest tests/test_steering.py tests/test_steering_security.py tests/test_steering_openapi.py tests/test_dashboard.py tests/test_dashboard_security.py -v --tb=short` | **46 passés**, 59,59 s, exit 0 | backend.txt |
| R1 | `npm.cmd run test:quick --prefix frontend -- SteeringPage.test.tsx ResultsIntent.test.tsx DashboardPage.test.tsx ProductShellSteering.test.tsx steering.test.ts dashboard.test.ts` | **27 assertions, 7 fichiers passés**, exit 0 | frontend.txt |
| E1 | `npm.cmd run test:e2e --prefix frontend -- steering.spec.ts dashboard.spec.ts` | **9 passés**, 1,3 min, exit 0 | e2e.txt + PNG |
| J1–J3 | Helpers existants et APIClient réel ; préparation/rejeu dans recette-executee.txt | Cartes, états, dates, révision, sources et refus conformes aux valeurs consignées | jeu-fixe.json |
| V1–V2 | Inspection directe des quatre PNG E1 | Dashboard lisible ; Pilotage insuffisant pour acceptation visuelle complète | tableau ci-dessous |

B1 = steering/calcul/permissions/OpenAPI ; B2 = dashboard/provenance/permissions.
Vitest sélectionne aussi SuperadminDashboard.test.tsx par correspondance de filtre sans casse :
7 fichiers/27 assertions représentent la sortie effective. Le diagnostic jsdom
« Not implemented: navigation to another Document » n’est pas une navigation réelle ;
E1 couvre le lien connecté et le reload. Les 403/404 attendus ne sont pas des échecs.

E1 : ports backend **8148**, frontend **5248** ; variable ASSESS_E2E_DB pointant vers
`<worktree>/.cache/mep-048/e2e.sqlite3`. J1–J3 : autre base `manual.sqlite3`.
Aucun compte/base de production ; aucun accès au worktree ou à la base MEP-047.
Serveurs manuels MEP-048 arrêtés après la tentative visuelle.

Première migration sans settings explicite refusée avant préparation de J1 par la configuration
production (secret externe absent). Reprise réussie avec
`DJANGO_SETTINGS_MODULE=config.settings_development` ; aucun défaut applicatif déduit.

## Inspection des captures

| ID / PNG dans le cache | Contexte | Observation réelle | Limite / verdict |
| --- | --- | --- | --- |
| V1 — steering-dark.png | Admin Results E2E, 1280×720, sombre Vert | Dashboard et Pilotage superposés | **Preuve de lisibilité au repos refusée** ; pas preuve d’un défaut permanent |
| V1 — steering-mobile.png | Même fixture, 390×844, clair Vert | Cartes 3/2/1/1, date, dernière complétion, table et focus ; largeur document assertée | Définitions fermées ; colonnes à droite hors champ ; note sous tableau tronquée à gauche ; Q1 nécessaire |
| V2 — dashboard-mobile-day.png | Coach Dashboard E2E, 390×844, clair Rouge | Révision/complétion, auteurs, version et assignation lisibles | Ni quatre rôles ni J1 |
| V2 — dashboard-mobile-night.png | Même scénario, sombre Rouge | Même distinction et lecture | Pas les autres formats UX-09 |

Ces quatre PNG ont été ouverts/examinés : le vert E1 ne valide pas leur esthétique.
Aucune définition ouverte, absence J2/J3, mesure complète de contraste, zoom réel 200 %,
ou géométrie de toutes les combinaisons n’est revendiquée.
Les autres recettes UX restent des preuves distinctes.

Tentative directe : création d’un onglet local via cua retourne
« The browser access host is unavailable » ; inventaire : aucun navigateur connecté.
La sélection de la fenêtre Edge expire : « Computer Use app approval timed out ».
Aucune interaction native réussie, capture J1 ou acceptation visuelle revendiquée.
Cette indisponibilité est un manque de preuve, pas un refus métier conforme.

## Réutilisation et traçabilité

[Consolidation historique](../audit-20261027/reutilisation-consolidee.md), référence STEER-001
`51574e0d43db13be0377ceb31eb0ac6de4f21d1d`.
Comparaison directe : steering.py, test_steering.py et ResultsIntent.test.tsx identiques.
SteeringSummary.tsx, SteeringTeams.tsx, SteeringPage.tsx et steering.spec.ts diffèrent.
Les dates portent notamment la trace `8bc5d1411fb744699d11a3b6847970b7d3970fd2`.
Une ancienne capture n’est donc pas transposée au shell courant.

L’inventaire `empreintes.json` identifie les fichiers relus et preuves brutes :
il ne prétend ni à la fermeture transitive des entrées ni au format cache qualité v3.
Les runs frais sont des constats locaux sur le candidat, pas un certificat de lint,
coverage ou CI exhaustifs. Les preuves historiques restent des appuis bornés.

## DoD et contrôle documentaire

Règles relues : AGENTS, agent-rules, charte, DoD, stratégie de tests,
validation-costs, UX-09 et contrats API.
Sans développement : README préalable et lint/typecheck/build/migrations de code non applicables
à ce lot documentaire ; les migrations de base fictive servent uniquement la recette.
Cas nominaux/vrais refus couverts par les tests existants ; aucun nouveau test.
Les seuils globaux de 90 % sont conservés, jamais déduits de cette sélection.

Le diff local comprend uniquement les trois Markdown de ce dossier ; sorties générées en cache ignoré.
Chaque fichier manuel reste sous 200 lignes.
Contrôle documentaire : `npm.cmd run quality:targeted` ; sortie locale `documentation.txt`.
Ce contrôle du rapport ne lève pas Q1–Q3 et ne clôt aucun PBI.

Commit/pre-push/push/CI de publication : **non exécutés, interdits par la demande**.
Aucune modification de statut/date ; aucune conformité technique assimilée à une acceptation MESS.
[Décision et matrice](rapport.md) ; [jeu fixe](jeu-fixe.md).



## Liens vers les assertions et l’implémentation relues

- B1 : [projection](../../../../backend/assessments/application/steering.py),
  [valeurs/dates](../../../../backend/tests/test_steering.py),
  [refus](../../../../backend/tests/test_steering_security.py),
  [OpenAPI](../../../../backend/tests/test_steering_openapi.py).
- B2 : [Dashboard](../../../../backend/assessments/application/dashboard.py),
  [provenance](../../../../backend/tests/test_dashboard.py),
  [scopes/refus](../../../../backend/tests/test_dashboard_security.py).
- R1 : [cartes/définitions](../../../../frontend/src/SteeringSummary.tsx),
  [états/liens/absences](../../../../frontend/src/SteeringTeams.tsx),
  [assertions Pilotage](../../../../frontend/src/SteeringPage.test.tsx),
  [intention Results](../../../../frontend/src/ResultsIntent.test.tsx).
- E1 : [scénarios Pilotage](../../../../frontend/e2e/steering.spec.ts),
  [scénarios Dashboard](../../../../frontend/e2e/dashboard.spec.ts).
- Sorties locales : backend (`.cache/mep-048/backend.txt`),
  React (`.cache/mep-048/frontend.txt`), E2E (`.cache/mep-048/e2e.txt`),
  jeu fixe brut (`.cache/mep-048/jeu-fixe.json`),
  empreintes (`.cache/mep-048/empreintes.json`).
Les liens vers le cache dépendent de ce worktree conservé ; ils ne constituent pas des preuves intégrées.
