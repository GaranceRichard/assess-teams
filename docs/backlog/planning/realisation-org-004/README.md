# ORG-004 — Réalisation de la politique approuvée

Décision du responsable produit le 2026-11-14 : ARB-ORG-005 option A, R01–R09 approuvées.
[Proposition historique publiée](../arb-org-005/README.md) au commit `c82f4e416a848020c2c6b3996e95772109083eaa`.
[Registre canonique](../../source/00-arbitrages-organisations.md#arb-org-005--états-et-cycle-de-vie-dune-organisation).
Aucune validation externe MESS requise pour cet arbitrage. D non retenu.
R03 respecte les durées et mécanismes de rétention existants ; aucune conservation illimitée.
ORG-004 est Ouvert / N/A ; la livraison technique ne vaut pas clôture fonctionnelle.

## Préparation du changement — politique et provenance

- Périmètre : réaliser le contrôle serveur des dépendances et la provenance durable des traces, sans cycle de vie supplémentaire ni nouvelle politique de purge.
- Objectif : supprimer une organisation admissible sans compte perdu, et refuser explicitement toute destruction de patrimoine métier protégé.
- Effets attendus : refus HTTP 400 par catégorie sans activité de succès, succès physique réservé au Superadmin, traces distinguables après disparition du périmètre.
- Risques : cascades indirectes, perte d’origine par SET_NULL, course de création ou de passation, divulgation de traces et modification accidentelle des rétentions existantes.
- Vérification : tests S01–S11 sur API et ORM, migration de données encore reliées seulement, rollback et SQLite fichier/processus distincts, puis frontend et E2E réels.
- Fichier : `backend/identities/application/organization_deletion.py`
- Fichier : `backend/identities/adapters/api/organization_detail_views.py`
- Fichier : `backend/journals/models.py`
- Fichier : `backend/journals/services.py`
- Fichier : `backend/journals/log_context.py`
- Fichier : `backend/journals/middleware.py`
- Fichier : `backend/journals/adapters/api/serializers.py`
- Fichier : `backend/journals/adapters/api/filters.py`
- Fichier : `backend/journals/adapters/api/views.py`
- Fichier : `backend/journals/migrations/0011_organization_origin.py`
- Fichier : `backend/tests/organization_delete_helpers.py`
- Fichier : `backend/tests/test_organization_delete_policy.py`
- Fichier : `backend/tests/test_organization_delete_provenance.py`
- Fichier : `backend/tests/test_organization_delete_concurrency.py`
- Fichier : `backend/tests/organization_delete_concurrency.py`
- Fichier : `backend/tests/organization_delete_process.py`
- Fichier : `backend/tests/test_journal_origin_migration.py`
- Fichier : `backend/tests/test_organization_delete_contract.py`
- Fichier : `backend/tests/test_organization_delete.py`
- Fichier : `backend/tests/test_logs_api.py`
- Fichier : `backend/tests/test_journal_openapi.py`

## Préparation du changement — confirmation et consultation

- Périmètre : aligner la confirmation et les refus sur le backend approuvé, et afficher la provenance des traces sans donner de droit supplémentaire.
- Objectif : rendre les conséquences de suppression et les catégories bloquantes compréhensibles, y compris lorsque la situation évolue pendant la confirmation.
- Effets attendus : annulation sans requête, dialogue conservé sur refus explicite, retrait de la liste uniquement après succès, origine visible dans les traces accessibles.
- Risques : masquer un refus métier par un message générique, double clic, confusion entre organisations homonymes, accessibilité du dialogue ou augmentation du périmètre de lecture.
- Vérification : tests React nominaux et refus, provenance connue et inconnue, E2E avec backend réel pour succès, annulation, dépendance apparue et relecture après refus.
- Fichier : `frontend/src/OrganizationDeleteDialog.tsx`
- Fichier : `frontend/src/OrganizationPage.tsx`
- Fichier : `frontend/src/OrganizationDelete.test.tsx`
- Fichier : `frontend/src/journals.ts`
- Fichier : `frontend/src/JournalEntries.tsx`
- Fichier : `frontend/src/LogEntries.tsx`
- Fichier : `frontend/src/OrganizationTraceProvenance.test.tsx`
- Fichier : `frontend/e2e/organization-deletion.spec.ts`

## Choix de réalisation

Réutiliser `lock_identity_changes` avant la première lecture du DELETE dans sa transaction atomique.
Contrôler les relations directes et indirectes, sans filtre d’état ; retirer la suppression explicite
NOT_STARTED de ce parcours. Aucun compte ni rattachement à un autre périmètre n’est effacé.
Ajouter `organization_origin_id` nullable et non relationnel aux deux types de traces, capturé lors de
leur création. Compléter les seules lignes encore reliées par migration ; ne jamais inférer du nom.
Les filtres d’origine restent appliqués après le scope autorisé, sans droit résiduel ancien Admin.
Les traces restent soumises aux purges existantes et aucune durée n’est modifiée.

La qualification prépare MEP-033/034 et le GO/NO-GO MEP-035 ; elle ne constitue pas un PV cible MESS.
TEAM-002/003/005 et C04 restent clos ; transfert, archivage Organisation, rétention générale et D exclus.
Les résultats et la proposition de clôture seront consignés dans le présent dossier après validation.


## Qualification et revue de contenu

[Correspondance S01–S11 et preuves](preuves.md). Préparation réellement écrite avant les tests puis le
code ; les chemins ont été définis dans les deux blocs ci-dessus. Aucun écart de préalable technique.
Revue agent : document propriétaire adapté au contrat Organisation et aux traces, sans remplissage
artificiel ; le README produit et les contrats API/Journal changent car le comportement public change.
Les sources/suivi et vues dérivées reflètent la décision rendue ; les audits datés restent historiques.
AGENTS, règles, charte, DoD, stratégie de tests et fondamentaux examinés, aucune norme qualité modifiée.
La migration ne reprend que les liens existants ; pas de nouvelle rétention, purge ou capacité Organisation.
La revue et les preuves de l’agent ne remplacent pas l’approbation fonctionnelle demandée au produit.
