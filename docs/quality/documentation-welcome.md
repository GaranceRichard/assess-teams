# Refonte de l’accueil et de la préparation documentaire

[Résultats de publication et correctif de portabilité du test](documentation-welcome-validation.md).

## Préparation du changement

- Périmètre : README, index et procédures d’accueil, règles documentaires, gate PowerShell et tests associés ; aucun code produit ni statut canonique.
- Objectif : rendre le produit et la démo immédiatement compréhensibles, conserver les informations dans leurs documents propriétaires.
- Effets attendus : préparer chaque lot technique dans son domaine sans édition systématique du README ; contrôler une trace observable et refuser les traces artificielles.
- Risques : perte de normes ou d’ancres, droits exagérés, confusion démo/production, faux positifs du gate, compatibilité des preuves historiques.
- Vérification : matrice de conservation, contrats et sources livrées, tests positifs/négatifs rouge/vert, liens/ancres, plan transverse et CI du SHA publié.
- Fichier : `scripts/quality/check-documentation.ps1`
- Fichier : `scripts/quality/documentation-policy.ps1`
- Fichier : `scripts/quality/check-agent-workflow.ps1`
- Fichier : `scripts/quality/tests/documentation.tests.ps1`
- Fichier : `scripts/quality/tests/run-tests.ps1`
- Fichier : `scripts/quality/tests/impact.test.mjs`
- Fichier : `scripts/quality.ps1`

Préparation rédigée le 12 novembre 2026 après audit de `origin/main` à
`2fedab80cdcff42325c6c1bfc06f5650c702c2ae`, avant modification des scripts.
Le mandat approuve la migration prospective ; les décisions et dérogations historiques restent intactes.

## Diagnostic initial

Le README initial compte 200 lignes et 30 324 caractères ; sa densité masque la limite de taille plutôt qu’elle ne facilite
la lecture. Licence en premier, démo dans le cadre technique, longs paragraphes de corrections UX,
qualifications, références MEP et règles de livraison mêlés aux capacités produit.
Les règles agents, la DoD, la charte et `check-documentation.ps1` imposent le README pour tout lot technique.
`check-agent-workflow.ps1` recherche même une formulation de publication dans le README.
Les scripts qualité sont classés transversaux par `impact-classification.mjs` : sélection exhaustive à conserver.

## Revue documentaire

AGENTS, règles agents, charte, DoD, stratégie, vision, architecture/API, démo, coûts et CI relus.
La pertinence des descriptions, le respect du préalable et la conservation normative seront revus
explicitement ; le diff final ne certifie ni la chronologie réelle ni la qualité sémantique.
La matrice de conservation et les résultats de validation complètent ce document avant publication.

## Matrice de conservation

Lecture du README de la base auditée, puis rapprochement des contrats et dossiers ci-dessous.
« Remplacer par un lien existant » signifie que le document propriétaire conserve déjà le détail ;
aucun historique n’est recopié, antidaté, réécrit ou supprimé. L’index documentaire assure leur découverte.

