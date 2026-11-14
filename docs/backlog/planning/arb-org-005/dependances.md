# Cartographie des dépendances et politique proposée

[Retour au dossier](README.md). Les identifiants D01–D16 relient les deux matrices ci-dessous.
**L/D/T** ont le sens du [diagnostic](diagnostic.md) ; T signifie test lu, sans nouvelle exécution.
Toutes les recommandations renvoient aux règles **non approuvées** R01–R09 du dossier principal.

## Relations et effets actuels

| Réf. / donnée | Modèle et relation Django | Effet actuel observé dans le code ou déduit ; preuve testée distincte |
| --- | --- | --- |
| D01 — Identités/membres | [Organization.users et User](../../../../backend/identities/models.py), M2M automatique ; suppression d’un parent → CASCADE des lignes intermédiaires | D : liens de l’organisation retirés, User non collecté ; autres rattachements non ciblés. T : 204, comptes conservés et autre organisation présente ; lien restant non explicitement asserté dans test_organization_delete. |
| D02 — Équipe active/Coachs | [Team.organization](../../../../backend/teams/models.py) CASCADE ; Team.coaches M2M | D : identité d’équipe et affectations Coachs disparaissent si aucun PROTECT conservé n’interrompt ; comptes Coachs conservés. Pas de test API exhaustif de cette cascade identifié. |
| D03 — Équipe archivée | Même Team, `is_active=False` ; même FK CASCADE | L/D : aucun filtre d’état dans la cascade parent ; TEAM-005 n’est pas une barrière de suppression physique Organisation. T : test_isolation_history protège une archive avec complétion, pas une archive seule. |
| D04 — Familles/modèles/versions | [EvaluationFamily.organization, Evaluation.organization et Evaluation.family](../../../../backend/assessments/models.py) CASCADE | D : famille, versions DRAFT/VALIDATED/ARCHIVED supprimables ensemble sans run protecteur. Contraintes d’état/version et immutabilité API n’annulent pas la cascade parent. T : protection du modèle référencé après démarrage. |
| D05 — Questions/repères | Question.evaluation CASCADE ; `lineage_id`, index, nom et `appreciation_markers` JSON sur Question | D : questions, repères et lignées disparaissent avec version non protégée. EvaluationRunQuestion.source_question PROTECT peut bloquer. T : question référencée après démarrage refusée à 400. |
| D06 — Planifications | EvaluationSchedule.team et .evaluation CASCADE ; .assignee SET_NULL vers User | D : mode, dates, récurrence, flag requires_reassignment et responsabilité disparaissent avec plan sans run conservé. L’identité responsable n’est pas supprimée par ce parcours ; son SET_NULL concerne une suppression de compte distincte. T : plan référencé après démarrage refusé. |
| D07 — NOT_STARTED | [EvaluationRun](../../../../backend/assessments/run_models.py) : organization/team/evaluation/schedule PROTECT, mais [vue DELETE](../../../../backend/identities/adapters/api/organization_detail_views.py) les supprime explicitement | L : filtre organisation + NOT_STARTED avant organization.delete. D : leur PROTECT ne suffit pas à les conserver ; snapshots éventuels en CASCADE vers run. T : attente conservée par rollback dans le fixture de test_isolation_history avec COMPLETED. Succès avec seules attentes non qualifié ici. |
| D08 — IN_PROGRESS | Mêmes quatre FK PROTECT ; assignee SET_NULL vers User, noms snapshotés | D : run non sélectionné par le DELETE explicite, organisation et références protégées ; refus de toute transaction. T : test_evaluation_run_invariants vérifie HTTP 400 après démarrage. |
| D09 — COMPLETED | Mêmes FK ; completed_by/revised_by SET_NULL vers User ; noms et dates d’auteurs snapshotés | D : PROTECT conservé, historique et provenance en place tant que le graphe demeure. T : refus organisation et snapshot métier inchangé après archivage équipe/modèle dans test_isolation_history. |
| D10 — Snapshots/réponses | EvaluationRunQuestion.run CASCADE ; .source_question PROTECT ; texte, repères, lignée, score 0–10 ou NULL sur le snapshot | L : [taking.start_evaluation](../../../../backend/assessments/application/taking.py) copie les questions au démarrage. D : snapshots/notes conservés avec run protégé, supprimés si run explicitement supprimé ; pas de modèle Answer distinct dans le graphe lu. |
| D11 — Journal métier | [ActivityEntry / JournalEntryFields](../../../../backend/journals/models.py) : organisation/équipe/acteur/cible utilisateur SET_NULL ; aucune FK Evaluation sur ActivityEntry | L : organisation_deleted crée une activité avant DELETE. D : succès conserve ligne/noms mais perd FK organisation ; refus annule l’activité. T : test_activity_journal prouve les snapshots et la consultation Superadmin après suppression ORM ; test_isolation_history couvre rollback d’activité. |
| D12 — Logs techniques | LogEntry hérite des FK SET_NULL, ajoute evaluation SET_NULL ; noms, opération, statut, corrélation persistés | D : anciennes lignes gardées, FK collectées NULL ; identifiant organisationnel d’origine absent. L : middleware ajoute séparément le Log HTTP après réponse, même refus. T : test_logs_api prouve noms/NULL/lecture Superadmin après suppression ORM, pas succès atomique de la vue. |
| D13 — Notifications | [EmailNotification](../../../../backend/notifications/models.py) : organization/team/evaluation/schedule/user SET_NULL | D : contenu, destinataire, flags, event_key, états et tentatives conservés ; pas d’annulation DELETE. L : delivery peut annuler ultérieurement un message de planification dont le plan manque ; générique/invitation suivent leurs autres contrôles. Aucun test lu ne démontre toutes les courses DELETE/livraison. |
| D14 — Accès | [scope Journal](../../../../backend/journals/adapters/api/scope.py), [scope passations](../../../../backend/assessments/application/taking_scope.py), [Results](../../../../backend/assessments/application/results.py), organisations/membres courants | L/D : Admin Journal exige une organisation courante unique ; SET_NULL exclut l’ancien périmètre ; Superadmin reste global. Coach passations et Viewer Results dépendent aussi du scope courant. T : accès archives protégées/isolation testé ; accessibilité après suppression ne s’infère pas du stockage. |
| D15 — Comptes, sessions et récupération | User, sessions Django, PasswordResetDelivery et PasswordRateLimit ; pas de FK Organisation directe dans les [modèles de récupération](../../../../backend/identities/password_models.py) | D : DELETE organisation ne vaut ni déconnexion, désactivation, effacement du compte ni purge de récupération. Session active peut subsister avec contexte organisationnel absent ; les droits sont à revérifier via API. |
| D16 — Reçus de purge | [JournalPurgeRun](../../../../backend/journals/purge_models.py) sans FK Organisation | L/D : pas de cascade organisationnelle ni de sauvegarde du patrimoine ; aucune nouvelle règle de rétention/purge ne découle de DELETE. |

