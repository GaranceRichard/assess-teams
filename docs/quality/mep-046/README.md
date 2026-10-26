# MEP-046 — Clarifier les scores et les indicateurs

Recette ciblée [UX-09](../ux-acceptance.md), réalisée le 2026-10-23 par Codex.
Référence auditée : `4492dc8` (MEP-014). Candidat : fichiers de cette livraison ;
la clôture et le SHA publié seront consignés après les gates et la CI verte.

## Audit et corrections limitées

| Ambiguïté constatée | Correction |
| --- | --- |
| Échelle graphique sans signification textuelle commune aux quatre vues | Aide « Scores 0–10 : mode d’emploi », toujours accessible près de Restitution ; bornes entières, note par critère et interprétation selon les repères du modèle |
| Zéro mesuré présent mais cellules historiques vides inexpliquées | Exemple explicite 0/10 mesuré, légende « Vide : aucune observation à ce rang » et explication des colonnes indépendantes |
| « Dernière version » et dates sans règle de récence lisible | Aide : numéro de version le plus élevé avec résultats accessibles, puis dernière complétion initiale par équipe sur cette version ; ni échéance, création ou révision ne redatent ce choix |
| « Lignée explicite » technique et invitation à consulter une évolution | Observations historiques et limites expliquées : même modèle/critère relié, anciennes versions sans lien séparées, critères ajoutés/retirés non reconstitués, segments sans progression continue démontrée |

Les calculs, agrégations, séries, dates, sources, données, contrats et droits sont inchangés.
Aucune moyenne, note globale, tendance ou valeur intermédiaire n’est ajoutée.
Les cellules restent vides, les notes réellement mesurées restent 0/10.
Aucun repère universel « bon/mauvais » n’est inventé pour les bornes.
La modale réutilise `Modal` et sa gestion de focus ; les styles restent limités aux Résultats.
Le contexte et la provenance MEP-014, les filtres et l’unique restitution sont conservés.
MEP-015 (dessin du radar) et MEP-047 (comparaisons) restent hors périmètre.

## Contrats, refus et accès

Audit des sélections dans `results.py` et `result_history.py`, confronté à `results-api.md`.
Les tests existants vérifient le choix de version, la récence malgré création/révision/échéance,
le zéro réel, l’absence de score, les lignées étrangères et les snapshots incompatibles.
`test_result_history_missing` refuse de combler les absences ou de relier des textes identiques.
`ResultsTemporalCorrection` conserve les colonnes triées séparément et les séries entièrement vides.
`ResultsPageErrors` vérifie les erreurs sans version ni provenance de résultat affichée.
`ResultsScoreReading` reproduit l’absence d’aide sur la référence :
[échec avant correction](regression-before.txt), puis réussite sur le candidat.
Le test couvre les quatre vues, une vraie note 0 et une cellule vide, sans requête supplémentaire.
Les refus Viewer/admin/hors organisation restent contrôlés par `viewer-results` et les tests API.
Les réponses Results autorisées restent l’unique source ; aucun auteur ni donnée administrative ajouté.

## Preuves visuelles et fonctionnelles

Chromium Playwright, Windows, Admin fictif Results E2E ; modèle Radar E2E v1/v2,
Équipes A/B, dates fixes de septembre/octobre 2026. Aucun compte de production.
Les captures [avant](before/) proviennent du scénario existant `results-longitudinal`,
exécuté sans correction ; les [après correspondants](after/longitudinal-light.png)
reprennent la même fixture, le viewport 1280 × 720 et la palette bleue du scénario.
Les identifiants de passation varient avec la base jetable ; scores et dates métier restent identiques.
Ce ne sont pas des comparaisons automatiques pixel à pixel.

La recette finale `results-score-reading` fixe explicitement Vert puis les deux thèmes :
1280 × 720, 1920 × 1080, 1280 × 480, 390 × 844 ; zoom 100 %.
[32 lignes UX-09](after/measurements.jsonl), une par combinaison Analyse/Restitution/format/thème,
avec captures et mesures de largeur, limites de la modale et couleurs réellement rendues.
Chaque ligne vérifie : zéro mesuré et cellule vide dans le tableau temporel,
provenance historique, aide ouvrable par Entrée, texte complet atteignable par défilement,
Échap et retour du focus, sélection conservée et aucune requête Results lors de l’aide.
Le document ne déborde pas horizontalement ; contraste du corps de l’aide ≥ 4,5:1.

- [Aide desktop claire](after/day-1280-720-radar-chart-help.png).
- [Données temporelles sombres mobiles](after/night-390-844-history-details.png).
- [Aide en faible hauteur](after/day-1280-480-radar-chart-help.png).
- [Radar clair](after/day-1280-720-radar-chart.png).

Revue visuelle : hiérarchie et provenance préservées ; aide secondaire soulignée,
modale défilable sans rogner les informations, score zéro distinct de la cellule vide.
En faible hauteur, le libellé compact « 0–10 » conserve le nom accessible complet.
Le premier candidat réduisait le canvas temporel à 66,5 px (minimum existant >70 px) :
ce candidat a été refusé, puis le test de géométrie existant passe après compactage.
Le gate complet du 2026-10-23 détecte ensuite une régression dans la démo à 820 × 600 :
canvas de 50,1875 px. Reprise le 2026-10-26 : le libellé compact s’applique désormais
à toutes les largeurs desktop en faible hauteur ; le test existant de la démo repasse.
Aucun seuil, graphique ni composant de notation n’a été modifié.
La palette de recette a été fixée explicitement pour éviter l’héritage d’un test bleu.
Le zoom natif et les dix palettes ne sont pas une nouvelle recette MEP-046 ; les acquis
MEP-014 sont préservés et les tests existants restent dans le gate, sans certification globale UX.

## Validation et DoD

- Tests ciblés React : 5 fichiers, 22 tests passants ; lint, formatage et typecheck passent.
- E2E : résultats, historique, longitudinal, Viewer et recette UX-09 exécutés ;
  le test de géométrie passe sur le candidat corrigé, sans seuil affaibli.
- Le plan du diff exige un exhaustif conservateur (captures et preuves non classifiables).
  Le gate de publication doit donc valider backend, frontend, application et démo.
- Revue documentaire : README annoncé avant code puis intégré au paragraphe Résultats
  pour respecter les 200 lignes ; règles agents, charte, DoD, stratégie de tests,
  fondamentaux, API/OpenAPI et cahier UX relus ; contrat de présentation Results actualisé.
- Aucune modification backend, migration ou contrat : nouveaux tests de contrat non applicables.
  Les contrats et refus existants restent couverts par les gates requis.
- Coordination MEP-013 : worktree inspecté en lecture seule ; aucun fichier applicatif commun.
  README et suivi du backlog sont les seuls chevauchements documentaires possibles,
  à réconcilier avec le dernier origin/main via le circuit `npm run publish`.
- Aucun changement Git, hooks, scripts de validation, CI, composant de notation ni PR.

Livraison non clôturée tant que le pre-push, la CI du SHA publié et la synchronisation sûre
ne sont pas confirmés. Cette recette ne clôture aucun PBI voisin ni aucun GO MESS.
