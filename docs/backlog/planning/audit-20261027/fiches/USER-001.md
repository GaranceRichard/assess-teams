# USER-001 — Créer un utilisateur

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/01-identites.md) · [Preuves identites](../preuves.md#identites).

## Diagnostic contradictoire

- **Identifiant / parent unique :** USER-001 / FEAT-002 — Administrer le cycle de vie d’une identité.
- **Valeur métier recherchée :** Ouvrir un accès à une personne identifiable avec une fonction contrôlée.
- **Comportement attendu :** Évolution distincte du contrat d’identité nom/prénom/mail, en distinguant création technique et invitation ; aucune réalisation historique réécrite. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** POST /api/users/ crée username/password/role sans email ni noms. L’invitation POST /api/admin/users/ exige déjà identifier/email/role. first_name/last_name sont hérités de Django mais non alimentés par ces créations produit.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#identites) ; Réalisé ; date canonique 2026-09-21. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Partiellement couvert.
- **Écart réel :** Collecte et reprise des noms ; traitement du mail sur la création technique qui ne l’accepte pas, distinct de l’invitation qui l’exige déjà. Statut/date historiques Réalisé/2026-09-21 à préserver.
- **Recouvrements :** USER-002 exposition et USER-003 édition consomment les mêmes champs ; éviter trois migrations ou trois politiques distinctes.
- **Prérequis déclarés :** **Dépendances :** `FEAT-001` ; `FEAT-004` pour l’autorisation. Le [contrat source](../../../../../docs/backlog/source/01-identites.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** C01 : point de collecte, traitement des comptes existants, distinction mail/login et propriétaire de l’évolution distincte demandée par la source.
- **Statut actuel et traitement proposé :** Réalisé ; date canonique 2026-09-21. Ne pas rouvrir USER-001 ; soumettre un delta distinct sous FEAT-002 sans attribuer de nouvel identifiant avant validation.

## Raffinement proposé — A à G

### A. Problème utilisateur

La création technique historique ne collecte ni nom/prénom ni mail ; l’invitation collecte déjà le mail. Le contrat d’identité canonique exige de traiter précisément ces deux parcours.

### B. Valeur observable

Ouvrir un accès à une personne identifiable avec une fonction contrôlée. La conformité se constate avec les scénarios ci-dessous ; elle ne se déduit pas de l’intitulé.

### C. Périmètre exact

- **À livrer ou qualifier :** Évolution distincte de collecte/reprise nom/prénom/mail avec portage explicite des deux créations, après C01.
- **Déjà présent :** Création technique username/password/role sans mail ; invitation identifier/email/role avec mail obligatoire ; aucune collecte produit des noms.
- **À conserver :** Fonction unique, email requis dans l’invitation, identifiant stable, permissions et rattachement local explicite du parcours Admin.
- **Exclus :** Mail devenu login implicitement, noms synthétiques depuis username, création de Superadmin via produit.
- **Rôles et données :** Superadmin technique et Admin invitant Coach/Viewer ; identités nouvelles et existantes.

### D. Acceptation observable

1. GIVEN la décision C01 et le parcours de création autorisé retenu WHEN les données d’identité valides sont recueillies THEN nom/prénom/email/fonction SHOULD BE relus selon ce contrat sans changer l’authentification par hypothèse ni confondre création technique et invitation.
2. GIVEN un compte technique historique sans mail ni noms WHEN la reprise décidée est appliquée THEN identité/accès/historique SHOULD BE conservés et aucune donnée personnelle SHOULD BE fabriquée.

### E. Vrai refus ou non-conformité

3. GIVEN création interdite, doublon ou données invalides selon C01 WHEN la demande est soumise THEN aucun compte ni rattachement partiel SHOULD BE créé.

Le refus doit être observé, avec absence d’effet non autorisé ; une erreur inattendue ne vaut pas un refus conforme.
Les refus additionnels de la source restent applicables. En l’absence d’arbitrage, ces scénarios conditionnels
sont des propositions à finaliser, pas une règle métier adoptée ni une fiche prête par simple présence de Gherkin.

### F. Preuves attendues

Unitaires validation des champs décidés ; API création/invitation/lecture et migration de reprise si nécessaire ; React/E2E formulaire et doublon. Contrôle visuel noms longs ; réutiliser les tests d’invitation.

Comparer attendu/observé par scénario et variante : SHA/entrées, rôle/jeu, état initial, action, résultat,
preuve et verdict. Les mesures UX reprennent [UX-01 à UX-09](../../../../../docs/quality/ux-acceptance.md) ;
aucun seuil esthétique, RPO/RTO, disponibilité ou capacité MESS supplémentaire n’est inventé.
Un test automatisé ne remplace pas la relecture visuelle ; un rapport local ne vaut pas un PV cible.

### G. Dépendances, décisions et aptitude

- **Technique :** **Dépendances :** `FEAT-001` ; `FEAT-004` pour l’autorisation. Prérequis non réalisés : attendre la sortie effectivement consommée ; préparation seule possible.
- **Métier :** rôles/périmètre et données ci-dessus, selon les concepts transverses ; les exclusions empêchent l’extension implicite à une Feature entière.
- **Décision humaine :** C01 : point de collecte, traitement des comptes existants, distinction mail/login et propriétaire de l’évolution distincte demandée par la source.
- **Ordonnancement :** [trajectoire proposée](../trajectoire.md), recommandation sans nouvel arc canonique ni engagement de taille/date.
- **Aptitude proposée :** Non prêt pour évolution tant que C01 et son portage distinct ne sont pas validés.

Cette fiche ne modifie ni source détaillée, ni suivi, ni date. Toute correction de périmètre/statut
est soumise à la validation demandée par l’utilisateur avant intégration canonique.

## Nature, prochaine action et passage

- **Nature analytique :** C+D selon la [légende A–F](../actions.md) ; ce n’est pas un statut.
- **Action concrète suivante :** Décider où recueillir nom/prénom/mail dans POST users et invitation, puis consigner la reprise des identités sans ces données.
- **Condition de passage :** C01 valide champs par parcours, reprise des existants et portage distinct ; aucun ID attribué ici.
- **Prochain consommateur :** USER-002/003.
- **Vérification des six questions :** problème A ; manque au diagnostic ; résultat C ; acquis/règles/données à conserver C ; acceptation/refus D/E et preuves F ; blocages G et condition ci-dessus. Les décisions non rendues empêchent le développement concerné.
