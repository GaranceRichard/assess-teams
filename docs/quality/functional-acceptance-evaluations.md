# MEP-030 — Évaluation et notation : FON-08 à FON-13

Retour au [cahier et aux verdicts](functional-acceptance.md) ; [jeux G2/G3 et vérifications API](functional-acceptance-data.md).
État de chaque nominal/refus : **Non exécuté**. PV consommateur : MEP-069 ; administration des modèles aussi MEP-033.
Les preuves UX se recueillent séparément selon MEP-067 ; aucun correctif UX ouvert n'est clôturé par ce cahier.

## FON-08 — Brouillon, questions ordonnées et repères d'appréciation

- **PBI / préconditions :** EVAL-001/002/004 ; Admin Alpha, G2 au stade brouillon ; Superadmin pour le nominal global, Coach/Viewer pour refus.
- **Actions :** créer Modèle Recette ; ajouter Collaboration puis Livraison, modifier les textes et repères 0/5/10 de Collaboration,
  supprimer/recréer une question de brouillon ; recharger la liste et les questions. Tenter de valider Modèle vide, puis valider Modèle Recette complet.
- **Attendu vérifiable :** modèle initial DRAFT, index attribués sans saisie d'index, ordre des questions conforme aux valeurs persistées ;
  repères facultatifs conservés sans changer l'échelle entière 0–10. Validation complète = VALIDATED, boutons d'édition/suppression retirés.
- **Vrais refus :** modèle sans question = 400 et DRAFT conservé ; repère de niveau 11 ou niveau répété dans `appreciation_markers`
  du corps question (structure du schéma existant) = 400 sans modification. PUT du modèle/question validé = 400 sans réécriture.
  Coach/Viewer sur `/api/admin/evaluations/` = 403 ; Admin Alpha sur modèle Beta = 404, sans effet ni activité de succès.
- **Preuves :** captures brouillon/validé, requêtes/réponses expurgées et relecture des textes/repères, Journal des seules transitions réussies ;
  [evaluations](../../frontend/e2e/evaluations.spec.ts), `evaluation-lifecycle`, `appreciation-markers` ; backend `test_evaluations.py`,
  `test_evaluation_lifecycle.py`, `test_appreciation_markers.py`, [contrat des repères](../architecture/appreciation-markers.md).

## FON-09 — Version suivante et conservation du passé

- **PBI / préconditions :** EVAL-003/004, PASS-001 ; G2 v1 validée, G3 v1 déjà démarrée et notée 5 à Collaboration ; relevé snapshot v1.
- **Actions :** Admin copie v1 en v2 ; dans le brouillon v2 renomme Collaboration en Collaboration v2 et le repère 5 en `Partagé v2`.
  Valide v2 ; ouvre la passation v1 et la reprend/finalise ; crée un nouveau planning sur v2 puis démarre sa passation.
- **Attendu vérifiable :** même family_id, IDs de versions/questions distincts, lignée copiée conservée ; v2 DRAFT avant validation,
  v1 ARCHIVED à activation de v2, une seule VALIDATED. Ancienne passation = version v1/textes/repères/notes figés ;
  nouvelle = v2 et nouveaux textes. Ni planning, ni réponse, ni run ne sont copiés par la seule copie de version.
- **Vrais refus :** nouvelle planification sur v1 archivée = 404 ; nouveau démarrage d'une attente v1 jamais commencée = 400 ;
  une passation commencée v1 reste au contraire reprenable. PUT d'un texte v1 archivé = 400. Hors organisation = 404,
  Coach/Viewer créent une version = 403 ; compteurs/versions/questions et Journal inchangés après refus.
- **Preuves :** captures états et anciens/nouveaux textes, family/version/run/lineage IDs et snapshots avant/après ;
  [evaluation-versions](../../frontend/e2e/evaluation-versions.spec.ts), backend `test_evaluation_version_history.py`,
  `test_evaluation_version_permissions.py`, `test_evaluation_taking_lifecycle.py` ; [versionnement](../architecture/evaluation-versioning.md).
  Aucun partage de modèle inter-organisation n'est livré ni arbitré.

