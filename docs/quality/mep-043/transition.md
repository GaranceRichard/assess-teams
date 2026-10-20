# MEP-043 — Transition et vérifications proposées

**Plan soumis à accord D1–D5 ; aucune étape de mutation distante exécutée.**
Voir les [décisions](README.md), les [constats distants](remote-evidence.md) et la [DoD](../definition-of-done.md).

## Modifications à réaliser après accord

| Responsabilité | Fichiers / évolution |
| --- | --- |
| Publication | `scripts/publish.ps1` et helpers courts : verrou, état propre, fetch, resynchronisation, branche distante, PR, CI, fusion conditionnelle, synchronisation sûre et CI finale |
| Garde pré-push | `check-contribution-workflow.ps1` : une branche et un worktree dédiés, origin, source HEAD vers sa propre branche distante ; refus direct-main, suppression, branche étrangère, état sale ou mise à jour non fast-forward |
| Diff de validation | `changes.mjs`, `selective.mjs` : diff complet main→candidat pour la PR, y compris à la première création distante où le SHA de destination est nul ; ne pas réduire le contrôle au dernier incrément de branche |
| Attente distante | Helpers dédiés à la PR : identité du dépôt, PR/base/head attendus, état non draft, check exact et App productrice, actualité de main, résultat non ambigu et fusion avec HEAD attendu |
| CI | Conserver `pull_request`, son merge synthétique et `push` sur main ; aucun filtre de chemins ni permissions d’écriture pour la qualité ; pas de `pull_request_target` exécutant du code candidat privilégié |
| Documentation | README, AGENTS, règles détaillées, charte, DoD, CI, validation et stratégie de tests ; invariants automatisés du workflow à adapter dans le même candidat |
| Preuves | Ruleset actif, règles effectivement applicables à main, producteur du check, acteurs et droits, PR/runs/SHA et refus datés ; références durables sans secrets |

Ne pas assimiler le SHA de tête de PR, le merge synthétique testé et le commit réellement intégré.
Conserver les identités de head/base/merge et du run/check ; vérifier leur correspondance avec
l’API GitHub et le checkout CI. Après fusion, vérifier l’ascendance de main, son arbre intégré et
la CI push de son SHA exact. Un run réussi d’un autre SHA ou d’une autre PR ne satisfait pas l’attente.

Avant la première publication de branche, rebase possible sur origin/main. Après publication,
merge de main dans la branche puis push normal ; la CI requise est recalculée sur le candidat à jour.
Le pré-push vérifie l’ascendance du SHA distant réellement annoncé pour la branche et celle du main
frais utilisé comme base. Un main évoluant ensuite doit faire refuser la fusion par les règles strictes.

Le verrou local commun couvre attente PR, fusion, CI finale et synchronisation : le premier chantier
prêt publie sans attendre les autres ; les suivants repartent du nouveau main. Un verrou local n’est
pas un verrou entre machines : les protections distantes arbitrent aussi les clients concurrents.
Ne jamais toucher aux ressources du chantier `fix/navigation-contrast` observé à l’inventaire.

## Ordre de transition sécurisé

1. Obtenir l’accord explicite sur D1–D5 et consigner ses éventuelles réserves.
2. Préparer et tester le nouveau circuit dans le worktree existant, après annonce README déjà réalisée.
   Préserver chaque fichier manuel à 200 lignes maximum ; ajouter les vrais cas passants et refus.
3. Compléter G05 avec accès propriétaire autorisé ; signaler précisément les preuves inaccessibles.
   Faire décider toute modification de credential ou de droits séparément si nécessaire.
4. Exécuter `quality:targeted` selon le plan réel. Les scripts/hooks/CI sont transversaux :
   leur changement impose le plan exhaustif conservateur existant, sans exemption inventée.
5. Créer un candidat commité ; autoriser sa seule publication de branche avec le nouveau pré-push,
   puis ouvrir sa PR. À partir de ce point, aucun `publish` ancien ne doit intégrer un autre PBI.
6. Exercer les refus et le chemin nominal sur les branches de preuve approuvées, en conservant traces
   et SHA avant/après. La copie de règles ne protège que ces références jetables, jamais main à leur place.
7. Après succès local et CI du candidat PR, relire main et les acteurs, activer le ruleset main
   approuvé et relire les règles effectives, bypass compris, avant toute fusion sur main.
   Si main a changé, resynchroniser la branche et attendre sa nouvelle CI obligatoire.
8. Fusionner la PR uniquement sous protection active, sans privilège de bypass, avec HEAD attendu.
   Le changement de circuit est ainsi intégré par son propre circuit protégé ; aucun dernier push direct.
