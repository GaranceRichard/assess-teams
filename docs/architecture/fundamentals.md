# Fondamentaux architecturaux

Ce dossier fixe les fondamentaux architecturaux de **Assess teams**. Ils définissent une direction et des règles de conception ; les détails complets des quality gates restent dans les documents qualité du projet.

## Navigation par responsabilité

- [Architecture hexagonale](hexagonal-architecture.md) : Domain, Application, Ports, Adapters, dépendances et organisation métier.
- [Clean Code](clean-code.md) : lisibilité, simplicité, responsabilités, taille des fichiers et pragmatisme.
- [Transactions SQLite](sqlite-transactions.md) : atomicité métier, rollback, provenance et frontières réseau.
- [API backend et OpenAPI](backend-api.md) : exposition HTTP avec Django REST Framework, contrat OpenAPI et Swagger UI.
- [Environnements et identités locales](../development-environments.md) : réglages explicites et données locales isolées.

- [Gestion du mot de passe](password-management.md) : services Django, tokens dédiés, limites atomiques et worker.
- [Sécurisation des connexions](login-security.md) : compteurs par identifiant et origine, concurrence SQLite et proxies fiables.

- [Dates et heures](date-time-presentation.md) : formats de présentation uniformes et fuseaux conservés.
- [Dashboard personnel](dashboard-api.md) : profil, apparence, activité prouvée et raccourcis par rôle.

## Complémentarité

L'architecture hexagonale organise les dépendances et les responsabilités à grande échelle. Clean Code organise la qualité et la lisibilité à petite échelle. Le contrat OpenAPI rend explicite la frontière HTTP exposée par les adapters backend.

Une architecture hexagonale avec des classes massives, des services génériques ou une forte complexité reste une mauvaise architecture. Du Clean Code fortement couplé à Django ou à l'infrastructure ne respecte pas non plus l'architecture attendue. Une API non documentée ou incohérente avec son schéma ne fournit pas un contrat exploitable. Ces principes doivent être respectés simultanément.

L'interface React expose la gestion des identités Superadmin sur la route `/users`, jamais sur le tableau de
bord. Son toggle illustré soleil/lune applique le thème au document complet et mémorise le choix dans le
navigateur.

Les [palettes personnelles](interface-palettes.md) reposent sur `identities.User.interface_palette`,
les réponses de session et `PATCH /api/session/`. Le sélecteur de Mon profil → Apparence applique des tokens CSS
sémantiques pour dix accents ; `theme.css` conserve les cartes claires blanches, dérive le fond central
et les bandeaux clairs de chaque accent via `light-appearance.css` et conserve
exactement les surfaces sombres validées, avec des textes/bordures lisibles. Changer le mode ne change jamais la couleur choisie, et inversement. Le backend reste autoritaire ; les séries du radar sont indépendantes.

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
reste reprenable après archivage du modèle. Le référentiel est versionné.

La route `/results` compare sur un radar les dernières passations complétées des équipes pour une
version exacte sélectionnable par famille dans l’organisation, archives comprises (dernière avec résultats par défaut). Le [contrat Results](results-api.md)
décrit les snapshots, le scope des passations et l’historique à la demande d’un critère, avec continuité
inter-version uniquement par lignée UUID explicite, sans agrégation. Viewer lit uniquement les
COMPLETED de son organisation, sans accéder aux utilisateurs, aux équipes administratives ni aux mutations.

La route `/steering` expose le [Pilotage P0](steering-api.md), projection read-only de couverture et
échéances des équipes actives pour Admin/Superadmin. Elle réutilise les scopes et snapshots, sans scores
ni calcul Results ; son drill-down présélectionne les identifiants accessibles sur le radar courant.

Les routes `/activity-journal` et `/logs` restent deux verticales de lecture distinctes. Le Journal d’activité
répond à « qui a fait quoi ? » après un succès métier. Les Logs répondent à « que s’est-il passé ? » avec des
événements applicatifs INFO, WARNING et ERROR nettoyés ; React ne déclare jamais le résultat d’une mutation.
Les deux modèles conservent leurs snapshots historiques sans former un framework d’audit, d’Event Sourcing ou
une plateforme d’observabilité.