## FON-10 — Planifier, notifier, modifier et replanifier

- **PBI / préconditions :** PLAN-001, NOTIF-001, MEP-004 ; G1/G2 validé, Coach/Admin local actif avec mail, relais/boîte de recette et worker.
  Utiliser une équipe ou un modèle distinct par variante pour ne pas confondre doublons et cadences.
- **Actions :** Admin crée les variantes immédiate, ponctuelle, mensuelle, trimestrielle avec première date relevée ; recharge,
  ouvre une ligne, modifie date/responsable et supprime une planification de test jamais commencée.
  Complète une ponctuelle via FON-12 puis replanifie le même couple équipe/modèle et complète la nouvelle occurrence.
  Faire traiter par le worker existant une échéance récurrente arrivée à terme sur le clone G5 ; observer courriel et calendrier.
- **Attendu vérifiable :** chaque planning persiste mode/date/assigné ; attente initiale unique, lien produit dans le courriel,
  confirmation et échéance reçues par le destinataire éligible. Après traitement, calendrier avancé par pas de 1/3 mois jusqu'à dépasser strictement la date de traitement,
  avec jour de la première échéance borné au dernier jour du mois cible (sans reconstruire les cycles omis),
  occurrence et intention uniques ; relever dates exactes avant/après. Nouvelle ponctuelle possible après complétion,
  ancien run/date/notes toujours consultables. 201/200 métier ne prouvent pas à eux seuls une remise SMTP.
- **Vrais refus :** doublon du même couple encore actif = 400, pas de ligne/attente/mail supplémentaire ; équipe archivée,
  modèle DRAFT/ARCHIVED, responsable Beta ou modèle Beta pour équipe Alpha = 404 sans persistance partielle.
  Admin désigne Superadmin responsable = 404 ; Superadmin peut se désigner dans une variante positive. Coach/Viewer créent = 403.
- **Preuves :** tableaux mode/date/assigné et occurrences, courriel expurgé de liens sensibles, état de remise attesté par l'exploitant,
  refus et ancien résultat après replanification ; [planning](../../frontend/e2e/planning.spec.ts), `evaluation-replanning`,
  backend `test_evaluation_schedules.py`, `test_evaluation_schedule_management.py`, `test_evaluation_schedule_superadmin_assignee.py`,
  `test_evaluation_lifecycle_planning.py`, [contrat planning](../architecture/evaluations-api.md) et [notifications](../architecture/email-notifications.md).
  Panne/reprise SMTP et concurrence ne sont pas exercées ici ; variante échéance Bloquée si le worker manque.

## FON-11 — Choix explicite, sauvegarde, interruption et reprise

- **PBI / préconditions :** PASS-001, EVAL-004, MEP-007 ; G3 vierge, Coach assigné ; deux questions dont une sans repères.
  MEP-013/045 restent ouverts ; [MEP-044 qualifié séparément](mep-044/README.md).
- **Actions :** ouvrir Évaluations → Démarrer ; parcourir aller/retour sans noter, fermer/recharger/reprendre.
  Choisir volontairement 5 pour Collaboration, attendre la sauvegarde ; Livraison=0, reprendre après rechargement,
  remplacer Collaboration par 6 puis 10. Refaire le choix par clavier et toucher sur des runs vierges distincts.
- **Attendu vérifiable :** ordre snapshoté ; absence « Aucune note sélectionnée », GET réponses [null,null], zéro PUT de note après
  simple focus/navigation. Geste volontaire 5 persiste [5,null], zéro reste 0 et non absence. Note 6 conserve 6 avec texte inférieur 5 ;
  note 10 affiche Maîtrisé ; sans repère, pas de texte inventé. Reprise conserve les notes confirmées par le serveur.
- **Vrais refus :** finalisation avec réponse manquante = 400 et bouton indisponible ; PUT note `{"score":11}` puis `{"score":2.5}`
  sur `/api/evaluations/<run>/responses/<question>/` = 400 sans changement ni complétion. Question étrangère = 400 ;
  Coach non assigné = 404 ; Viewer = 403, aucun score ni succès Journal ajouté.
