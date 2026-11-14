# TEAM-003 — Soumission séparée de clôture

Soumission du 2026-11-13 après qualification complète, publication et CI verte.
Décision demandée : approuver séparément la clôture canonique de TEAM-003.
Statut **Ouvert**, date **N/A** conservés jusqu’à votre décision explicite.

Code publié : [`09e305a1215300ea59ded1cb13e5a23e87639e70`](https://github.com/GaranceRichard/assess-teams/commit/09e305a1215300ea59ded1cb13e5a23e87639e70).
[CI indépendante du SHA exact : succès](https://github.com/GaranceRichard/assess-teams/actions/runs/43542234233).
[Validations finales](validations.md#validation-finale-et-publication-réussie--2026-11-13) :
1 539 tests backend, 494 frontend, 151 E2E applicatifs et 10 E2E de démo ; couvertures conformes.

| Critère canonique | Preuve disponible |
| --- | --- |
| Superadmin global et Admin local | Tests détail sur actif/archivé et organisation absente/étrangère. |
| Coach actif actuellement affecté et membre courant | test_coach_team_reads : deux états, affectation, appartenance et session courantes. |
| Quatre champs exclusivement | Projection exacte id/name/organization_id/is_active et schéma strict en lecture seule. |
| État actif ou archivé explicite | Même identité relue après archivage, is_active=false ; affectation conservée requise. |
| Inexistant et inaccessible : même 404 | Corps identique, aucun contexte d’équipe cachée dans le Log ; ID hors plage contrôlé. |
| Ancien lien ou assignation de passation sans droit supplémentaire | Retraits, ancien rattachement et passation en cours/complétée sans affectation d’équipe. |
| Aucune écriture métier ni élargissement des mutations | Comparaison de toutes les données métier, une seule capture HTTP ; Coach ne peut toujours ni créer, modifier, ni archiver. |

Les refus d’authentification ou de rôle Viewer restent 403 avant recherche ; les ID mal
formés conservent le 404 du routeur documenté. TEAM-005/006/007 et C03/C05 restent distincts.
La préparation initiale relevait de l’ancienne règle README ; la normalisation du bloc
propriétaire après développement est déclarée dans le contrat, sans antériorité inventée.

Approbation sollicitée : **TEAM-003 uniquement**. La décision sur l’autre PBI
reste indépendante. Cette soumission ne modifie ni TEAM-006, ni C03/C05, ni les arbitrages
Organisation ; elle ne vaut pas approbation humaine implicite de la chronologie documentaire.
