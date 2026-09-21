# API backend et OpenAPI

## Frontière HTTP

Django REST Framework est l'adapter HTTP de référence du backend. Il traduit les requêtes et réponses sans porter de logique métier significative. Le domaine et l'application restent indépendants de HTTP, des serializers et de la génération documentaire.

## Contrat permanent

`drf-spectacular` produit le contrat OpenAPI de référence de l'API :

- schéma OpenAPI : `/api/schema/` ;
- Swagger UI : `/api/docs/`.

Tout endpoint backend nouveau ou modifié documente, selon ce qui s'applique :

- la méthode HTTP et le chemin ;
- les paramètres de chemin, de requête et d'en-tête ;
- le corps de requête ;
- le schéma de chaque réponse ;
- les codes HTTP ;
- les erreurs de validation et refus métier ;
- l'authentification et les permissions ;
- des exemples utiles lorsque le contrat le justifie.

Le contrat est versionné avec l'implémentation. Le schéma complet doit rester générable, syntaxiquement valide et cohérent avec le comportement exposé. Une évolution d'API est inachevée si son contrat est absent, invalide ou incohérent.

## Portée actuelle

Cette exigence s'applique au health check existant et à tout futur endpoint. Elle ne crée aucun endpoint métier et ne décide d'aucune règle d'authentification, de permission ou de publication encore soumise à arbitrage produit.
