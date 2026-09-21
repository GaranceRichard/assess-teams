## EPIC-003 — Référentiel des modèles d’évaluation

Cet Epic applique les [concepts métier transverses](00-concepts-transverses.md). L’organisation d’origine de chaque modèle doit être déterminable. Le partage éventuel relève de la décision produit bloquante `ARB-ORG-010` du [registre des arbitrages Organisation](00-arbitrages-organisations.md) ; `FEAT-011` à `FEAT-016` ne sont pas prêtes à être raffinées ni implémentées sur ce point.

### FEAT-011 — Composer un modèle d’évaluation ordonné

- **Intention métier :** formaliser ce qui doit être évalué et dans quel ordre.
- **Acteur concerné :** `Admin` dans son organisation.
- **Description :** créer un modèle nommé, ajouter, modifier ou retirer des critères et définir leur ordre avant publication.
- **Critères d’acceptation principaux :**
  - un brouillon contient des critères identifiables et présentés dans l’ordre défini ;
  - réordonner un critère ne change ni son identité ni sa signification ;
  - un modèle sans critère, avec doublons interdits ou critères invalides ne peut pas être publié ;
  - le modèle conserve son organisation d’origine, sans partage interorganisation implicite.
- **Dépendances éventuelles :** `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Référentiel d’évaluation.

### FEAT-012 — Définir les modalités de notation

- **Intention métier :** rendre les réponses cohérentes, comparables et validables.
- **Acteur concerné :** `Admin` dans son organisation.
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
- **Acteur concerné :** `Admin` dans son organisation.
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
- **Acteurs concernés :** `Admin` pour la création d’une version ; `Viewer` authentifié pour la consultation.
- **Description :** créer une nouvelle version lors de toute évolution d’un modèle publié et conserver les versions antérieures en lecture.
- **Critères d’acceptation principaux :**
  - une version publiée est immuable et toute évolution produit une version distincte ;
  - chaque passation référence exactement la version avec laquelle elle a commencé ;
  - une version historique reste consultable dans le périmètre organisationnel applicable et ne peut être supprimée si elle est référencée.
- **Dépendances éventuelles :** `FEAT-013`.
- **Priorité :** P0.
- **Domaine métier cible :** Référentiel d’évaluation.

## EPIC-004 — Affectations et planification des évaluations

Cet Epic dérive l’organisation de ses associations, cycles et échéances de l’équipe concernée. Toute référence à un modèle, un `Coach` ou un paramètre vérifie sa compatibilité avec cette organisation selon les [concepts métier transverses](00-concepts-transverses.md) et les arbitrages de partage applicables.

### FEAT-015 — Associer des modèles à une équipe

- **Intention métier :** définir les cadres d’évaluation applicables à chaque équipe.
- **Acteur concerné :** `Admin` de l’organisation de l’équipe.
- **Description :** associer un ou plusieurs modèles publiés à une équipe active avec une période d’applicabilité.
- **Critères d’acceptation principaux :**
  - plusieurs modèles publiés peuvent coexister pour une équipe si leurs associations sont explicites ;
  - une association identifie l’organisation, la version applicable ou une règle explicite de prise en compte des versions futures ;
  - une équipe inactive, un modèle non publié, un modèle non applicable à l’organisation de l’équipe ou une association identique qui se chevauche est refusé.
- **Dépendances éventuelles :** `TEAM-001`, `FEAT-013`, `FEAT-014`.
- **Priorité :** P0.
- **Domaine métier cible :** Planification des évaluations.

### FEAT-016 — Retracer les associations équipe–modèle

- **Intention métier :** expliquer quel cadre d’évaluation s’appliquait à une équipe à une date donnée.
- **Acteurs concernés :** `Admin`, `Coach` autorisé par son affectation.
- **Description :** conserver les débuts, fins, versions et auteurs des associations entre équipes et modèles.
- **Critères d’acceptation principaux :**
  - la chronologie distingue organisation, association active, terminée et remplacée ;
  - une évaluation passée reste explicable même après changement de modèle ;
  - la suppression d’une association utilisée est interdite au profit d’une clôture datée.
- **Dépendances éventuelles :** `FEAT-015`.
- **Priorité :** P0.
- **Domaine métier cible :** Planification des évaluations.

### FEAT-017 — Configurer la fréquence et la première échéance

- **Intention métier :** transformer une association en engagement récurrent et prévisible.
- **Acteur concerné :** `Admin` de l’organisation de l’équipe.
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
- **Acteurs concernés :** `Coach` affecté, `Admin`, dans l’organisation de l’équipe.
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
- **Acteurs concernés :** `Coach` affecté, `Admin`, dans l’organisation de l’équipe.
- **Description :** qualifier comme en retard toute échéance dépassée sans évaluation valablement finalisée pour le cycle concerné.
- **Critères d’acceptation principaux :**
  - le statut dépend d’une date de référence explicite, de l’échéance et de la finalisation attendue ;
  - une évaluation finalisée pour un autre modèle ou un autre cycle ne clôt pas le retard ;
  - un retard résolu reste explicable dans l’historique sans demeurer dans la liste active.
- **Dépendances éventuelles :** `FEAT-018`, `FEAT-023`.
- **Priorité :** P1.
- **Domaine métier cible :** Planification des évaluations.

## EPIC-005 — Passation et preuve d’évaluation

Cet Epic dérive l’organisation de chaque passation et évaluation de l’équipe concernée. Tous les acteurs, affectations, modèles, cycles et résultats mobilisés doivent relever de ce même périmètre ou d’une règle de partage explicitement arbitrée ; tout croisement implicite est refusé.

### FEAT-020 — Démarrer l’évaluation attendue

- **Intention métier :** ouvrir la bonne passation dans le bon contexte de responsabilité.
- **Acteur concerné :** `Coach` affecté à l’équipe.
- **Description :** créer une passation pour une équipe, une association et un cycle, en figeant la version du modèle utilisée.
- **Critères d’acceptation principaux :**
  - le coach courant peut démarrer une passation attendue pour une équipe active et un modèle applicable ;
  - la passation conserve organisation, équipe, `Coach`, cycle, échéance et version du modèle ;
  - un `Coach` non affecté ou d’une autre organisation, un modèle retiré ou non applicable à l’organisation, une équipe inactive ou un doublon pour le même cycle est refusé.
- **Dépendances éventuelles :** `FEAT-008`, `FEAT-014`, `FEAT-015`, `FEAT-017`.
- **Priorité :** P0.
- **Domaine métier cible :** Passations d’évaluation.
### FEAT-021 — Renseigner et reprendre un brouillon

- **Intention métier :** permettre une saisie fiable, y compris lorsque l’évaluation ne peut être terminée en une fois.
- **Acteur concerné :** `Coach` responsable de la passation.
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
- **Acteur concerné :** `Coach` responsable de la passation.
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
- **Acteurs concernés :** `Coach` responsable pour la finalisation ; accès du `Viewer` authentifié à la preuve soumis à `ARB-ORG-012`.
- **Description :** finaliser une passation, figer son contenu et conserver les faits nécessaires à son audit ; toute rectification ultérieure est explicite et traçable.
- **Critères d’acceptation principaux :**
  - seule une passation validée peut être finalisée, avec auteur et instant de finalisation ;
  - organisation, contenu, résultats, contexte et version du modèle deviennent immuables ;
  - une nouvelle tentative de finalisation est sans double effet et une rectification ne remplace jamais silencieusement l’original.
- **Dépendances éventuelles :** `FEAT-022`.
- **Priorité :** P0.
- **Domaine métier cible :** Passations d’évaluation.
