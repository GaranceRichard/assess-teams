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


## Resynchronisation documentaire

Le chantier est resynchronisé sur `264723b76566c478d9c19a31db517df4d24017de` avant sa campagne finale.
Les trois conflits de planification ont été résolus en conservant la refonte MESS de ce commit et
ses conventions, dépendances et autres PBI ; seules les lignes de décision/suivi ORG-004 sont actualisées.
Aucun fichier applicatif n’a changé dans cette intégration amont. Les sorties de couverture de la
campagne interrompue restent des artefacts locaux, retirés avant relance et absents de tout commit.


## Campagne générale finale et revue de livraison

Campagne exécutée le 2026-11-14 par `npm run quality:targeted`, plan exhaustif imposé par la migration
et le contrat API. Résultats contrôlés à la reprise du 2026-11-15 ; les preuves ne périment pas par
leur âge, et leur réutilisation exige toujours les entrées et sélections exactes du dépôt.

| Contrôle | Résultat observé |
| --- | --- |
| Dépôt et préparation | Gates structure, 200 lignes, secrets, préparation propriétaire et suites de l’outillage : zéro échec |
| Backend | 1 604 tests réussis ; couverture globale 97,53 % ; lint/formatage conformes, migrations cohérentes sans changement manquant |
| Frontend | 120 fichiers / 499 tests réussis ; lint, formatage, typage et build conformes |
| Couverture frontend | Instructions 94,97 % ; branches 93,55 % ; fonctions 96,47 % ; lignes 95,81 % ; quatre seuils >= 90 % |
| E2E applicatif | 155 parcours réussis avec backend réel, dont les quatre ORG-004 aux deux formats |
| Démo statique | Build et 10 parcours réussis sans backend |
| Revue documentaire | 319 liens locaux/ancres contrôlés après resynchronisation ; aucun chemin absent ni ancre invalide, fichiers maintenus <= 200 lignes |

Le premier build frontend avait détecté une fixture de test au niveau de Log trop largement typé ;
la fixture est désormais explicitement de type `LogEntry`, sans cast d’assouplissement. Le build et
la campagne frontend complète ci-dessus ont ensuite réussi. Une origine connue reste visible même
si le nom historique est vide ; aucune donnée historique n’est reconstruite pour cet affichage.
Les preuves locales backend/frontend/E2E sont distinctes et contrôlées par le pré-push ; la publication
reste conditionnée au gate bloquant et à la CI indépendante du SHA exact. Le SHA et le lien de CI
sont communiqués dans le rapport de livraison, sans prétendre qu’un rapport local vaut recette MESS.

## Proposition de clôture fonctionnelle — à approuver

Proposition au responsable produit : approuver la conformité d’ORG-004 aux règles R01–R09 et aux
scénarios S01–S11 sur la version livrée, sur la base des tests, des invariants et de la revue ci-dessus.
Aucun écart fonctionnel bloquant n’est identifié. Les origines anciennes déjà détachées restent
inconnues conformément à la décision, les rétentions existantes restent applicables et une contention
technique n’est jamais considérée comme un succès métier. Les recettes cible et le GO MESS restent distincts.

**ORG-004 demeure Ouvert / N/A jusqu’à l’approbation fonctionnelle explicite du responsable produit.**
Ce dossier et sa publication ne modifient pas automatiquement ce statut, sa date ou ceux des recettes.
