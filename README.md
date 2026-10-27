# Assess teams

## Licence et réutilisation

Assess Teams est distribué sous **[Apache License 2.0](LICENSE)** ; voir le [NOTICE](NOTICE).
[Conditions de fork et redistribution, notamment au MESS](docs/legal/redistribution.md) ; [licences tierces](docs/legal/third-party.md).

## Vision produit

**Assess Teams** vise à transformer l’évaluation ponctuelle des équipes en un dispositif continu d’évaluation, d’accompagnement et de pilotage de leur progression dans le temps.
Des modèles maîtrisés et versionnés, des évaluations planifiées et traçables et un historique fiable doivent aider les Coachs et chaque Organisation à agir sur des résultats observables, sans réduire une équipe à un score. La [Vision produit](docs/product/vision.md) fixe cette direction et la distingue du socle livré.

## Cadre actuel

[MEP-019](docs/quality/light-theme.md) corrige les contrastes démontrés du thème clair dans les dix palettes et rend la sélection de modèle explicite, avec mesures et captures avant/après UX-02/03/04 ; surfaces, typographie, préférences et contrastes sombres sont préservés. [MEP-030](docs/quality/functional-acceptance.md) définit 18 scénarios de recette fonctionnelle MESS : rôles, jeux fictifs, attentes, vrais refus et preuves, avec capacités ouvertes et arbitrages distincts ; aucune recette cible exécutée par ce cahier. Le [cahier UX MEP-067](docs/quality/ux-acceptance.md) conserve ses mesures. [MEP-053](docs/quality/typography.md) harmonise typographie, hiérarchie et densité avec preuves UX-01/05, deux thèmes et zoom navigateur 200 % ; la passation conserve son maximum desktop de 600 px sous Linux et les dix palettes. Le [chemin MESS](docs/backlog/planning/pre-mep.md) conserve MEP-019 (contrastes clairs), MEP-052 (sombre), installation en parallèle et jalon MEP-035 ; MEP-055 attend D01–D09.

