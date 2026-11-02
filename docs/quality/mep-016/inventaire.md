# MEP-016 — Inventaire lexical et revue des refus

Base et méthode : [rapport de qualification](README.md). Termes observés dans les composants
réels, puis confrontés aux projections et aux contrats ; aucune nouvelle terminologie normative.
La cohérence signifie ici une correspondance au fait métier, sans imposer un mot unique à des vues
qui n’ont pas le même usage. Les différences « terminée » / « complétion » décrivent le même événement.

## Sources de lecture

- D : [DashboardPage](../../../frontend/src/DashboardPage.tsx),
  [DashboardActivity](../../../frontend/src/DashboardActivity.tsx),
  [projection Dashboard](../../../backend/assessments/application/dashboard.py),
  [contrat Dashboard](../../architecture/dashboard-api.md).
- P : [SteeringPage](../../../frontend/src/SteeringPage.tsx),
  [SteeringSummary](../../../frontend/src/SteeringSummary.tsx),
  [SteeringTeams](../../../frontend/src/SteeringTeams.tsx),
  [projection Steering](../../../backend/assessments/application/steering.py),
  [contrat Pilotage](../../architecture/steering-api.md).
- Sens de référence : [vision, quatre responsabilités](../../product/vision.md),
  [source F07 et refus](../../backlog/source/mess/f07.md).

## Occurrences Dashboard

| ID / occurrence exacte | Fait source et sens | Rôle / limite et résultat de revue |
| --- | --- | --- |
| D1 — « Tableau de bord », « Votre espace », « Mon profil » | Profil courant et accueil personnel ; aucune note personnelle | Toutes sessions actives ; le profil ne mesure pas la personne. Conforme |
| D2 — « Activité récente », « Évaluations terminées et révisées dans votre périmètre. » | `recent_activity`, événements `completed` et `revised` issus des COMPLETED accessibles via Results ; dix événements maximum | Admin/Coach/Viewer selon scope ; pas un historique exhaustif ni le journal administratif. Conforme |
| D3 — « Évaluation terminée », « Évaluation révisée » | `completed_at`/`completed_by_name` distincts de `revised_at`/`revised_by_name` ; même passation possible, dates et auteurs distincts | « Par … » exprime la provenance, pas une performance ; absent si auteur nul et toujours masqué au Viewer. Conforme |
| D4 — « Activité globale · organisation indiquée pour chaque événement. », « Organisation : » | `activity_scope=global`, organisation snapshotée pour chaque événement | Superadmin ; global signifie accès aux événements autorisés, pas agrégation de scores entre organisations. Conforme |
| D5 — « évaluation assignée » / « évaluations assignées » « à réaliser. », « Aucune évaluation assignée à réaliser. », « Mes évaluations » | `pending_assignments` : runs persistés réalisables, non COMPLETED, assignés à soi ; inclut dates futures, pas les récurrences non matérialisées | Admin/Coach métier uniquement ; aucun compteur d’organisation, de productivité ou de retard personnel. Superadmin/Viewer : compteur nul non exposé. Conforme |
| D6 — « Voir les résultats », « Pilotage », « Raccourcis utiles » | Liens `/results` et `/steering` sous droits existants | Résultats pour tous dans leur scope ; raccourci Pilotage conditionné à `role=Admin`. Le Superadmin canonique (`role=null`) y accède par la navigation du shell ; aucune promesse de mutation ou d’accès à toutes les équipes. Conforme |

## Occurrences Pilotage

