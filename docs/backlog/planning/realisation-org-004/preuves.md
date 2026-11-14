# ORG-004 — Preuves de réalisation et proposition de clôture

[Préparation et décision](README.md) ; base de travail `c82f4e416a848020c2c6b3996e95772109083eaa`.
Tests sur données fictives et bases locales isolées, jamais sur les données du checkout principal.
La décision A/R01–R09 est rendue ; ce document ne sollicite aucun nouvel arbitrage.

## Critères et scénarios couverts

| Cas / règles | Comportement et assertions | Tests reproductibles versionnés |
| --- | --- | --- |
| S01 / R01 | Organisation admise, suppression physique, comptes/rôles et autres liens intacts ; création réelle avant suppression | [test_organization_delete](../../../../backend/tests/test_organization_delete.py), [provenance](../../../../backend/tests/test_organization_delete_provenance.py), [E2E](../../../../frontend/e2e/organization-deletion.spec.ts) |
| S02 / R02 | Équipe active sans aucune évaluation : 400, identité et M2M inchangés | [policy](../../../../backend/tests/test_organization_delete_policy.py), paramètre active=True |
| S03 / R02 | Archive seule également bloquante ; aucun effet de destruction, de réactivation ou de retrait de Coach | Même test active=False ; E2E archive après premier refus puis répète le refus |
| S04 / R02 | Famille seule et versions DRAFT/VALIDATED/ARCHIVED avec questions/repères préservées | policy : famille vide et chaque état ; snapshot DB complet |
| S05 / R02/R05 | Quatre modes de plans avec/sans assigné, sans run ; NOT_STARTED conservé ; sept états de notification bloquants et liens indirects | policy : modes/assignee/flags, états, organisation NULL avec lien équipe/modèle/plan |
| S06 / R02 | IN_PROGRESS avec notes, COMPLETED avec révision et snapshots ; historique/provenance inchangés, même graphe incohérent indirect | policy : tous états et graphes mixtes ; [isolation historique](../../../../backend/tests/test_isolation_history.py) et tests existants de résultats/archives en campagne complète |
| S07 / R03/R04/R05 | Origine durable entre homonymes, ancien nom non réécrit, Log HTTP après suppression, consultations Superadmin seules et filtres n’élargissant pas le scope | provenance ; [migration](../../../../backend/tests/test_journal_origin_migration.py), [React provenance](../../../../frontend/src/OrganizationTraceProvenance.test.tsx) ; notification personnelle seule admise |
| S08 / droits acquis | Admin/Coach/Viewer/anonyme/CSRF refusés sans effet et sans inventaire ; cible inconnue 404 | [contract](../../../../backend/tests/test_organization_delete_contract.py), test_organization_delete, matrices existantes de rôles et isolation |
| S09 / R06/R07 | Refus par catégorie avant effet ; graphe complet identique ; erreur injectée après DELETE physique annule organisation/M2M/activité | policy et provenance : comparaison métier excluant seulement les Logs techniques, puis inspection séparée du Log de refus |
| S10 / R08 | Deux ordres, vraies écritures concurrentes sur fichier SQLite ; pas de double succès ni d’orphelin ; Log chargé avant suppression garde son origine | [concurrency](../../../../backend/tests/test_organization_delete_concurrency.py), [orchestrateur](../../../../backend/tests/organization_delete_concurrency.py), [processus](../../../../backend/tests/organization_delete_process.py) |
| S11 / R09 | Information sur refus/rétention, annulation sans DELETE, attente/double clic, message backend conservé ; dépendance créée après ouverture | [React confirmation](../../../../frontend/src/OrganizationDelete.test.tsx), E2E réel à 1280×844 et 390×844 |

## Preuves ciblées initiales

- Avant correction : neuf tests rouges reproduisent 204 au lieu du refus pour équipe active/archivée et chacun des sept états de notification ; base inchangée `c82f4e4`.
- Après contrôle serveur : 41 tests ciblés verts (suppression, politique, Journal et Logs), dont les neuf cas précédents.
- Concurrence : 22 cas verts sur fichiers/processus indépendants, configurations development et production, sessions/CSRF réels et barrières autour des écritures SQL ; pas de synchronisation fondée sur un simple délai.
- Frontend ciblé : deux fichiers / sept tests React verts pour confirmation, refus, attente et provenance.
- E2E ciblé : quatre parcours verts avec backend réel, dont création de dépendance pendant confirmation, archivage puis nouveau refus ; relecture après rechargement.
- Migration : organisations homonymes distinctes, données historiques inchangées, lignes détachées à origine NULL ; schéma API/Swagger et rollback vérifiés dans les tests complémentaires.
- Revue visuelle agent des captures générées par l’E2E : textes et boutons lisibles/accessibles à 1280 et 390 px. Ce constat n’est pas une approbation esthétique humaine.

Les sorties temporaires des tests restent locales et ne sont pas publiées comme données produit.
Les tests et cette correspondance sont versionnés ; les résultats de campagne et CI complètent les preuves.

## Limites et conséquences de recette

L’origine des traces déjà détachées n’est pas retrouvée par leur nom : NULL reste une inconnue explicite,
conforme à la décision. Aucun changement de durée ni de mécanisme de rétention/purge.
La contention peut conserver le refus technique existant ; il ne vaut jamais succès. Les tests de
démarrage concurrent vérifient l’absence d’état partiel avant une nouvelle tentative explicite.
Le Log HTTP demeure post-transactionnel : l’activité de suppression atomique atteste le succès métier.
La conservation de l’origine ne donne aucun droit de consultation à l’ancien Admin, même rattaché ailleurs.

MEP-033 reprend les succès/refus et traces ; MEP-034 les droits/isolation et observations d’intégrité,
avec concurrence du candidat selon le périmètre existant MEP-071 ; MEP-035 conserve ses autres exigences.
Aucun PV cible MESS, GO ou clôture automatique d’ORG-004 n’est déduit des tests locaux.


## Non-régression de l’écriture des Logs

La première campagne générale a révélé six assertions TEAM d’intégrité incompatibles avec un UPDATE
organisationnel ajouté à l’écriture de Log. Correction : conserver le seul INSERT normal du Log,
vérifier la FK sous le verrou acquis par cet INSERT et, si le parent a disparu, annuler cette insertion
avant une unique insertion détachée préservant l’origine. Aucun test ni invariant TEAM n’a été assoupli.
Le test OpenAPI Journal a été aligné sur le nouveau filtre d’origine explicitement documenté.
Après correction : 55 tests ciblés verts, incluant les invariants TEAM, la provenance, le contrat Journal,
les erreurs de contrainte étrangères au contexte et les 22 cas concurrents dans les deux configurations.
