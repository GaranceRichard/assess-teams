# Diagnostic actualisé et niveau des preuves

[Retour au dossier de proposition](README.md). Lecture sur `3802d77687f23b83b53c12926b48727d7eaf2341`.
Aucune requête destructive, campagne applicative ou expérimentation sur des données existantes.

## Méthode et autorités relues

**L** = fait directement lu dans le code ; **D** = effet déduit des relations et de la transaction ;
**T** = assertion présente dans un test existant lu, sans nouvelle exécution ni certification verte.
Une protection déduite n’est pas un résultat observé en base ; un test présent ne prouve pas tous les états.

| Source d’autorité | Usage dans ce dossier |
| --- | --- |
| [AGENTS.md](../../../../AGENTS.md), [règles qualité](../../../quality/agent-rules.md), [politique documentaire](../../../quality/documentation-policy.md) | Worktree dédié, limites, revue, validations documentaires et publication directe |
| [Registre Organisation](../../source/00-arbitrages-organisations.md) | Décisions acquises, arbitrage bloquant et séparation des transferts |
| [Source Organisations](../../source/05-organisations.md), [suivi PBI](../../tracking/pbis.md) | Contrat ORG-004 et maintien Bloqué/N/A |
| [Audit suppression](../audit-20261027/suppression-organisation.md), [fiche ORG-004](../audit-20261027/fiches/ORG-004.md) | Graphe historique et manque de politique, sans réécrire leurs dates ni leurs conclusions datées |
| [Écarts consolidés](../../source/08-ecarts-et-qualifications.md), [dépendances MESS](../mess-dependances.md), [jalon GO](../../tracking/mess-jalon.md) | Pas de recette/GO conforme si opération destructive non arbitrée exposée |
| [Index des preuves historiques](../audit-20261027/preuves.md#organisations) | Appuis versionnés, pas réexécution du candidat actuel |

## Séquence actuelle du DELETE

Dans [OrganizationDetailView.delete](../../../../backend/identities/adapters/api/organization_detail_views.py),
`CanManageOrganizations` et la session filtrent d’abord l’accès ; le corps impose `is_superuser` avant
la recherche de la cible. **L** : recherche par PK, description de tentative technique,
`organization_deleted`, suppression des runs `state=NOT_STARTED` de cette organisation,
`organization.delete()`, réponse 204. L’ensemble du corps est décoré `transaction.atomic`.

`organization_deleted` **enregistre déjà** une ActivityEntry avant la suppression ; ce n’est pas un
simple événement préparé en mémoire. [activity_records](../../../../backend/journals/activity_records.py)
et [services](../../../../backend/journals/services.py) montrent la création ORM et les snapshots de noms.
**D** : une exception sortant du corps annule cette activité, les suppressions NOT_STARTED et les cascades.
[exceptions](../../../../backend/journals/exceptions.py) traduit ProtectedError en HTTP 400 avec
« Cette ressource est utilisée par une passation conservée. » Ce message n’inventorie pas les dépendances.

**L/D** : aucune vérification métier générale d’admissibilité ni verrou explicite avant lecture de
l’organisation dans ce DELETE. Les protections dépendent du collecteur Django et des runs conservés.
Un `PROTECT` est déclaré pour tous les états de run, mais les NOT_STARTED sont retirés avant la collecte.
Il serait faux de conclure soit « tout cascade toujours », soit « tous les runs protègent toujours ».
Les questions snapshotées ont aussi un PROTECT vers la question source.

## Journal, Logs, accès et notifications

[journals/models](../../../../backend/journals/models.py) : ActivityEntry et LogEntry héritent de FK
organisation/équipe SET_NULL ; LogEntry possède aussi evaluation SET_NULL. Les noms sont snapshotés.
L’identifiant organisationnel exposé par les [serializers](../../../../backend/journals/adapters/api/serializers.py)
est la FK nullable, sans identifiant d’origine indépendant. Deux noms identiques ne distinguent pas deux périmètres.
L’activité n’a pas de FK évaluation : ne pas lui attribuer celle du Log.

Le [scope Journal/Logs](../../../../backend/journals/adapters/api/scope.py) donne la consultation globale
au Superadmin et filtre l’Admin par son organisation courante unique. Sans organisation, l’Admin est
refusé par [assigned_admin_organization](../../../../backend/identities/adapters/api/organization_scope.py).
Un futur rattachement ailleurs ne redonne pas le scope de l’ancienne organisation ; Coach/Viewer n’ont
pas l’API administrative des journaux. Conservation physique et accessibilité sont donc deux garanties distinctes.

Le [middleware HTTP](../../../../backend/journals/middleware.py) écrit son Log **après** la réponse de la vue,
avec [contexte autorisé](../../../../backend/journals/http_context.py) et
[références encore valides](../../../../backend/journals/http_relations.py). Un refus peut donc ajouter
un Log WARNING sans activité de succès. Un échec d’écriture du Log est capturé par le middleware :
la présence de ce Log n’est pas une condition atomique de succès du DELETE actuel.

[EmailNotification](../../../../backend/notifications/models.py) conserve corps/destinataire/état et
met les liens organisation/équipe/modèle/plan à NULL. Aucun signal de DELETE ne choisit une annulation.
La [livraison](../../../../backend/notifications/delivery.py), lorsqu’elle reprend une notification de
planification et constate son plan absent, retourne un corps nul puis CANCELLED ; ce n’est pas une
annulation synchrone par DELETE. Un courriel générique peut encore utiliser son corps ; une invitation
vérifie surtout l’utilisateur et son éligibilité. Un SMTP déjà en cours n’est pas annulable par rollback.
Le comportement après effacement concurrent pendant une livraison déjà chargée n’est pas démontré.
La [file](../../../../backend/notifications/queue.py) peut livrer après commit ; une remise SMTP ne se déduit
ni de la présence d’une intention ni de son SET_NULL.

## Tests existants effectivement examinés

| Test / assertions lues (T) | Ce qui est couvert | Limite de la preuve |
| --- | --- | --- |
| [test_organization_delete](../../../../backend/tests/test_organization_delete.py), `test_superadmin_deletes_an_organization_but_keeps_its_users` | 204, organisation disparue, autre organisation présente, deux comptes conservés | Le fixture rattache un Viewer à deux organisations par ORM, malgré la règle produit actuelle ; n’assert pas explicitement le lien M2M restant ni toute la DB |
| Même fichier, `test_organization_delete_refuses_non_superadmins_and_unknown_targets` | Admin/Coach 403, cible inconnue 404, organisation conservée | Pas Viewer/anonyme dans ce fichier ; pas matrice de dépendances |
| [test_api_role_matrix](../../../../backend/tests/test_api_role_matrix.py), paramétrage depuis [role_matrix_helpers](../../../../backend/tests/role_matrix_helpers.py) | DELETE organisation interdit Admin/Coach/Viewer ; snapshot métier inchangé, réponse detail | Le snapshot exclut LogEntry ; preuve de rôle, pas de toutes les règles métier proposées |
| [test_api_permission_inventory](../../../../backend/tests/test_api_permission_inventory.py) | Toute route privée, dont DELETE organisation, refuse l’anonyme à 403 sans révéler le nom | Vérification d’accès générique ; pas snapshot exhaustif des dépendances |
| [test_evaluation_run_invariants](../../../../backend/tests/test_evaluation_run_invariants.py), `test_referenced_questions_models_planning_and_organization_cannot_be_deleted` | Après démarrage, suppression API question/modèle/plan/organisation à 400 | Ne contrôle pas à lui seul chaque ligne du rollback ni tous les états |
| [test_isolation_history](../../../../backend/tests/test_isolation_history.py), `test_archived_resources_keep_their_owner_and_consultation_scope` | Après archivage modèle/équipe, DELETE organisation avec run COMPLETED refusé à 400 ; snapshot métier inchangé | Le fixture [isolation_helpers](../../../../backend/tests/isolation_helpers.py) contient aussi NOT_STARTED ; couvre leur rollback et l’activité, mais exclut LogEntry ; pas test de concurrence |
| [test_activity_journal](../../../../backend/tests/test_activity_journal.py), `test_activity_filters_and_snapshots_survive_related_deletion` | Suppression ORM, FK NULL, noms conservés, consultation par un nouveau Superadmin | Contourne la vue ; aucune politique d’admissibilité, pas identité d’organisation immuable ni accès ancien Admin après suppression testé ici |
| [test_logs_api](../../../../backend/tests/test_logs_api.py), `test_log_snapshots_survive_related_objects_deletion` | Même conservation et consultation des Logs après suppression ORM | Pas preuve de transaction du DELETE ni de provenance stable |
| [OrganizationDelete.test](../../../../frontend/src/OrganizationDelete.test.tsx) | Bouton Superadmin, confirmation, retrait en succès simulé, dialogue conservé en refus simulé | API mockée ; aucun inventaire de dépendances, transaction ou parcours réel de refus métier |

Le [dialogue actuel](../../../../frontend/src/OrganizationDeleteDialog.tsx) annonce une suppression
définitive et les comptes conservés. Il n’explique pas les dépendances, les conditions de refus ni
l’accès futur aux traces. Le [contrat API actuel](../../../architecture/backend-api.md) décrit 204,
403/404, cascades possibles et 400 pour passation commencée ; il demeure inchangé par cette proposition.

## Dépendances explorées en complément

- [Modèles assessment](../../../../backend/assessments/models.py) et [runs](../../../../backend/assessments/run_models.py) : familles, versions, repères, plans, snapshots et notes.
- [taking](../../../../backend/assessments/application/taking.py) : snapshots créés au démarrage, transition et contrôle de cohérence équipe/modèle/organisation.
- [taking_scope](../../../../backend/assessments/application/taking_scope.py) et [results](../../../../backend/assessments/application/results.py) : scope courant ; les résultats Viewer exigent COMPLETED dans son organisation.
- [Création d’équipe](../../../../backend/teams/adapters/api/views.py), [verrou identité](../../../../backend/identities/application/lifecycle.py) : verrou d’écriture SQLite acquis avant lecture pour ce parcours, pas pour DELETE organisation.
- [Planification](../../../../backend/assessments/adapters/api/schedule_serializers.py), [scope verrouillé](../../../../backend/assessments/adapters/api/scope.py), [attentes](../../../../backend/assessments/application/expected_evaluations.py), [récurrences](../../../../backend/assessments/application/schedule_notifications.py) : écritures concurrentes et notifications à inclure dans la future preuve.
- [Conflits critiques SQLite](../../../../backend/tests/test_sqlite_critical_conflicts.py) : appui de méthode fichier/processus ; les cas lus ne qualifient pas suppression organisation contre équipe/plan/démarrage.
- [Modèles de récupération](../../../../backend/identities/password_models.py) et [reçus de purge](../../../../backend/journals/purge_models.py) : pas de FK Organisation ; aucun transfert de leur politique à ce mandat.

## Portée de la qualification documentaire

Le graphe historique est confirmé par lecture et enrichi de la couverture contradictoire ci-dessus.
Aucune nouvelle exécution applicative n’était indispensable pour décider : les risques et les manques
sont explicites, et la politique recommandée doit précisément être développée après approbation.
Les preuves historiques restent datées, sans expiration ajoutée ; leur réutilisation applicative sur
un futur candidat exige les entrées et sélections identiques prévues par les règles qualité.
Les seuls contrôles nouveaux de ce chantier concernent les documents ; ils ne prouvent pas R01–R09.
