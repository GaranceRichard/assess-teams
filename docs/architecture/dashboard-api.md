# Dashboard personnel — DASH-001

`/dashboard` est l’accueil des sessions connectées depuis `/`. Il comporte Mon profil,
Activité récente et Raccourcis utiles. Il ne calcule aucun score, moyenne, classement ou indicateur
analytique ; Results, Pilotage et Journal restent des pages distinctes.

## Audit de main et choix de source

Audit réalisé depuis `origin/main` (`51574e0`) avant les changements applicatifs.

| Existant | Conséquence pour le dashboard |
| --- | --- |
| User hérite d’AbstractUser ; nom/prénom existent, souvent vides | Lire first_name/last_name, sinon username ; aucune édition de compte |
| Session Django, IsAuthenticated, rôle effectif Admin pour Superadmin | Garder la session ; présenter Superadmin séparément sans organisation personnelle |
| Organisation unique Admin/Coach/Viewer ; équipes actives du Coach dans la session | Réutiliser SessionUserSerializer pour le contexte courant |
| evaluation_runs_for : global Superadmin, organisation Admin, assignations Coach | Réutiliser ce scope pour les assignations personnelles |
| completed_results_for : même scope, plus COMPLETED organisationnels pour Viewer | Réutiliser ce scope pour l’activité accessible |
| EvaluationRun : completed_at/by_name conservés, revised_at/by_name remplacés à chaque révision | Deux événements distincts démontrables : complétion initiale et dernière révision |
| Noms organization/team/evaluation snapshotés ; FK Evaluation protégée, version immuable | Afficher ces snapshots et la version exacte référencée, même après archivage/version suivante |
| Journal : actions métier mais aucun lien structuré vers le run | Ne pas parser les descriptions ni inventer les anciennes révisions |
| Logs : audit HTTP technique | Aucune utilisation comme source métier |
| Steering : projection des actifs ; Results : snapshots et historique par lignée | Ne pas les dupliquer ni calculer leurs projections dans l’accueil |
| PalettePicker : PATCH session, choix optimiste et rollback | Déplacer l’UI ; conserver le cycle de préférence dans ProductShell |
| Navigation : /dashboard pour tous, /evaluations Admin/Coach, /steering Admin | Raccourcis conformes ; aucune nouvelle capacité |
| Vision et backlog : suivi continu, séparation Results/Pilotage/Journal | Accueil personnel rattaché à FEAT-001, sans déclarer le pilotage élargi livré |

## API read-only

`GET /api/dashboard/` exige une session Django active (`cookieAuth`). Réponse `200` :

- `profile` : représentation de session existante plus `first_name`/`last_name` ;
- `activity_scope` : `global` pour Superadmin, `accessible_results` sinon ;
- `recent_activity` : au plus dix événements ;
- `pending_assignments` : nombre personnel Admin/Coach, `null` pour Viewer/Superadmin.

Chaque événement contient `run_id`, `type` (`completed` ou `revised`), `organization_id`,
`organization_name`, `team_name`, `model_name`, `version`, `occurred_at` et `author_name` nullable.
Une session absente/inactive reçoit `403`. POST/PUT/PATCH/DELETE reçoivent `405` avec session/CSRF
valides. Aucun corps, filtre, identifiant cible ou paramètre de scope n’est défini ; les paramètres
supplémentaires sont ignorés et ne changent jamais le périmètre. OpenAPI documente cette projection.

## Scopes et provenance

| Acteur | Activité | Auteur | Assignations personnelles |
| --- | --- | --- | --- |
| Superadmin | Globale ; chaque ligne indique explicitement son organisation snapshotée | Oui | Non exposées |
| Admin | COMPLETED de son organisation actuelle | Oui | Ses seules assignations réalisables |
| Coach | COMPLETED qui lui sont actuellement assignées dans son organisation | Oui | Ses seules assignations réalisables |
| Viewer | COMPLETED consultables via Results dans son organisation | Toujours masqué | Non exposées |

Une vérification supplémentaire exige que équipe, modèle et passation relèvent de la même organisation.
La perte du rattachement ou de l’assignation Coach retire immédiatement l’activité lors du prochain GET.
Les archives restent consultables dans le même scope historique que Results.

Deux requêtes bornées à dix passations chacune lisent respectivement les complétions et révisions ;
la fusion conserve les dix événements les plus récents, par date décroissante, PK du run décroissante,
puis type décroissant en cas d’égalité. Une transaction englobe la lecture de la projection.
Le compteur lit uniquement les EvaluationRun persistées non COMPLETED, assignées à l’utilisateur,
sur équipe active et contexte cohérent. Une NOT_STARTED exige un modèle VALIDATED ; une IN_PROGRESS
reste reprenable après archivage. Les dates futures sont incluses. Aucune attente n’est créée à la lecture.

## Interface et limites livrées

Mon profil présente les noms présents, sinon l’identifiant actuel, le rôle et l’organisation courante.
Superadmin n’a aucune organisation personnelle. Les équipes actives du Coach restent visibles uniquement dans son organisation actuelle,
y compris dans la session réutilisée : un ancien lien Coach–équipe ne révèle plus une équipe étrangère.
Apparence reprend les dix accents du main resynchronisé (`2c49f5f`), dont Vert/Bleu/Rose/Rouge ;
le mode clair/sombre reste dans
le header avec l’identité légère et la déconnexion. Le stockage utilisateur et PATCH CSRF sont inchangés.
`usePalettePreference` vit dans le shell : navigation et remontage du dashboard conservent le choix,
l’écriture en cours, le retour serveur et le rollback ; déconnexion et changement de compte restent isolés.

Mes évaluations apparaît pour les rôles métier Admin/Coach, Voir les résultats pour tous,
Pilotage pour Admin/Superadmin. Le compteur n’est pas une vue des attentes de
l’organisation et ne prédit aucune récurrence non encore matérialisée.

L’activité ne garantit pas un historique exhaustif : seule la dernière révision est structurée sur le run.
La complétion reste un événement distinct mais peut sortir de la limite des dix derniers événements.
Aucune date n’est déduite de created_at et aucun auteur manquant n’est remplacé par l’assigné.
Les dates ISO sont affichées en français avec le fuseau du navigateur ; les valeurs persistées restent intactes.
L’accueil recharge au montage ou après Réessayer, sans rafraîchissement temps réel. Loading, erreur et vide
sont explicites ; les palettes restent utilisables en cas d’échec de lecture du dashboard.

## Validation et revue documentaire

API/ORM : provenance réelle, révisions répétées, snapshots, versions, tri/limite, scopes forgés,
relations incohérentes, perte d’accès, lecture seule et OpenAPI. React : profil, rôles, états, retry,
réponses obsolètes et navigation/palette en cours. Playwright : rôles, refus Viewer, mobile,
clair/sombre, raccourcis clavier, persistance existante et déplacement du sélecteur.

README, API, fondamentaux, palettes, stratégie de tests et backlog sont concernés. Vision, règles des
agents, charte qualité et DoD ont été relues et restent applicables sans modification.
Aucun modèle Django ni migration n’est ajouté.
