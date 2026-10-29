# Finalisation et intégration documentaire — 2026-10-29

Suite autorisée de la [consolidation](consolidation-revue.md), sans nouvel audit ni réécriture des 52 fiches.
Branche `audit/backlog-contradictoire-20261027`, worktree d’audit existant ; base après récupération
de `origin/main` : initialement `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`, puis resynchronisation
sur **`eede63120a2b6fdc949d9e30de63d562a20f1002`** après publication UX concurrente. Son code, tests,
preuves et documents, ainsi que les acquis Résultats, sont conservés ; aucun autre worktree modifié.

## Conclusions intégrées

- [Complément canonique concis](../../source/08-ecarts-et-qualifications.md) : acquis/deltas par capacité,
  natures A–F, décisions et consommateurs, liens aux scénarios/refus/prochaines actions détaillés.
- Sources Identités/Équipes/Organisation et F04–F20 pertinentes : frontières explicites, qualifications
  plutôt que développement présumé, contrats/distribution/outils absents séparés des PV cible.
- Registres, vue détaillée, index du backlog, ordonnancement, dépendances et synthèse synchronisés.
  Le [plan courant](../pre-mep.md) commence par **MEP-045 — Qualification de conformité et décision de clôture**.
  047/048 : qualification également ; ordre UX conditionnel, D01–D09/C11 et trames en parallèle.
- C19 rapproché dans les documents courants ; revues historiques et critères/décisions approuvés conservés.
  C06 reste une réconciliation à valider, sans chantier Git/CI ni remise en cause du 21 octobre.
- [C21](anomalie-transitions.md) : raccord technique désormais publié (`c7efd22` et suites jusqu’à `eede631`) ;
  code/vidéo/frames référencés, acceptation visuelle utilisateur non acquise. Le README conserve la
  description du correctif intégré et distingue livraison technique et verdict esthétique.

## Invariants et décisions

96 PBI actifs : 34 fonctionnels + 62 MESS ; **45 Réalisés, 48 Ouverts, 3 Bloqués**, 0 En cours.
Couverture analytique **47/20/22/2/5**, aucun doublon actif intégral démontré ; 19 Features sans PBI
propre restent non raffinées. Aucun ID, parent, statut ou date de réalisation changé ; aucun PBI créé,
retiré, clos ou rouvert. Aucune fiche A–G refaite dans cette finalisation.

Restent ouverts et attribuables : **ARB-ORG-005, D01–D09, C11, C01/C02, C03/C04/C05, C06,
C12 et C21**. Leurs véritables consommateurs seuls attendent ; aucune politique de suppression,
configuration MESS, règle de droit, objectif chiffré, priorité ou durée inventé.
MEP-045/047/048 n’exigent aucun développement identifié ; une conformité avec DoD démontrée
autorise une **proposition** de clôture, jamais une clôture par cette publication documentaire.

## Revue d’impact et validation

README racine, règles des agents, charte qualité, DoD, stratégie de tests, vision, architecture et
documentation API examinés : seul le README doit expliciter C21 ; les politiques, contrats API et
documents techniques restent applicables sans modification. Sources historiques conservées.
Code, tests, modèles, migrations, contrats et workflows : non applicables, aucun changement technique.
Validation demandée : cohérence exhaustive des identifiants/parents/statuts/dates, liens/ancres,
champs historiques et dépendances, limites de 200 lignes, diff et `quality:targeted` documentaire.
Résultats de contrôle avant commit :

| Contrôle | Résultat |
| --- | --- |
| Registres / matrice | 96 identifiants uniques, 34+62 ; titres, parents, tailles/modèles recommandés, statuts et dates identiques à la base ; catégories analytiques inchangées. |
| Sources historiques | 412 lignes structurantes des sources modifiées conservées : identifiants, parents, stories, critères/refus, dépendances/priorités. Ajouts de limites et renvois explicitement séparés. |
| Features / fiches | 61 Features actives, 42 raffinées, 19 non raffinées toutes dans la table de frontières ; 96 dossiers dont 52 A–G, aucun raffinement repris. |
| Périmètre / liens / taille | Après resynchronisation : 152 fichiers documentaires concernés, dont 117 dans le dossier d’audit ; 2 104 liens locaux/ancres résolus, maximum 200 lignes ; aucun fichier applicatif modifié par ce lot. |
| `git diff --check` | Conforme. |
| `npm run quality:targeted` | Réussi avant et après resynchronisation, 0 échec : lignes, secrets, structure, cohérence documentaire des agents ; backend/frontend/E2E explicitement ignorés par le plan d’impact. |

Les contrôles de publication seront recalculés par le pre-push et la CI ; aucun succès distant anticipé.

## Publication et suite

Circuit autorisé : commit, resynchronisation, `npm run publish`, pre-push proportionné, CI du SHA
publié, synchronisation sûre du checkout principal puis nettoyage du seul chantier. Aucun circuit PR.
Le succès de publication et le SHA exact sont rapportés après ces gates, sans verdict anticipé ici.
Prochaine action : dossier borné MEP-045, huit critères/refus et preuves réutilisables, observations
manquantes seulement, puis l’une des quatre issues. En parallèle : collecte des décisions MESS.
