# Backlog produit initial

## Finalité et principes

Ce backlog décrit les premières capacités métier d’**Assess teams**. Il est ordonné par valeur utilisateur et par parcours, non par couches techniques. Les identifiants sont stables : un élément retiré n’est pas renuméroté.

Chaque future implémentation reste soumise à `QUALITY_CHARTER.md`, `DEFINITION_OF_DONE.md` et `TEST_STRATEGY.md`. En particulier, chaque comportement fonctionnel devra avoir un cas passant et un vrai cas de refus, et les parcours critiques devront être couverts de bout en bout. Ces exigences sont des critères de livraison, pas des fonctionnalités produit.

Priorités :

- **P0** : nécessaire au premier parcours fonctionnel complet ;
- **P1** : important après le premier parcours ;
- **P2** : capacité secondaire ou amélioration.

## Premier parcours vertical — PV-001

**Objectif :** prouver rapidement la valeur et la cohérence du produit sur une chaîne complète : **Coach → Équipe → Affectation du coach → Modèle d’évaluation → Affectation du modèle → Passation → Finalisation → Historique**.

**Scénario nominal :**

1. Un administrateur authentifié crée et active le compte d’un coach (`FEAT-001` à `FEAT-004`).
2. Il crée une équipe, puis lui affecte ce coach ; l’affectation est historisée (`FEAT-005`, `FEAT-007` à `FEAT-009`).
3. Il compose, paramètre, publie et versionne un modèle d’évaluation (`FEAT-011` à `FEAT-014`).
4. Il associe ce modèle à l’équipe et fixe la première échéance ainsi que la fréquence (`FEAT-015` à `FEAT-018`).
5. Le coach affecté démarre l’évaluation attendue, renseigne les critères et conserve au besoin un brouillon (`FEAT-020`, `FEAT-021`).
6. Le produit refuse une finalisation incomplète ; une passation valide peut être finalisée et devient traçable (`FEAT-022`, `FEAT-023`).
7. Le coach retrouve l’évaluation finalisée dans l’historique de l’équipe avec la version exacte du modèle utilisée (`FEAT-024`).

**Refus essentiels à démontrer :** un acteur non autorisé ne peut ni affecter un coach ni finaliser l’évaluation ; une équipe inactive ou un modèle non publié ne permet pas de démarrer une passation ; une passation incomplète ou une note hors modalités est refusée ; une évaluation finalisée n’est pas modifiable silencieusement.

**Résultat attendu :** une évaluation finalisée, rattachée à la bonne équipe, au coach responsable, à son échéance et à une version immuable du modèle, est consultable dans l’historique. Ce parcours constitue le premier scénario E2E critique.

## EPIC-001 — Identités, coachs et habilitations

### FEAT-001 — Accéder de manière authentifiée au produit

- **Intention métier :** garantir que chaque action sensible est attribuable à une identité reconnue.
- **Acteur concerné :** utilisateur, coach, administrateur.
- **Description :** permettre la connexion, la déconnexion et la reprise contrôlée d’une session selon l’état du compte.
- **Critères d’acceptation principaux :**
  - un compte actif muni d’informations valides accède aux capacités autorisées et peut se déconnecter ;
  - des informations invalides, un compte désactivé ou une session expirée ne donnent aucun accès ;
  - les actions métier sensibles conservent l’identité de leur auteur.
- **Dépendances éventuelles :** aucune.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.

### FEAT-002 — Administrer le cycle de vie d’un utilisateur

- **Intention métier :** maîtriser qui peut participer au dispositif sans effacer son passé.
- **Acteur concerné :** administrateur.
- **Description :** créer un utilisateur, mettre à jour ses informations utiles et activer ou désactiver son accès.
- **Critères d’acceptation principaux :**
  - une identité unique et valide peut être créée puis corrigée par un administrateur habilité ;
  - la désactivation bloque les nouvelles connexions sans supprimer les actions historiques ;
  - une identité en doublon ou des données obligatoires invalides sont refusées.
- **Dépendances éventuelles :** `FEAT-001`, `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.

### FEAT-003 — Qualifier et superviser un coach

- **Intention métier :** distinguer les personnes pouvant accompagner des équipes et connaître leur disponibilité.
- **Acteur concerné :** administrateur.
- **Description :** associer à un utilisateur un profil de coach, son statut actif et les informations nécessaires à sa supervision.
- **Critères d’acceptation principaux :**
  - un utilisateur éligible peut devenir coach actif et apparaît dans les choix d’affectation ;
  - un coach désactivé ne reçoit plus de nouvelle affectation, sans perdre son historique ;
  - un utilisateur inexistant, désactivé ou déjà coach ne peut pas recevoir un profil incohérent.
- **Dépendances éventuelles :** `FEAT-002`, `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.

