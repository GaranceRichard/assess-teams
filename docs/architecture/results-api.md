# Résultats : comparaison interéquipes pour une version

## Audit et modèle retenu

Le domaine `assessments` possède déjà `EvaluationFamily`, les versions exactes `Evaluation`,
`EvaluationRun` et `EvaluationRunQuestion`. Les modèles validés puis archivés sont immuables.
Aucun nouveau modèle, migration ou moteur de versionnement n’est nécessaire.
`application/results.py` réutilise `evaluation_runs_for` et expose une projection dédiée ;
les adapters API restent des vues DRF avec serializers et annotations `drf-spectacular`.

## Contrat de lecture

Session active par cookie ; aucune mutation et aucun endpoint par équipe/run/question.

- `GET /api/results/versions/` : `200`, tableau de `{id, family_id, family_name, version, organization_name}`.
  L’ID est celui de la version `Evaluation`, jamais celui de sa famille. Seules les versions ayant
  une passation `COMPLETED` accessible sont listées ; aucun filtre de statut du modèle n’exclut l’archive.
- `GET /api/results/versions/{evaluation_id}/` : `200`, `{axes, teams}`.
  `axes` contient `{question_id, index, text}` ordonnés par index de snapshot puis ID.
  `teams` contient `{team_id, team_name, run_id, completed_at, scores}` ; les scores entiers 0–10
  suivent exactement les axes. Aucune question de brouillon ni passation plus ancienne n’est envoyée.
- Anonyme/inactif : `403` ; version inconnue, inaccessible ou sans complétion accessible : `404`.
  Un snapshot inutilisable peut produire des équipes vides ; React affiche un état explicite.

Le schéma dynamique `/api/schema/` et Swagger `/api/docs/` documentent ces deux lectures et leurs erreurs.
Les paramètres d’identifiants supplémentaires ne sont pas des filtres et ne changent jamais le scope.

## Sélection et intégrité

Dans le scope autorisé, filtrer d’abord l’ID exact de version et `state=completed`.
Une sous-requête corrélée par équipe choisit `completed_at DESC, pk DESC`, puis un prefetch unique
charge uniquement les questions de ces runs. La collection de versions coûte une requête ; la projection
comparative coûte deux requêtes, indépendamment du nombre d’équipes (hors session/logs et lookup de version).
Les noms d’équipe sont les snapshots de la passation retenue ; les équipes archivées restent éligibles.

`completed_at` est la date métier initiale de complétion ; ni `due_date`, ni `created_at`, ni `revised_at`
ne la remplacent. Une révision autorisée modifie les scores du run retenu, sans changer cette récence.
Aucune agrégation ni fallback vers un ancien run. Le référentiel vient du premier snapshot retenu dans
l’ordre déterministe nom d’équipe/ID. Les autres snapshots doivent correspondre exactement en identité
de question, index et texte ; un snapshot vide, incompatible ou avec un score manquant est exclu.
Les API de passation normales garantissent ces invariants pour une version immuable.

## Autorisation

Superadmin : tous les runs ; Admin : son organisation ; Coach : ses runs assignés dans son organisation ;
Viewer : aucun run. Le menu `/results` est conservé pour tous les rôles, sans élargir les capacités backend.
Le Viewer obtient une collection vide et `404` pour toute version. L’autorisation précède le choix du run
le plus récent : un Coach ne reçoit jamais la dernière passation d’un autre assigné.
Les IDs forgés ne peuvent élargir ni les versions, ni les équipes, ni les questions retournées.

## React et radar

`ResultsPage` charge les versions, puis une projection par choix explicite. Aucun choix initial d’équipe.
Les réponses devenues obsolètes sont ignorées ; tout changement de version remet la sélection à zéro.
`ResultsRadar` utilise Chart.js 4 et react-chartjs-2 5, avec seulement l’échelle radiale, les éléments
ligne/point, remplissage et tooltip enregistrés. Pas de dépendance de dashboard.
L’échelle fixe 0–10 et les axes existent même avec zéro dataset. Les sélections modifient les datasets
directement en React. Les styles restent liés à l’équipe, avec trait, marqueur, numéro et légende datée.
Le thème adapte les textes et grilles. Les libellés longs sont abrégés autour du radar et affichés
intégralement dans un tableau sémantique contenant aussi les scores exacts.

Ce [PBI RESULT-001](../backlog/source/04a-results.md) compare uniquement une même version.
Comparaison temporelle, comparabilité v1/v2, moyennes, scores globaux, classement et exports restent hors périmètre.
