# ARB-ORG-005 — suppression : données, protections et décision requise

[Retour aux contradictions](contradictions.md) · [ORG-004](fiches/ORG-004.md) · [Trajectoire](trajectoire.md).
Analyse du code au SHA `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`, sans requête destructive exécutée.
L’autorité est le [registre des arbitrages](../../source/00-arbitrages-organisations.md).
La suppression physique réservée au Superadmin et la conservation des identités sont déjà décidées.
Le sort des dépendances ne l’est pas ; aucune nouvelle politique n’est choisie ici.

## Séquence réellement permise

[OrganizationDetailView.delete](../../../../backend/identities/adapters/api/organization_detail_views.py) :
rôle Superadmin vérifié → organisation recherchée → activité de suppression enregistrée →
suppression explicite des runs NOT_STARTED de l’organisation → `organization.delete()`.
Le bloc est `transaction.atomic` : un échec ultérieur doit annuler aussi les effets précédents.
[ProtectedError est traduit en refus de validation HTTP 400](../../../../backend/journals/exceptions.py).
L’interface [OrganizationDeleteDialog](../../../../frontend/src/OrganizationDeleteDialog.tsx)
annonce la disparition définitive et les comptes conservés, sans inventaire des dépendances.
Une confirmation UI ne constitue ni une politique de conservation ni une barrière API.

| Donnée dépendante | Relation / effet du code actuel | Risque ou protection à ne pas confondre |
| --- | --- | --- |
| Organisation et liens utilisateurs | [Organization.users](../../../../backend/identities/models.py) : table M2M supprimée avec organisation, comptes conservés | Perte du rattachement courant ; aucun historique daté d’appartenance recréé. |
| Équipes actives et archivées | [Team.organization](../../../../backend/teams/models.py) CASCADE ; liens Coachs de l’équipe supprimée aussi | Archivage d’équipe n’est pas une protection de suppression Organisation ; aucun run protecteur n’est requis pour qu’une équipe existe. |
| Familles / modèles DRAFT, VALIDATED, ARCHIVED | [EvaluationFamily/Evaluation](../../../../backend/assessments/models.py) vers organisation en CASCADE | Familles et versions peuvent disparaître en l’absence de référence protégée ; l’immutabilité VALIDATED ne bloque pas cette cascade parent. |
| Questions et repères | Question→Evaluation CASCADE, repères JSON sur question | Perte de critères, lignées et repères si aucun snapshot protégé ne les retient. |
| Planifications / responsables | Schedule→Team/Evaluation CASCADE, assignee SET_NULL si utilisateur supprimé séparément | Fréquences, échéances et responsabilité de plans sans run protecteur peuvent disparaître avec équipe/modèle. |
| Runs NOT_STARTED | [EvaluationRun](../../../../backend/assessments/run_models.py) possède des FK PROTECT, mais la vue les supprime explicitement avant la cascade | Leur protection FK ne les préserve donc pas dans ce parcours. Attentes non commencées supprimables ; ne pas prétendre tous les runs protégés. |
| Runs IN_PROGRESS et COMPLETED | organization/team/evaluation/schedule PROTECT ; pas supprimés par le filtre NOT_STARTED | Une référence cohérente conservée bloque la suppression via ProtectedError ; transaction annulée. Ne pas affirmer que toutes les complétions sont supprimées. |
| Snapshots de questions/réponses | RunQuestion→run CASCADE, source_question PROTECT, texte/note/repères/lignée snapshotés | Préservés avec run conservé ; pas une protection générale des modèles n’ayant jamais été utilisés. |
| Journal et Logs | [JournalEntryFields/LogEntry](../../../../backend/journals/models.py) : liens organisation/équipe/évaluation SET_NULL ; noms snapshotés conservés | Lignes non effacées par ces FK, mais liens vivants perdus ; snapshots ne reconstruisent pas les objets supprimés. |
| Visibilité des journaux | [scope.py](../../../../backend/journals/adapters/api/scope.py) filtre Admin par organisation ; Superadmin global | Une entrée dont organisation devient NULL n’est plus dans le scope Admin de cette organisation supprimée ; la conservation physique ne garantit pas une consultation métier identique. |
| Notifications en file | [EmailNotification](../../../../backend/notifications/models.py) : organisation/team/evaluation/schedule SET_NULL ; corps/destinataire persistés | Liens peuvent disparaître tandis que contenu persiste ; politique de devenir des intentions/contenus à décider, pas d’effacement ni de remise présumés par l’audit. |
| Comptes et données personnelles d’accès | Identités conservées ; files de récupération et sessions ne sont pas des dépendances CASCADE Organisation directes | Ne pas assimiler suppression du périmètre et purge/anonymisation de l’identité. |
| Reçus de purge | JournalPurgeRun sans FK Organisation | Aucun mécanisme de suppression métier ou sauvegarde de l’organisation n’en découle. |

