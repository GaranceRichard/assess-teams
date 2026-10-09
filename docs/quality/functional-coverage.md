# Inventaire des couvertures fonctionnelles

Cet inventaire complète la [stratégie de tests](test-strategy.md) et décrit les preuves par domaine livré.

Le parcours d'accès produit ajoute des tests API de connexion valide et invalide, de session protégée, de
déconnexion et de contrôle CSRF. Les tests frontend vérifient les menus exacts Admin, Coach et Viewer,
l'héritage des capacités, l'absence des entrées interdites et le refus des routes directes. Playwright exerce
le parcours critique navigateur → session Django → espace Viewer → déconnexion, ainsi que les refus de
connexion et de route Admin.

La [gestion du mot de passe](../architecture/password-management.md) ajoute API/ORM,
expiration/usage unique concurrent, limitations partagées, non-énumération, absence de secrets,
contrats OpenAPI/React et deux parcours Playwright avec email réel, rejeu refusé et sessions multiples.

Le bootstrap de développement vérifie séparément la création et l'authentification des trois identités
fictives, leurs fonctions, l'idempotence, la préservation des comptes existants et le refus défensif en
production. Un test de configuration garantit aussi que l'application de données locales n'est pas installée
par les réglages de production.

La gestion Superadmin couvre contrats API, permissions, invitations signées, notifications,
identifiant, attente et dialogues. Le [lifecycle USER-004](../architecture/user-lifecycle.md) ajoute
concurrence, sessions existantes, invitations, historique intact et responsabilités suspendues.
React et Playwright vérifient création, modification, désactivation et réactivation d’une identité,
ainsi que le menu Utilisateurs et les thèmes jour/nuit.

Le référentiel d’évaluation couvre l’attribution automatique des index de modèles et de questions, les
validations, les permissions, le contrat OpenAPI et la cascade. Playwright valide le CRUD complet sans champ
d’index, ainsi que la sélection immédiate d’un modèle nouvellement créé. Le cycle de vie couvre aussi la migration
des modèles planifiés, création en brouillon, validation complète/incomplète, états et transitions interdits,
immutabilité des modèles/questions, archivage logique et audit. React et Playwright vérifient les confirmations,
le filtrage des modèles planifiables et les références historiques après archivage ; l’API teste les requêtes
forgées, permissions Admin/Superadmin et refus inter-organisations.

La planification couvre les quatre cadences, la première échéance, le refus des doublons encore actifs, l’équipe active et
le cloisonnement organisationnel. Elle couvre aussi le responsable Coach ou Admin, l’auto-affectation du
Superadmin et son refus à un Admin, le rattachement atomique d’un Coach, le refus d’un responsable hors
organisation, les modifications et suppressions, les courriels de
confirmation et d’échéance, le lien produit et l’avancement calendaire des récurrences. Les tests React vérifient
les formulaires immédiat et récurrent, la ligne structurée et la suppression dans la modale ; Playwright
traverse la session Admin, le changement de fond au survol, l’ouverture de la ligne, la modification et la suppression.
La non-régression `test_evaluation_replanning*` couvre la replanification après complétion ponctuelle,
l’historique intact, les refus encore actifs et la migration sans perte de données.
`evaluation-replanning.spec.ts` complète puis replanifie le même modèle pour la même équipe, refuse
un doublon en attente et consulte les anciennes notes après la nouvelle complétion.

Les journaux sont couverts séparément : création après succès, absence de succès après refus ou échec,
snapshots historiques, tri, filtres, pagination et lecture seule. Les tests directs des endpoints prouvent les
scopes Admin/Superadmin et l’exclusion des logs système pour l’Admin. Le contrat des Logs couvre les niveaux,
les sources, la migration des erreurs historiques, le filtre de niveau et l’absence de corps de requête,
traceback, secret, token, cookie ou credential exposé. Les tests React vérifient en plus que INFO reste discret,
WARNING identifiable et que toute ligne ERROR reçoit le traitement rouge accessible en modes jour et nuit.

La passation couvre accès assigné/Admin/Superadmin, refus Viewer et hors organisation, ordre et snapshot des
questions, notes entières `0..10`, contraintes SQLite, sauvegarde/reprise, complétude, verrouillage après
validation, auteur/date initiaux et dernière révision. Les payloads forgés et les révisions invalides sont
refusés sans mutation partielle ni activité de succès. Les migrations reprennent les attentes existantes.
React vérifie le tableau, la modale, les bornes et notes affichées, la file de sauvegardes, les erreurs et
la révision. Playwright traverse Coach → reprise après rechargement → finalisation → consultation verrouillée
→ révision Admin → complétion à la place de l’assigné → Journal d’activité, en utilisant le range au clavier.
La passation vérifie aussi le prérequis `VALIDATED`, le refus des nouveaux démarrages sur brouillon/archive
et la reprise, complétion et révision de passations commencées avant l’archivage du modèle.
Une non-régression E2E vérifie aussi la réinitialisation répétée des fixtures avec passations protégées,
sans supprimer les données d’une autre organisation de test.
Les mutations revérifient l’accès après changement d’assignation, d’organisation ou de rattachement entre
lecture et verrouillage. React et Playwright vérifient que « Suivant » attend sa sauvegarde avant de naviguer.

L’extension HTTP des Logs couvre les succès CRUD, les refus PATCH, 4xx/5xx, la corrélation, le contexte sûr,
les filtres seuls/combinés, les bornes inclusives et les tentatives inter-organisations. React vérifie les dix
filtres, dépendances/reset, scopes et pagination ; Playwright crée les événements HTTP avant de les filtrer.

Les repères `EVAL-004` ajoutent `appreciation-markers.spec.ts` (range/reprise, absence de hover,
consultation immuable, mobile, thèmes/palettes et points alignés), `evaluation-versions.spec.ts`
(édition et texte v1 conservé après v2) et `demo-e2e/appreciation-markers.spec.ts` (édition locale/snapshot sans API).
L’ergonomie de passation préserve les onze notes au curseur, les seuls points explicitement définis,
le descriptif inférieur (6 affiche 5 mais persiste 6), le repli sans texte et les refus de sauvegarde.
`evaluation-taking-layout.spec.ts` mesure dimensions et navigation constantes à 1366×768,
1920×1080 et sur trois viewports mobiles, sans scroll desktop ordinaire ni overflow horizontal.
Les textes réellement longs partagent un seul scroll de contenu avec actions visibles ; les captures
clair/sombre complètent les assertions géométriques. Les tests unitaires des points et du hover
échouent avec l’ancien composant et passent avec les indicateurs passifs.
