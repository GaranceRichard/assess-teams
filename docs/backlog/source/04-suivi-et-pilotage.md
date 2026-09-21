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
- **Dépendances éventuelles :** `TEAM-002`, `TEAM-003`, `TEAM-005`, `FEAT-008`, `FEAT-015`, `FEAT-018`.
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
