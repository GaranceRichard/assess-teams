# Versionnement des modèles d’évaluation

## Audit et choix d’architecture

`Evaluation` porte déjà l’organisation, le nom et le lifecycle ; `Question` porte le texte et
l’ordre. `EvaluationSchedule.evaluation` et `EvaluationRun.evaluation` sont des FK exactes, et
`EvaluationRunQuestion` conserve question source, texte, ordre et score. Aucun moteur de
référentiel distinct n’existe. Les scopes Admin/Superadmin et les journaux communs sont réutilisés.

Le parent minimal `EvaluationFamily` porte l’organisation, un nom stable initial et le compteur
`next_version`. `Evaluation` reste la version, avec son ID existant, sa FK `family`, son entier
`version`, son nom de version et son statut. Renommer un brouillon change son nom de version,
jamais l’identité ni le nom stable de la famille. Aucun endpoint de réaffectation de famille ou
d’organisation n’est ajouté. Le nom de famille n’est pas unique : l’identité est son ID.

La DB garantit `version >= 1`, l’unicité `(family, version)` et au plus une ligne `VALIDATED`
par famille, via une contrainte conditionnelle. Les FK/index/questions existants restent en place.
La création ORM sans famille, utilisée par le bootstrap existant, crée aussi une famille v1.
L’API n’accepte pas de numérotation ni de famille imposée par le client.

## Création et concurrence

Créer un modèle initialise une famille et v1 `DRAFT`. `POST /api/admin/evaluations/{id}/versions/`
sans corps crée la prochaine version `DRAFT` depuis toute version accessible, y compris archivée.
Réponse `201` : modèle complet avec `family_id`, `family_name`, `version`, nom et statut.
Session Admin de l’organisation ou Superadmin, CSRF obligatoire ; refus `403`/`404` selon le cas.
La source est déterminée par l’URL ; les champs supplémentaires du corps sont ignorés.

La transaction prend d’abord un verrou d’écriture sur l’organisation, avant ses lectures, puis
incrémente atomiquement le compteur de famille. Cela protège aussi l’index interne par organisation
et fonctionne avec SQLite, où `select_for_update` seul ne verrouille pas les lignes.
Les mutations de brouillon et le lifecycle partagent ce verrou pour copier une source cohérente.
Le nom et chaque question sont copiés exactement, avec leurs index, y compris les trous d’ordre.
Les IDs des questions copiées sont distincts, mais leur lignée UUID explicite est conservée depuis
`0013_question_lineage`. Renommer un brouillon copié conserve cette lignée ; une nouvelle question
en reçoit une nouvelle. Aucun planning, run ni réponse n’est copié.
Tout échec annule copie, compteur et événement de succès. Deux demandes concurrentes réussies
obtiennent deux numéros distincts. Supprimer un brouillon reste possible ; son numéro n’est
jamais réutilisé, donc la suite peut présenter un trou après suppression explicite.

## Lifecycle et version active

Chaque version suit uniquement `DRAFT → VALIDATED → ARCHIVED`. Validation explicite : nom
non vide, au moins une question, textes des questions valides. Seul `DRAFT` est éditable ou
supprimable ; les modèles et questions validés/archivés restent immuables par les API métier.

Valider une nouvelle version archive automatiquement l’ancienne `VALIDATED`, puis valide le
brouillon, dans une seule transaction. Le dialogue explique ce remplacement. Ce choix évite
une étape d’archivage manuel qui interromprait inutilement la planification courante. Un refus
de validation laisse la version active intacte. Une famille peut avoir zéro version active.
Les brouillons restent linéaires, sans branches ni rollback ; une version archivée ne redevient
jamais validée. La création depuis une ancienne version reçoit toujours le prochain numéro global.

Le Journal d’activité enregistre création de version, validation, archivage explicite et automatique
avec nom/ID de famille et numéro. Les erreurs utilisent `describe_log_attempt` et le gestionnaire
commun des Logs, sans logging HTTP supplémentaire. Les anciens événements restent inchangés.

## Planning et passation

Le sélecteur de création affiche uniquement les versions `VALIDATED` : famille et numéro visibles.
Une ancienne référence archivée reste visible et désactivée dans la modale de modification.
Le backend refuse `DRAFT`/`ARCHIVED` à la création et modification (`404`), même avec un ID forgé.
Les doublons de planning encore actifs sont refusés par équipe–version ; une complétion ponctuelle
autorise une nouvelle planification indépendante. v1 et v2 conservent leurs propres planifications.

Valider/archiver ne modifie aucun planning ni run. `EvaluationRun.evaluation_id` conserve la
version exacte ; les snapshots de questions, scores et provenance ne sont pas reconstruits.
Les lectures de planning/run ajoutent `family_id`, `family_name`, `evaluation_version`, dérivés
de cette FK historique. React montre aussi le nom historique du run s’il diffère du nom de famille.
Le démarrage reste réservé à un modèle actuellement validé selon le lifecycle déjà livré ;
une attente sur v1 ensuite archivée reste consultable mais ne peut plus être démarrée. Une passation
commencée reste reprenable, finalisable et révisable sur v1, indépendamment de v2.

## Migration et vérification

Le [contrat Results](results-api.md) sélectionne l’ID exact de version, y compris archivée, et conserve
les axes/scores des snapshots. Le longitudinal compare uniquement les observations d’une lignée
explicitement conservée ; la migration `0013` ne rapproche pas les anciennes copies historiques.

`assessments.0011` crée une famille distincte pour chaque `Evaluation` existante et l’y rattache en
v1, compteur à 2. Elle conserve IDs, noms, statuts, index, questions, FK de planning/run et snapshots.
Deux noms égaux ne sont pas fusionnés. Aucun numéro antérieur, date de validation ou historique
inconnu n’est inventé. `journals.0007` ajoute seulement le choix d’action de création de version.

Les tests couvrent création/copieur/ordre/source, contraintes DB, rollback, état actif, scopes,
API/OpenAPI, migration avec snapshots et journaux, et concurrence sur SQLite avec fichier réel.
Vitest couvre affichage, actions, erreurs, requêtes CSRF et références historiques.
Playwright couvre v1 validée et planifiée, passation commencée, v2 copiée et modifiée puis validée,
archivage automatique de v1, complétion historique sur v1 et nouveau planning/passation sur v2.

Le longitudinal Results est documenté séparément ; agrégation, comparaison globale ou statistique,
import/export et publication externe restent hors périmètre du versionnement. La version constitue seulement l’ancre du référentiel historique.

## Repères d’appréciation

`QuestionScoreGuide` dépend de la question de version exacte, jamais de sa seule lignée.
La copie conserve score et texte en créant des lignes indépendantes dans le même verrou d’organisation.
Les API refusent toute mutation VALIDATED/ARCHIVED, y compris suppression des seuls repères.
Les snapshots ne sont jamais relus depuis une version plus récente : voir [repères](score-guides.md).
