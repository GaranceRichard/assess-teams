# Tests des résultats et versions historiques

Résultats : `test_results*` vérifie la récence métier, le tie-break, les snapshots ordonnés, les archives,
l’isolation et un nombre constant de requêtes. Les tests React couvrent 0/1/N équipes, styles, légende,
dates, désélection, changement d’organisation/famille et réponses obsolètes. `results.spec.ts` exerce le radar réel
avec deux équipes et deux complétions pour l’une, sans requête supplémentaire lors des sélections.
`ResultsTabs.test.tsx` couvre le partage des filtres/équipes, les dates/scores détaillés, le clavier,
la sélection vide et le refus de chargement. `ResultsViewsTransitions.test.tsx` et `ResultsLongitudinal.test.tsx`
couvrent les quatre combinaisons Analyse / Restitution, leur indépendance, le choix et la conservation
du critère, le drill-down vers la courbe, les lignées absentes et les refus sans données obsolètes.
`ResultsTemporalCorrection.test.tsx` couvre le switch Analyse contrôlé et le changement réel
des quatre vues, colonnes indépendantes, ordre chronologique/tie-break, historiques inégaux ou vides,
format local exact et distinction entre zéro mesuré et absence. `test_result_history_missing` protège
les scores absents et les textes identiques de lignées distinctes dans les séries API v1/v2.
`results-analysis.spec.ts` dans la démo vérifie Espace/Entrée, focus, état et description accessibles,
les deux thèmes, les libellés sur mobile et la réduction des animations, sans appel API.
`results-layout.spec.ts` mesure le canvas et les bornes
de chaque libellé sur huit viewports desktop, dont 1280×480, sans scroll de document/page/panneau radar ;
il vérifie le scroll interne du tableau, la conservation des sélections et l’accès mobile.
Le longitudinal ajoute les tests `test_result_longitudinal*` et `test_question_lineage*` : lignées
explicites, migration conservatrice, v1/v2, isolement et IDs forgés. `results-longitudinal.spec.ts`
vérifie le radar automatique, le chargement à la demande, les observations accessibles et le retour.
Les tests de layout longitudinal de l’application et du build statique partagent leurs assertions :
huit viewports desktop, texte du canvas non rogné, dates sans chevauchement, titre/légende contenus,
resize, mises à jour jour/nuit et changements de restitution, retour par Analyse, tableau seul scrollable
au clavier et flux mobile. Les assertions vérifient l’absence de tableau avec la courbe et inversement,
ainsi que la restitution détaillée radar après le retour depuis le tableau historique.
`test_viewer_results` et `viewer-results.spec.ts` protègent la consultation Viewer des COMPLETED de
son organisation, le longitudinal, les refus inter-organisations et l’absence d’accès/mutation admin.

Les versions historiques ajoutent `test_result_archived_versions` et
`test_result_version_selection_security` : choix exact, snapshots, équipes anciennes, familles entièrement
archivées, versions sans complétion, quatre rôles et refus sans substitution. React vérifie détails,
historique avec version explicite, remise à zéro et réponses obsolètes ;
`results-archived-versions.spec.ts` exerce v1 archivée → v2 et une famille entièrement archivée.