| Contenu retiré ou raccourci | Document propriétaire | Action | Vérification |
| --- | --- | --- | --- |
| Licence, NOTICE, redistribution MESS et tiers | [Redistribution](../legal/redistribution.md), [tiers](../legal/third-party.md) | Conserver dans le README | Mêmes fichiers, mêmes liens et licence Apache 2.0 |
| Finalité, continuité et accompagnement | [Vision](../product/vision.md) | Résumer et renvoyer | Ambition distinguée du socle, aucune performance individuelle |
| Démo, commandes et isolation | [Démo publique](../architecture/public-demo.md) | Résumer et renvoyer | Sources `DemoApp`, `store`, adaptateurs et fixtures relues ; HTTP 200 |
| Contrastes clairs et sombres, typographie | [Clair](light-theme.md), [sombre](dark-theme.md), [typographie](typography.md) | Remplacer par un lien existant | Mesures et preuves UX-01/02/03/04/05 conservées |
| Cahiers de recette MESS et UX | [Fonctionnel](functional-acceptance.md), [UX](ux-acceptance.md) | Remplacer par un lien existant | Définition de recette distincte d’une exécution cible |
| Chemin MESS, prérequis et jalon | [Pré-MEP](../backlog/planning/pre-mep.md), [prérequis](../operations/installation-prerequisites.md) | Résumer et renvoyer | Aucun GO ni statut modifié |
| Shell, pagination, navigation, marque et palettes | [Layout](../architecture/product-layout.md), [palettes](../architecture/interface-palettes.md) | Remplacer par un lien existant | 100dvh, dix accents, SVG, mode clair et repli décrits dans leurs contrats |
| Mobile et collections longues | [Clôture 049](mep-049/cloture.md), [017](mep-017/README.md), [clôture 017](mep-017/cloture.md) | Remplacer par un lien existant | Dates de clôture, correctifs et limites physiques conservés |
| Dashboard et vocabulaire des indicateurs | [Dashboard](../architecture/dashboard-api.md), [016](mep-016/README.md) | Résumer et renvoyer | Activité personnelle distincte du Pilotage et de la performance |
| Pilotage et qualification de lecture | [Pilotage](../architecture/steering-api.md), [rapport 048](../backlog/planning/qualification-mep-048/rapport.md), [clôture](../backlog/planning/qualification-mep-048/cloture.md) | Résumer et renvoyer | Couverture/échéances Admin/Superadmin, aucun score ajouté |
| Lifecycle réversible et Superadmin global | [Identités](../architecture/user-lifecycle.md) | Résumer et renvoyer | Dernier Admin actif, réaffectation et provenance conservés |
| Journaux, conservation et purge | [Journaux](../architecture/journals-api.md), [durées](../operations/configuration/journal-retention.md), [purge](../operations/journal-purge.md) | Remplacer par un lien existant | Audit/Logs séparés, aucune durée métier décidée |
| Radar, versions, critères, observations temporelles | [Results](../architecture/results-api.md), [hiérarchie](results-hierarchy.md), [015](mep-015/README.md) | Résumer et renvoyer | Version exacte, archives, lignées et absence de zéro inventé préservées |
| Qualité sémantique des résultats et états vides | [046](mep-046/README.md), [047](mep-047/README.md), [clôture 050](mep-050/cloture.md) | Remplacer par un lien existant | Réserves et décisions distinctes de la recette MESS |
| HTTP, permissions et accès indirects | [HTTPS](../architecture/http-security.md), [rôles](../architecture/role-permissions.md), [accès](../architecture/indirect-access.md) | Résumer et renvoyer | Matrice API et refus existants ; aucun export métier annoncé |
| Dialogues, transitions et acceptation C21 | [Dialogues](../architecture/dialog-accessibility.md), [transitions](ux-transitions/README.md), [C21](../backlog/planning/audit-20261027/anomalie-transitions.md) | Remplacer par un lien existant | Réduction d’animations, focus, limites Linux et acceptation ouverte conservés |
| Courriels, refus et reprises de formulaires | [Notifications](../architecture/email-notifications.md), [051](mep-051/README.md) | Remplacer par un lien existant | Succès métier indépendant de SMTP |
| Configuration, secrets et démarrage | [Inventaire](../operations/configuration/README.md), [contrôles](../operations/configuration/startup-security.md) | Remplacer par un lien existant | Défauts et refus production demeurent propriétaires |
| CI/npm, rationalisation et décisions C06 | [Correctif](ci-npm-20261106/README.md), [rationalisation](validation-rationalisation/README.md), [012](mep-012/qualification.md) | Remplacer par un lien existant | Historiques, réserves npm et validations explicites en attente conservés |
| Partitionnement, protections et mesures CI | [Backend](backend-ci-performance.md), [043](mep-043/README.md), [CI](ci.md), [mesures CI](ci-performance.md) | Remplacer par un lien existant | Circuit direct et indépendance du SHA inchangés |
| SQLite, transactions et concurrence | [Transactions](../architecture/sqlite-transactions.md), [SQLite](../operations/sqlite/README.md), [contention](../operations/sqlite/contention.md), [conflits](../operations/sqlite/critical-conflicts.md) | Remplacer par un lien existant | DELETE/FULL, limites et preuves multiprocessus conservés |
| Socle Django/DRF, React/TypeScript, tests | [Fondamentaux](../architecture/fundamentals.md), [requirements](../../backend/requirements.txt), [manifest frontend](../../frontend/package.json), [tests](test-strategy.md) | Résumer et renvoyer | Versions portées par les manifests, aucune dépendance ni technologie modifiée |
| Isolation, authentification, mot de passe | [Isolation](../architecture/organization-isolation.md), [API](../architecture/backend-api.md), [mots de passe](../architecture/password-management.md), [connexion](../architecture/login-security.md) | Remplacer par un lien existant | Session, CSRF, quotas et exceptions publiques inchangés |
| Hiérarchie des identités, droits et limites USER-002/003 | [API](../architecture/backend-api.md), [source identités](../backlog/source/01-identites.md) | Résumer et renvoyer | Coach ne crée pas de compte ; Admin ne gère pas ses pairs |
| Organisations et équipes, périmètres TEAM/C04 | [Équipes](../architecture/teams-api.md), [registre](../backlog/tracking/pbis.md) | Résumer et renvoyer | Aucun accès Coach Équipes ni réactivation annoncé ; statuts inchangés |
| Attentes réseau et réponses inversées | [018](mep-018/README.md), [décision](mep-018/decision-20261109.md), [dérogation](mep-018/cloture.md) | Remplacer par un lien existant | Dérogation README historique explicitement conservée |
| Repères, cycle des modèles, versions et planification | [Repères](../architecture/appreciation-markers.md), [versions](../architecture/evaluation-versioning.md), [fondamentaux](../architecture/fundamentals.md) | Résumer et renvoyer | Brouillon/validation/archive, index automatiques, responsables et notifications confirmés |
| Passation, tri, curseur, complétion et révision | [Passation](../architecture/evaluation-taking.md), [013](mep-013/README.md), [044](mep-044/README.md), [045](../backlog/planning/qualification-mep-045/cloture.md) | Résumer et renvoyer | Pointeur désactivé, null/0/5, ordre avant pagination, provenance et CI historique conservés |
| Installation, commandes séparées, ports et Superadmin | [Développement](../development-environments.md) | Déplacer vers le document compétent | Complément d’installation ajouté ; routes détaillées déjà dans le contrat API |
| Tests globaux, seuils et commandes ciblées | [Commandes](test-commands.md), [stratégie](test-strategy.md) | Résumer et renvoyer | Orchestrateur, échecs et 90 % conservés |
| Quality-first, 200 lignes et hooks | [Validation](validation-costs.md), [agents](agent-rules.md), [DoD](definition-of-done.md) | Déplacer vers le document compétent | Commandes/hooks relogés, préparation corrigée prospectivement |
| Preuves réutilisables, nightly et qualification | [Validation](validation-costs.md), [mesures](validation-measurements.md), [CI](ci.md) | Remplacer par un lien existant | Ni expiration ajoutée, ni seuil réduit, ni décision MESS |
| Renvois répétés aux mêmes contrats et preuves | Documents propriétaires ci-dessus | Retirer une répétition démontrée | Liens d’origine comparés à la matrice ; aucun dossier historique supprimé |
| Ajout README intégré pendant le chantier par `f400a8e` | [Incident CI/SQLite](ci-incident-20261111/README.md) et [contention](../operations/sqlite/contention.md) | Remplacer par un lien existant | Renvoi conservé dans l’index ; tests, assertions, timeouts et preuves de ce chantier intégralement préservés |

