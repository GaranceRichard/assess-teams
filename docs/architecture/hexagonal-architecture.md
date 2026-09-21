# Architecture hexagonale

L'architecture hexagonale est le principe structurant du backend. Elle protège le cœur métier des technologies et organise le système autour du domaine, des cas d'usage, des ports et des adapters.

## Domain

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

## Application

La couche Application orchestre les cas d'usage. Elle appelle le domaine, manipule les ports et coordonne les opérations nécessaires à un comportement fonctionnel. Elle ne contient aucun détail d'infrastructure.

Les cas d'usage expriment des intentions métier explicites. Les services génériques et les classes fourre-tout sont à éviter.

## Ports

Les ports représentent les contrats nécessaires au cœur applicatif. Ils peuvent notamment décrire :

- un repository ;
- un service de notification ;
- une horloge ;
- un système d'identité ;
- un service externe.

Un port est défini à partir d'un besoin du domaine ou de l'application, jamais à partir de la technologie utilisée.

## Adapters

Les adapters implémentent les interactions avec le monde extérieur, par exemple :

- Django REST Framework ;
- l'ORM Django ;
- une persistance SQLite ou PostgreSQL ;
- une API externe ;
- l'envoi d'emails ;
- une tâche planifiée.

Les adapters dépendent des ports et du cœur applicatif. Le cœur applicatif ne dépend jamais des adapters.

## Règle de dépendance

La direction autorisée des dépendances est :

`Adapters → Application → Domain`

Les dépendances pointent toujours vers le cœur. Une dépendance du domaine vers Django, Django REST Framework, l'ORM, HTTP ou toute infrastructure constitue une violation architecturale.

## Organisation par domaine métier

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
