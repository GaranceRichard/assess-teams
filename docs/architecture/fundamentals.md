# Fondamentaux architecturaux

Ce dossier fixe les fondamentaux architecturaux de **Assess teams**. Ils définissent une direction et des règles de conception ; les détails complets des quality gates restent dans les documents qualité du projet.

## Navigation par responsabilité

- [Architecture hexagonale](hexagonal-architecture.md) : Domain, Application, Ports, Adapters, dépendances et organisation métier.
- [Clean Code](clean-code.md) : lisibilité, simplicité, responsabilités, taille des fichiers et pragmatisme.
- [API backend et OpenAPI](backend-api.md) : exposition HTTP avec Django REST Framework, contrat OpenAPI et Swagger UI.
- [Environnements et identités locales](../development-environments.md) : réglages explicites et données locales isolées.

## Complémentarité

L'architecture hexagonale organise les dépendances et les responsabilités à grande échelle. Clean Code organise la qualité et la lisibilité à petite échelle. Le contrat OpenAPI rend explicite la frontière HTTP exposée par les adapters backend.

Une architecture hexagonale avec des classes massives, des services génériques ou une forte complexité reste une mauvaise architecture. Du Clean Code fortement couplé à Django ou à l'infrastructure ne respecte pas non plus l'architecture attendue. Une API non documentée ou incohérente avec son schéma ne fournit pas un contrat exploitable. Ces principes doivent être respectés simultanément.

L'interface React expose la gestion des identités Superadmin sur la route `/users`, jamais sur le tableau de
bord. Son toggle illustré soleil/lune applique le thème au document complet et mémorise le choix dans le
navigateur.

Les [palettes personnelles](interface-palettes.md) reposent sur `identities.User.interface_palette`,
les réponses de session et `PATCH /api/session/`. Le sélecteur de l’en-tête applique des tokens CSS
sémantiques partagés en jour/nuit. Le backend reste autoritaire ; les séries du radar sont indépendantes.

La route `/organization`, visible pour les Superadmins et Admins, matérialise le vertical slice
React → API DRF → ORM pour créer ou renommer une organisation, puis ajouter ou retirer ses membres depuis sa fiche.

La route `/teams` confie au domaine Django `teams` le cycle de vie des équipes. Son sélecteur fixe explicitement
l’organisation administrée avant toute lecture ou écriture et l’API revalide systématiquement ce périmètre.

La route `/templates` confie au domaine Django `assessments` le référentiel administratif des modèles
d’évaluation et de leurs questions ordonnées. Le cycle `DRAFT → VALIDATED → ARCHIVED` est irréversible :
seuls les brouillons sont modifiables ou supprimables ; validation et archivage sont des actions auditées.
`EvaluationFamily` rassemble les versions `Evaluation` ; leur [versionnement](evaluation-versioning.md)
conserve les FK historiques et remplace transactionnellement la version active.

La route `/planning` associe une équipe active à un modèle validé de sa propre organisation et fixe une première
échéance immédiate, ponctuelle, mensuelle ou trimestrielle. Le backend demeure l’autorité du périmètre : le
Superadmin agit globalement et l’Admin uniquement dans son organisation. Un Coach ou Admin actif avec e-mail
est désigné comme responsable ; seul le Superadmin peut désigner un Superadmin. Un Coach peut être rattaché
pendant la planification, tandis qu’un Admin reste distinct des Coachs de l’équipe. Les notifications différées
utilisent une commande Django quotidienne et conservent la première échéance comme ancre des récurrences.
Une planification ponctuelle complétée permet de replanifier le même modèle pour la même équipe avec
une nouvelle passation indépendante et un historique conservé ; les planifications encore actives bloquent les doublons.

La route `/evaluations` utilise le domaine `assessments` pour les passations planifiées : brouillon persistant,
questions figées, finalisation et révision Admin avec provenance initiale conservée. Le [contrat de passation](evaluation-taking.md)
décrit les données, contraintes et scopes. Le démarrage exige un modèle validé ; une passation déjà commencée
reste reprenable après archivage du modèle. Le référentiel est versionné ;
le pilotage et le tableau de bord générique restent des placeholders.

La route `/results` compare sur un radar les dernières passations complétées des équipes pour une
version radar automatiquement choisie par famille dans l’organisation. Le [contrat Results](results-api.md)
décrit les snapshots, le scope des passations et l’historique à la demande d’un critère, avec continuité
inter-version uniquement par lignée UUID explicite, sans agrégation.

Les routes `/activity-journal` et `/logs` restent deux verticales de lecture distinctes. Le Journal d’activité
répond à « qui a fait quoi ? » après un succès métier. Les Logs répondent à « que s’est-il passé ? » avec des
événements applicatifs INFO, WARNING et ERROR nettoyés ; React ne déclare jamais le résultat d’une mutation.
Les deux modèles conservent leurs snapshots historiques sans former un framework d’audit, d’Event Sourcing ou
une plateforme d’observabilité.

Une passation commencée protège ses références de la suppression physique. Les autres dépendances d’une
organisation restent supprimées par cascade ; leur arbitrage produit reste suivi par `ARB-ORG-005`.

La [traçabilité HTTP](journals-api.md) est un adapter transverse Django : elle centralise la réponse HTTP
et reçoit uniquement le contexte autorisé des vues, indépendamment des activités métier transactionnelles.