Une passation commencée protège ses références de la suppression physique. Les autres dépendances d’une
organisation restent supprimées par cascade ; leur arbitrage produit reste suivi par `ARB-ORG-005`.

La [traçabilité HTTP](journals-api.md) est un adapter transverse Django : elle centralise la réponse HTTP
et reçoit uniquement le contexte autorisé des vues, indépendamment des activités métier transactionnelles.

Le [lifecycle des identités](user-lifecycle.md) utilise `is_active` : désactivation/réactivation explicites,
identité et provenance conservées, invariant transactionnel du dernier Admin actif et planifications suspendues
jusqu’à réaffectation explicite. Le Superadmin Django reste distinct des fonctions métier.

Le [shell produit](product-layout.md) borne le desktop à 100dvh, avec header/sidebar immobiles, zones internes scrollables et pagination serveur commune.

La [démo publique](public-demo.md) compose le shell et ses composants avec des adaptateurs locaux sélectionnés uniquement par son build statique.

Les [repères d’appréciation](appreciation-markers.md) restent dans les questions de version exacte,
avec copie JSON au démarrage des passations. Ils guident la notation sans intervenir dans les calculs.

Les [dialogues accessibles](dialog-accessibility.md) partagent la modalité native, le cycle du focus,
les annonces internes et les gardes de fermeture, dans le produit et la démo.

Les [notifications fiables — MEP-004](email-notifications.md) séparent succès métier et remise SMTP,
avec intentions persistées, deux workers locaux, reprises bornées et suivi Superadmin.

La [frontière HTTP de production](http-security.md) impose HTTPS, valide les hôtes et origines,
accepte le protocole forwarded uniquement des pairs proxy explicitement autorisés et protège les cookies.

## Préparation de l’exploitation MESS

Le [backlog de préparation MESS](../backlog/source/07-pre-mep.md) organise les travaux restants par
Epic → Feature → PBI ; le socle fonctionnel et les preuves livrées restent distincts de la qualification cible.
SQLite demeure la base permanente en production. La [référence MEP-039](../operations/sqlite/README.md)
fixe DELETE/FULL, timeout 5 s, connexions API/workers et limites mesurées sur fichier réel.
[MEP-010](../operations/sqlite/contention.md) ajoute les reprises sûres bornées et les refus diagnostiqués.
La cible on-premise MESS doit être installable et
exploitable hors ligne sans Docker ni Node/npm ; build React et dépendances Python se préparent ailleurs.
Le [contrat des prérequis MEP-055](../operations/installation-prerequisites.md) distingue exigences démontrées, propositions et décisions MESS en attente ; aucune cible approuvée ni installation qualifiée.
Configuration unique, package autonome, installation, opérations et reprise restent à livrer/qualifier
selon le contrat MESS, sans annoncer leur disponibilité par cette refonte documentaire.
Les journaux HTTP et métier, transactions, contrôles d’accès et workers SMTP existants sont réutilisés.
La [matrice MEP-011](organization-isolation.md) distingue rôle, scope courant et contexte historique,
avec refus des références croisées et exceptions Superadmin explicitement bornées.

[MEP-036 — Inventaire des paramètres](../operations/configuration/README.md) recense sources, défauts,
obligations et risques de production pour MEP-009, sans modifier les réglages existants.
Le [contrôle MEP-009](../operations/configuration/startup-security.md) valide ensuite secrets,
SMTP et protections HTTP effectives au démarrage Django, sans accès réseau ni migration.
La [configuration MEP-042](../operations/configuration/journal-retention.md) valide aussi la
conservation des deux types de journaux, sans durée métier implicitement autorisée.
La [purge MEP-020](../operations/journal-purge.md) réutilise ces paramètres avec simulation,
lots transactionnels bornés et reçus persistants ; elle préserve toutes les preuves métier.
