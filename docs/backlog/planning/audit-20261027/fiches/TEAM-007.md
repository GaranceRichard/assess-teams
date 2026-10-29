# TEAM-007 — Réactiver une équipe

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/02-equipes.md) · [Preuves equipes](../preuves.md#equipes).

## Diagnostic contradictoire

- **Identifiant / parent unique :** TEAM-007 / FEAT-010 — Gérer la sortie et la reprise du suivi actif.
- **Valeur métier recherchée :** Reprendre le suivi du même collectif sans recréer son identité ni perdre son contexte.
- **Comportement attendu :** Réactivation explicite du même ID et actualisation des listes active/archives. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** Aucun endpoint de réactivation ; PUT et DELETE ne ciblent que les équipes actives.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#equipes) ; Ouvert ; date canonique N/A. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Non couvert.
- **Écart réel :** Transition archivée→active et changement cohérent des listes.
- **Recouvrements :** TEAM-006 fournit l’entrée de consultation ; TEAM-001 ne doit pas recréer l’identité.
- **Prérequis déclarés :** **Dépendances :** `TEAM-005` ; `FEAT-004` pour l’autorisation. Le [contrat source](../../../../../docs/backlog/source/02-equipes.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** C05 : si la reprise doit produire un effet sur plans/assignations, décision des propriétaires ; ne pas le déduire du seul changement d’état.
- **Statut actuel et traitement proposé :** Ouvert ; date canonique N/A. Conserver la fiche minimale ; confirmer les effets annexes avant de la déclarer prête sans réserve.

## Raffinement proposé — A à G

### A. Problème utilisateur

Une équipe archivée ne peut reprendre son suivi avec son identité existante.

### B. Valeur observable

Reprendre le suivi du même collectif sans recréer son identité ni perdre son contexte. La conformité se constate avec les scénarios ci-dessous ; elle ne se déduit pas de l’intitulé.

### C. Périmètre exact

- **À livrer ou qualifier :** Réactivation explicite du même ID et actualisation des listes active/archives.
- **Déjà présent :** Aucun endpoint de réactivation ; PUT et DELETE ne ciblent que les équipes actives.
- **À conserver :** Nom, organisation, liens et données historiques ; autorisations de mutation.
- **Exclus :** Restauration implicite de responsabilités ou génération d’échéances sans règle décidée.
- **Rôles et données :** Superadmin/Admin local ; équipe archivée et données associées.

### D. Acceptation observable

1. GIVEN une équipe archivée accessible WHEN sa réactivation est validée THEN son état SHOULD BE actif avec même ID/nom/organisation et historique.
2. GIVEN cette réactivation WHEN les listes sont relues THEN l’équipe SHOULD BE dans les actifs et absente des archives.

### E. Vrai refus ou non-conformité

3. GIVEN une équipe déjà active, étrangère ou un Coach/Viewer WHEN réactivation est demandée THEN aucune transition ni nouvel historique SHOULD BE créé.

Le refus doit être observé, avec absence d’effet non autorisé ; une erreur inattendue ne vaut pas un refus conforme.
Les refus additionnels de la source restent applicables. En l’absence d’arbitrage, ces scénarios conditionnels
sont des propositions à finaliser, pas une règle métier adoptée ni une fiche prête par simple présence de Gherkin.

### F. Preuves attendues

Unitaires transition ; API/ORM état/relations/refus ; E2E réactivation puis consultation. Vérifier les effets réels du worker sur une équipe réactivée.

Comparer attendu/observé par scénario et variante : SHA/entrées, rôle/jeu, état initial, action, résultat,
preuve et verdict. Les mesures UX reprennent [UX-01 à UX-09](../../../../../docs/quality/ux-acceptance.md) ;
aucun seuil esthétique, RPO/RTO, disponibilité ou capacité MESS supplémentaire n’est inventé.
Un test automatisé ne remplace pas la relecture visuelle ; un rapport local ne vaut pas un PV cible.

### G. Dépendances, décisions et aptitude

- **Technique :** **Dépendances :** `TEAM-005` ; `FEAT-004` pour l’autorisation. Prérequis non réalisés : attendre la sortie effectivement consommée ; préparation seule possible.
- **Métier :** rôles/périmètre et données ci-dessus, selon les concepts transverses ; les exclusions empêchent l’extension implicite à une Feature entière.
- **Décision humaine :** C05 : si la reprise doit produire un effet sur plans/assignations, décision des propriétaires ; ne pas le déduire du seul changement d’état.
- **Ordonnancement :** [trajectoire proposée](../trajectoire.md), recommandation sans nouvel arc canonique ni engagement de taille/date.
- **Aptitude proposée :** Après TEAM-005 ; politique des reprises annexes à confirmer par C05.

Cette fiche ne modifie ni source détaillée, ni suivi, ni date. Toute correction de périmètre/statut
est soumise à la validation demandée par l’utilisateur avant intégration canonique.

## Nature, prochaine action et passage

- **Nature analytique :** C+D selon la [légende A–F](../actions.md) ; ce n’est pas un statut.
- **Action concrète suivante :** Expliciter le changement d’état seul et présenter les effets sur plans/assignations à leurs propriétaires.
- **Condition de passage :** TEAM-005 acquis, C05 approuve effets de reprise ; aucun rétablissement implicite de responsabilité.
- **Prochain consommateur :** Reprise du suivi actif.
- **Vérification des six questions :** problème A ; manque au diagnostic ; résultat C ; acquis/règles/données à conserver C ; acceptation/refus D/E et preuves F ; blocages G et condition ci-dessus. Les décisions non rendues empêchent le développement concerné.
