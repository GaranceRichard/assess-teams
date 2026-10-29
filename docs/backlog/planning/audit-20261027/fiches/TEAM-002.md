# TEAM-002 — Lister les équipes

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/02-equipes.md) · [Preuves equipes](../preuves.md#equipes).

## Diagnostic contradictoire

- **Identifiant / parent unique :** TEAM-002 / FEAT-007 — Consulter les équipes.
- **Valeur métier recherchée :** Retrouver les équipes actives sur lesquelles une action de suivi est autorisée.
- **Comportement attendu :** Liste Coach dans le périmètre C04 avec ID/nom/état/organisation, sans archives par défaut. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** Liste Admin/Superadmin, pagination, équipes actives et include_archived pour Logs ; route /teams réservée Admin.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#equipes) ; Ouvert ; date canonique N/A. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Partiellement couvert.
- **Écart réel :** Lecture Coach et définition exacte de son périmètre de liste ; Viewer exclu conformément aux concepts.
- **Recouvrements :** Dashboard donne les noms des équipes courantes ; Results donne les équipes avec COMPLETED, ce n’est pas cette liste.
- **Prérequis déclarés :** **Dépendances :** `TEAM-001` ; `FEAT-004` pour le périmètre d’accès. Le [contrat source](../../../../../docs/backlog/source/02-equipes.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** C04 : confirmer si la liste Coach porte les seules équipes affectées ou tout son périmètre organisationnel ; ne pas déduire de Results.
- **Statut actuel et traitement proposé :** Ouvert ; date canonique N/A. Conserver la liste Admin et sa pagination ; livrer seulement l’accès Coach approuvé.

## Raffinement proposé — A à G

### A. Problème utilisateur

Le Coach ne peut ouvrir la liste des équipes alors que la fiche lui donne une lecture dans son périmètre.

### B. Valeur observable

Retrouver les équipes actives sur lesquelles une action de suivi est autorisée. La conformité se constate avec les scénarios ci-dessous ; elle ne se déduit pas de l’intitulé.

### C. Périmètre exact

- **À livrer ou qualifier :** Liste Coach dans le périmètre C04 avec ID/nom/état/organisation, sans archives par défaut.
- **Déjà présent :** Liste Admin/Superadmin, pagination, équipes actives et include_archived pour Logs ; route /teams réservée Admin.
- **À conserver :** Pagination existante, droits de mutation Admin/Superadmin et unicité par organisation.
- **Exclus :** Recherche avancée, droits Viewer, détail ou réactivation.
- **Rôles et données :** Coach rattaché, Admin local, Superadmin ; Viewer et anonyme refusés.

### D. Acceptation observable

1. GIVEN un Coach avec équipes actives autorisées selon C04 WHEN il consulte la liste THEN chacune SHOULD BE présente une seule fois avec son contexte minimal.
2. GIVEN aucune équipe active autorisée WHEN il consulte THEN une liste vide explicite SHOULD BE affichée ; une équipe nouvellement créée SHOULD BE visible au prochain chargement autorisé.

### E. Vrai refus ou non-conformité

3. GIVEN une organisation étrangère ou un Viewer WHEN la liste est demandée THEN aucune donnée protégée SHOULD BE révélée.

Le refus doit être observé, avec absence d’effet non autorisé ; une erreur inattendue ne vaut pas un refus conforme.
Les refus additionnels de la source restent applicables. En l’absence d’arbitrage, ces scénarios conditionnels
sont des propositions à finaliser, pas une règle métier adoptée ni une fiche prête par simple présence de Gherkin.

### F. Preuves attendues

API scopes affecté/non affecté selon décision, actifs/archives et contrats ; React liste vide/pagination ; E2E Coach et refus Viewer. Pas de test réécrivant la liste livrée.

Comparer attendu/observé par scénario et variante : SHA/entrées, rôle/jeu, état initial, action, résultat,
preuve et verdict. Les mesures UX reprennent [UX-01 à UX-09](../../../../../docs/quality/ux-acceptance.md) ;
aucun seuil esthétique, RPO/RTO, disponibilité ou capacité MESS supplémentaire n’est inventé.
Un test automatisé ne remplace pas la relecture visuelle ; un rapport local ne vaut pas un PV cible.

### G. Dépendances, décisions et aptitude

- **Technique :** **Dépendances :** `TEAM-001` ; `FEAT-004` pour le périmètre d’accès. Prérequis non réalisés : attendre la sortie effectivement consommée ; préparation seule possible.
- **Métier :** rôles/périmètre et données ci-dessus, selon les concepts transverses ; les exclusions empêchent l’extension implicite à une Feature entière.
- **Décision humaine :** C04 : confirmer si la liste Coach porte les seules équipes affectées ou tout son périmètre organisationnel ; ne pas déduire de Results.
- **Ordonnancement :** [trajectoire proposée](../trajectoire.md), recommandation sans nouvel arc canonique ni engagement de taille/date.
- **Aptitude proposée :** Non prêt pour le scope Coach avant C04 ; liste Admin déjà utilisable.

Cette fiche ne modifie ni source détaillée, ni suivi, ni date. Toute correction de périmètre/statut
est soumise à la validation demandée par l’utilisateur avant intégration canonique.

## Nature, prochaine action et passage

- **Nature analytique :** C+D selon la [légende A–F](../actions.md) ; ce n’est pas un statut.
- **Action concrète suivante :** Faire choisir le périmètre Coach et écrire les exemples équipe affectée/non affectée/étrangère avant d’ouvrir la liste.
- **Condition de passage :** C04 et projection approuvés ; nominal/vide/refus définis ; liste Admin conservée.
- **Prochain consommateur :** TEAM-003/006.
- **Vérification des six questions :** problème A ; manque au diagnostic ; résultat C ; acquis/règles/données à conserver C ; acceptation/refus D/E et preuves F ; blocages G et condition ci-dessus. Les décisions non rendues empêchent le développement concerné.
