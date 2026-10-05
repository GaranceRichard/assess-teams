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

#### PASS-001 — Passer et réviser les évaluations planifiées

- **Identifiant / Feature parente :** `PASS-001` / `FEAT-023`.
- **User story :** en tant qu’assigné, je veux remplir et reprendre une évaluation planifiée ; en tant qu’Admin, je veux la compléter à sa place ou en réviser les notes dans mon organisation.
- **Intention / valeur :** produire une complétion durable et attribuable à partir du référentiel local existant.
- **Description :** une passation par planification et échéance, avec contexte figé, questions exactes et ordonnées, notes entières de 0 à 10, brouillon persistant, validation et tableau récapitulatif.
- **Critères d’acceptation :** menu Évaluations, modale à une question, position X/N, range accessible, note affichée, précédent/suivant, reprise, refus d’une finalisation incomplète, verrouillage de l’assigné après complétion.
- **Provenance :** conserver assigné original, auteur réel et date initiale ; une révision Admin remplace les notes et conserve seulement le dernier réviseur/date, sans altérer la provenance initiale. Le tableau indique « Révisé par [ADMIN] le [date/heure] ».
- **Autorisations / refus :** Coach seulement assigné et membre de l’organisation ; Admin seulement dans son organisation ; Superadmin global ; Viewer/anonyme refusés. Refuser les IDs étrangers, les payloads de contexte forgés, les valeurs invalides et la révision par un Coach.
- **Journal d’activité :** complétion, complétion par Admin à la place de l’assigné, révision Admin ; aucune activité pour les lectures, sauvegardes de notes ou navigation.
- **Dépendances / priorité :** `AUTH-001`, `EVAL-002`, `PLAN-001`, `JOURNAL-001` / P0.
- **Cycle de vie :** le démarrage exige un modèle local `VALIDATED`, non vide et de la même organisation ; après archivage, une passation déjà commencée reste reprenable, consultable et révisable dans son périmètre.
- **Limites explicites :** les questions exactes sont figées sans introduire de versionnement (`FEAT-014` reste distincte). Aucun scoring, agrégation, export ou historique exhaustif de notes.
- **Preuves :** contraintes et migrations de passations/réponses, OpenAPI, tests API/permissions/reprise/provenance, React et Playwright de passation → reprise → finalisation → révision/proxy Admin.
- **Vérification de livraison :** intégration avec `EVAL-002`, validation complète du schéma et quality gate commun ; 233 tests backend, 120 frontend et 14 scénarios Playwright passent.
