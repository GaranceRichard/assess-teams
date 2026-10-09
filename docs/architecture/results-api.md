# Résultats : radar et observations longitudinales

## Audit du main et choix retenus

Le main audité (base `e900f3d`) possède `EvaluationFamily`, les versions exactes `Evaluation`,
`EvaluationRun` et ses questions snapshotées, ainsi qu’un radar Chart.js 4/react-chartjs-2 5.
Les projections existantes sélectionnent la dernière complétion par équipe sur une version exacte.
Le scope Results conserve `evaluation_runs_for` pour Superadmin/Admin/Coach ; Viewer dispose
d’une lecture distincte des COMPLETED de son organisation, sans droit de passation.
La copie de version recréait les questions avec texte/index, sans filiation explicite entre leurs IDs.
Les journaux de copie ne prouvent pas la correspondance individuelle des questions historiques.

`Question.lineage_id` est un UUID technique non éditable. Une nouvelle question reçoit une nouvelle
lignée ; une copie conserve la lignée source ; renommer/réordonner un brouillon copié ne la change pas.
La DB impose une seule occurrence d’une lignée par version. `EvaluationRunQuestion.lineage_id`
fige cette identité au démarrage, en plus du texte, ordre et score ; une lignée est unique par run.
Supprimer une question de brouillon n’efface pas les snapshots existants ; leurs sources sont protégées.
Aucun rapprochement par texte, index ou position n’existe.

La migration `0013_question_lineage` attribue une lignée distincte à chaque question préexistante,
puis à ses snapshots via leur FK source démontrable. Deux copies historiques identiques restent
indépendantes. Les copies effectuées après migration conservent explicitement la lignée.
IDs, modèles, équipes, dates, scores, textes et provenance historiques sont conservés.
Le longitudinal peut ainsi être discontinu pour les anciennes versions, sans inventer une continuité.

## API de lecture actuelle

Session active par cookie. Lectures GET uniquement ; anonyme/inactif : `403`.

- `GET /api/results/organizations/` : `200`, `[{id, name}]`. Superadmin : organisations globales ;
  autres rôles : leurs rattachements. Cette collection ne donne aucun accès aux passations.
- `GET /api/results/families/?organization_id=ID` : `200`,
  `[{id, family_id, family_name, version, organization_id, organization_name}]`.
  `id` identifie la version radar, `family_id` le modèle à sélectionner. Chaque famille proposée
  possède au moins une `COMPLETED` accessible dans l’organisation. Sa plus grande version ayant
  des résultats accessibles est retenue, y compris archivée, indépendamment de la date de complétion.
  Une version plus récente sans résultat n’est pas retenue. ID absent/invalide : `400` ; hors scope : `404`.
- `GET /api/results/families/{family_id}/` : `200`, `{evaluation_id, version, axes, teams}`.
  La version radar est automatiquement recalculée dans le scope de l’acteur.
  `axes` contient `{question_id, lineage_id, index, text}` issus des snapshots ordonnés.
  `teams` contient `{team_id, team_name, run_id, completed_at, scores}` ; scores entiers 0–10.
  Famille inaccessible ou sans complétion accessible : `404`.
- `GET /api/results/families/{family_id}/criteria/{lineage_id}/?team_ids=ID&team_ids=ID` : `200`,
  `{lineage_id, criterion_text, teams: [{team_id, team_name, points}]}`.
  Chaque point contient `{run_id, team_name, completed_at, score, criterion_text, evaluation_id, version}`.
  Seuls les snapshots `COMPLETED`, avec score présent, de la même famille et de la lignée exacte
  sont lus pour les équipes sélectionnées. Ordre par `completed_at ASC, pk ASC`, un point par passation.
  Le texte observé, le score, le nom historique d’équipe et la date viennent des snapshots/runs.
  `version` provient de la FK exacte de version du run, jamais d’une version courante de substitution.
  Aucun ID d’équipe : séries vides. IDs répétés : dédupliqués. IDs mal formés : `400`.
  Critère absent des axes du radar courant ou équipe non éligible sur sa version : `404`.
  Une liste mêlant équipes accessibles et forgées est refusée intégralement.

Les anciens `GET /api/results/versions/` et `GET /api/results/versions/{evaluation_id}/` sont conservés
avec leur contrat exact de version et leurs réponses `{axes, teams}`, sans lignée ajoutée à ces axes.
Le schéma dynamique `/api/schema/` et Swagger `/api/docs/` décrivent paramètres, types, réponses et refus.

## Sélection, intégrité et coût

Radar = dernière position sur la dernière version de la famille ayant des résultats accessibles.
Après filtrage du scope et de la version, une sous-requête par équipe choisit
`completed_at DESC, pk DESC`. Les questions sont chargées par un prefetch unique (deux requêtes
pour la projection radar, hors lookup/session/logs). Les équipes archivées restent éligibles.
`due_date`, `created_at` et `revised_at` ne déterminent jamais cette récence.
Une révision modifie les scores conservés sans déplacer la date de complétion initiale.

Axes et noms proviennent du premier snapshot retenu dans l’ordre déterministe nom d’équipe/ID.
Les autres snapshots doivent correspondre exactement en question, lignée, index et texte.
Snapshot vide, incompatible ou incomplet : série exclue, sans remplacer le dernier run par un ancien.
L’API n’envoie aucune question du modèle courant pour reconstituer un résultat endommagé.

Longitudinal = observations historiques compatibles d’un critère, sans agrégation ni calcul d’évolution.
Une seule requête de snapshots avec jointure sur la version historique charge toutes les équipes sélectionnées,
après validation de leur éligibilité sur le radar. La continuité inter-version repose exclusivement sur
la lignée explicitement conservée. Les critères ajoutés ou retirés ne sont ni alignés ni reconstitués.
Les anciennes versions sans lignée commune démontrable ne sont pas fusionnées.