Planifications et notifications doivent être recherchées aussi par leurs objets reliés, pas seulement
par une colonne organization : EvaluationSchedule n’en possède pas directement, et une notification
peut avoir organization NULL tout en conservant un lien vers un plan ou une équipe du périmètre.
Pour un run, vérifier aussi les références équipe/modèle/plan si un ancien graphe est incohérent ;
ne pas transformer le seul filtre direct organization en preuve d’exhaustivité.

## Risque, recommandation et vérification après approbation

Chaque ligne fournit la décision produit requise et l’observation nécessaire ; aucune ne vaut exécution.
Les refus proposés conservent les objets et leurs accès **selon les droits courants**, sans restaurer
un droit perdu pour une autre raison (retrait de membre, identité inactive ou archivage).

| Réf. | Risque métier | Comportement souhaité / décision à rendre | Vérifications requises après approbation |
| --- | --- | --- | --- |
| D01 | Assimiler retrait d’appartenance et perte du compte ; toucher un autre périmètre | R01 : membres seuls admis, comptes/roles/activité personnelle inchangés ; retrait seulement du M2M cible | S01/S08 : relire User et tables M2M, autre organisation et liens ; cas multi-lien historique isolé hors parcours de création autorisé |
| D02 | Perte de l’identité d’équipe, de ses Coachs et d’un investissement même sans évaluation | R02 : toute équipe active bloque ; pas de dérogation « équipe vide » | S02 : 400 explicite, équipe/M2M/organisation inchangés, aucun succès Journal |
| D03 | Confondre archive et absence de patrimoine | R02 : archive bloque exactement comme équipe active | S03 : identité, état, liens et historique identiques ; aucune réactivation/destruction implicite |
| D04 | Effacer brouillon utile ou version validée/archivée sans run | R02 : famille seule et toutes versions bloquent ; aucun état exempté | S04 : un fixture par état, famille seule, plusieurs versions ; mêmes IDs et contenus après refus |
| D05 | Perdre critères, repères et provenance longitudinale | R02 : question/repère protégé avec son référentiel ; contrôle du graphe relié | S04/S06 : comparer JSON, textes, lignées et références, pas uniquement le nombre de questions |
| D06 | Effacer échéance, récurrence et responsable sans annulation explicite | R02 : tout plan bloque, même sans run, sans assigné, ponctuel terminé ou requires_reassignment | S05 : modes/dates/assignee/flag inchangés, pas de nouveau rappel dû à la tentative |
| D07 | Effacer engagements avant même le contrôle final | R02/R07 : ne plus supprimer automatiquement les NOT_STARTED dans ORG-004 futur | S05/S09 : attente seule puis attente + run commencé/terminé ; données, états, notifications et Journal identiques |
| D08 | Perte de saisie et du contexte d’une passation | R02/R08 : refus métier systématique avant mutation ; PROTECT garde-fou secondaire | S06/S10 : notes partielles, snapshots, auteurs et quatre FK inchangés, vraie concurrence début/DELETE |
| D09 | Perte de résultats et de leur provenance | R02 : aucun effacement ni détachement de COMPLETED | S06 : notes, complétion/révision/auteurs/dates et Results/radar/longitudinal encore accessibles aux rôles légitimes |
| D10 | Conserver des valeurs sans critères/source ou perdre des observations | R02 : aucun snapshot supprimé/réécrit ; pas de traitement spécial des notes NULL | S06/S09 : comparaison complète des snapshots, score/lignée/repères ; tester le graphe mixte et rollback |
| D11 | Nom homonyme ambigu ; activité de succès malgré refus | R03/R07 : traces seules non bloquantes si provenance stable ; activité de suppression unique dans la transaction, visible uniquement si commit réussi | S07/S09 : ancien contexte immuable, ID d’origine conservé, FK éventuellement NULL uniquement après succès ; zéro activité de succès sur refus |
| D12 | Logs conservés mais inattribuables/inaccessibles ; absence de Log masquée | R03/R04 : conserver provenance stable et accès Superadmin ; Log de refus permis, sans garantie nouvelle de durée | S07 : relire DB puis API avec Superadmin/ancien Admin/autre Admin/Coach/Viewer ; statut/corrélation/noms, homonymes et incident de Log |
| D13 | Intention livrée sans contexte ou accès indu au contenu/destinataire | R05 : tous états liés bloquent, y compris PENDING/SENDING/RETRY/SENT/FAILED/UNKNOWN/CANCELLED | S05/S07/S10 : aucune transition causée par DELETE, corps/destinataire/liens conservés ; worker autonome identifié séparément ; notification personnelle non liée non bloquante |
| D14 | Faire passer conservation physique pour consultation conservée ou ouvrir un scope global à l’ancien Admin | R04 : traces résiduelles Superadmin seul ; refus sur dépendance conserve les scopes préexistants | S01/S06/S07/S08 : tests API directs avec identifiants devinés, homonymes, ancien Admin sans puis avec autre organisation ; aucun grant automatique |
| D15 | Confondre suppression du périmètre avec anonymisation ou changement de fonction | R01 : ne modifier ni compte ni sessions/récupération au titre de ce DELETE | S01/S08 : connexion possible selon l’état initial, profil sans organisation, aucune donnée étrangère ; droits API recalculés |
| D16 | Utiliser une purge pour rendre l’organisation artificiellement admissible | Hors décision de rétention ; R03 ne crée aucune durée de conservation nouvelle | Contrôle du diff : aucune commande/politique de purge changée ; aucune suppression préalable exigée par la recette |

## Frontière d’exhaustivité et données déjà détachées

Les modèles persistants d’identities, teams, assessments, journals et notifications et leurs relations
inverses Organisation ont été parcourus ; les tables M2M automatiques sont incluses dans l’analyse.
Le [diagnostic](diagnostic.md) identifie les chemins applicatifs et tests pertinents, plutôt que de
dupliquer l’intégralité des preuves historiques. Le développement devra réinventorier les relations
sur son SHA et compléter l’admissibilité si de nouveaux modèles ont été ajoutés depuis cette base.

Un événement déjà à organization NULL n’est pas réattribuable par son seul nom. Une notification
sans aucun lien organisationnel ne doit pas être rattachée par comparaison de son corps ou par
l’organisation **actuelle** de son destinataire. Conserver ces lignes sans reconstitution inventée ;
signaler une ambiguïté connue, et refuser si une dépendance du périmètre reste identifiable mais
non classable. Le dossier ne revendique pas une reconstruction des provenances perdues avant ORG-004.
La revue future doit distinguer absence de dépendance démontrée et impossibilité de la déterminer.