| ID / occurrence exacte | Fait source et sens | Rôle / limite et résultat de revue |
| --- | --- | --- |
| P1 — « Pilotage », « Couverture et échéances du dispositif, pour orienter l’accompagnement. » | Finalité de lecture des faits du dispositif, distincte des observations Results | Admin/Superadmin ; aucun menu, plan d’accompagnement ou droit supplémentaire annoncé. Conforme |
| P2 — « Organisation », « Sélectionner une organisation », « Date de référence » | Une organisation à la fois ; `organization`, `as_of_date` backend | Admin imposé ; Superadmin sélection explicite ; pas de comparaison interorganisation. Conforme |
| P3 — « Équipes actives », « Avec un résultat », « Sans résultat » | `active_teams`, `teams_with_results`, `teams_without_results` ; les définitions précisent équipes actives et au moins une passation complétée accessible | Compter des équipes couvertes ne juge pas leur qualité, ni celle d’un Coach ; « sans résultat » ne vaut pas zéro. Conforme |
| P4 — « Évaluations en retard » | `overdue_evaluations` : passations attendues persistées non complétées, échéance strictement antérieure à la référence | Unité passation, plusieurs par équipe possibles ; aucun classement individuel. Définition présente. Conforme |
| P5 — « Dernière complétion », « Aucune complétion » | `last_completed_at` global ou `last_result.completed_at` par équipe ; clôture initiale ; définition : révision sans effet sur cette date | Même événement que D3 « terminée », autre granularité ; absence explicite. Conforme |
| P6 — « Coachs affectés », « Aucun Coach affecté » | `coaches` de l’équipe, affectations courantes cohérentes avec l’organisation | Identifie les interlocuteurs d’accompagnement ; ni auteur déduit, ni évaluation du Coach. Conforme |
| P7 — « Dernier modèle évalué », « Version exacte », « Aucun modèle évalué », « Non disponible » | `last_result.model_name` snapshoté et `version` du run complété le plus récent | Dans le contexte équipe/complétion, désigne le modèle utilisé pour l’évaluation d’équipe, pas une note de qualité du modèle. Aucun score de modèle affiché. Conforme en contexte |
| P8 — « Prochaine échéance », « Aucune échéance connue » | `next_due_date` minimale connue ; peut être passée | Ne promet pas une échéance future ni un calendrier exhaustif ; note explicative présente. Conforme |
| P9 — « État », « En retard », « Jamais évaluée », « À jour », « Détail », « Voir les résultats », « Aucun résultat » | Statut du dispositif : absence de COMPLETED prioritaire, sinon retard connu, sinon à jour ; lien Results si dernier résultat présent | La note précise « sans présumer de la qualité de l’équipe » ; Results réapplique ses droits et sa version par défaut, sans droit de révision induit. Conforme |

Les textes de chargement/erreur/vide restent techniques et bornés : « Impossible de charger… »,
« Aucune activité récente dans votre périmètre. », « Aucune organisation accessible. »,
« Aucune équipe active dans cette organisation. ». Ils n’annoncent ni zéro de performance ni nouvel accès.
« Comprendre les indicateurs », « Synthèse du dispositif » et « Équipes suivies » qualifient les régions
et l’aide présentes ; ils ne promettent pas de score ou de supervision individuelle.

## Matrice de responsabilité et portée des mots

| Rôle | Activité Dashboard | Assignations / raccourcis | Pilotage |
| --- | --- | --- | --- |
| Superadmin | Globale, organisation sur chaque événement ; pas d’organisation personnelle inventée | Sans assignations personnelles exposées ; Results ; Pilotage via la navigation du shell | Une organisation choisie, jamais synthèse interorganisation |
| Admin | COMPLETED accessibles de son organisation | Ses assignations réalisables ; Mes évaluations, Results, Pilotage | Son organisation imposée |
| Coach | COMPLETED actuellement assignées dans son organisation | Ses assignations réalisables ; Mes évaluations, Results | Refus de route et API ; aucun raccourci Pilotage |
| Viewer | COMPLETED consultables de son organisation ; auteurs masqués | Results seul ; ni passation ni compteur d’assignations | Refus de route et API ; aucun raccourci Pilotage |

Sans rattachement, le scope métier ne s’élargit pas ; un libellé de lien ne donne aucun droit.
Le mot « résultat » conserve le scope Results, sans promesse de révision ou de résultat exploitable
sur toute version. L’accompagnement reste une utilisation des constats par les acteurs autorisés.

## Refus de rédaction : attendu, action, observé

État initial : occurrence actuelle conservée. Action : confronter les deux formulations candidates
ci-dessous à la donnée réelle et aux droits. Résultat : deux refus éditoriaux, aucun changement d’UI.
Ces candidats sont des contre-exemples de revue, explicitement absents du produit livré.

| Cas / occurrence ciblée | Proposition évaluée | Écart précisément identifié | Décision / absence d’effet |
| --- | --- | --- | --- |
| R1 — P6, colonne « Coachs affectés » | « Performance des Coachs » | `coaches` contient des identités affectées à une équipe, aucun score ni observation individuelle ; transformer la provenance en mesure personnelle viole la vision et le refus F07 | **Non conforme, rédaction refusée** ; colonne actuelle conservée, aucun classement ou calcul ajouté |
| R2 — D6, raccourci Viewer « Voir les résultats » | « Évaluer toutes les équipes » | Le Viewer lit les COMPLETED de son organisation ; ni passation ni accès global. Le candidat promet simultanément mutation et extension de scope, incompatibles avec Dashboard et Results | **Non conforme, rédaction refusée** ; lien Results conservé, aucun droit ni route ajouté |

Si un changement futur du sens est demandé, fournir occurrence, donnée et rôle impactés à **C09**
avant adoption. Cette revue ne valide aucun nouveau sens ni extension de périmètre.