- **Variante de service :** sur clone, reproduire le refus de sauvegarde 400 intercepté dans `dialog-taking-accessibility` :
  note saisie gardée, erreur, fermeture/navigation protégées, aucune annonce de succès ; lever l'interception et réessayer,
  puis recharger pour prouver la persistance. Identifier cette preuve comme simulation frontend, distincte d'un vrai refus serveur de note invalide.
- **Preuves :** captures absence/0/5/6/10, requêtes de notes et GET après reprise, message/refus/réessai ;
  [evaluation-explicit-rating](../../frontend/e2e/evaluation-explicit-rating.spec.ts), `appreciation-markers`,
  `dialog-taking-accessibility`, backend `test_evaluation_taking.py`, `test_evaluation_taking_security.py` ;
  [contrat de passation](../architecture/evaluation-taking.md).

## FON-12 — Finalisation, verrouillage et suppléance Admin

- **PBI / préconditions :** PASS-001, JOURNAL-001 ; G3 complète en saisie [0,10], seconde attente assignée Coach pour suppléance.
- **Actions :** Coach finalise après confirmation des deux sauvegardes ; recharge et consulte le run COMPLETED.
  Répète le POST de finalisation avec sa session valide. Admin complète l'attente de suppléance à la place du Coach.
- **Attendu vérifiable :** finalisation 200 atomique ; COMPLETED, notes consultables en lecture seule ; répétition idempotente,
  mêmes auteur/date initiaux et une seule activité de complétion. Suppléance distingue Assigné à=Coach et Rempli par=Admin ;
  activité `evaluation_completed_by_admin`, snapshots/questions conservés. Tester aussi le nominal Superadmin sur un run distinct.
- **Vrais refus :** PUT ordinaire de score après COMPLETED = 400, seul le parcours Réviser est autorisé aux Admins.
  Coach non assigné tente finalize = 404, Viewer = 403 ; comparer notes, état, auteur/date et activité avant/après.
- **Preuves :** run avant/après et après POST répété, tableau provenance, Journal unique, réponses de refus ;
  [evaluation-taking](../../frontend/e2e/evaluation-taking.spec.ts), backend `test_evaluation_taking.py`, `test_evaluation_taking_permissions.py`.
  Aucun succès de finalisation n'est déduit d'un simple message client sans relecture serveur.

## FON-13 — Réviser une complétion et traiter une responsabilité suspendue

- **PBI / préconditions :** PASS-001, USER-004 ; run FON-12 COMPLETED ; clone avec planning ouvert et run IN_PROGRESS noté,
  Coach assigné désactivé puis réactivé (FON-04). Conserver IDs, scores et provenance avant opérations.
- **Actions :** Admin ouvre Réviser les notes du run complété, change [0,10] en [1,9], valide puis recharge ;
  Superadmin refait sur un autre run. Sur clone suspendu, tenter la reprise, puis Admin édite explicitement le planning
  avec un responsable actif, reprend et complète le run IN_PROGRESS à la place de l'assigné historique.
- **Attendu vérifiable :** révision atomique, auteur/date initiaux inchangés, dernier réviseur/date mis à jour, activité `evaluation_revised`.
  Désactivation/réactivation seule ne rétablit pas une responsabilité ; édition explicite lève le signal de réaffectation,
  sans réattribuer un run déjà commencé ni perdre ses réponses ; une attente NOT_STARTED peut suivre la nouvelle affectation.
- **Vrais refus :** Coach révise = 403 ; Admin envoie `{"answers":[]}` au PUT `/api/evaluations/<run>/revision/` = 400,
  aucune réponse ni métadonnée modifiée. Avant réaffectation explicite, mutations du run suspendu par Admin = 400 même après réactivation du Coach.
- **Preuves :** notes/provenance/Journal avant/après et après refus, état `requires_reassignment` avant/après édition ;
  `evaluation-taking`, `user-lifecycle`, backend `test_evaluation_revision.py`, `test_user_lifecycle_history.py`,
  `test_user_lifecycle_access.py` ; [règles de responsabilité](../architecture/user-lifecycle.md#responsabilités-et-historique).