### FEAT-004 — Appliquer les rôles et permissions métier

- **Intention métier :** limiter chaque décision aux acteurs responsables.
- **Acteur concerné :** administrateur, coach, utilisateur.
- **Description :** définir les capacités accessibles selon le rôle et, lorsque nécessaire, selon le lien de l’acteur avec l’équipe.
- **Critères d’acceptation principaux :**
  - un administrateur gère le dispositif et un coach n’agit que sur les équipes qui lui sont confiées ;
  - toute action interdite est refusée sans modifier l’état métier ni divulguer d’information protégée ;
  - un changement de rôle prend effet sans altérer la traçabilité passée.
- **Dépendances éventuelles :** `FEAT-001`, `FEAT-002`.
- **Priorité :** P0.
- **Domaine métier cible :** Identités et habilitations.

## EPIC-002 — Équipes et accompagnement

### FEAT-005 — Constituer une équipe

- **Intention métier :** créer le collectif qui sera accompagné et évalué.
- **Acteur concerné :** administrateur.
- **Description :** enregistrer une équipe avec une identité métier non ambiguë et les informations nécessaires à son suivi.
- **Critères d’acceptation principaux :**
  - une équipe valide devient active et peut recevoir un coach ainsi que des modèles ;
  - l’identité de l’équipe permet de la distinguer des équipes existantes ;
  - des informations obligatoires manquantes ou une identité déjà utilisée sont refusées.
- **Dépendances éventuelles :** `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Équipes et coaching.

### FEAT-006 — Faire évoluer les informations d’une équipe

- **Intention métier :** garder le dossier d’équipe fidèle à la réalité sans rompre son suivi.
- **Acteur concerné :** administrateur.
- **Description :** modifier les informations courantes d’une équipe en conservant son identité et ses relations historiques.
- **Critères d’acceptation principaux :**
  - une modification valide est visible lors des consultations suivantes ;
  - les évaluations, associations et affectations passées restent rattachées à la même équipe ;
  - une modification créant une ambiguïté ou portant sur une équipe archivée est refusée selon les règles établies.
- **Dépendances éventuelles :** `FEAT-005`.
- **Priorité :** P1.
- **Domaine métier cible :** Équipes et coaching.

### FEAT-007 — Consulter le dossier d’une équipe

- **Intention métier :** donner une vue fiable du contexte d’accompagnement.
- **Acteur concerné :** coach affecté, administrateur.
- **Description :** présenter l’état, le coach courant, les modèles associés, les échéances et les accès vers l’historique d’une équipe.
- **Critères d’acceptation principaux :**
  - la vue distingue clairement les informations courantes des éléments historiques ;
  - un coach ne consulte que les équipes auxquelles ses permissions donnent accès ;
  - une équipe inconnue ou inaccessible ne révèle aucune donnée métier.
- **Dépendances éventuelles :** `FEAT-004`, `FEAT-005`, puis enrichissement par `FEAT-008`, `FEAT-015`, `FEAT-017` et `FEAT-024`.
- **Priorité :** P0.
- **Domaine métier cible :** Équipes et coaching.

### FEAT-008 — Affecter un coach à une équipe

- **Intention métier :** rendre explicite la responsabilité d’accompagnement d’une équipe.
- **Acteur concerné :** administrateur.
- **Description :** démarrer, remplacer ou terminer l’affectation du coach responsable selon une période déterminée.
- **Critères d’acceptation principaux :**
  - un coach actif peut devenir responsable d’une équipe active à une date d’effet connue ;
  - un remplacement clôt l’affectation courante avant d’ouvrir la suivante, sans chevauchement incohérent ;
  - un coach inactif, une équipe inactive ou une période invalide entraîne un refus.
- **Dépendances éventuelles :** `FEAT-003`, `FEAT-005`, `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Équipes et coaching.

### FEAT-009 — Retracer les affectations de coachs

