# USER-003 — Modifier un utilisateur

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/01-identites.md) · [Preuves identites](../preuves.md#identites).

## Diagnostic contradictoire

- **Identifiant / parent unique :** USER-003 / FEAT-002 — Administrer le cycle de vie d’une identité.
- **Valeur métier recherchée :** Corriger l’identité d’un utilisateur sans élévation de privilège ni perte de traçabilité.
- **Comportement attendu :** Proposition : édition nom/prénom/mail avec ID stable ; le devenir de identifier/role/is_active existants doit être décidé explicitement. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** PUT identifier/email/role/is_active, notices courriel et protections de rôle/dernier Admin ; pas de noms dans ce contrat.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#identites) ; Ouvert ; date canonique N/A. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Insuffisamment défini.
- **Écart réel :** Contradiction entre fiche USER-003, matrice FEAT-004 et contrat livré ; suppression de capacités non autorisée par cet audit.
- **Recouvrements :** USER-004 owns activation et invariant Admin ; USER-002 owns lecture ; USER-001 manque de collecte des noms.
- **Prérequis déclarés :** **Dépendances :** `USER-002` ; `FEAT-004` pour l’autorisation et le périmètre. Le [contrat source](../../../../../docs/backlog/source/01-identites.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** C02 : aligner les acteurs/cibles et propriétaire de chaque mutation ; C01 : mail/login et données historiques.
- **Statut actuel et traitement proposé :** Ouvert ; date canonique N/A. Arbitrer les droits et le contrat, puis ne développer que le delta des champs retenus.

## Raffinement proposé — A à G

### A. Problème utilisateur

L’édition permet aujourd’hui de changer login, fonction et activation, tandis que la fiche limite l’opération aux noms et au mail.

### B. Valeur observable

Corriger l’identité d’un utilisateur sans élévation de privilège ni perte de traçabilité. La conformité se constate avec les scénarios ci-dessous ; elle ne se déduit pas de l’intitulé.

### C. Périmètre exact

- **À livrer ou qualifier :** Proposition : édition nom/prénom/mail avec ID stable ; le devenir de identifier/role/is_active existants doit être décidé explicitement.
- **Déjà présent :** PUT identifier/email/role/is_active, notices courriel et protections de rôle/dernier Admin ; pas de noms dans ce contrat.
- **À conserver :** Dernier Admin actif, absence d’auto-gestion, notices aux anciennes/nouvelles adresses et historique.
- **Exclus :** Modification du profil personnel, mot de passe tiers, rattachements ou changement silencieux de rôle.
- **Rôles et données :** Superadmin, Admin et Coach selon matrice FEAT-004 ; la fiche les contredit. Aucun rôle supplémentaire décidé.

### D. Acceptation observable

1. GIVEN C01/C02 autorisent l’Admin A à corriger nom/prénom/mail du Coach U de son organisation WHEN ces champs sont soumis avec ID U constant THEN seules ces valeurs SHOULD BE changées, sans modification du rôle, rattachement ou historique hors contrat retenu.
2. GIVEN une modification de mail autorisée WHEN elle réussit THEN ancienne et nouvelle adresses SHOULD BE traitées selon le contrat de notification existant.

### E. Vrai refus ou non-conformité

3. GIVEN un Admin A cible un Admin pair ou une identité d’une autre organisation WHEN il soumet le PUT THEN l’opération SHOULD BE refusée sans modification ni notice de succès ; un champ interdit par C02 SHOULD BE également refusé atomiquement.

Le refus doit être observé, avec absence d’effet non autorisé ; une erreur inattendue ne vaut pas un refus conforme.
Les refus additionnels de la source restent applicables. En l’absence d’arbitrage, ces scénarios conditionnels
sont des propositions à finaliser, pas une règle métier adoptée ni une fiche prête par simple présence de Gherkin.

### F. Preuves attendues

Unitaires matrice de droits retenue ; API/ORM champs autorisés/interdits, conflits et dernier Admin ; React/E2E édition et refus. Aucune assertion nouvelle avant C02.

Comparer attendu/observé par scénario et variante : SHA/entrées, rôle/jeu, état initial, action, résultat,
preuve et verdict. Les mesures UX reprennent [UX-01 à UX-09](../../../../../docs/quality/ux-acceptance.md) ;
aucun seuil esthétique, RPO/RTO, disponibilité ou capacité MESS supplémentaire n’est inventé.
Un test automatisé ne remplace pas la relecture visuelle ; un rapport local ne vaut pas un PV cible.

### G. Dépendances, décisions et aptitude

- **Technique :** **Dépendances :** `USER-002` ; `FEAT-004` pour l’autorisation et le périmètre. Prérequis non réalisés : attendre la sortie effectivement consommée ; préparation seule possible.
- **Métier :** rôles/périmètre et données ci-dessus, selon les concepts transverses ; les exclusions empêchent l’extension implicite à une Feature entière.
- **Décision humaine :** C02 : aligner les acteurs/cibles et propriétaire de chaque mutation ; C01 : mail/login et données historiques.
- **Ordonnancement :** [trajectoire proposée](../trajectoire.md), recommandation sans nouvel arc canonique ni engagement de taille/date.
- **Aptitude proposée :** Non prêt : C02 bloque un contrat contradictoire, même si le registre porte Ouvert.

Cette fiche ne modifie ni source détaillée, ni suivi, ni date. Toute correction de périmètre/statut
est soumise à la validation demandée par l’utilisateur avant intégration canonique.

## Nature, prochaine action et passage

- **Nature analytique :** D selon la [légende A–F](../actions.md) ; ce n’est pas un statut.
- **Action concrète suivante :** Confronter pour chaque rôle/cible les champs nom/prénom/mail/login/role/is_active entre fiche, FEAT-004 et PUT ; soumettre les différences.
- **Condition de passage :** C02 approuvé et C01 disponible ; le devenir des capacités existantes est explicite.
- **Prochain consommateur :** Édition identité décidée.
- **Vérification des six questions :** problème A ; manque au diagnostic ; résultat C ; acquis/règles/données à conserver C ; acceptation/refus D/E et preuves F ; blocages G et condition ci-dessus. Les décisions non rendues empêchent le développement concerné.
