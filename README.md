# Assess teams

## Vision produit

**Assess Teams** vise à transformer l’évaluation ponctuelle des équipes en un dispositif continu d’évaluation, d’accompagnement et de pilotage de leur progression dans le temps.
Des modèles maîtrisés et versionnés, des évaluations planifiées et traçables et un historique fiable doivent aider les Coachs et chaque Organisation à agir sur des résultats observables, sans réduire une équipe à un score. La [Vision produit](docs/product/vision.md) fixe cette direction et la distingue du socle livré.

## Cadre actuel

[Démo interactive](https://GaranceRichard.github.io/assess-teams/) : shell React réel, données fictives locales, passation, radar et Pilotage sans compte ni serveur. `npm run dev:demo` et `npm run build:demo` sont isolés du build normal ; [architecture, limites et publication](docs/architecture/public-demo.md).

Le [shell desktop](docs/architecture/product-layout.md) occupe 100dvh, borne les collections avec pagination serveur, adapte le mobile et conserve des surfaces neutres en mode clair. La sidebar partagée avec la démo ancre le bouton de repli en bas ; les icônes centrées ne débordent plus horizontalement et seule la navigation scrolle en faible hauteur.
Le [Dashboard personnel — DASH-001](docs/architecture/dashboard-api.md) remplace le placeholder :
profil, apparence, dix complétions/dernières révisions accessibles et raccourcis par rôle.
Il réutilise la provenance EvaluationRun et les scopes Results, sans scores ni droits supplémentaires.

USER-004 livre le [lifecycle réversible des identités](docs/architecture/user-lifecycle.md), sans perte d’historique et avec protection du dernier Admin actif. Les validations E2E acceptent des ports dédiés pour isoler les worktrees.

[Pilotage P0 — STEER-001](docs/architecture/steering-api.md) livre `/steering` pour Admin/Superadmin :
équipes actives, complétions, retards et liens Results, via une projection backend read-only.
Aucun score global, classement ou indicateur de performance individuelle n’est calculé.

Le produit fait de l'Organisation la frontière d'administration : le Superadmin est global et [sans appartenance](docs/architecture/user-lifecycle.md#superadmin-global-sans-appartenance), avec migration des liens historiques ; un Admin rattaché à une organisation unique administre ses membres non-Admin, ses équipes et ses modèles, jamais les Admins pairs. Le bandeau de navigation vertical associe une icône à chaque entrée et peut être replié puis déplié ; les icônes repliées révèlent leur libellé au survol. Le composant de marque intègre le SVG corrigé fourni, dont la flèche est espacée du « e » : symbole agrandi et proportionné au nom Assess teams, espacement compact et centrage vertical en vue ouverte, symbole lisible en vue repliée. Le dessin et ses proportions sont préservés ; `currentColor` suit le texte clair/sombre, sans changer la typographie, les bandeaux ni le layout.
Le Journal d’activité conserve l’audit métier ; les Logs applicatifs INFO, WARNING et ERROR restent read-only et cloisonnés, avec les logs système globaux réservés au Superadmin.

Les Logs capturent toutes les réponses HTTP applicatives GET/POST/PUT/PATCH/DELETE et proposent dix filtres structurés, avec contexte sûr et isolation par organisation. Les données sensibles restent exclues ; le Journal métier reste séparé.

Les [Résultats](docs/architecture/results-api.md) séparent Analyse (Radar / Dans le temps) et Restitution (Graphique / Données détaillées), avec filtres et équipes communs, dans l’application réelle et la démo. Le contrôle Analyse devient un switch compact inspiré du mode jour/nuit, avec libellés Radar / Dans le temps visibles, curseur animé et accès clavier ; la vue temporelle présente une colonne par équipe : observations chronologiques `SCORE/10 (JJ/MM/AAAA - HH:mm)`, cellules restantes vides, sans alignement de dates ni zéro inventé. Les quatre combinaisons affichent une seule restitution à la fois : graphiques dimensionnés dans le shell fixe et tableaux à scroll interne. Le critère sélectionné est conservé lors des transitions. La dernière version ayant des résultats reste utilisée par organisation et famille, sans modifier les calculs, la récence, les accès ni les contrats API. Un clic sur un critère ouvre Dans le temps / Graphique ; la continuité inter-version exige une lignée explicite, sans agrégation ni rapprochement implicite. La direction artistique et le mode sombre sont conservés.

Les [dates et heures](docs/architecture/date-time-presentation.md) des interfaces, de la démo et des notifications sont uniformisées en `JJ/MM/AAAA`, `HH:mm` et `JJ/MM/AAAA - HH:mm`, sans secondes visibles. Le chantier centralise la présentation en conservant les fuseaux existants, la précision persistée et les formats techniques des API et exports.

## CI — feedback qualité

Le backend CI sépare Ruff et migrations des tests, répartis en deux shards équilibrés selon les durées mesurées. Les poids sont recalibrés depuis les rapports JUnit GitHub, après une première mesure locale. Un job obligatoire fusionne leur couverture globale et applique le seuil de 90 % ; Pages attend la qualité complète. La [CI parallèle](docs/quality/ci.md) conserve les autres contrôles indépendants et les caches. `npm run quality:full` reste le gate local canonique ; `Full quality gate` agrège tous les jobs sans répéter leurs contrôles.

## Socle technique

- Backend : Python 3.12+, Django 5.2, Django REST Framework 3.16, `drf-spectacular` et SQLite.
- Frontend : React 19, TypeScript 5.9 et Vite 8.
- Tests : pytest, Vitest, React Testing Library et Playwright.
- Qualité : Ruff, ESLint, Prettier et coverage bloquant à 90 %.

Le bootstrap distingue `development` et `production`, réconcilie les identités sans doublon et permet d'afficher ou masquer le mot de passe sans l'altérer. La [gestion sécurisée du mot de passe](docs/architecture/password-management.md) ajoute la récupération publique et la modification dans Mon profil, avec validateurs Django, liens à usage unique et politique des sessions.

## Périmètres livrés — identités et accès

L'endpoint initial de création d'identité est réservé au Superadmin. Dans l'espace produit, un Admin invite
uniquement des Coachs ou Viewers, automatiquement rattachés à son organisation unique.

Une identité active peut ouvrir une session produit, reprendre sur le tableau de bord depuis la racine puis accéder aux pages autorisées par sa fonction.
Les menus et accès directs appliquent la hiérarchie `Admin > Coach > Viewer`. Le Superadmin Django obtient
l'espace Admin sans devenir un rôle métier supplémentaire. Sans menu Équipes, le Coach retrouve sur son tableau
de bord son organisation et ses équipes actives ; le Viewer y retrouve son organisation. La déconnexion invalide la session.
La page Utilisateurs administre les identités et leurs invitations ; elle affiche `—` pour le Superadmin, conserve les cellules Actions et centre les badges Actif/Désactivé dans les thèmes et palettes. Un toggle illustré
soleil/lune conserve le mode jour/nuit. Dans Mon profil → Apparence, le sélecteur [Couleurs](docs/architecture/interface-palettes.md) propose dix accents : les bandeaux sidebar/header clairs suivent une teinte lumineuse plus perceptible de la palette, le fond central devient un gris très clair subtilement teinté et les cartes restent blanches. Cette évolution des seuls tokens LIGHT conserve le layout, le shell, les scrolls, la pagination et les préférences. Le Dashboard clair conserve sa hiérarchie compacte et son fonctionnement ; le mode sombre validé conserve exactement son rendu. La couleur choisie reste indépendante du mode et persiste par utilisateur dans la session backend (défaut vert). Le panneau de choix doit rester contenu dans le viewport mobile avec les métriques de police Linux. Le chargement initial de la planification ignore les réponses obsolètes.

La gestion actuelle des utilisateurs suit la hiérarchie : le Superadmin gère les autres comptes sans agir sur le sien,
l'Admin gère uniquement les Coachs et Viewers de son organisation, le Coach gère les Viewers de son
organisation. Le Viewer consulte uniquement les résultats COMPLETED de son organisation, sans accès Utilisateurs ni Équipes. Seul le Superadmin crée, affecte, modifie, désactive ou réactive un Admin.
Sans organisation, un Coach ne voit aucun utilisateur et un Viewer aucun résultat ; le Coach ne change jamais une fonction. Les comptes désactivés conservent leurs références ; les planifications non closes exigent une réaffectation explicite, même après réactivation. Les contrats `nom`/`prénom` restent ouverts dans USER-002/003.

## Périmètre livré — gestion des organisations et équipes

Le Superadmin crée et supprime physiquement les organisations. Un Admin consulte et renomme uniquement son organisation,
et peut en gérer les Coachs et Viewers sans jamais modifier les Admin qui y sont rattachés.
Le menu Équipes permet de choisir une organisation accessible, puis de créer, renommer, archiver ses équipes et de leur affecter un ou plusieurs Coachs de cette organisation. Les archives ne sont pas encore consultables ou réactivables. Une organisation utilisée par une passation commencée est protégée contre la suppression ; les autres dépendances restent soumises à l’arbitrage produit.

## Périmètre livré — modèle d’évaluation

La réconciliation des deux chantiers conserve un contrat unique et renforce les infobulles des [repères d’appréciation](docs/architecture/appreciation-markers.md) : scores entiers 0–10 facultatifs par question, édition en brouillon, copie par version, snapshot au démarrage, accès clavier/mobile et démo fictive, sans effet sur les calculs.
Les modèles suivent le cycle irréversible `DRAFT → VALIDATED → ARCHIVED` : validation et archivage explicites,
immutabilité du modèle et de ses questions après validation, planification limitée aux modèles validés.
Les Superadmins administrent les évaluations de toutes les organisations ; les Admins administrent uniquement celles de leur organisation.
Les index des évaluations et questions sont attribués automatiquement, sans champ de saisie pour l’utilisateur.
Ils planifient pour une équipe un modèle immédiat, fixe, mensuel ou trimestriel, notifié par e-mail. Chaque planification peut être confiée à un Coach ou à un Admin actif de la même organisation ; le Superadmin peut aussi se désigner lui-même. Chaque ligne suit `ORGANISATION - ÉVALUATION - ÉQUIPE - RESPONSABLE` et ouvre la modification et la suppression. Une référence existante reste visible après archivage ; sa modification exige un modèle validé. Les modèles sont regroupés en familles organisationnelles avec versions linéaires : création v1 brouillon, copie explicite en nouvelle version, archivage automatique de l’ancienne version active lors de la validation. Le planning affiche famille/version ; les passations conservent leur référence historique et leurs snapshots. La [stratégie de versionnement](docs/architecture/evaluation-versioning.md) précise migration et concurrence. Le radar Résultats utilise la dernière version ayant des résultats ; le longitudinal suit les lignées explicites ; Pilotage lit couverture et échéances sans recalculer Results.

## Périmètre livré — passation des évaluations planifiées

La modale « Passer l’évaluation » propose onze points accessibles avec infobulles, des dimensions et une navigation fixes, des zones réservées à défilement interne et le descriptif de la borne inférieure renseignée la plus proche, sans changer les notes ni les contrats API.

La route `/evaluations` propose un parcours de passation persistante des modèles planifiés : l’assigné répond aux questions ordonnées, reprend un brouillon et finalise ses notes de 0 à 10. Le tableau distingue l’assigné de l’auteur réel de la complétion. Dans son organisation, un Admin peut compléter à la place de l’assigné puis réviser une évaluation finalisée sans altérer l’auteur ni la date initiaux ; la dernière révision reste attribuée et datée. Les finalisations et révisions significatives alimentent le Journal d’activité existant. Après une passation ponctuelle complétée, une équipe peut replanifier le même modèle : une nouvelle passation indépendante conserve l’historique et les anciens résultats. Les planifications encore actives bloquent les doublons.

## Installation

Prérequis : Python 3.12 ou 3.13, Node.js 22 ou 24, npm et PowerShell, sous Windows, macOS ou Linux.

Le lancement prépare les dépendances du checkout : il crée ou répare `backend/.venv`, synchronise les requirements
et exécute `npm ci` lorsque le lockfile l'exige. Chaque worktree bénéficie de ce mécanisme sans installation
manuelle. Les [réglages et credentials fictifs locaux](docs/development-environments.md) sont documentés séparément.

Le backend utilise `backend/db.sqlite3`, créé localement et ignoré par Git. Les migrations sont appliquées automatiquement par la commande de développement backend.

## Lancement en développement

Le parcours nominal complet hors VS Code est :

```powershell
npm.cmd run dev:all
```

`Ctrl+Shift+B` offre le même résultat dans VS Code, avec deux terminaux dédiés. Les commandes séparées restent disponibles :

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\dev-backend.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\dev-frontend.ps1
```

- Django écoute sur `http://127.0.0.1:8000`.
- Vite écoute sur `http://127.0.0.1:5173`.
- Vite transmet `/api/*` à Django sur le port `8000`.
- Le health check est disponible sur `http://127.0.0.1:8000/api/health/`.
- Le schéma OpenAPI est disponible sur `http://127.0.0.1:8000/api/schema/`.
- Swagger UI est disponible sur `http://127.0.0.1:8000/api/docs/`.
- La création technique d'utilisateur est disponible au seul Superadmin par `POST /api/users/`.
- La session produit utilise `POST /api/session/login/`, `GET /api/session/` et
  `POST /api/session/logout/` ; la déconnexion exige le jeton CSRF fourni avec la session.
- La gestion des organisations utilise `/api/admin/organizations/` : collection globale pour le Superadmin,
  organisation unique pour l'Admin.
- Les modèles d’évaluation utilisent `/api/admin/evaluations/` et les questions leurs routes imbriquées.

Le premier Superadmin est créé exclusivement avec le bootstrap Django :

```powershell
Push-Location backend
& .\.venv\Scripts\python.exe manage.py createsuperuser --settings=config.settings_development
Pop-Location
```

Au premier lancement, chaque terminal affiche la préparation de son runtime avant de démarrer le service. Les
lancements suivants restent quasi immédiats sur chaque plateforme ; une erreur explicite arrête le service concerné.

## Tests et coverages

La commande de référence pour tous les tests du dépôt est :

```powershell
npm.cmd run test:all
```

Elle délègue à `scripts/test-all.ps1`, exécute successivement backend, frontend et E2E, affiche leur résultat séparément et retourne `0` uniquement si tout ce qui est applicable passe. Elle contrôle les seuils backend et frontend de 90 % et indique explicitement les niveaux non applicables. En CI ou avec PowerShell 7, le même orchestrateur peut être appelé par `pwsh ./scripts/test-all.ps1`.

Les [commandes ciblées backend, frontend et E2E](docs/quality/test-commands.md) complètent cette suite.

Les suites backend, React et Playwright couvrent authentification, scopes, CRUD, contrats et parcours métier.
La [stratégie de tests](docs/quality/test-strategy.md) décrit leur couverture, y compris la conservation
historique, les responsabilités à réaffecter et la concurrence du dernier Admin actif de USER-004.

## Approche quality-first

Le projet traite la qualité comme une condition de livraison : Clean Code, fichiers maintenus limités à 200 lignes, tests à plusieurs niveaux, coverage backend et frontend d'au moins 90 %, sécurité et documentation à jour.

Le workflow attendu part du dernier `origin/main` dans une branche et un worktree dédiés, annonce le périmètre
dans le README, valide puis committe le changement et le resynchronise. Le Pre-push vers main exécute le gate
complet avant la publication et le nettoyage du chantier.

## Commandes qualité

Depuis PowerShell à la racine du dépôt :

```powershell
# limite de 200 lignes — commande utilisateur de référence
npm run check:lines

# quality:quick — informatif, retourne toujours 0 après les contrôles
npm run quality:quick

# quality:full — exhaustif, retourne 1 dès que le résultat global est non conforme
npm run quality:full
```

`check:lines` contrôle tous les fichiers maintenus manuellement, sans liste blanche d’extensions. `scripts/quality/files.ps1` est la définition exécutable unique des exclusions : métadonnées Git ; dépendances et environnements locaux ; répertoires nommés de build, coverage, rapports E2E et caches ; migrations Django, fichiers minifiés et source maps ; lock files explicitement reconnus ; fichiers binaires détectés par extension ou contenu.

PowerShell 7 (`pwsh`) peut remplacer `powershell.exe`. Les résultats utilisent les statuts `PASS`, `WARNING`, `FAIL informatif`, `FAIL` et `NON APPLICABLE`.

Active les hooks versionnés une fois par clone :

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-hooks.ps1
```

Le premier lancement backend effectue aussi cette activation. Des dispatchers physiques dans le répertoire Git
commun permettent au `post-checkout` cible de préparer ses runtimes sans partage, junction ni lien symbolique.

Le `pre-commit` lance `quality:quick` sans bloquer le commit. Pour une publication, le `pre-push` impose d'abord
la branche et le worktree dédiés, l'état entièrement commité, la destination `main` et la resynchronisation sur
le SHA distant annoncé par Git. Il lance ensuite `quality:full` et bloque le push en cas d'échec. Le workflow
[GitHub Actions](.github/workflows/quality.yml) appelle le même script en mode `full` par scope indépendant,
puis exige leur succès dans `Full quality gate`, sans réexécuter les contrôles.

`quality:quick`, `quality:full` et la CI réutilisent tous `npm run check:lines`. Le gate rapide produit réellement les coverages backend et frontend courants, tout en restant informatif. `quality:full` réutilise aussi l'orchestrateur `test:all` : il n'existe donc qu'une définition de la suite complète. Il ajoute les contrôles de secrets, cohérence, documentation, lint, formatage, migrations et le build/typecheck frontend. Les scopes CI sont documentés dans [CI parallèle](docs/quality/ci.md).

## Documentation

L’[index de la documentation](docs/README.md) donne accès à l’ensemble des références :

- [synthèse du backlog](docs/backlog/synthese.md) — point d’entrée du suivi d’avancement ;
- [architecture](docs/architecture/fundamentals.md) ;
- [qualité](docs/README.md#qualité) ;
- [backlog et gouvernance](docs/backlog/README.md).