- **Intention métier :** savoir qui était responsable d’une équipe à tout moment.
- **Acteur concerné :** administrateur, coach autorisé.
- **Description :** conserver et consulter la chronologie des affectations, avec dates d’effet et motif de fin ou de remplacement.
- **Critères d’acceptation principaux :**
  - chaque transition conserve le coach, la période et l’auteur de la décision ;
  - l’affectation applicable à une date passée peut être déterminée sans ambiguïté ;
  - une correction ne doit pas effacer silencieusement une période déjà utilisée par une évaluation.
- **Dépendances éventuelles :** `FEAT-008`.
- **Priorité :** P0.
- **Domaine métier cible :** Équipes et coaching.

### FEAT-010 — Désactiver ou archiver une équipe

- **Intention métier :** sortir une équipe du dispositif actif tout en préservant les preuves acquises.
- **Acteur concerné :** administrateur.
- **Description :** empêcher de nouvelles activités pour une équipe désactivée et conserver son dossier en consultation historique.
- **Critères d’acceptation principaux :**
  - une équipe désactivée ne reçoit plus de nouvelle affectation, association ou passation ;
  - ses évaluations et historiques restent consultables par les acteurs autorisés ;
  - l’archivage signale les échéances ouvertes à traiter et requiert une décision explicite à leur sujet.
- **Dépendances éventuelles :** `FEAT-007`, `FEAT-008`, `FEAT-015`, `FEAT-017`.
- **Priorité :** P1.
- **Domaine métier cible :** Équipes et coaching.

## EPIC-003 — Référentiel des modèles d’évaluation

### FEAT-011 — Composer un modèle d’évaluation ordonné

- **Intention métier :** formaliser ce qui doit être évalué et dans quel ordre.
- **Acteur concerné :** administrateur, concepteur habilité.
- **Description :** créer un modèle nommé, ajouter, modifier ou retirer des critères et définir leur ordre avant publication.
- **Critères d’acceptation principaux :**
  - un brouillon contient des critères identifiables et présentés dans l’ordre défini ;
  - réordonner un critère ne change ni son identité ni sa signification ;
  - un modèle sans critère, avec doublons interdits ou critères invalides ne peut pas être publié.