## Autorisation

Superadmin : global avec choix d’organisation ; Admin : organisation imposée ; Coach : uniquement
ses passations assignées dans son organisation ; Viewer : toutes les COMPLETED de son organisation,
indépendamment de l’assigné, en lecture seule. Son organisation est imposée dans l’UI.
Les menus et routes Utilisateurs/Équipes lui sont interdits ; leurs API administratives refusent Viewer (403).
Aucun droit de passation, de révision ou autre mutation métier n’est ajouté.
Le scope est appliqué avant le choix de version, du dernier run et des points historiques.
Un Coach ne reçoit pas une complétion plus récente d’un autre assigné. Les IDs de famille, lignée,
organisation et équipe ne peuvent élargir ce scope ni mélanger plusieurs organisations.

## React et graphiques

Parcours : Organisation → Modèle (famille) → Équipe(s) → Analyse / Restitution → Critère si temporel.
Sans intention URL de Pilotage, aucune organisation préchoisie pour le Superadmin ni équipe préchoisie ; l’organisation de l’Admin et du Viewer est imposée.
Changer d’organisation ou de famille remet à zéro les sélections et ferme le longitudinal.
Les réponses obsolètes des listes, du radar et de l’historique sont ignorées.

Le radar conserve axes et échelle 0–10 avec zéro série. Avec 1/N équipes, il conserve séries superposées,
styles par équipe, légende et dates. Analyse est un select natif contrôlé (Radar / Dans le temps),
étiqueté et lié au panneau affiché ; Restitution conserve Graphique / Données détaillées.
Les deux contrôles indépendants partagent les mêmes filtres et équipes. Le clavier natif pilote Analyse ;
les flèches, Home et End déplacent le focus et activent le choix dans Restitution.
Changer de restitution conserve le critère et les observations chargées. Le tableau radar reprend les scores et dates
des passations retenues, avec scroll interne uniquement en cas de dépassement. Les critères s’ouvrent
par clic sur leur libellé ou point dans le radar, ou par bouton clavier dans le menu
Historique par critère sous le radar et dans le tableau : ce clic active Dans le temps / Graphique.
Dans le temps propose un sélecteur de critère, sans continuité possible pour les axes sans lignée.
Sans critère choisi, un message invite à le sélectionner sans charger d’historique.
Le radar remplit la hauteur restante du panneau flex, sans hauteur fixe ni scroll de page desktop ;
ses libellés radar abrégés existants passent à la ligne selon la largeur disponible. Les textes
intégraux restent accessibles dans le tableau et le menu Historique par critère. Le mobile conserve le flux naturel.
Le longitudinal partage le conteneur flex responsive du radar : la note et la légende
réservent leur espace, puis le canvas remplit la hauteur restante. Données détaillées affiche uniquement
le tableau historique à scroll interne ; aucun empilement ni juxtaposition avec la courbe.
Les dates restent horizontales et leurs graduations suivent la largeur du canvas.
Le titre de l’axe des scores adapte sa police entre 10 et 12 px ; aucune donnée ni échelle ne change.
L’application et la démo composent le même ResultsHistory. Le mobile garde son flux naturel.
L’historique est chargé uniquement quand cette vue s’ouvre, et pour la sélection courante.
Le retour par le sélecteur Analyse garde organisation, modèle, équipes et restitution, sans recharger
la projection radar ni ajouter un bouton de retour. Le critère reste choisi pour la prochaine visite temporelle.

Le longitudinal réutilise Chart.js : X numérique en timestamps de complétion (espacement temporel réel),
Y fixe 0–10, une courbe par équipe, chaque point correspondant à une passation compatible.
Les segments droits relient les observations, sans lissage, point intermédiaire ni valeur calculée.
Le tableau sémantique contient une colonne par équipe sélectionnée, même sans observation compatible.
Chaque colonne est triée par date croissante, puis ID de passation à date égale, indépendamment des autres.
Une cellule contient `SCORE/10 (JJ/MM/AAAA - HH:mm)` ; les dates/heures restent locales au navigateur.
Les lignes correspondent au rang de l'observation dans chaque équipe, jamais à des dates communes.
Le nombre de lignes est celui de l'historique le plus long ; les cellules restantes sont vides.
Une absence de mesure ne devient jamais zéro ; un score mesuré de zéro reste `0/10`.
Équipe historique, version et texte observé sont conservés dans le title de l'entrée et le tooltip graphique.
Ce format est limité au tableau temporel ; les autres formats de dates/heures ne changent pas.
Sans observation, un état explicite remplace le graphique ; aucune date fictive n’est affichée.
Les thèmes jour/nuit et styles des équipes restent cohérents entre les deux vues.

## Périmètre et preuves

[RESULT-001 et RESULT-002](../backlog/source/04a-results.md) appartiennent à EPIC-006.
Tests backend : `test_viewer_results` (scope COMPLETED, refus admin/mutations, isolation),
lignées/copies/migration, choix de version, récence/tie-break, observations, isolation,
IDs forgés, paramètres et OpenAPI. React : états 0/1/N, chargement à la demande, retour, erreurs,
thèmes et réponses obsolètes. Playwright : radar courant et observations v1/v2 avec valeurs accessibles.
Moyennes, score global, classement, tendances calculées, objectifs, comparaison automatique sans filiation,
comparaison globale des versions, exports et édition depuis Results restent hors périmètre.
Le [Pilotage P0](steering-api.md) fournit une intention URL organisation/famille/équipe ; Results la valide
contre ses réponses accessibles et sélectionne seulement une équipe éligible sur sa version radar.
Une équipe source absente de cette version reçoit un message explicite ; les calculs restent inchangés.
