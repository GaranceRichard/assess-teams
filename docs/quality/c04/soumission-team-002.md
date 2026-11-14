# TEAM-002 — Soumission séparée de clôture

Soumission du 2026-11-13 après qualification complète, publication et CI verte.
Décision demandée : approuver séparément la clôture canonique de TEAM-002.
Statut **Ouvert**, date **N/A** conservés jusqu’à votre décision explicite.

Code publié : [`09e305a1215300ea59ded1cb13e5a23e87639e70`](https://github.com/GaranceRichard/assess-teams/commit/09e305a1215300ea59ded1cb13e5a23e87639e70).
[CI indépendante du SHA exact : succès](https://github.com/GaranceRichard/assess-teams/actions/runs/43542234233).
[Validations finales](validations.md#validation-finale-et-publication-réussie--2026-11-13) :
1 539 tests backend, 494 frontend, 151 E2E applicatifs et 10 E2E de démo ; couvertures conformes.

| Critère canonique | Preuve disponible |
| --- | --- |
| Liste Superadmin globale et Admin locale | Tests équipes existants, isolation et matrice de rôles ; parcours Admin conservé. |
| Coach actif : affectation et organisation courantes | test_coach_team_reads : périmètre, session après retrait, désactivation et rôle courant. |
| Identité minimale, chaque équipe une fois | Projection exacte et tests de pagination sur 25 affectations et 25 équipes cachées. |
| Archives absentes de la liste active | Tests avec archive affectée et include_archived=true ; filtre Logs Admin préservé. |
| Vide valide et explicite | API simple et paginée, React Dashboard, parcours coach-team-reads. |
| Nouvelle équipe affectée visible au prochain appel | Création Admin réelle puis lecture Coach ; aucune attribution implicite sans affectation. |
| Refus sans divulgation ni mutation | Organisation étrangère/inexistante, Viewer/anonyme/inactif, refus de création/édition/archivage et état métier inchangé. |

Le contrat source porte la consultation backend. Aucun nouvel écran administratif n’est
ouvert ; le contexte Coach existant présente explicitement le vide. TEAM-006 reste distinct.
La préparation initiale relevait de l’ancienne règle README ; la normalisation du bloc
propriétaire après développement est déclarée dans le contrat, sans antériorité inventée.

Approbation sollicitée : **TEAM-002 uniquement**. La décision sur l’autre PBI
reste indépendante. Cette soumission ne modifie ni TEAM-006, ni C03/C05, ni les arbitrages
Organisation ; elle ne vaut pas approbation humaine implicite de la chronologie documentaire.