9. Vérifier la CI push du SHA intégré puis fast-forward sûr du main principal propre et non divergent.
   Une erreur de CI, un checkout sale/divergent ou un main local en retard refuse la livraison.
10. Intégrer les preuves finales nécessaires par une nouvelle PR protégée si elles dépendent de la
    première fusion. Attendre aussi sa CI et resynchroniser main ; ne jamais inventer un résultat futur.
11. Clôturer uniquement MEP-043 après satisfaction de tous les critères et de la DoD, puis supprimer
    uniquement sa branche/worktree et les ressources jetables identifiées et autorisées.

Un refus d’activation ou de fusion laisse le candidat et ses preuves disponibles. Corriger par la voie PR ;
aucune désactivation de règle, liste de bypass temporaire, suppression de check ou option de contournement.
Le bootstrap du worktree n’installe aucun mécanisme de publication affaibli.

## Matrice de vérification après implémentation

| Couche | Cas passant | Refus attendu |
| --- | --- | --- |
| Worktree/branche | Branche dédiée hors du principal, état commité | Principal, main local, detached, état sale, remote/destination étrangers |
| Pré-push | Création puis mise à jour fast-forward de sa branche | Direct-main, suppression, mauvais HEAD, plusieurs références, réécriture |
| Plan | Diff complet base main→candidat, création distante incluse | Base absente, candidat sale, incrément seul masquant un changement antérieur |
| Verrou | Un seul publisher jusqu’à synchronisation | Second publisher avant fetch ; aucune modification du premier |
| PR/CI | PR du bon dépôt, base main à jour, checks et producteur attendus | Rouge, annulé, absent, skipped requis, draft, conflit, mauvaise App, mauvais SHA/PR |
| Courses | Nouveau main intégré puis nouvelle CI | Main avancé, HEAD modifié après CI ou pendant la demande de fusion |
| Agrégateurs | Documentation : repository réussi, domaines hors plan skipped | Job requis échoué/absent/annulé/skipped ; plan échoué ou skip injustifié |
| Exhaustif | Tous domaines, fusions, couvertures >= 90 %, rapports | Un domaine, partition ou fusion absent ; couverture insuffisante |
| MESS | SHA exact, run exhaustif GitHub réussi et artefact conforme | Autre SHA, preuve locale/partielle, artefact absent/expiré, provenance incorrecte |
| Main local | Propre, non divergent, avancé par fast-forward seulement | Données locales à écraser, divergence ou retard après synchronisation |
| Serveur jetable | PR verte fusionnée sous règles équivalentes | Push direct, PR rouge/sans check, force-push, suppression, admin sans bypass |

Les essais serveur utilisent des branches `mep-043-proof/*` et PR dédiées ; les refus doivent être
attribuables aux règles, pas à une erreur de transport, à un hook local ou à un conflit Git antérieur.
Archiver code HTTP/message ou sortie Git, Request-Id quand disponible, acteur et SHA avant/après.
Vérifier que chaque refus n’a pas muté la référence. En cas d’acceptation inattendue sur une référence
jetable, arrêter la transition main et conserver la preuve ; ne pas présenter ce test comme réussi.
La protection de main est démontrée par sa configuration effective et l’équivalence explicite des règles
exercées ; aucun force-push ou DELETE de main n’est utilisé comme test.

## Vérification préalable réalisée le 2026-10-20

Commande dans le worktree existant :

```powershell
node --test scripts/quality/tests/impact-execution.test.mjs scripts/quality/tests/impact-git.test.mjs scripts/quality/tests/validation-publish.test.mjs
```

Résultat : **15 tests réussis, zéro échec**. Refus des agrégateurs, mauvaises preuves MESS/SHA,
pré-push, checkout sale/divergent et verrou vérifiés avec les fixtures existantes.
Ces tests prouvent le comportement actuel ; ils ne prouvent ni la future migration ni une protection GitHub.
Le diff préparatoire est documentaire ; aucune nouvelle campagne applicative nécessaire à ce stade.
La revue a consulté README, AGENTS/règles, charte, DoD, stratégie, architecture et contrat API.
Aucun endpoint, modèle, migration ou parcours produit n’est affecté par cette proposition.

Validation préparatoire : `npm run quality:targeted` réussi (documentation seule), avec lignes,
secrets, structure et cohérence documentaire. Le libellé local « Full quality gate conforme »
porte ici sur ce scope documentaire ; il ne constitue pas une qualification exhaustive MESS.
Préparation conservée localement, sans commit/push ni mise en œuvre avant accord explicite.
