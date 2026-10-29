# TEAM-005 — Archiver une équipe

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/02-equipes.md) · [Preuves equipes](../preuves.md#equipes).

## Diagnostic contradictoire

- **Identifiant / parent unique :** TEAM-005 / FEAT-010 — Gérer la sortie et la reprise du suivi actif.
- **Valeur métier recherchée :** Retirer un collectif des actifs tout en conservant un dossier consultable et sans double transition.
- **Comportement attendu :** Réutilisation GET archivé et message déjà archivée sans seconde transition. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** DELETE logique conserve l’équipe, la retire des actifs et crée l’activité ; scope actif rend le second DELETE 404.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#equipes) ; Ouvert ; date canonique N/A. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Partiellement couvert.
- **Écart réel :** Lecture archivée via TEAM-003 et refus métier explicite du second archivage.
- **Recouvrements :** TEAM-003 owns GET ; TEAM-006 owns liste ; ne pas développer deux détails archivés.
- **Prérequis déclarés :** **Dépendances :** `TEAM-003` ; `FEAT-004` pour l’autorisation. Le [contrat source](../../../../../docs/backlog/source/02-equipes.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** Aucune nouvelle politique métier pour le delta ; effets sur planifications restent aux Epics propriétaires.
- **Statut actuel et traitement proposé :** Ouvert ; date canonique N/A. Compléter après TEAM-003 ; conserver le seul archivage logique existant.

## Raffinement proposé — A à G

### A. Problème utilisateur

Après archivage, la fiche minimale ne peut être relue et un second DELETE répond introuvable plutôt que déjà archivée.

### B. Valeur observable

Retirer un collectif des actifs tout en conservant un dossier consultable et sans double transition. La conformité se constate avec les scénarios ci-dessous ; elle ne se déduit pas de l’intitulé.

### C. Périmètre exact

- **À livrer ou qualifier :** Réutilisation GET archivé et message déjà archivée sans seconde transition.
- **Déjà présent :** DELETE logique conserve l’équipe, la retire des actifs et crée l’activité ; scope actif rend le second DELETE 404.
- **À conserver :** Identité, nom, organisation, historique et refus Coach/Viewer.
- **Exclus :** Suppression physique, transfert, annulation automatique des planifications ou réécriture des complétions.
- **Rôles et données :** Admin local/Superadmin ; équipe et liens historiques.

### D. Acceptation observable

1. GIVEN une équipe active accessible WHEN l’archivage réussit THEN le GET de TEAM-003 SHOULD BE archivé et la liste active SHOULD BE sans cette équipe.
2. GIVEN la même équipe archivée WHEN un second archivage est demandé THEN un refus déjà archivée SHOULD BE explicite et aucun nouvel événement d’archivage SHOULD BE produit.

### E. Vrai refus ou non-conformité

3. GIVEN une équipe hors scope WHEN DELETE est tenté THEN état, liens et Journal de succès SHOULD BE inchangés.

Le refus doit être observé, avec absence d’effet non autorisé ; une erreur inattendue ne vaut pas un refus conforme.
Les refus additionnels de la source restent applicables. En l’absence d’arbitrage, ces scénarios conditionnels
sont des propositions à finaliser, pas une règle métier adoptée ni une fiche prête par simple présence de Gherkin.

### F. Preuves attendues

API/ORM transition, seconde requête et activité unique ; E2E archive→relecture→second refus ; contrats d’erreur documentés, sans inventer ici un code HTTP.

Comparer attendu/observé par scénario et variante : SHA/entrées, rôle/jeu, état initial, action, résultat,
preuve et verdict. Les mesures UX reprennent [UX-01 à UX-09](../../../../../docs/quality/ux-acceptance.md) ;
aucun seuil esthétique, RPO/RTO, disponibilité ou capacité MESS supplémentaire n’est inventé.
Un test automatisé ne remplace pas la relecture visuelle ; un rapport local ne vaut pas un PV cible.

### G. Dépendances, décisions et aptitude

- **Technique :** **Dépendances :** `TEAM-003` ; `FEAT-004` pour l’autorisation. Prérequis non réalisés : attendre la sortie effectivement consommée ; préparation seule possible.
- **Métier :** rôles/périmètre et données ci-dessus, selon les concepts transverses ; les exclusions empêchent l’extension implicite à une Feature entière.
- **Décision humaine :** Aucune nouvelle politique métier pour le delta ; effets sur planifications restent aux Epics propriétaires.
- **Ordonnancement :** [trajectoire proposée](../trajectoire.md), recommandation sans nouvel arc canonique ni engagement de taille/date.
- **Aptitude proposée :** Prêt après TEAM-003 ; aucun besoin de refaire le premier DELETE.

Cette fiche ne modifie ni source détaillée, ni suivi, ni date. Toute correction de périmètre/statut
est soumise à la validation demandée par l’utilisateur avant intégration canonique.

## Nature, prochaine action et passage

- **Nature analytique :** B selon la [légende A–F](../actions.md) ; ce n’est pas un statut.
- **Action concrète suivante :** Préparer le cas premier DELETE puis second DELETE 404 actuel, attendu déjà archivée sans deuxième activité ; référencer GET archivé TEAM-003.
- **Condition de passage :** TEAM-003 livré et contrat du second refus documenté ; aucune suppression physique.
- **Prochain consommateur :** TEAM-006/007.
- **Vérification des six questions :** problème A ; manque au diagnostic ; résultat C ; acquis/règles/données à conserver C ; acceptation/refus D/E et preuves F ; blocages G et condition ci-dessus. Les décisions non rendues empêchent le développement concerné.