## Vérification produit et découverte

Hiérarchie finale : proposition de valeur et démo, pourquoi, cinq usages, publics, scénario de démo,
état/limites, développement/contribution, index/licence. Aucun badge, logo ou visuel inventé.
Les contrats livrés de modèles, passations, Results, Pilotage et rôles sont rapprochés des sources
`backend/assessments`, `backend/identities`, `frontend/src/demo/DemoApp.tsx`, `store.ts` et adaptateurs.
Les ambitions d’accompagnement ne sont pas présentées comme un workflow livré.
Le README final compte 142 lignes et 8 889 caractères, soit environ 71 % de texte en moins.

Le contrôle final des liens Markdown hors blocs de code couvre 432 documents et 4 661 références internes :
aucun chemin ni ancre manquant. Les 15 anciennes sections du README conservent leur ancre ; les liens
connus dans vision/règles/charte/stratégie pointent désormais vers les sources propriétaires appropriées.
L’ancienne ancre absente `état-actuel` est également conservée comme alias ; la vision utilise la nouvelle.
Les 76 destinations du README initial sont rapprochées de la matrice et du README final. Les deux renvois
indirects restants sont le [workflow CI](../../.github/workflows/quality.yml) décrit dans `ci.md` et la
[CI historique de 045](https://github.com/GaranceRichard/assess-teams/actions/runs/41098527407), conservée dans sa clôture.
Les liens entrants extérieurs au dépôt ne sont pas inventoriables exhaustivement ; les alias limitent ce risque.

La démo publique répond HTTP 200 sans redirection à l’URL du mandat (`curl.exe -IL --max-time 30`).
L’entrée HTML française et les ressources JavaScript/CSS qu’elle référence répondent également HTTP 200.
L’hôte de contrôle navigateur est indisponible dans la session : aucun rendu navigateur prétendument validé.
Le code et le contrat confirment données fictives en mémoire, profil Admin, passation/résultats/Pilotage,
aperçus administratifs, rechargement/reset et absence d’API. Le gate E2E reste requis par le plan transverse.

Les champs GitHub About `description` et `homepageUrl` étaient vides lors de la lecture par `gh repo view`.
Ils méritent la signature produit et l’URL de démo ; aucune modification de métadonnées n’est incluse ici.

## Ancienne et nouvelle règle

Avant : README systématique dans un lot technique, sans contrôle du contenu ni preuve de chronologie.
Après : préparation ajoutée complète, document propriétaire, référence exacte à chaque fichier technique,
revue explicite de pertinence et du préalable réel. Le README suit seulement son impact public.
Les gates, la classification transverse et la CI indépendante restent bloquants ; aucune rétroactivité.

## Preuves rouge et verte

Commande : `node scripts/run-powershell.mjs scripts/quality/tests/documentation.tests.ps1`.
Avant correction, le checker de `2fedab8` échoue sur sept attentes : architecture sans README,
README cosmétique, script qualité documenté, lot mixte couvert, configuration racine sans trace,
préparation stagée et committée. Les succès indus sont donc aussi reproduits, pas seulement des refus.
Après correction : les 24 scénarios passent, dont les vrais refus listés dans la politique.
Une vérification supplémentaire protège HEAD, index/checkout et configuration du dépôt appelant.
Le script de tests est intégré à `run-tests.ps1` ; deux cas supplémentaires dans `impact.test.mjs`
vérifient que modifier les deux scripts du gate reste exhaustif. Les 21 tests de cette suite passent.

## Revue de contenu avant publication

Revue effectuée par l’agent : préparation rédigée avant les modifications techniques, adéquation du dossier
qualité à ce changement de gate, champs substantiels et fichiers couverts, absence de remplissage artificiel.
README, AGENTS, règles, charte, DoD, stratégie, architecture, API et CI rapprochés ; aucun contrat applicatif
ne change. Les historiques de qualification restent des preuves datées, même quand ils citent l’ancienne règle.
La revue humaine d’acceptation dispose de cette matrice, des différences et des preuves ; aucune approbation
humaine supplémentaire n’est revendiquée par le contrôle automatique.

## Périmètre des fichiers

- Accueil et navigation : `README.md`, `docs/README.md`, `docs/development-environments.md`, `docs/product/vision.md`.
- Règles : `AGENTS.md`, `docs/quality/agent-rules.md`, `definition-of-done.md`, `quality-charter.md` et la nouvelle `documentation-policy.md` dans ce dossier.
- Références de validation : `docs/quality/ci.md`, `test-strategy.md`, `validation-costs.md` et le présent rapport.
- Gate : `scripts/quality.ps1`, `scripts/quality/check-documentation.ps1`, `check-agent-workflow.ps1` et le nouveau `documentation-policy.ps1` dans `scripts/quality/`.
- Tests : `scripts/quality/tests/run-tests.ps1`, `impact.test.mjs` et le nouveau `documentation.tests.ps1` dans ce même dossier.

Aucun fichier backend, frontend, E2E, dépendance, migration ou registre canonique n’est modifié.
Ni clôture TEAM, ni arbitrage C04/C06, ni décision MESS ; aucune preuve historique supprimée.
L’accès navigateur reste la limite de vérification manuelle de la démo ; sa présence HTTP et ses contrats
sont vérifiés, et ses tests automatisés restent requis. Les métadonnées About ne sont pas modifiées.

## Validation du lot

Le plan réel est exhaustif : repository, backend, frontend et E2E, sans domaine écarté.
Les tests qualité/bootstrap/scopes/licences/agrégation/validation/matrice et le gate dépôt passent.
La première tentative s’arrête ensuite avant le backend : `npm.ps1` est interdit par la politique
PowerShell du processus. Relance avec `PSExecutionPolicyPreference=Bypass` limitée au processus,
conformément aux lanceurs du dépôt ; aucune politique système, aucun seuil ni contrôle modifié.
Le backend a été exécuté avec `quality:targeted -- --only backend` ;
le pré-push recalcule indépendamment le plan complet et vérifie les preuves selon leurs entrées exactes.

Avant resynchronisation : 1 496 tests backend passent en 1 436,81 s, couverture 97,51 %.
Le 13 novembre, resynchronisation avec `f400a8e` publié pendant l’interruption : seul conflit README,
résolu en conservant sa nouvelle vitrine et en référençant le dossier CI/SQLite dans l’index et cette matrice.
Les changements backend de ce commit restent ceux de `main`, pas du présent mandat. Leur présence
invalide la preuve backend précédente : les validations finales sont recalculées avant le push par le pré-push,
puis indépendamment par la CI du SHA publié. Aucun résultat antérieur n’est présenté comme preuve finale.
La clôture documentaire CI `6090c02` est ensuite reprise sans conflit ni modification de ses quatre fichiers.

## Incident du premier pré-push et correction

Le premier `npm run publish` a été refusé avant tout push : la fixture PowerShell nouvellement ajoutée
héritait des variables Git du hook. `git -C` ne suffisait pas à isoler son dépôt temporaire ; l’index et
HEAD du chantier ont reçu deux commits de fixture, et des réglages Git partagés ont été altérés.
La garde a détecté le candidat modifié. Les fichiers du checkout principal n’ont pas été modifiés.

Restauration depuis le commit conservé `e2a2a95`, par reset mixte limité au chantier, sans suppression
de fichiers ; réglages `bare`, identité locale et `autocrlf` rétablis à leur état effectif antérieur.
Le checkout principal reste propre, les autres branches et worktrees ne sont ni nettoyés ni déplacés.
La fixture sauvegarde désormais les variables retournées par `git rev-parse --local-env-vars`, les retire
de son processus puis les restaure en `finally`, selon le mécanisme déjà utilisé par les tests bootstrap.
Elle compare aussi HEAD, état index/checkout et configuration du dépôt appelant avant/après.

Preuve verte : exécution avec `GIT_DIR`, `GIT_WORK_TREE` et `GIT_INDEX_FILE` du chantier explicitement
injectés : les 24 scénarios et la vérification de non-mutation passent. Le pré-push complet est relancé,
sans suppression de gate ni contournement ; l’incident et son refus restent consignés ici.

La seconde tentative passe le dépôt mais échoue sur 115 setups pytest avec `WinError 5` dans
`.cache/tmp/pytest-of-garan`, créé sous le compte sandbox de la première campagne. Aucun test métier
concerné n’a démarré. Ce répertoire et `backend/.pytest_cache` sont archivés sous un autre nom, uniquement
dans ce worktree, sans changer les ACL ni exclure de test. Les 24 tests `test_backend_coverage.py`
passent ensuite sous le compte de publication ; la campagne complète est relancée sur le même périmètre.
