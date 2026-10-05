# Passation des évaluations planifiées

La route React `/evaluations` est ouverte aux Admins et Coachs selon la navigation existante.
Le backend applique la session Django et le CSRF aux mutations ; il décide toujours du périmètre.

## Données conservées

`EvaluationRun` référence la planification source et sa date d’échéance, son organisation,
son équipe, son modèle et son assigné. L’unicité `(schedule, due_date)` évite les doublons.
La première passation attendue est créée à la planification ; les échéances récurrentes le sont
par le traitement de notifications existant, avant l’avancement de `next_due_date`.
La migration reprend les planifications existantes ayant un assigné, sans inventer leurs cycles passés.

L’état vaut `not_started`, `in_progress` ou `completed`. Au démarrage, un modèle local non vide
au statut `VALIDATED` est contrôlé et verrouillé, puis ses questions exactes, textes et index sont
copiés dans `EvaluationRunQuestion`. Les modèles validés sont déjà immuables grâce à `EVAL-002`.
L’archivage interdit un nouveau démarrage, mais ne bloque ni reprise, ni complétion, ni révision
d’une passation commencée. Le snapshot garantit la provenance avec la FK de version exacte.
Le [versionnement](evaluation-versioning.md) conserve les runs existants et ajoute en lecture
`family_id`, `family_name`, `evaluation_version` ; le nom historique du run reste conservé.
Une réponse appartient à une seule passation, référence la question source protégée et porte
une note entière `0..10` ou `null` avant réponse. Contraintes DB : état, provenance cohérente,
unicité échéance, question/index uniques et index positif, notes entières et bornées même sous SQLite.

Les noms d’organisation, équipe, modèle, assigné, auteur initial et dernier réviseur sont figés.
Les comptes supprimés rendent leurs FK nulles sans supprimer ces noms historiques.
`completed_by`/`completed_at` sont fixés à la première finalisation. `revised_by`/`revised_at`
décrivent uniquement la dernière révision, sans changer la complétion initiale.
Les modifications ultérieures du planning ne transfèrent pas une passation déjà commencée.
La suppression d’un modèle, question, planning ou organisation utilisé par une passation commencée
est refusée avec `400` ; les attentes jamais commencées peuvent être retirées avec leur source.

## API minimale

| Méthode / chemin | Effet / réponse |
| --- | --- |
| `GET /api/evaluations/` | Tableau accessible, `200` liste |
| `GET /api/evaluations/{run_id}/` | Contexte, questions ordonnées et réponses, `200` |
| `POST /api/evaluations/{run_id}/` | Démarrage ou reprise idempotente, aucun payload, `200` |
| `PUT /api/evaluations/{run_id}/responses/{question_id}/` | JSON `{ "score": 0 }`, sauvegarde, `204` |
| `POST /api/evaluations/{run_id}/finalize/` | Finalisation atomique, aucun payload, `200` |
| `PUT /api/evaluations/{run_id}/revision/` | Toutes les réponses `{ "answers": [{ "question_id": 1, "score": 10 }] }`, `200` |

Liste et détail exposent modèle, organisation, équipe, assigné original, auteur réel de complétion,
date initiale, état, date d’échéance et dernière révision. Les IDs de provenance sont également exposés.
`is_assignee` et `can_revise` alimentent l’interface, sans remplacer la permission backend.
Avant démarrage, le détail contient une liste de questions vide ; `POST` fige ensuite les questions.
La finalisation exige toutes les notes ; sa répétition ne change ni date/auteur ni Journal d’activité.
La révision exige exactement toutes les questions, une seule fois, et ne sauvegarde rien en cas de refus.

`400` refuse les notes hors bornes, flottantes, booléennes, chaînes, nulles ou structures invalides,
les questions étrangères, les champs de contexte forgés, le modèle vide ou non validé, l’équipe archivée au démarrage,
les réponses manquantes et la modification d’une complétion hors révision Admin.
`403` refuse Viewer, anonyme, CSRF manquant et révision par Coach ; `404` masque tout ID hors périmètre.
Le schéma DRF/Spectacular est généré par `/api/schema/` et testé avec sa validation complète.

## Permissions, interface et activités

Un Coach membre de l’organisation lit/remplit seulement ses assignations, puis les consulte après validation.
Un Admin lit toutes les attentes et complétions de son organisation, peut répondre à la place de l’assigné
et réviser les complétions. Le Superadmin conserve son périmètre global. Aucun droit Viewer n’est ajouté.
Les scopes se basent sur l’organisation historique de la passation, jamais sur un ID fourni dans le payload.
Le scope de lecture est aussi utilisé par les mutations : après verrouillage de la passation courante,
le service revérifie l’assignation et l’appartenance à l’organisation dans sa transaction. Si ce contexte
a changé depuis la première lecture HTTP, la mutation retourne `404`, sans réponse modifiée ni activité métier.

Une même modale native sert passation, consultation et révision : question X/N, range entier accessible
au clavier, note affichée, précédent/suivant, sauvegarde ordonnée, erreurs et reprise après interruption.
La finalisation attend la confirmation des sauvegardes ; une révision est validée atomiquement.
Lorsque « Suivant » confirme la note proposée, le range est temporairement désactivé jusqu’à la sauvegarde ;
un refus laisse la même question ouverte et réactive la saisie pour réessayer.
Le tableau distingue « Assigné à » de « Rempli par » et indique « Révisé par [ADMIN] le [date/heure] ».

Le Journal d’activité existant enregistre `evaluation_completed`, `evaluation_completed_by_admin`
et `evaluation_revised` dans la transaction métier. GET, sliders, sauvegardes et navigation n’y créent rien.
Le gestionnaire commun des erreurs couvre aussi `/api/evaluations/`, avec son contexte d’organisation,
sans nouvelle infrastructure, stockage de payload ni journalisation HTTP spécifique.
