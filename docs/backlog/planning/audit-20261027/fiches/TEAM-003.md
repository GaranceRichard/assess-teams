# TEAM-003 — Consulter une équipe

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/02-equipes.md) · [Preuves equipes](../preuves.md#equipes).

## Diagnostic contradictoire

- **Identifiant / parent unique :** TEAM-003 / FEAT-007 — Consulter les équipes.
- **Valeur métier recherchée :** Accéder à une référence stable du dossier minimal d’une équipe, même archivée.
- **Comportement attendu :** GET par ID, données minimales et état active/archivée, refus inaccessible sans fuite. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** Route de détail présente pour PUT/DELETE uniquement ; manageable_team filtre is_active=True.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#equipes) ; Ouvert ; date canonique N/A. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Non couvert.
- **Écart réel :** GET détail et projection archivée absents ; choisir un handler nommé Detail ne prouve pas GET.
- **Recouvrements :** TEAM-005 consomme la lecture archivée ; TEAM-006 liste les archives.
- **Prérequis déclarés :** **Dépendances :** `TEAM-001` ; `FEAT-004` pour le périmètre d’accès. Le [contrat source](../../../../../docs/backlog/source/02-equipes.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** C04 pour le Coach uniquement ; contrat Admin/Superadmin déjà explicite.
- **Statut actuel et traitement proposé :** Ouvert ; date canonique N/A. Premier delta équipe après accord du périmètre ; garder le détail minimal, sans enrichissement.

## Raffinement proposé — A à G

### A. Problème utilisateur

Aucune lecture par ID ne permet de retrouver la fiche minimale d’une équipe active ou archivée.

### B. Valeur observable

Accéder à une référence stable du dossier minimal d’une équipe, même archivée. La conformité se constate avec les scénarios ci-dessous ; elle ne se déduit pas de l’intitulé.

### C. Périmètre exact

- **À livrer ou qualifier :** GET par ID, données minimales et état active/archivée, refus inaccessible sans fuite.
- **Déjà présent :** Route de détail présente pour PUT/DELETE uniquement ; manageable_team filtre is_active=True.
- **À conserver :** ID/nom/organisation et archives historiques ; aucune mutation à la lecture.
- **Exclus :** Coachs détaillés, modèles, échéances, historique général et transfert.
- **Rôles et données :** Superadmin, Admin local et Coach selon C04 ; Viewer exclu.

### D. Acceptation observable

1. GIVEN une équipe accessible active puis archivée WHEN son ID est consulté THEN la même identité, le nom et l’organisation SHOULD BE restitués avec l’état exact.
2. GIVEN un ID inexistant WHEN la lecture est demandée THEN une erreur d’introuvable sans contenu équipe SHOULD BE retournée.

### E. Vrai refus ou non-conformité

3. GIVEN un ID hors scope WHEN la lecture est tentée THEN aucune confirmation d’existence SHOULD BE révélée et aucune donnée SHOULD BE modifiée.

Le refus doit être observé, avec absence d’effet non autorisé ; une erreur inattendue ne vaut pas un refus conforme.
Les refus additionnels de la source restent applicables. En l’absence d’arbitrage, ces scénarios conditionnels
sont des propositions à finaliser, pas une règle métier adoptée ni une fiche prête par simple présence de Gherkin.

### F. Preuves attendues

API/ORM GET actifs/archives, introuvable et rôle ; contrat OpenAPI ; React/E2E si point d’entrée UI retenu. Vérifier GET sans Journal métier.

Comparer attendu/observé par scénario et variante : SHA/entrées, rôle/jeu, état initial, action, résultat,
preuve et verdict. Les mesures UX reprennent [UX-01 à UX-09](../../../../../docs/quality/ux-acceptance.md) ;
aucun seuil esthétique, RPO/RTO, disponibilité ou capacité MESS supplémentaire n’est inventé.
Un test automatisé ne remplace pas la relecture visuelle ; un rapport local ne vaut pas un PV cible.

### G. Dépendances, décisions et aptitude

- **Technique :** **Dépendances :** `TEAM-001` ; `FEAT-004` pour le périmètre d’accès. Prérequis non réalisés : attendre la sortie effectivement consommée ; préparation seule possible.
- **Métier :** rôles/périmètre et données ci-dessus, selon les concepts transverses ; les exclusions empêchent l’extension implicite à une Feature entière.
- **Décision humaine :** C04 pour le Coach uniquement ; contrat Admin/Superadmin déjà explicite.
- **Ordonnancement :** [trajectoire proposée](../trajectoire.md), recommandation sans nouvel arc canonique ni engagement de taille/date.
- **Aptitude proposée :** Prêt proposé pour le slice Admin/Superadmin ; ajout Coach attend C04 et découpage validé.

Cette fiche ne modifie ni source détaillée, ni suivi, ni date. Toute correction de périmètre/statut
est soumise à la validation demandée par l’utilisateur avant intégration canonique.

## Nature, prochaine action et passage

- **Nature analytique :** C+D selon la [légende A–F](../actions.md) ; ce n’est pas un statut.
- **Action concrète suivante :** Soumettre le découpage du GET minimal actif/archivé Admin/Superadmin et l’attente du scope Coach.
- **Condition de passage :** Périmètre complet décidé par C04 ou découpage explicitement approuvé ; aucun slice présumé autorisé.
- **Prochain consommateur :** TEAM-005.
- **Vérification des six questions :** problème A ; manque au diagnostic ; résultat C ; acquis/règles/données à conserver C ; acceptation/refus D/E et preuves F ; blocages G et condition ci-dessus. Les décisions non rendues empêchent le développement concerné.
