# Journal d’activité et Logs

`GET /api/admin/activity-journal/` expose les actions métier réussies. Ses filtres historiques restent
`date`, `organization_id`, `player` et `team`. `GET /api/admin/logs/` expose le journal technique HTTP
et les événements techniques explicites, comme les notifications. Les collections restent séparées,
en lecture seule, triées par `created_at` puis identifiant décroissants et paginées par 20 (`page`).
Une mutation réussie peut produire une `ActivityEntry` métier et une `LogEntry` HTTP.

## Capture HTTP

`journals.middleware.HttpLogMiddleware`, placé avant les middlewares susceptibles de refuser une requête,
enregistre une seule réponse pour chaque GET/POST/PUT/PATCH/DELETE sur `/api/*`, succès et erreurs compris.
Health, schéma, Swagger et leurs sous-ressources sont exclus, ainsi que les routes hors API et OPTIONS/HEAD.
Une lecture des Logs produit une entrée après la pagination : aucune nouvelle requête HTTP ni récursion.
Les niveaux par défaut sont 2xx/3xx INFO, 4xx WARNING, 5xx ERROR. Aucune route applicative actuelle ne
supporte PATCH ; ses refus sont capturés, et la capture est prête pour une future route.

Le middleware génère un UUID interne, renvoyé en `X-Correlation-ID` et persisté comme `correlation_id`.
L’opération par défaut est le nom statique de route, jamais l’URL brute. Les vues enrichissent `LogContext`
avec les objets déjà autorisés via `describe_log_attempt`, partagé entre DRF et Django. Sans contexte,
un utilisateur membre d’une seule organisation permet d’attribuer celle-ci ; le Superadmin reste global.
Aucune donnée de body, query ou identifiant de ressource non autorisée ne sert à un lookup d’enrichissement.
Les équipes et évaluations doivent appartenir à l’organisation sûre du contexte.

Les exceptions 5xx restent dans les logs serveur, avec le même UUID, sans message d’exception ni traceback
persisté dans LogEntry. Un échec de stockage est signalé au serveur avec l’UUID sans casser la réponse API.
Les transactions métier et le Journal d’activité conservent leur fonctionnement indépendant.

## Modèle et migration

Chaque Log conserve date, niveau, source, opération, catégorie, message, corrélation et relations/snapshots
organisation, acteur et équipe. La migration `journals.0007` ajoute `method` (vide pour l’historique),
`status_code` (nullable), `evaluation` (FK nullable SET_NULL) et `evaluation_name` (snapshot vide).
La migration de fusion `journals.0008` rejoint l’évolution du Journal métier arrivée simultanément sur main.
Elle conserve les anciennes lignes, niveaux et corrélations sans reclassification des erreurs historiques.
Les labels connus restent lisibles après suppression des objets ; ils sont nettoyés avant stockage.
Les nouveaux index portent méthode, statut, niveau et source ; date et FKs étaient déjà indexées. Les listes
chargent les relations avec `select_related`, sans requête par ligne.

## Filtres et scopes

Les filtres des Logs sont combinables : `organization` (alias historique `organization_id`), `actor`,
`team`, `evaluation` (identifiants positifs), `from`, `to` (date/heure ISO 8601, fuseau recommandé), `method`,
`level`, `source`, `status_code` (100–599) et `page`. Les bornes sont inclusives ; une plage inversée
ou une valeur invalide retourne 400. Une page inexistante retourne 404.

Le scope est appliqué au queryset avant tous les filtres. Le Superadmin voit les logs de toutes les
organisations et ceux sans organisation. L’Admin voit exclusivement son organisation unique, même avec
un filtre organisation/acteur/équipe/évaluation forgé ; un Admin sans rattachement unique reçoit 403.
Coachs, Viewers et anonymes reçoivent 403. Les paramètres ne peuvent pas élargir un scope.

Le sélecteur Évaluation distingue les versions avec le libellé de référence existant ; chaque filtre
cible l’identifiant exact de version. La création de version fournit le modèle créé au contexte HTTP.

La page Logs propose Organisation, Utilisateur, Équipe, Évaluation, Du, Au, Méthode, Niveau, Source et
Statut, avec conversion des dates locales en ISO UTC, puis pagination backend. L’organisation est imposée
pour l’Admin. Les ressources Organisation (membres), Équipe et Évaluation existantes alimentent les
sélecteurs : aucun membre, équipe ou modèle d’une autre organisation ne reste sélectionnable. Changer
d’organisation réinitialise les trois sélections dépendantes et ignore les réponses devenues obsolètes.
Les Logs utilisent `include_archived=true` sur la ressource Équipe existante pour inclure les archives ;
les snapshots des suppressions restent consultables dans les lignes. INFO reste normal, WARNING ambre et ERROR rouge, avec labels textuels.

## Confidentialité et vérification

La capture ne lit ni ne persiste corps, password, token, cookie, session, CSRF, Authorization, API key,
secret, headers sensibles, query sensible, IP, User-Agent ou fingerprint. Seuls les champs HTTP autorisés
et le contexte métier déjà connu sont conservés. Les événements techniques explicites utilisent des
messages contrôlés et nettoyés ; ils ne reçoivent aucune donnée brute de requête.

Les tests API couvrent CRUD réel, refus PATCH, erreurs 4xx/5xx, contexte, corrélation, confidentialité,
non-récursion, bornes temporelles, filtres combinés, pagination et tentatives inter-organisations.
React couvre les dix filtres, dépendances/reset, Admin/Superadmin, erreurs et pagination.
Playwright crée des logs par des requêtes réelles, filtre dans l’UI et vérifie l’isolation organisationnelle.

Les transitions User enregistrent acteur, organisation, `target_user` et `target_user_name` dans le Journal.
Les anciennes entrées restent intactes ; les refus métier restent dans les Logs HTTP opérationnels.
Voir le [lifecycle User](user-lifecycle.md).
