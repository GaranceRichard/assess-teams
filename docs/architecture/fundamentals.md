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

La route `/organization`, visible pour les Superadmins et Admins, matérialise le vertical slice
React → API DRF → ORM pour créer une organisation, puis ajouter ou retirer ses membres depuis sa fiche.