Cette lecture décrit un comportement conditionnel, pas une nouvelle preuve d’exécution.
Les [tests de suppression existants](../../../../backend/tests/test_organization_delete.py)
couvrent organisation sans dépendance métier, comptes conservés et refus de rôle/ID inconnu.
Ils ne constituent pas une matrice de conservation complète des dépendances ci-dessus.

## Cas à décider et à prouver, sans politique choisie

| Cas fictif isolé | Comportement déduit du code | Décision manquante / preuve requise |
| --- | --- | --- |
| Organisation sans équipe/modèle/plan/run | Suppression physique et liens M2M retirés, comptes conservés | Acquis historique à préserver ; vérifier Journal/contextes selon la politique applicable. |
| Équipe archivée + modèle validé, aucun run | Pas de PROTECT issu d’un run ; cascade possible | Produit choisit refus, archivage ou suppression autorisée avec conséquences explicites. |
| Plan et attentes NOT_STARTED uniquement | Attentes explicitement supprimées ; cascade peut ensuite réussir | Décider la conservation/annulation des engagements et des notifications liées. |
| Au moins un run IN_PROGRESS/COMPLETED conservé | PROTECT bloque ; HTTP 400, transaction à annuler entièrement | Tester absence de suppression des attentes NOT_STARTED et absence d’activité de succès commise lors de ce refus. |
| Journal/Logs/notifications sans run protecteur | Liens SET_NULL ; objets historiques et visibilité changent | Décider maintien de consultation, contenu, rattachement et accès après disparition de l’organisation. |
| Suppression concurrente avec début de passation | Invariants peuvent être sollicités pendant les écritures | Préparer un vrai test concurrent de la politique retenue ; ne déduire ni sécurité complète ni perte certaine de la seule lecture. |

## Questions à soumettre au produit/MESS

1. Définir l’admissibilité par famille de dépendance et par état, y compris équipe archivée, version
   validée/archivée, plan, attente, brouillon commencé et complétion.
2. Choisir refus, archivage ou suppression explicitement autorisée et leurs effets ; le choix doit
   couvrir liens Coachs, notifications, journaux et preuves, pas seulement l’objet Organisation.
3. Définir l’autorité, la confirmation/information nécessaire, l’accès futur aux faits et l’intégrité
   des provenances ; aucune règle de purge/anonymisation ne découle de ce chantier.
4. Si limitation du candidat MESS : décider son périmètre et faire démontrer la barrière effective
   côté API. Masquer le bouton, omettre un cas du cahier ou accepter un risque sans protection ne suffit pas.

## Protections minimales à démontrer après choix

- Contrôle d’admissibilité réel avant effet irréversible, appliqué à l’API et sous concurrence pertinente ;
  les seules décisions déjà prises (rôle, comptes conservés) restent obligatoires.
- Préservation des données/preuves requises par la politique approuvée ; refus sans effet partiel,
  sans activité de succès commise et sans divulgation hors scope.
- Conséquences sur chaque type de dépendance vérifiées par relecture DB/Journal/Logs/intentions ;
  vrais tests nominaux/refus et non-régression du cas vide.
- Critère de conformité du candidat : politique ou limitation approuvée **et effectivement protégée**,
  avec preuve rattachée au SHA. Ceci est une condition de recette, pas le choix d’une solution technique.

**ORG-004** reste Bloqué/N/A. **MEP-033** ne peut conclure l’administration conforme si un parcours
destructif non arbitré demeure exposé ; **MEP-034** vérifie droits/refus/invariants de la solution retenue.
**MEP-035** ne peut rendre GO sans traitement de cet arbitrage nécessaire ; un NO-GO motivé n’achève
aucun PBI. Décider et protéger ce risque peut avancer indépendamment de la distribution MESS,
sans autoriser une implémentation pendant la présente consolidation.