- **Dépendances éventuelles :** `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Référentiel d’évaluation.

### FEAT-012 — Définir les modalités de notation

- **Intention métier :** rendre les réponses cohérentes, comparables et validables.
- **Acteur concerné :** administrateur, concepteur habilité.
- **Description :** associer aux critères les modes de réponse, bornes, choix autorisés, caractère obligatoire et règles de calcul utiles.
- **Critères d’acceptation principaux :**
  - chaque critère publié possède une modalité non ambiguë et compatible avec le calcul attendu ;
  - une réponse valide peut être distinguée d’une valeur hors bornes ou d’un choix non permis ;
  - une configuration contradictoire ou incomplète bloque la publication.
- **Dépendances éventuelles :** `FEAT-011`.
- **Priorité :** P0.
- **Domaine métier cible :** Référentiel d’évaluation.

### FEAT-013 — Publier ou retirer un modèle

- **Intention métier :** contrôler quels modèles peuvent gouverner de nouvelles évaluations.
- **Acteur concerné :** administrateur, concepteur habilité.
- **Description :** activer un modèle prêt à l’emploi et désactiver un modèle qui ne doit plus être proposé.
- **Critères d’acceptation principaux :**
  - seul un modèle complet et valide peut être publié puis associé pour de nouvelles passations ;
  - un modèle retiré ne permet plus de nouveau démarrage, mais reste visible dans les évaluations passées ;
  - le retrait signale les associations et échéances futures affectées avant confirmation.
- **Dépendances éventuelles :** `FEAT-011`, `FEAT-012`.
- **Priorité :** P0.
- **Domaine métier cible :** Référentiel d’évaluation.

### FEAT-014 — Versionner un modèle sans réécrire le passé

- **Intention métier :** faire évoluer le référentiel tout en garantissant la comparabilité et l’audit.
- **Acteur concerné :** administrateur, concepteur habilité, lecteur autorisé.
- **Description :** créer une nouvelle version lors de toute évolution d’un modèle publié et conserver les versions antérieures en lecture.
- **Critères d’acceptation principaux :**
  - une version publiée est immuable et toute évolution produit une version distincte ;
  - chaque passation référence exactement la version avec laquelle elle a commencé ;
  - une version historique reste consultable et ne peut être supprimée si elle est référencée.
- **Dépendances éventuelles :** `FEAT-013`.
- **Priorité :** P0.
- **Domaine métier cible :** Référentiel d’évaluation.

## EPIC-004 — Affectations et planification des évaluations

### FEAT-015 — Associer des modèles à une équipe

- **Intention métier :** définir les cadres d’évaluation applicables à chaque équipe.
- **Acteur concerné :** administrateur.
- **Description :** associer un ou plusieurs modèles publiés à une équipe active avec une période d’applicabilité.
- **Critères d’acceptation principaux :**
  - plusieurs modèles publiés peuvent coexister pour une équipe si leurs associations sont explicites ;
  - une association identifie la version applicable ou une règle explicite de prise en compte des versions futures ;
  - une équipe inactive, un modèle non publié ou une association identique qui se chevauche est refusé.
- **Dépendances éventuelles :** `FEAT-005`, `FEAT-013`, `FEAT-014`.
- **Priorité :** P0.
- **Domaine métier cible :** Planification des évaluations.

### FEAT-016 — Retracer les associations équipe–modèle

- **Intention métier :** expliquer quel cadre d’évaluation s’appliquait à une équipe à une date donnée.
- **Acteur concerné :** administrateur, coach autorisé.
- **Description :** conserver les débuts, fins, versions et auteurs des associations entre équipes et modèles.
- **Critères d’acceptation principaux :**
  - la chronologie distingue association active, terminée et remplacée ;
  - une évaluation passée reste explicable même après changement de modèle ;
  - la suppression d’une association utilisée est interdite au profit d’une clôture datée.
- **Dépendances éventuelles :** `FEAT-015`.
- **Priorité :** P0.
- **Domaine métier cible :** Planification des évaluations.

### FEAT-017 — Configurer la fréquence et la première échéance

- **Intention métier :** transformer une association en engagement récurrent et prévisible.
- **Acteur concerné :** administrateur.
- **Description :** définir une cadence, une première date d’échéance et le contexte calendaire applicable à une association équipe–modèle.
- **Critères d’acceptation principaux :**
  - une cadence valide et une première échéance déterminent sans ambiguïté le premier cycle attendu ;
  - une fréquence nulle, une date incohérente ou une configuration incomplète est refusée ;
  - toute modification indique sa date d’effet et ne réécrit pas les cycles passés.
- **Dépendances éventuelles :** `FEAT-015`.
- **Priorité :** P0.
- **Domaine métier cible :** Planification des évaluations.

### FEAT-018 — Calculer la prochaine échéance

- **Intention métier :** rendre visible le prochain engagement d’évaluation sans dérive dans le temps.
- **Acteur concerné :** coach affecté, administrateur.
- **Description :** déterminer la prochaine échéance depuis la première échéance et la cadence, en tenant compte des cycles déjà finalisés.
- **Critères d’acceptation principaux :**
  - à données égales, le calcul fournit toujours la même échéance et gère les bornes calendaires définies ;
  - une finalisation tardive ne décale pas implicitement la cadence planifiée ;
  - l’absence de configuration valide ne produit pas une date supposée et est signalée.
- **Dépendances éventuelles :** `FEAT-017`, puis `FEAT-023` pour les cycles finalisés.
- **Priorité :** P0.
- **Domaine métier cible :** Planification des évaluations.

### FEAT-019 — Identifier les évaluations en retard

- **Intention métier :** faire ressortir les engagements échus qui exigent une action.
- **Acteur concerné :** coach affecté, administrateur.
- **Description :** qualifier comme en retard toute échéance dépassée sans évaluation valablement finalisée pour le cycle concerné.
- **Critères d’acceptation principaux :**
  - le statut dépend d’une date de référence explicite, de l’échéance et de la finalisation attendue ;
  - une évaluation finalisée pour un autre modèle ou un autre cycle ne clôt pas le retard ;
  - un retard résolu reste explicable dans l’historique sans demeurer dans la liste active.
- **Dépendances éventuelles :** `FEAT-018`, `FEAT-023`.
- **Priorité :** P1.
- **Domaine métier cible :** Planification des évaluations.

## EPIC-005 — Passation et preuve d’évaluation

### FEAT-020 — Démarrer l’évaluation attendue

- **Intention métier :** ouvrir la bonne passation dans le bon contexte de responsabilité.
- **Acteur concerné :** coach affecté.
- **Description :** créer une passation pour une équipe, une association et un cycle, en figeant la version du modèle utilisée.
- **Critères d’acceptation principaux :**
  - le coach courant peut démarrer une passation attendue pour une équipe active et un modèle applicable ;
  - la passation conserve équipe, coach, cycle, échéance et version du modèle ;
  - un coach non affecté, un modèle retiré, une équipe inactive ou un doublon pour le même cycle est refusé.
- **Dépendances éventuelles :** `FEAT-008`, `FEAT-014`, `FEAT-015`, `FEAT-017`.
- **Priorité :** P0.
- **Domaine métier cible :** Passations d’évaluation.

### FEAT-021 — Renseigner et reprendre un brouillon

- **Intention métier :** permettre une saisie fiable, y compris lorsque l’évaluation ne peut être terminée en une fois.
- **Acteur concerné :** coach responsable de la passation.
- **Description :** saisir les réponses ou notes, afficher leur validité et sauvegarder un état en cours reprenable.
- **Critères d’acceptation principaux :**
  - les réponses valides sont conservées par critère et retrouvées à la reprise ;
  - une valeur hors modalité est signalée et ne peut pas être considérée valide ;
  - seul un acteur autorisé peut modifier une passation en cours, et jamais une passation finalisée.
- **Dépendances éventuelles :** `FEAT-020`, `FEAT-012`.
- **Priorité :** P0.
- **Domaine métier cible :** Passations d’évaluation.

### FEAT-022 — Valider la complétude et les résultats

- **Intention métier :** empêcher qu’une évaluation incohérente devienne une référence.
- **Acteur concerné :** coach responsable de la passation.
- **Description :** contrôler les critères obligatoires, les modalités et les calculs, puis présenter les erreurs ou le résultat prêt à finaliser.
- **Critères d’acceptation principaux :**
  - une passation complète produit des résultats globaux et par critère conformes aux règles de sa version ;
  - les erreurs sont rattachées aux critères concernés et n’altèrent pas le brouillon ;
  - toute absence obligatoire, réponse invalide ou règle de calcul impossible bloque la finalisation.
- **Dépendances éventuelles :** `FEAT-012`, `FEAT-014`, `FEAT-021`.
- **Priorité :** P0.
- **Domaine métier cible :** Passations d’évaluation.

### FEAT-023 — Finaliser et tracer une évaluation

- **Intention métier :** transformer une passation valide en preuve durable et attribuable.
- **Acteur concerné :** coach responsable de la passation, lecteur autorisé.
- **Description :** finaliser une passation, figer son contenu et conserver les faits nécessaires à son audit ; toute rectification ultérieure est explicite et traçable.
- **Critères d’acceptation principaux :**
  - seule une passation validée peut être finalisée, avec auteur et instant de finalisation ;
  - contenu, résultats, contexte et version du modèle deviennent immuables ;
  - une nouvelle tentative de finalisation est sans double effet et une rectification ne remplace jamais silencieusement l’original.
- **Dépendances éventuelles :** `FEAT-022`.
- **Priorité :** P0.
- **Domaine métier cible :** Passations d’évaluation.

## EPIC-006 — Suivi longitudinal

### FEAT-024 — Parcourir l’historique des évaluations

- **Intention métier :** restituer la trajectoire d’une équipe dans le temps.
- **Acteur concerné :** coach autorisé, administrateur.
- **Description :** lister et consulter les évaluations finalisées d’une équipe avec leur date, cycle, modèle, version et responsable.
- **Critères d’acceptation principaux :**
  - les évaluations sont ordonnées et filtrables sans mélanger brouillons et résultats officiels ;
  - le détail restitue les réponses et résultats selon la version historique du modèle ;
  - un acteur sans accès à l’équipe ne peut consulter ni liste ni détail.
- **Dépendances éventuelles :** `FEAT-004`, `FEAT-023`.
- **Priorité :** P0.
- **Domaine métier cible :** Analyse longitudinale.

### FEAT-025 — Comparer des évaluations compatibles

- **Intention métier :** rendre les changements observables entre deux moments.
- **Acteur concerné :** coach autorisé, administrateur.
- **Description :** comparer deux évaluations d’une équipe en explicitant les critères comparables et les écarts de modèle ou de version.
- **Critères d’acceptation principaux :**
  - les valeurs comparables sont alignées par identité de critère, pas seulement par libellé ou position ;
  - les critères ajoutés, retirés ou dont la modalité a changé sont signalés et non comparés abusivement ;
  - deux évaluations d’équipes différentes ou non accessibles ne peuvent être comparées.
- **Dépendances éventuelles :** `FEAT-014`, `FEAT-024`.
- **Priorité :** P1.
- **Domaine métier cible :** Analyse longitudinale.

### FEAT-026 — Mesurer l’évolution par critère et globale

- **Intention métier :** aider le coach à repérer progrès, stabilité et recul.
- **Acteur concerné :** coach autorisé, administrateur.
- **Description :** calculer les évolutions sur une période choisie aux niveaux des critères et du résultat global.
- **Critères d’acceptation principaux :**
  - l’évolution indique période, évaluations sources et unité de mesure ;
  - les ruptures de comparabilité sont visibles et exclues des calculs trompeurs ;
  - l’absence de données suffisantes produit un état explicite plutôt qu’une tendance inventée.
- **Dépendances éventuelles :** `FEAT-025`.
- **Priorité :** P1.
- **Domaine métier cible :** Analyse longitudinale.

### FEAT-027 — Visualiser les tendances

- **Intention métier :** rendre l’évolution rapidement interprétable sans masquer les données sources.
- **Acteur concerné :** coach autorisé, administrateur.
- **Description :** proposer des rendus graphiques de l’évolution globale et par critère, avec accès aux valeurs détaillées.
- **Critères d’acceptation principaux :**
  - le graphique représente fidèlement dates, valeurs, unités et ruptures de comparabilité ;
  - les mêmes informations restent accessibles sous une forme non graphique et compréhensible ;
  - peu de données, données manquantes ou série incompatible ne produisent pas de représentation trompeuse.
- **Dépendances éventuelles :** `FEAT-026`.
- **Priorité :** P1.
- **Domaine métier cible :** Analyse longitudinale.

## EPIC-007 — Notifications du dispositif

### FEAT-028 — Préparer les rappels d’évaluations à venir

- **Intention métier :** donner au coach le temps d’agir avant l’échéance.
- **Acteur concerné :** coach affecté, administrateur paramétrant les rappels.
- **Description :** repérer les échéances entrant dans la fenêtre de rappel et produire une intention de notification contextualisée.
- **Critères d’acceptation principaux :**
  - un rappel identifie équipe, modèle, échéance et coach responsable à la date considérée ;
  - une échéance déjà finalisée, annulée ou portée par une équipe inactive ne génère pas de rappel indu ;
  - l’exécution répétée d’un même contrôle ne multiplie pas les rappels identiques.
- **Dépendances éventuelles :** `FEAT-008`, `FEAT-018`, `FEAT-023`, `FEAT-031`.
- **Priorité :** P1.
- **Domaine métier cible :** Notifications.

### FEAT-029 — Alerter sur les évaluations en retard

- **Intention métier :** mobiliser les responsables lorsqu’un engagement n’est pas tenu.
- **Acteur concerné :** coach affecté, administrateur superviseur.
- **Description :** produire des alertes de retard, avec relance ou escalade selon les règles du dispositif.
- **Critères d’acceptation principaux :**
  - seul un retard actif donne lieu à une alerte adressée au responsable courant ;
  - fréquence de relance, déduplication et éventuelle escalade sont respectées ;
  - la résolution du retard stoppe les nouvelles alertes sans effacer celles déjà tracées.
- **Dépendances éventuelles :** `FEAT-019`, `FEAT-031`.
- **Priorité :** P1.
- **Domaine métier cible :** Notifications.

### FEAT-030 — Remettre une notification sans coupler le métier au canal

- **Intention métier :** informer les coachs de façon fiable tout en permettant aux canaux d’évoluer.
- **Acteur concerné :** coach destinataire, administrateur.
- **Description :** acheminer une intention de notification par un canal disponible selon les préférences et conserver son état de remise.
- **Critères d’acceptation principaux :**
  - le contenu métier d’un rappel ou d’une alerte est produit sans présumer d’un canal concret ;
  - ajouter ou remplacer un canal ne modifie pas les règles d’échéance, de retard ou de destinataire ;
  - un échec de remise est traçable et peut être repris sans dupliquer la notification métier.
- **Dépendances éventuelles :** `FEAT-028`, `FEAT-029`.
- **Priorité :** P1.
- **Domaine métier cible :** Notifications.

## EPIC-008 — Pilotage du dispositif

### FEAT-031 — Gérer les paramètres métier du dispositif

- **Intention métier :** adapter les règles transverses sans rendre le comportement historique inexplicable.
- **Acteur concerné :** administrateur.
- **Description :** gérer les paramètres autorisés, notamment fenêtres de rappel, règles de relance et valeurs de cadence proposées, avec date d’effet.
- **Critères d’acceptation principaux :**
  - toute valeur est validée selon son sens métier et sa période d’application ;
  - un changement affecte les calculs futurs selon une date d’effet explicite, sans réécrire les résultats passés ;
  - une configuration incohérente est refusée et la précédente reste applicable.
- **Dépendances éventuelles :** `FEAT-004`.
- **Priorité :** P1.
- **Domaine métier cible :** Pilotage du dispositif.

### FEAT-032 — Superviser la charge et la situation des coachs

- **Intention métier :** répartir l’accompagnement et détecter les situations nécessitant une intervention.
- **Acteur concerné :** administrateur.
- **Description :** présenter pour chaque coach son statut, ses équipes actives et leurs échéances ou retards.
- **Critères d’acceptation principaux :**
  - la vue distingue coachs actifs et inactifs et compte uniquement les affectations applicables ;
  - l’administrateur peut atteindre les équipes et échéances à l’origine des indicateurs ;
  - une donnée inaccessible ou incomplète est signalée sans produire un total trompeur.
- **Dépendances éventuelles :** `FEAT-003`, `FEAT-008`, `FEAT-018`, `FEAT-019`.
- **Priorité :** P1.
- **Domaine métier cible :** Pilotage du dispositif.

### FEAT-033 — Superviser le portefeuille d’équipes

- **Intention métier :** connaître la couverture effective du dispositif d’évaluation.
- **Acteur concerné :** administrateur.
- **Description :** segmenter les équipes selon leur état, la présence d’un coach, leurs modèles associés et leur planification.
- **Critères d’acceptation principaux :**
  - les équipes sans coach, sans modèle ou sans prochaine échéance sont identifiables ;
  - filtres et totaux reposent sur les états métier courants et donnent accès au dossier source ;
  - les équipes archivées sont exclues des actifs mais restent consultables séparément.
- **Dépendances éventuelles :** `FEAT-007`, `FEAT-008`, `FEAT-010`, `FEAT-015`, `FEAT-018`.
- **Priorité :** P1.
- **Domaine métier cible :** Pilotage du dispositif.

### FEAT-034 — Superviser les échéances

- **Intention métier :** prioriser les actions sur les évaluations à venir et en retard.
- **Acteur concerné :** administrateur.
- **Description :** fournir une vue consolidée et filtrable des échéances, de leur statut et de leur responsable.
- **Critères d’acceptation principaux :**
  - chaque ligne expose équipe, modèle, coach, date et statut calculé ;
  - les vues à venir, dues, en retard et résolues suivent les mêmes règles que la planification ;
  - aucune échéance hors périmètre ou déjà satisfaite n’apparaît comme action active.
- **Dépendances éventuelles :** `FEAT-018`, `FEAT-019`, `FEAT-023`.
- **Priorité :** P1.
- **Domaine métier cible :** Pilotage du dispositif.

### FEAT-035 — Obtenir une vue globale du dispositif

- **Intention métier :** donner une lecture synthétique de l’adoption et de la santé du programme.
- **Acteur concerné :** administrateur, responsable du dispositif.
- **Description :** agréger des indicateurs explicables sur équipes, coachs, évaluations finalisées, échéances et retards sur une période.
- **Critères d’acceptation principaux :**
  - chaque indicateur définit son périmètre, sa période et sa règle de calcul ;
  - un indicateur permet de revenir aux données métier qui le composent ;
  - données manquantes et absence de données sont distinguées d’une valeur nulle.
- **Dépendances éventuelles :** `FEAT-024`, `FEAT-032`, `FEAT-033`, `FEAT-034`.
- **Priorité :** P2.
- **Domaine métier cible :** Pilotage du dispositif.

## Ordonnancement recommandé

1. **Socle du parcours P0 :** `FEAT-001` à `FEAT-005`, `FEAT-007` à `FEAT-009`.
2. **Cadre d’évaluation P0 :** `FEAT-011` à `FEAT-018`.
3. **Passation et preuve P0 :** `FEAT-020` à `FEAT-024`, puis validation E2E de `PV-001` avec son chemin nominal et ses refus essentiels.
4. **Maîtrise opérationnelle P1 :** cycle de vie avancé des équipes, retard, comparaison, tendances, notifications et supervision (`FEAT-006`, `FEAT-010`, `FEAT-019`, `FEAT-025` à `FEAT-034`).
5. **Synthèse P2 :** vue globale du dispositif (`FEAT-035`).

Cet ordre indique une séquence de valeur ; il ne prescrit ni lots techniques ni applications Django.

## Hypothèse de cartographie des domaines métier

Cette cartographie est une hypothèse évolutive. Elle guide un découpage cohérent sans figer prématurément les frontières. Dans chaque domaine, une future implémentation pourra distinguer sobrement **Domain**, **Application**, **Ports** et **Adapters** lorsque cette séparation apporte une valeur réelle.

### Identités et habilitations

- **Responsabilité principale :** identités, accès, cycle de vie des utilisateurs et coachs, décisions d’autorisation.
- **Features concernées :** `FEAT-001` à `FEAT-004`.
- **Dépendances :** fournit l’identité et les autorisations aux autres domaines ; ne porte pas leurs règles métier.

### Équipes et coaching

- **Responsabilité principale :** identité et état des équipes, responsabilité courante du coach et historique des affectations.
- **Features concernées :** `FEAT-005` à `FEAT-010`.
- **Dépendances :** reçoit les identités de coachs du domaine Identités et habilitations ; expose équipe active et affectation applicable à Planification et Passations.

### Référentiel d’évaluation

- **Responsabilité principale :** définition des critères, modalités, publication et versions immuables des modèles.
- **Features concernées :** `FEAT-011` à `FEAT-014`.
- **Dépendances :** fournit des versions publiées à Planification et des règles de réponse et calcul à Passations ; ne connaît ni équipe ni échéance.

### Planification des évaluations

- **Responsabilité principale :** associations équipe–modèle, cadences, cycles, échéances et qualification du retard.
- **Features concernées :** `FEAT-015` à `FEAT-019`.
- **Dépendances :** utilise l’état des équipes, les versions publiées et les faits de finalisation ; expose les évaluations attendues à Passations, Notifications et Pilotage.

### Passations d’évaluation

- **Responsabilité principale :** cycle de vie d’une passation, réponses, validation, résultats, finalisation et preuve immuable.
- **Features concernées :** `FEAT-020` à `FEAT-023`.
- **Dépendances :** vérifie coach et équipe auprès d’Équipes et coaching, modèle auprès du Référentiel et cycle auprès de Planification ; publie le fait de finalisation sans piloter la cadence.

### Analyse longitudinale

- **Responsabilité principale :** restitution de l’historique, comparabilité, évolutions et représentations des résultats.
- **Features concernées :** `FEAT-024` à `FEAT-027`.
- **Dépendances :** lit les preuves finalisées de Passations et la sémantique des versions du Référentiel ; n’altère jamais les évaluations sources.

### Notifications

- **Responsabilité principale :** intentions de rappel ou d’alerte, destinataires, déduplication et suivi de remise.
- **Features concernées :** `FEAT-028` à `FEAT-030`.
- **Dépendances :** consomme échéances, retards et affectations ; remet ses messages au moyen d’un port de notification afin que les règles métier ignorent les canaux concrets.

### Pilotage du dispositif

- **Responsabilité principale :** paramètres transverses autorisés et vues de supervision explicables du programme.
- **Features concernées :** `FEAT-031` à `FEAT-035`.
- **Dépendances :** consolide des informations des autres domaines sans devenir leur propriétaire ; les indicateurs restent reliés aux données sources.

## Garde-fous pour l’architecture future

- Le domaine métier et ses règles ne dépendront directement ni de Django REST Framework, ni de l’ORM Django, ni de SQLite, ni de HTTP, ni de React, ni de serializers, ni d’un système concret de notification.
- Les cas d’usage orchestreront les règles et dépendront de ports définis selon les besoins métier ; les adapters porteront persistance, API, interface et canaux externes.
- Les frontières suivront les responsabilités ci-dessus, pas des regroupements techniques génériques tels que `core`, `services`, `repositories`, `controllers` ou `utils`.
- SQLite est un adapter de persistance initial, pas une contrainte du domaine. React et Django REST Framework exposent le produit, mais ne définissent pas ses règles.
- La séparation restera pragmatique : aucun port, adapter ou abstraction ne sera créé sans collaboration réelle à isoler ou règle à protéger.
