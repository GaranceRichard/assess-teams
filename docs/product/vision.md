# Vision produit d’Assess Teams

Ce document fixe la direction du produit. Les [sources fonctionnelles du backlog](../backlog/README.md#source-fonctionnelle-détaillée) définissent le périmètre et les règles ; le [registre PBI](../backlog/tracking/pbis.md) porte le suivi d’exécution. La vision ne constitue ni une spécification détaillée ni une seconde source de statuts.

## Pourquoi Assess Teams existe

Une évaluation ponctuelle décrit une situation, mais ne suffit pas à comprendre comment une équipe évolue ni à organiser son accompagnement. Sans continuité, les constats perdent leur contexte, les changements de référentiel rendent les comparaisons incertaines et les responsables manquent de repères pour agir.

**Assess Teams vise à transformer cette photographie ponctuelle en un dispositif continu d’évaluation, d’accompagnement et de pilotage de la progression des équipes dans le temps.** Le questionnaire et la notation sont des moyens de recueillir des observations ; la finalité est d’aider à comprendre une trajectoire et à orienter l’accompagnement.

## Pour qui et pour quelle valeur

Le produit s’adresse aux Organisations qui structurent l’évaluation et l’accompagnement de leurs équipes. Les équipes en sont les bénéficiaires : les constats doivent éclairer leur progression collective.

Les Coachs doivent disposer de repères fiables pour comprendre les évolutions des équipes qu’ils accompagnent. L’Admin organise et pilote le dispositif dans son Organisation. Le Viewer consulte dans le périmètre autorisé, dont l’accès aux résultats reste soumis aux arbitrages du backlog. Le Superadmin assure l’administration globale explicitement prévue ; il ne constitue pas un quatrième rôle métier.

La valeur recherchée est une continuité de compréhension et de responsabilité : savoir ce qui a été évalué, dans quel cadre, à quel moment et par qui, puis observer les progrès, les stabilités ou les reculs. Le pilotage organisationnel doit s’appuyer sur des résultats observables et contextualisés pour orienter l’accompagnement des équipes et soutenir les Coachs.

## La transformation recherchée

La cible associe des modèles d’évaluation maîtrisés et versionnés à des évaluations planifiées et traçables. Un historique fiable doit rendre l’évolution d’une équipe lisible, même lorsque son modèle ou ses responsables changent. Une comparaison n’a de sens que si ses données sont compatibles et si les ruptures de contexte restent visibles.

Quatre responsabilités doivent rester distinctes :

- **Évaluation** : recueillir des observations lors d’une passation, selon un modèle et une planification explicites.
- **Résultat** : restituer ce que ces observations permettent de constater, avec leurs règles et leurs limites.
- **Accompagnement** : utiliser ces constats pour guider le travail des équipes et des Coachs.
- **Pilotage** : comprendre la couverture et la situation du dispositif pour orienter les interventions dans l’Organisation.

Le résultat éclaire l’accompagnement ; il ne dicte pas à lui seul une décision. Le pilotage consolide des faits explicables sans réécrire les évaluations ni se substituer au jugement des acteurs.

La provenance et le contexte font partie de la valeur des données : Organisation, équipe, version du modèle, échéance, responsable, auteur réel et dates permettent d’expliquer un constat. Le Journal d’activité retrace les actions métier réussies ; les Logs servent au diagnostic applicatif. Ces deux journaux restent distincts des résultats et du suivi longitudinal.

## Principes d’arbitrage

- **Mesurer pour accompagner, pas pour surveiller.** Retenir les observations utiles à la progression collective, sans en faire une mesure de performance personnelle.
- **Privilégier la trajectoire à la photographie.** Une évolution contextualisée apporte davantage qu’une note isolée ; ne pas comparer des données incompatibles.
- **Préserver l’intégrité historique.** Faire évoluer les modèles par versions et rendre les rectifications explicites, sans effacer silencieusement le contexte des faits passés.
- **Rendre les résultats explicables et traçables.** Relier tout constat à ses données sources ; signaler les limites et données manquantes plutôt que produire une certitude artificielle.
- **Respecter le périmètre organisationnel.** L’Organisation reste la frontière d’autorisation ; aucun partage ou agrégat interorganisation ne découle implicitement du pilotage.
- **Piloter sans réduire une équipe à un score.** Lire critères, contexte et évolution ensemble ; utiliser la supervision des Coachs pour soutenir l’accompagnement.

## Non-objectifs structurants

Assess Teams n’a pas vocation à devenir :

- un outil RH d’évaluation individuelle ou un système de surveillance de la performance personnelle : l’objet évalué est l’équipe, les auteurs étant identifiés pour la traçabilité ;
- un outil générique de sondage ou de formulaire : le recueil est lié à un cadre d’évaluation d’équipe, à sa responsabilité et à sa continuité ;
- un outil de classement simpliste des équipes : un score détaché de son contexte ne traduit pas une progression ;
- une plateforme projet ou ALM remplaçant Jira, Azure DevOps ou équivalent : le périmètre est l’évaluation et l’accompagnement, pas la gestion du travail projet.

## Direction cible et socle actuel

Le socle livré comprend les modèles locaux validés, archivés et versionnés, la planification, la passation persistante et les journaux cloisonnés. Il conserve la version et le contexte des passations commencées ainsi que leur provenance initiale. Les résultats, le suivi longitudinal et les vues de pilotage restent à construire ; les accès Viewer correspondants et l’éventuel partage interorganisation ne sont pas acquis.

L’intégrité historique est une exigence cible dont le socle reste partiel : la révision Admin remplace les notes et ne conserve que le dernier réviseur et sa date, en plus de l’auteur et de la date initiaux. L’historique complet des révisions et des affectations n’est pas livré ; le traitement de certaines suppressions reste à arbitrer. Le [README](../../README.md#état-actuel), les [sources du backlog](../backlog/README.md) et le [registre des arbitrages Organisation](../backlog/source/00-arbitrages-organisations.md) précisent ces limites sans que cette vision décide de nouvelles fonctionnalités.
