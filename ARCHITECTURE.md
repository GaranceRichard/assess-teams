# Fondamentaux architecturaux

Ce document fixe les deux fondamentaux architecturaux de **Assess teams** :

1. l'architecture hexagonale ;
2. Clean Code.

Il définit une direction et des règles de conception. Il ne détaille ni les frameworks, ni le déploiement, ni l'infrastructure. Les détails complets des quality gates restent définis dans les documents qualité du projet.

## Premier fondamental : architecture hexagonale

L'architecture hexagonale est le principe structurant du backend. Elle protège le cœur métier des technologies et organise le système autour du domaine, des cas d'usage, des ports et des adapters.

### Domain

Le domaine constitue le cœur du système. Il contient :

- les entités métier ;
- les value objects ;
- les règles métier ;
- les invariants ;
- les comportements métier ;
- les exceptions métier lorsqu'elles sont nécessaires.

Le domaine ne dépend :

- ni de Django REST Framework ;
- ni de l'ORM Django ;
- ni de SQLite ou d'une autre base de données ;
- ni de HTTP ;
- ni de serializers ;
- ni de React ;
- ni d'un système concret de notification ;
- ni d'aucun adapter technique.

### Application

La couche Application orchestre les cas d'usage. Elle appelle le domaine, manipule les ports et coordonne les opérations nécessaires à un comportement fonctionnel. Elle ne contient aucun détail d'infrastructure.

Les cas d'usage expriment des intentions métier explicites. Les services génériques et les classes fourre-tout sont à éviter.

### Ports

Les ports représentent les contrats nécessaires au cœur applicatif. Ils peuvent notamment décrire :

- un repository ;
- un service de notification ;
- une horloge ;
- un système d'identité ;
- un service externe.

Un port est défini à partir d'un besoin du domaine ou de l'application, jamais à partir de la technologie utilisée.

### Adapters

Les adapters implémentent les interactions avec le monde extérieur, par exemple :

- Django REST Framework ;
- l'ORM Django ;
- une persistance SQLite ou PostgreSQL ;
- une API externe ;
- l'envoi d'emails ;
- une tâche planifiée.

Les adapters dépendent des ports et du cœur applicatif. Le cœur applicatif ne dépend jamais des adapters.

### Règle de dépendance

La direction autorisée des dépendances est :

`Adapters → Application → Domain`

Les dépendances pointent toujours vers le cœur. Une dépendance du domaine vers Django, Django REST Framework, l'ORM, HTTP ou toute infrastructure constitue une violation architecturale.

### Organisation par domaine métier

Les futures applications Django représentent des domaines ou des capacités métier. Les notions techniques restent dans le domaine qu'elles servent.

Il ne faut pas créer de modules globaux techniques tels que :

- `core` ;
- `services` ;
- `repositories` ;
- `utils` ;
- `controllers`.

Une structure indicative est :

```text
<domain>/
├── domain/
├── application/
├── ports/
├── adapters/
└── tests/
```

Cette structure exprime une direction architecturale. Elle n'impose pas de créer tous ces dossiers dès le démarrage : chaque élément apparaît uniquement lorsqu'un besoin réel le justifie.

## Second fondamental : Clean Code

Clean Code est le second principe fondamental de l'architecture. Le code privilégie :

- la lisibilité ;
- la simplicité ;
- l'explicitation des intentions ;
- un faible couplage ;
- une forte cohésion ;
- la responsabilité unique ;
- de petites unités de code ;
- des noms métier explicites ;
- le contrôle de la complexité ;
- la suppression de la duplication significative ;
- l'absence de code mort ;
- l'absence d'abstraction prématurée.

### Responsabilité unique

Une classe, une fonction, un composant ou un module possède une responsabilité principale identifiable. Lorsqu'un élément assume plusieurs responsabilités indépendantes, il doit être décomposé.

### Simplicité

La solution retenue est la plus simple qui satisfait le besoin actuel. Il ne faut pas introduire :

- d'abstraction spéculative ;
- de généricité prématurée ;
- de framework interne inutile ;
- de pattern sans problème concret à résoudre ;
- de couche supplémentaire sans responsabilité identifiable.

L'architecture hexagonale ne justifie jamais la sur-ingénierie.

### Nommage

Les noms expriment le vocabulaire métier. Préférer `FinalizeAssessment` à `AssessmentService.process()` et les intentions explicites aux termes génériques comme `manager`, `helper`, `utils`, `processor` ou un `handler` générique.

### Fonctions et méthodes

Les fonctions et méthodes doivent :

- rester courtes ;
- avoir une intention claire ;
- éviter les effets de bord implicites ;
- limiter l'imbrication ;
- éviter les paramètres qui modifient radicalement leur comportement.

### Taille des fichiers

**Aucun fichier maintenu manuellement ne doit dépasser 200 lignes. Cette règle est obligatoire et bloquante.**

Cette limite favorise la séparation des responsabilités, la modularité, la lisibilité et la maintenabilité. Elle ne doit jamais être contournée par une compression artificielle du code, la suppression de retours à la ligne utiles ou une dégradation de la lisibilité.

## Complémentarité des deux fondamentaux

L'architecture hexagonale organise les dépendances et les responsabilités à grande échelle. Clean Code organise la qualité et la lisibilité à petite échelle.

Une architecture hexagonale avec des classes massives, des services génériques ou une forte complexité reste une mauvaise architecture. Du Clean Code fortement couplé à Django ou à l'infrastructure ne respecte pas non plus l'architecture attendue. Les deux principes doivent être respectés simultanément.

## Pragmatisme

Le projet vise une **architecture hexagonale pragmatique, pas cérémonielle** :

- ne pas créer de port sans interaction nécessitant une abstraction ;
- ne pas créer d'adapter sans infrastructure correspondante ;
- ne pas créer d'interface pour chaque classe ;
- ne pas créer de repository abstrait sans besoin métier ou technique réel ;
- ne pas multiplier les couches pour respecter artificiellement un schéma ;
- permettre à l'architecture d'émerger avec les fonctionnalités.

## Violations architecturales

Constituent notamment des violations :

- de la logique métier dans une view Django REST Framework ;
- de la logique métier significative dans un serializer ;
- un domaine important directement implémenté dans un Model Django ;
- un accès à l'ORM depuis le domaine ;
- une dépendance du domaine vers Django ;
- des appels HTTP depuis le domaine ;
- des composants ou services fourre-tout ;
- des fichiers maintenus dépassant 200 lignes ;
- la duplication de règles métier ;
- des abstractions créées sans usage concret.

## Décisions futures

Les choix suivants seront définis lorsqu'ils deviendront nécessaires :

- la structure physique exacte des applications Django ;
- les conventions précises des ports ;
- la stratégie de repositories ;
- l'organisation des adapters Django REST Framework ;
- l'infrastructure de notifications ;
- le queueing ;
- un éventuel passage de SQLite à PostgreSQL ;
- l'architecture détaillée du frontend.

Ces décisions dépendent des futures fonctionnalités et ne doivent pas être figées prématurément.