[Démo interactive](https://GaranceRichard.github.io/assess-teams/) : shell React réel, données fictives locales, passation, radar et Pilotage sans compte ni serveur. `npm run dev:demo` et `npm run build:demo` sont isolés du build normal ; [architecture, limites et publication](docs/architecture/public-demo.md).

Le [shell desktop](docs/architecture/product-layout.md) occupe 100dvh, borne les collections avec pagination serveur, adapte le mobile et conserve des surfaces neutres en mode clair. En mode jour uniquement, la navigation renforce le conteneur de la page sélectionnée (accent plein, texte et icône blancs) et le fond des bandeaux pour identifier immédiatement la position courante, dans les dix palettes et les deux états de la sidebar. La sidebar partagée avec la démo ancre le bouton de repli en bas ; les icônes centrées ne débordent plus horizontalement et seule la navigation scrolle en faible hauteur.
Le [Dashboard personnel — DASH-001](docs/architecture/dashboard-api.md) remplace le placeholder :
profil, apparence, dix complétions/dernières révisions accessibles et raccourcis par rôle.
Il réutilise la provenance EvaluationRun et les scopes Results, sans scores ni droits supplémentaires.

USER-004 livre le [lifecycle réversible des identités](docs/architecture/user-lifecycle.md), sans perte d’historique et avec protection du dernier Admin actif. Les validations E2E acceptent des ports dédiés pour isoler les worktrees.

[Pilotage P0 — STEER-001](docs/architecture/steering-api.md) livre `/steering` pour Admin/Superadmin :
équipes actives, complétions, retards et liens Results, via une projection backend read-only.
Aucun score global, classement ou indicateur de performance individuelle n’est calculé.

Le produit fait de l'Organisation la frontière d'administration : le Superadmin est global et [sans appartenance](docs/architecture/user-lifecycle.md#superadmin-global-sans-appartenance), avec migration des liens historiques ; un Admin rattaché à une organisation unique administre ses membres non-Admin, ses équipes et ses modèles, jamais les Admins pairs. Le bandeau de navigation vertical associe une icône à chaque entrée et peut être replié puis déplié ; les icônes repliées révèlent leur libellé au survol. Le composant de marque intègre le SVG corrigé fourni, dont la flèche est espacée du « e » : symbole agrandi et proportionné au nom Assess teams, espacement compact et centrage vertical en vue ouverte, symbole lisible en vue repliée. Le dessin et ses proportions sont préservés ; `currentColor` suit le texte clair/sombre, sans changer la typographie, les bandeaux ni le layout.
Le [contrat des journaux](docs/architecture/journals-api.md) sépare audit métier et Logs HTTP/applicatifs, avec consultation cloisonnée et données sensibles exclues.
MEP-042 configure leur [conservation par type](docs/operations/configuration/journal-retention.md) : durées validées au démarrage et preuves métier protégées en attente des arbitrages MESS. MEP-020 ajoute une [purge technique planifiable](docs/operations/journal-purge.md), simulée par défaut, bornée, traçable et reprenable, consommant cette politique sans modifier les durées.

La vue Radar / Graphique des Résultats retire le menu dépliant « Historique par critère » ; les critères restent accessibles par le radar, les données détaillées et la vue Dans le temps. Les [Résultats](docs/architecture/results-api.md) séparent Analyse (Radar / Dans le temps) et Restitution (Graphique / Données détaillées), avec filtres et équipes communs, dans l’application réelle et la démo. Le contrôle Analyse devient un switch compact inspiré du mode jour/nuit, avec libellés Radar / Dans le temps visibles, curseur animé et accès clavier ; la vue temporelle présente une colonne par équipe : observations chronologiques `SCORE/10 (JJ/MM/AAAA - HH:mm)`, cellules restantes vides, sans alignement de dates ni zéro inventé. Les quatre combinaisons affichent une seule restitution à la fois : graphiques dimensionnés dans le shell fixe et tableaux à scroll interne. Le critère sélectionné est conservé lors des transitions. Une sélection explicite propose toutes les versions ayant des résultats accessibles, y compris archivées, après organisation et famille ; la dernière reste choisie par défaut. Radar, détails et éligibilité temporelle utilisent la version exacte consultée, sans modifier calculs, récence ni accès. L’aide de lecture rappelle le choix des archives et conserve la version consultée lors de son ouverture. Un clic sur un critère ouvre Dans le temps / Graphique ; la continuité inter-version exige une lignée explicite, sans agrégation ni rapprochement implicite. La direction artistique et le mode sombre sont conservés. [MEP-014](docs/quality/results-hierarchy.md) améliore la hiérarchie visuelle des Résultats : contexte organisation/modèle/version, équipes et provenance autorisée identifiables dans Analyse et Restitution, avec preuves avant/après ; graphiques, calculs, sélection et droits préservés. Chantier isolé de MEP-044 (notation). MEP-046 clarifie l’échelle, le zéro mesuré, l’absence, la récence métier et les limites de continuité et de comparabilité dans les quatre vues ; [audit et preuves UX-09](docs/quality/mep-046/README.md). Calculs, données et droits préservés ; composants de notation MEP-013 hors périmètre.

Le [MEP-002 — HTTPS, proxy et CSRF](docs/architecture/http-security.md) impose HTTPS en production, protège cookies et CSRF, valide proxys et origines, et conserve HTTP local.

Le [MEP-005 — Accessibilité des dialogues](docs/architecture/dialog-accessibility.md) harmonise l’accessibilité de tous les dialogues : focus initial et contenu, retour au déclencheur ou à un repère pertinent, fermeture par Échap selon les protections existantes, titres et descriptions accessibles. Les saisies et les parcours métier restent protégés, sans refonte graphique ni changement du curseur de notation. Les [transitions douces](docs/quality/ux-transitions/README.md) ajoutent des entrées sobres aux pages, questions et dialogues, immédiates en réduction des animations ; focus, sauvegardes et géométrie MEP-013/044 sont conservés. La recette Linux du zoom natif à 200 % est fiabilisée avec le navigateur complet déjà disponible, sans évolution du pipeline.

MEP-004 fiabilise les [notifications par courriel](docs/architecture/email-notifications.md) : file persistante locale, reprises SMTP bornées, prévention des doublons et suivi administratif, sans remettre en cause une opération métier validée ni ajouter de service externe obligatoire.

La configuration de production s’appuie sur l’[inventaire MEP-036](docs/operations/configuration/README.md) et les [contrôles de démarrage MEP-009](docs/operations/configuration/startup-security.md) : paramètres, défauts et risques documentés ; secrets absents/faibles, DEBUG, SMTP et proxy dangereux refusés, avec protection et rotation des secrets.

[MEP-037 — Permissions par rôle](docs/architecture/role-permissions.md) confronte les actions API et la navigation aux rôles canoniques et aux exceptions publiques MEP-008 : matrice explicite, refus sans effet et correction des seules protections manquantes, sans modifier les acquis MEP-011. [MEP-038 — Accès indirects et exports](docs/architecture/indirect-access.md) qualifie filtres, liens profonds et relations historiques selon MEP-011/037 : aucun défaut démontré ni export métier existant ; preuves complétées sans modification applicative.

MEP-055 prépare le [contrat des prérequis d’installation MESS](docs/operations/installation-prerequisites.md) : exigences démontrées, propositions et validations MESS en attente, sans installateur ni qualification d’une cible.

## Validations proportionnées

Le [correctif du backend CI MEP-037](docs/quality/backend-ci-performance.md) remplace le job complet séquentiel par huit partitions partagées avec la qualification exhaustive, rééquilibrées depuis les JUnit réels. La collection complète, la couverture globale et tous les contrôles bloquants sont conservés. Le correctif bloquant CI de MEP-011 versionne les modes exécutables des hooks et vérifie que leur installation laisse le candidat Git propre sous Linux. Preuves sans expiration temporelle et classification SQLite/sécurité différenciée : correction ciblée du pipeline, avec ses protections conservées. Les tests de cache isolent les chargeurs du runner et vérifient le frais forcé pour les entrées externes ; les seules sorties TypeScript cartographiées sont exclues des octets installés. Les fixtures des workers utilisent des signaux atomiques par processus. Le [dispositif de validation](docs/quality/validation-costs.md) sépare le retour rapide, les tests ciblés selon le risque et les preuves complètes. Il sérialise la publication des worktrees et mesure les réexécutions. Tests, seuils et contrôles de sécurité sont conservés ; la [CI parallèle](docs/quality/ci.md) et son [bilan mesuré](docs/quality/ci-performance.md) restent documentés. MEP-043 est finalisée selon les critères révisés du 2026-10-21 : aucune PR sauf demande explicite, publication directe sur main, pré-push bloquant, CI du SHA publié et synchronisation sûre ; limite CI après intégration acceptée et réserve G05 non bloquante. Le [suivi des protections et du nettoyage](docs/quality/mep-043/README.md) conserve les preuves utiles de la PR retirée et les limites du contrôle CI après intégration ; l’audit MEP-012 reste un acquis. Les tests de configuration restent indépendants de l’état Django et de l’ordre des shards ; les probes SQLite sont isolées pour terminer leurs auxiliaires avant la fusion de couverture.

## Socle technique

- Backend : Python 3.12+, Django 5.2, Django REST Framework 3.16, `drf-spectacular` et SQLite permanent en production. [MEP-003 — Transactions métier](docs/architecture/sqlite-transactions.md) préserve atomicité, Journal et données antérieures. [MEP-039 — Concurrence](docs/operations/sqlite/README.md) fixe DELETE/FULL, timeout 5 s et connexions API/workers, avec 126 mesures sur fichier et limites documentées ; [MEP-010](docs/operations/sqlite/contention.md) borne les reprises sûres et diagnostique les refus multiprocessus ; [MEP-040](docs/operations/sqlite/critical-conflicts.md) qualifie les conflits métier de finalisation, versionnement et protection du dernier Admin, avec concurrence multiprocessus, atomicité et provenance préservées.
- Frontend : React 19, TypeScript 5.9 et Vite 8.
- Tests : pytest, Vitest, React Testing Library et Playwright.
- Qualité : Ruff, ESLint, Prettier et coverage bloquant à 90 %.

[MEP-011 — Isolation organisationnelle](docs/architecture/organization-isolation.md) contrôle lectures et mutations, identifiants forgés, sessions après rattachement et historique ; les anciens liens ne révèlent plus les données courantes hors organisation et les exceptions Superadmin sont bornées. MEP-008 renforce les [permissions API](docs/architecture/backend-api.md) : authentification obligatoire par défaut, accès publics déclarés explicitement et conservation des permissions métier existantes. Le bootstrap distingue `development` et `production`, réconcilie les identités sans doublon et permet d'afficher ou masquer le mot de passe sans l'altérer. La [gestion sécurisée du mot de passe](docs/architecture/password-management.md) ajoute la récupération publique et la modification dans Mon profil, avec validateurs Django, liens à usage unique et politique des sessions. MEP-001 — [sécurisation de l'authentification](docs/architecture/login-security.md) limite les échecs par identifiant et origine, explicite la restriction temporaire sans révéler les comptes, restaure l'accès après expiration et configure les proxies de confiance on-premise.

## Périmètres livrés — identités et accès

La [création technique Superadmin et l'invitation Admin](docs/architecture/backend-api.md#gestion-hiérarchique-des-identités) restent distinctes.

Les sessions actives accèdent aux menus et routes autorisés selon Admin > Coach > Viewer.
Le Superadmin Django reçoit les capacités Admin ; Coach et Viewer retrouvent leur organisation au Dashboard,
le Coach ses équipes actives. Équipes reste réservé aux Admins ; la déconnexion invalide la session.
La page Utilisateurs administre les identités et leurs invitations ; elle affiche `—` pour le Superadmin, conserve les cellules Actions et centre les badges Actif/Désactivé dans les thèmes et palettes. Un toggle illustré
soleil/lune conserve le mode jour/nuit. Dans Mon profil → Apparence, le sélecteur [Couleurs](docs/architecture/interface-palettes.md) propose dix accents : les bandeaux sidebar/header clairs suivent une teinte lumineuse plus perceptible de la palette, le fond central devient un gris très clair subtilement teinté et les cartes restent blanches. Cette évolution des seuls tokens LIGHT conserve le layout, le shell, les scrolls, la pagination et les préférences. Le Dashboard clair conserve sa hiérarchie compacte et son fonctionnement ; le mode sombre conserve ses surfaces, accents et préférences ; [MEP-052](docs/quality/dark-theme.md) harmonise les bordures des champs, les sélecteurs et la piste de notation après vérification des dix palettes. La couleur choisie reste indépendante du mode et persiste par utilisateur dans la session backend (défaut vert). Le panneau de choix doit rester contenu dans le viewport mobile avec les métriques de police Linux. Le chargement initial de la planification ignore les réponses obsolètes.

La gestion actuelle des utilisateurs suit la hiérarchie : le Superadmin gère les autres comptes sans agir sur le sien,
l'Admin gère uniquement les Coachs et Viewers de son organisation, le Coach gère les Viewers de son
organisation. Le Viewer consulte uniquement les résultats COMPLETED de son organisation, sans accès Utilisateurs ni Équipes. Seul le Superadmin crée, affecte, modifie, désactive ou réactive un Admin.
Sans organisation, un Coach ne voit aucun utilisateur et un Viewer aucun résultat ; le Coach ne change jamais une fonction. Les comptes désactivés conservent leurs références ; les planifications non closes exigent une réaffectation explicite, même après réactivation. Les contrats `nom`/`prénom` restent ouverts dans USER-002/003.

## Périmètre livré — gestion des organisations et équipes

Le Superadmin crée et supprime physiquement les organisations. Un Admin consulte et renomme uniquement son organisation,
et peut en gérer les Coachs et Viewers sans jamais modifier les Admin qui y sont rattachés.
Le menu Équipes permet de choisir une organisation accessible, puis de créer, renommer, archiver ses équipes et de leur affecter un ou plusieurs Coachs de cette organisation. Les archives ne sont pas encore consultables ou réactivables. Une organisation utilisée par une passation commencée est protégée contre la suppression ; les autres dépendances restent soumises à l’arbitrage produit.

## Périmètre livré — modèle d’évaluation

Les [repères d’appréciation](docs/architecture/appreciation-markers.md) associent chacun un score entier 0–10 à un texte : édition en brouillon, copie par version, snapshot au démarrage, curseur accessible au clavier/mobile et démo fictive. La correction ciblée impose une sélection unique obligatoire dans l’éditeur et le bouton « Enregistrer le repère » ; la validation serveur est vérifiée, les repères historiques, versions et calculs sont conservés, sans migration.
Les modèles suivent le cycle irréversible `DRAFT → VALIDATED → ARCHIVED` : validation et archivage explicites,
immutabilité du modèle et de ses questions après validation, planification limitée aux modèles validés.
Les Superadmins administrent les évaluations de toutes les organisations ; les Admins administrent uniquement celles de leur organisation.
Les index des évaluations et questions sont attribués automatiquement, sans champ de saisie pour l’utilisateur.
Ils planifient pour une équipe un modèle immédiat, fixe, mensuel ou trimestriel, notifié par e-mail. Chaque planification peut être confiée à un Coach ou à un Admin actif de la même organisation ; le Superadmin peut aussi se désigner lui-même. Chaque ligne suit `ORGANISATION - ÉVALUATION - ÉQUIPE - RESPONSABLE` et ouvre la modification et la suppression. Une référence existante reste visible après archivage ; sa modification exige un modèle validé. Les modèles sont regroupés en familles organisationnelles avec versions linéaires : création v1 brouillon, copie explicite en nouvelle version, archivage automatique de l’ancienne version active lors de la validation. Le planning affiche famille/version ; les passations conservent leur référence historique et leurs snapshots. La [stratégie de versionnement](docs/architecture/evaluation-versioning.md) précise migration et concurrence. Le radar Résultats propose toutes les versions avec résultats accessibles, dont les archives, et choisit la dernière par défaut ; le longitudinal suit les lignées explicites ; Pilotage lit couverture et échéances sans recalculer Results.

## Périmètre livré — passation des évaluations planifiées

Correction UX ciblée : les boutons indisponibles de la modale de passation conservent un pointeur normal et leur aspect désactivé, en clair comme en sombre. Les validations, sauvegardes et protections contre les réponses implicites sont préservées. Le tri de la liste des évaluations priorise les passations à faire ou en cours, de la plus ancienne à la plus récente, puis présente les passations terminées par complétion décroissante. Le tri est déterministe et appliqué avant pagination, sans modifier les dates, les statuts, les filtres ni les droits. [MEP-013](docs/quality/mep-013/README.md) corrige la notation selon UX-07/08 : aucune attribution par Entrée sur un curseur vierge, Suivant bloqué sans réponse explicite, onze positions numériques 0–10 toujours visibles et sélectionnables au-dessus de la piste. Le focus suit la question et reste accessible au clavier ; passation, révision, reprise, snapshots, repères passifs et actions stables sur refus sont conservés ; les écarts Linux de hauteur (<600 px) et de focus sont corrigés puis revalidés, sans changement des calculs, des API ni des confirmations MEP-045.

[MEP-044](docs/quality/mep-044/README.md) rend l’échelle entière 0–10 visible et accessible avant toute réponse et indique la valeur réelle du repère inférieur, avec preuves clair/sombre, clavier et mobile ; les snapshots, calculs et sauvegardes sont conservés. Le libellé compact préserve aussi le maximum desktop de 600 px sous Linux. MEP-007 garantit une notation explicite : une question sans réponse reste non renseignée, distincte de 0 et de 5. Le curseur 0–10 et les repères sont conservés ; seules les notes choisies sont enregistrées, la reprise préserve les réponses et la finalisation exige toujours la complétude métier. La route `/evaluations` propose un parcours de passation persistante des modèles planifiés : l’assigné répond aux questions ordonnées, reprend un brouillon et finalise ses notes de 0 à 10. Le tableau distingue l’assigné de l’auteur réel de la complétion. Dans son organisation, un Admin peut compléter à la place de l’assigné puis réviser une évaluation finalisée sans altérer l’auteur ni la date initiaux ; la dernière révision reste attribuée et datée. Les finalisations et révisions significatives alimentent le Journal d’activité existant. Après une passation ponctuelle complétée, une équipe peut replanifier le même modèle : une nouvelle passation indépendante conserve l’historique et les anciens résultats. Les planifications encore actives bloquent les doublons.

## Installation en développement

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

La commande de référence pour tous les tests du dépôt est `npm run test:all`.

Elle délègue à `scripts/test-all.ps1`, exécute successivement backend, frontend et E2E, affiche leur résultat séparément et retourne `0` uniquement si tout ce qui est applicable passe. Elle contrôle les seuils backend et frontend de 90 % et indique explicitement les niveaux non applicables. En CI ou avec PowerShell 7, le même orchestrateur peut être appelé par `pwsh ./scripts/test-all.ps1`.

Les [commandes ciblées backend, frontend et E2E](docs/quality/test-commands.md) complètent cette suite.

La [stratégie de tests](docs/quality/test-strategy.md) détaille les preuves backend, React et Playwright par parcours, dont la conservation historique et les invariants USER-004.

## Approche quality-first

Le projet traite la qualité comme une condition de livraison : Clean Code, fichiers maintenus limités à 200 lignes, tests à plusieurs niveaux, coverage backend et frontend d'au moins 90 %, sécurité et documentation à jour.

Le workflow part du dernier `origin/main` dans une branche et un worktree dédiés, annonce le périmètre dans le README, valide de façon ciblée puis committe. `npm run publish` sérialise resynchronisation, Pre-push vers main, publication et fast-forward sûr du checkout principal ; nettoyer ensuite uniquement ce chantier.

## Commandes qualité

Depuis PowerShell à la racine du dépôt :

```powershell
# limite de 200 lignes — commande utilisateur de référence
npm run check:lines

# quality:quick — statiques informatifs, sans tests ni coverage
npm run quality:quick

# quality:targeted — sélection automatique ; quality:full reste exhaustif
npm run quality:targeted
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
le SHA distant annoncé par Git. Il calcule ensuite les contrôles requis par le diff et bloque tout échec. La
[CI sélective](.github/workflows/quality.yml) utilise le même plan, indépendamment des preuves locales.
`publish` attend sa réussite ; [limite du push direct, nightly et qualification MESS](docs/quality/ci.md).

`quality:targeted` sans argument sélectionne automatiquement les contrôles ; les tests explicites restent disponibles. Documentation pure : aucun test applicatif. Risque sensible ou inconnu : sélection conservatrice. `quality:full` conserve tous les contrôles, `quality:qualify -- SHA` qualifie exhaustivement le candidat MESS ; la nightly quotidienne conserve les mêmes seuils. Voir [matrice et preuves](docs/quality/validation-costs.md) et [mesures](docs/quality/validation-measurements.md).

## Documentation

L’[index documentaire](docs/README.md) regroupe les références et le suivi du backlog.
