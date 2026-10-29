# USER-002 — Consulter les utilisateurs

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/01-identites.md) · [Preuves identites](../preuves.md#identites).

## Diagnostic contradictoire

- **Identifiant / parent unique :** USER-002 / FEAT-002 — Administrer le cycle de vie d’une identité.
- **Valeur métier recherchée :** Identifier les collaborateurs et leur état d’accès sans consulter de donnée étrangère ou secrète.
- **Comportement attendu :** Lecture d’une identité accessible avec ID, nom, prénom, mail, fonction/indicateur Superadmin et état ; listes existantes conservées. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** Liste paginée, fonction, état et organisations ; aucun GET sur ManagedUserDetailView. Les champs Django first_name/last_name existent mais ne sont pas exposés par ManagedUserSerializer.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#identites) ; Ouvert ; date canonique N/A. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Partiellement couvert.
- **Écart réel :** Détail par ID et contrat nom/prénom ; mail déjà exposé comme email. Ne pas annoncer le mail totalement absent.
- **Recouvrements :** USER-001 création historique ; USER-003 écriture ; DASH-001 lit déjà les noms persistés.
- **Prérequis déclarés :** **Dépendances :** `USER-001` ; `FEAT-004` pour l’autorisation ; `FEAT-037` pour le périmètre organisationnel de l’`Admin`. Le [contrat source](../../../../../docs/backlog/source/01-identites.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** C01 : responsable de la collecte/reprise des noms et relation mail/username ; aucune donnée historique inventée.
- **Statut actuel et traitement proposé :** Ouvert ; date canonique N/A. Conserver la liste ; préciser la reprise des données avant de livrer le détail et les noms.

## Raffinement proposé — A à G

### A. Problème utilisateur

Un administrateur ne peut obtenir le détail minimal d’une identité et distinguer ses nom/prénom dans l’API de gestion.

### B. Valeur observable

Identifier les collaborateurs et leur état d’accès sans consulter de donnée étrangère ou secrète. La conformité se constate avec les scénarios ci-dessous ; elle ne se déduit pas de l’intitulé.

### C. Périmètre exact

- **À livrer ou qualifier :** Lecture d’une identité accessible avec ID, nom, prénom, mail, fonction/indicateur Superadmin et état ; listes existantes conservées.
- **Déjà présent :** Liste paginée, fonction, état et organisations ; aucun GET sur ManagedUserDetailView. Les champs Django first_name/last_name existent mais ne sont pas exposés par ManagedUserSerializer.
- **À conserver :** Scopes actuels, exclusion des inactifs non administrables, secrets absents et bootstrap séparé.
- **Exclus :** Recherche/pagination nouvelles, rattachement, renommage du login et édition.
- **Rôles et données :** Superadmin global, Admin local, Coach local selon FEAT-004 ; Viewer refusé.

### D. Acceptation observable

1. GIVEN un compte accessible avec noms renseignés WHEN l’acteur ouvre son détail THEN ID, noms, email, fonction et activation SHOULD BE restitués sans secret.
2. GIVEN un Coach sans organisation WHEN il consulte la liste THEN la liste SHOULD BE vide ; un Viewer SHOULD BE refusé.

### E. Vrai refus ou non-conformité

3. GIVEN un ID étranger ou inexistant WHEN le détail est demandé THEN aucune identité ni confirmation d’existence SHOULD BE révélée.

Le refus doit être observé, avec absence d’effet non autorisé ; une erreur inattendue ne vaut pas un refus conforme.
Les refus additionnels de la source restent applicables. En l’absence d’arbitrage, ces scénarios conditionnels
sont des propositions à finaliser, pas une règle métier adoptée ni une fiche prête par simple présence de Gherkin.

### F. Preuves attendues

API/ORM : détail autorisé, ID étranger et noms vides historiques selon décision ; React : liste→détail ; E2E rôles. Relecture visuelle des identités et états.

Comparer attendu/observé par scénario et variante : SHA/entrées, rôle/jeu, état initial, action, résultat,
preuve et verdict. Les mesures UX reprennent [UX-01 à UX-09](../../../../../docs/quality/ux-acceptance.md) ;
aucun seuil esthétique, RPO/RTO, disponibilité ou capacité MESS supplémentaire n’est inventé.
Un test automatisé ne remplace pas la relecture visuelle ; un rapport local ne vaut pas un PV cible.

### G. Dépendances, décisions et aptitude

- **Technique :** **Dépendances :** `USER-001` ; `FEAT-004` pour l’autorisation ; `FEAT-037` pour le périmètre organisationnel de l’`Admin`. Prérequis non réalisés : attendre la sortie effectivement consommée ; préparation seule possible.
- **Métier :** rôles/périmètre et données ci-dessus, selon les concepts transverses ; les exclusions empêchent l’extension implicite à une Feature entière.
- **Décision humaine :** C01 : responsable de la collecte/reprise des noms et relation mail/username ; aucune donnée historique inventée.
- **Ordonnancement :** [trajectoire proposée](../trajectoire.md), recommandation sans nouvel arc canonique ni engagement de taille/date.
- **Aptitude proposée :** Non prêt pour le contrat des noms tant que C01 n’est pas tranché ; détail isolable après validation du découpage.

Cette fiche ne modifie ni source détaillée, ni suivi, ni date. Toute correction de périmètre/statut
est soumise à la validation demandée par l’utilisateur avant intégration canonique.

## Nature, prochaine action et passage

- **Nature analytique :** C+D selon la [légende A–F](../actions.md) ; ce n’est pas un statut.
- **Action concrète suivante :** Établir le contrat GET détail avec deux exemples, identité nommée et identité historique sans noms, selon C01.
- **Condition de passage :** C01 et projection de lecture validés ; champs, droits et refus étrangers arrêtés.
- **Prochain consommateur :** USER-003.
- **Vérification des six questions :** problème A ; manque au diagnostic ; résultat C ; acquis/règles/données à conserver C ; acceptation/refus D/E et preuves F ; blocages G et condition ci-dessus. Les décisions non rendues empêchent le développement concerné.
