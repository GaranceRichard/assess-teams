## Journal d’activité et Logs

`GET /api/admin/activity-journal/` expose les actions métier réussies ; `GET /api/admin/logs/` expose les
événements applicatifs utiles à l’exploitation. Les deux collections sont antéchronologiques, paginées par 20
et filtrables avec `date`, `organization_id`, `player` et `team`; les Logs acceptent aussi `level` et `source`.
Aucun `POST`, `PUT`, `PATCH` ou `DELETE` fonctionnel n’est exposé.

Chaque entrée conserve la date complète et des snapshots de l'organisation, de l'auteur et de l'équipe, en
plus de ses relations optionnelles. Une suppression ultérieure ne rend donc pas l'historique illisible. Le
Journal d'activité stocke aussi un code d'action structuré et une description fonctionnelle. Une activité est
créée dans la transaction de la mutation réussie ; tout refus ou rollback exclut l'entrée de succès.

Chaque Log conserve son niveau INFO, WARNING ou ERROR, sa source fonctionnelle, son message nettoyé et son
`correlation_id`; opération et catégorie restent disponibles si pertinentes. Les anciennes erreurs sont
migrées sans perte en ERROR. Aucun corps de requête, traceback, secret, mot de passe, token, cookie ou
credential n’est persisté. Les logs techniques restent distincts et reliables par le `correlation_id`.

Le Superadmin reçoit toutes les entrées. L'Admin est limité par le queryset backend à son organisation unique,
même si un autre `organization_id` est envoyé. Une activité ou un log sans organisation, notamment un log
système, reste visible du seul Superadmin. Les Coachs, Viewers et visiteurs anonymes reçoivent `403`.
