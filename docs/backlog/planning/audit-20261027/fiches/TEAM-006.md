# TEAM-006 — Consulter les équipes archivées

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/02-equipes.md) · [Preuves equipes](../preuves.md#equipes).

## Diagnostic contradictoire

- **Identifiant / parent unique :** TEAM-006 / FEAT-010 — Gérer la sortie et la reprise du suivi actif.
- **Valeur métier recherchée :** Retrouver les collectifs sortis du suivi sans les confondre avec le portefeuille actif.
- **Comportement attendu :** Liste des seules archives, identification minimale et état vide explicite. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** include_archived retourne actifs et archives à Admin/Superadmin pour Logs ; pas de vue dédiée des seules archives.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#equipes) ; Ouvert ; date canonique N/A. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Partiellement couvert.
- **Écart réel :** Vue/listage exclusif des archives et accès Coach approuvé.
- **Recouvrements :** TEAM-003 détail ; TEAM-005 transition ; MEP-017 responsive de la future vue seulement si livré.
- **Prérequis déclarés :** **Dépendances :** `TEAM-005` ; `FEAT-004` pour l’autorisation. Le [contrat source](../../../../../docs/backlog/source/02-equipes.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** C04 scope Coach ; conserver les filtres Logs existants.
- **Statut actuel et traitement proposé :** Ouvert ; date canonique N/A. Ajouter seulement la consultation séparée ; ne pas remplacer include_archived ni créer une chronologie.

## Raffinement proposé — A à G

### A. Problème utilisateur

Les équipes sorties du suivi ne sont repérables que comme options du filtre Logs, sans liste métier séparée.

### B. Valeur observable

Retrouver les collectifs sortis du suivi sans les confondre avec le portefeuille actif. La conformité se constate avec les scénarios ci-dessous ; elle ne se déduit pas de l’intitulé.

### C. Périmètre exact

- **À livrer ou qualifier :** Liste des seules archives, identification minimale et état vide explicite.
- **Déjà présent :** include_archived retourne actifs et archives à Admin/Superadmin pour Logs ; pas de vue dédiée des seules archives.
- **À conserver :** Liste active inchangée et archives utilisables dans Logs.
- **Exclus :** Recherche avancée, historique détaillé, réactivation et export.
- **Rôles et données :** Admin/Superadmin ; Coach selon C04 ; Viewer exclu.

### D. Acceptation observable

1. GIVEN une équipe active et une archivée autorisées WHEN la liste archives est consultée THEN seule l’archivée SHOULD BE présente une fois.
2. GIVEN aucune archive accessible WHEN la vue s’ouvre THEN un état vide valide SHOULD BE affiché sans erreur ni équipe active.

### E. Vrai refus ou non-conformité

3. GIVEN une archive étrangère WHEN le filtre est forgé THEN aucune donnée ni existence SHOULD BE révélée.

Le refus doit être observé, avec absence d’effet non autorisé ; une erreur inattendue ne vaut pas un refus conforme.
Les refus additionnels de la source restent applicables. En l’absence d’arbitrage, ces scénarios conditionnels
sont des propositions à finaliser, pas une règle métier adoptée ni une fiche prête par simple présence de Gherkin.

### F. Preuves attendues

API filtre exclusif/scopes ; React état vide/navigation ; E2E archive→liste archives et retour actifs. Revue visuelle lisibilité des états.

Comparer attendu/observé par scénario et variante : SHA/entrées, rôle/jeu, état initial, action, résultat,
preuve et verdict. Les mesures UX reprennent [UX-01 à UX-09](../../../../../docs/quality/ux-acceptance.md) ;
aucun seuil esthétique, RPO/RTO, disponibilité ou capacité MESS supplémentaire n’est inventé.
Un test automatisé ne remplace pas la relecture visuelle ; un rapport local ne vaut pas un PV cible.

### G. Dépendances, décisions et aptitude

- **Technique :** **Dépendances :** `TEAM-005` ; `FEAT-004` pour l’autorisation. Prérequis non réalisés : attendre la sortie effectivement consommée ; préparation seule possible.
- **Métier :** rôles/périmètre et données ci-dessus, selon les concepts transverses ; les exclusions empêchent l’extension implicite à une Feature entière.
- **Décision humaine :** C04 scope Coach ; conserver les filtres Logs existants.
- **Ordonnancement :** [trajectoire proposée](../trajectoire.md), recommandation sans nouvel arc canonique ni engagement de taille/date.
- **Aptitude proposée :** Après TEAM-005 selon source ; C04 avant ouverture Coach.

Cette fiche ne modifie ni source détaillée, ni suivi, ni date. Toute correction de périmètre/statut
est soumise à la validation demandée par l’utilisateur avant intégration canonique.

## Nature, prochaine action et passage

- **Nature analytique :** C+D selon la [légende A–F](../actions.md) ; ce n’est pas un statut.
- **Action concrète suivante :** Définir la vue des seules archives avec actif et archivé de même organisation ; conserver include_archived de Logs.
- **Condition de passage :** TEAM-005 et C04 disponibles ; modèle de projection et entrée de consultation approuvés.
- **Prochain consommateur :** TEAM-007 / consultation historique.
- **Vérification des six questions :** problème A ; manque au diagnostic ; résultat C ; acquis/règles/données à conserver C ; acceptation/refus D/E et preuves F ; blocages G et condition ci-dessus. Les décisions non rendues empêchent le développement concerné.
