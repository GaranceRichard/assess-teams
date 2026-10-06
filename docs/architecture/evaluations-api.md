# Contrat API des évaluations et planifications

## Gestion des modèles d’évaluation et de leurs questions

`GET` et `POST /api/admin/evaluations/` listent et créent les modèles. La création exige
`organization_id` et `name`; une cible hors périmètre retourne `404`. Tout nouveau modèle est `DRAFT`.
`PUT` et `DELETE /api/admin/evaluations/{evaluation_id}/` renomment ou suppriment physiquement uniquement
un brouillon et ses questions. Un modèle `VALIDATED` ou `ARCHIVED` refuse ces mutations (`400`).
Un modèle expose `id`, `organization_id`, `name` et un `status` en lecture seule. Son index est attribué
automatiquement, détermine l’ordre de la
collection et reste absent des requêtes comme des réponses afin d’être invisible à l’utilisateur.

`GET` et `POST /api/admin/evaluations/{evaluation_id}/questions/` listent et ajoutent les questions du modèle.
`PUT` et `DELETE /api/admin/questions/{question_id}/` modifient ou suppriment une question. Chaque question
possède un index positif unique attribué automatiquement dans son modèle et un nom obligatoire. L’index reste
absent des écritures, mais numérote la liste triée renvoyée en lecture. Toute mutation d’une question
d’un modèle validé ou archivé retourne `400`, y compris une tentative de changement d’ordre.

`POST /api/admin/evaluations/{evaluation_id}/validate/` sans corps passe un brouillon à `VALIDATED`
si son nom est non vide et s’il contient au moins une question au texte valide. La validation archive
transactionnellement l’ancienne version active de sa famille. `POST .../archive/` sans corps passe
uniquement `VALIDATED` à `ARCHIVED`, sans suppression. Ces actions retournent le modèle (`200`),
journalisent le succès et refusent état/complétude invalides (`400`), fonction (`403`) ou périmètre (`404`).
Aucune transition inverse n’existe. Les modèles archivés et leurs questions restent dans les lectures.
La migration `0007` reprend comme validés les modèles déjà planifiés et laisse les autres en brouillon.

Toutes ces routes exigent une session active de Superadmin ou d’Admin et un jeton CSRF pour les écritures.
Le Superadmin voit toutes les organisations ; l'Admin ne voit que les évaluations et questions de son
organisation. Pour les évaluations historiques, une seule organisation constitue l'unique affectation possible ;
la migration historique `0003` la renseigne automatiquement. Avec zéro ou plusieurs organisations, elle s'interrompt pour exiger
une résolution explicite.

Toute future ressource métier, y compris le journal d'activité, porte ou hérite d'une organisation et applique
les mêmes scopes backend : vue globale pour le Superadmin, organisation unique pour l'Admin. Un identifiant
fourni dans une URL ou un corps JSON ne remplace jamais cette vérification.

## Familles et versions

Le [contrat de versionnement](evaluation-versioning.md) décrit `POST .../{id}/versions/` (`201`),
les champs read-only `family_id`, `family_name`, `version`, les verrous et la migration conservant les IDs.
Les réponses planning ajoutent `family_id`, `family_name`, `evaluation_version` sans modifier les FK historiques.

## Planification des évaluations

`GET /api/admin/planning/` liste toutes les planifications pour le Superadmin et uniquement celles de l’organisation de l’Admin. React les présente sur une ligne cliquable `ORGANISATION - FAMILLE vN - ÉQUIPE - RESPONSABLE`, surlignée au survol, qui ouvre la modification et la suppression dans une même modale. `POST` accepte `organization_id`, `team_id`, `evaluation_id`, `assignee_id`, `mode` et, sauf pour le mode immédiat, `first_due_date`. Les modes autorisés sont `immediate`, `fixed`, `monthly` et `quarterly`.

Le mode immédiat fixe la première échéance à la date locale du serveur et refuse une date fournie. Les trois
autres modes exigent une date présente ou future. L’équipe doit être active ; l’équipe et le modèle doivent
appartenir à l’organisation accessible. Le modèle doit être `VALIDATED` ; brouillon et archive retournent
`404` à la création comme à la modification. Le responsable doit être un Coach ou un Admin actif de cette même
organisation et posséder une adresse e-mail. Le Superadmin peut également désigner un Superadmin actif ; un
Admin ne peut jamais le faire. Un Coach choisi est rattaché à l’équipe dans la même transaction ; un Admin peut
être choisi même si l’équipe possède déjà un Coach, sans devenir Coach de l’équipe. Une planification
ponctuelle (`immediate` ou `fixed`) dont toutes les passations sont complétées autorise une nouvelle
planification indépendante pour la même équipe et le même modèle, même à la même date. L’historique,
les notes, les snapshots et la provenance des passations précédentes sont conservés. Une planification
récurrente, sans passation ou avec une passation non complétée bloque encore les doublons (`400`).
La migration `0012` retire l’unicité historique équipe–modèle sans modifier les données ; l’unicité
planification–échéance des passations reste en vigueur. Les incohérences retournent `400`, les ressources absentes
ou hors périmètre `404`, et un Coach, Viewer ou visiteur reçoit `403`.

`PUT` et `DELETE /api/admin/planning/{schedule_id}/` remplacent les paramètres ou suppriment la planification.
Le Superadmin agit globalement ; un Admin reste dans son organisation. La modification réapplique les validations
de création. L’archivage d’un modèle conserve toutes les planifications existantes, lisibles avec leur référence.
Le sélecteur de création ne propose que les modèles validés ; la modale conserve la référence archivée historique
désactivée et impose un modèle validé pour enregistrer des modifications.

Une planification future envoie au responsable une confirmation précisant équipe, modèle, cadence et prochaine
date. À l’échéance, ou immédiatement, le responsable reçoit un lien vers `${FRONTEND_URL}/evaluations`.
La commande idempotente `send_due_evaluation_notifications` traite les échéances dues ; après envoi, une
cadence mensuelle ou trimestrielle avance sans dérive calendaire, tandis qu’une échéance ponctuelle est close.
Après authentification, ce lien conserve `/evaluations` au lieu de renvoyer le Coach vers le tableau de bord.
