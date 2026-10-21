# MEP-067 — Cahier de recette UX

Référence de [MEP-067](../backlog/source/mess/f17.md), datée du 2026-10-21.
Commencer immédiatement **MEP-053 → UX-01/05**, **MEP-019 → UX-02/03**, puis **MEP-052 → UX-02/03/04**.
Les corrections relèvent de ces PBI ; ce cahier ne constitue ni un PV passé, ni une certification d’accessibilité,
ni un GO MESS. Les recettes cible restent MEP-033/069/070. Aucun suivi individuel n’est ajouté.

## Préparer une exécution comparable

Utiliser une instance locale isolée et des données fictives : Admin et Coach d’une même organisation,
Viewer autorisé aux résultats complétés ; Superadmin seulement pour son menu global. Aucun compte de production.
Les suites ci-dessous créent leurs jeux : `taking-fixture.ts` (deux questions, passation Coach),
`results-fixture.ts` (Équipes A/B, modèle Radar E2E et historique), `steering-fixture.ts` (couverture/échéances),
`shell-fixture.ts` (collections paginées), dans `frontend/e2e/`. Le secret de test reste dans la fixture existante.
Pour une exécution manuelle, constituer les mêmes cas via les écrans existants : modèle à deux questions,
repères 0/5/7/10, passation vierge puis complétée, deux équipes avec résultats et historique, collection >20 lignes.
La démo suffit aux comparaisons de rendu ; persistance, refus et rôles se vérifient dans l’application connectée.

| Dimension | Échantillon à exécuter |
| --- | --- |
| Écrans | Dashboard/profil, Utilisateurs et dialogue d’ajout, Organisation/renommage, Équipes, Modèles/questions, Planification, Évaluations/passation, Résultats radar/historique/données, Pilotage, Journal/Logs |
| Géométrie | Desktop 1280×720 et 1920×1080 ; faible hauteur 1280×480 ; mobile 390×844 ; passation aussi 320×568 et 568×320 (dimensions CSS déjà testées) |
| Apparence | Clair et sombre ; Bleu, Indigo, Violet, Rose, Rouge, Orange, Ambre, Vert, Émeraude, Turquoise ; références dans les [palettes](../architecture/interface-palettes.md) |
| Interaction | Clavier seul sur desktop ; tactile émulé 390×844 pour la notation ; parcours tactile manuel pour menus, formulaires, scrolls et résultats |
| Zoom | Navigateur réel à 100 %, puis 200 % sur une fenêtre 1280×720 : choix explicite de ce cahier pour vérifier la perte d’action, pas une couverture automatisée existante |

Exécuter UX-01/05/06/08/09 en Vert dans les deux thèmes aux tailles pertinentes ci-dessus.
UX-02/03 couvrent les vingt combinaisons thème/palette sur les écrans représentatifs Dashboard, dialogue,
passation et Résultats ; les tests de tokens balaient les vingt combinaisons sans répéter tous les parcours métier.
UX-04 balaie les dix choix ; UX-07 utilise les deux thèmes, clavier/souris puis tactile.
Après changement de styles communs, comparer aussi menus Admin/Coach/Viewer et sidebar repliée.

## Scénarios et décisions

Chaque ligne donne les actions dans l’ordre. « Refus » signifie échec du scénario, à consigner avec le PBI concerné.
Les contrôles manuels complètent les assertions existantes ; aucun test cité n’atteste à lui seul l’esthétique.

| ID / PBI consommateur | Actions / résultat attendu | Critère vérifiable et refus | Preuve nécessaire |
| --- | --- | --- | --- |
| UX-01 — MEP-053 | Ouvrir Dashboard → Utilisateurs/dialogue → Modèles/questions → Passation → Résultats → Pilotage. Comparer titre de page, titre de section, libellé, aide et action principale : mêmes rôles, même hiérarchie ; densité compatible avec la lecture et les actions. | Relever famille/taille/graisse/interligne et espaces titre–contenu/action dans les styles calculés ; mêmes rôles partagés = mêmes valeurs, toute différence liée à un rôle distinct est explicitée. Aucun chevauchement/rognage ; titre, aide et action identifiables par leur texte et niveau. Dashboard de référence, trois événements et Apparence fermée : raccourcis dans les 720 px, comme le test. Refus : rôle essentiel indiscernable ou action masquée. | Captures avant/après identiques en données/viewport, tableau des styles et écarts par écran ; `theme-surfaces`, `product-shell`, `evaluation-taking-layout`. Revue manuelle de typographie/hiérarchie/densité requise. |
| UX-02 — MEP-019/052 | Depuis Apparence, parcourir dix palettes dans chaque thème ; ouvrir menu, dialogue, passation, Résultats. Fonds, cartes, champs, sélection et statuts conservent leurs rôles ; le sombre reste cohérent. | Clair : cartes blanches, bandeaux distincts du fond central. Sombre : surfaces conformes aux tokens documentés. Statut/erreur/sélection distingués aussi par texte, symbole ou état de contrôle ; séries radar/historique identifiables par légende et restitution détaillée. Refus : sens porté seulement par couleur, surface incohérente ou régression non expliquée d’une palette. | Planche avant/après par thème/palette, état normal/sélectionné/erreur ; `theme-tokens`, `theme-surfaces`, `results-layout`, `results-history-layout`. La distinction sémantique reste une vérification manuelle. |
| UX-03 — MEP-019/052 | Sur les mêmes écrans, relever texte principal/secondaire, liens, bouton normal/survolé, navigation active et focus clavier sur leur fond réellement rendu. | Reprendre les seuils déjà testés : texte/accents ≥4,5:1 sur leurs surfaces ; en clair sélection/bandeau ≥3:1 et bandeau/fond central ≥1,15:1. Mesurer les paires calculées, avec composition des transparences. Focus visible et non masqué ; pas de seuil numérique de focus ajouté. Refus : une paire sous son seuil, texte/action illisible ou focus introuvable. | Tableau écran/élément/thème/palette/couleurs/ratio/seuil et capture du focus ; `theme-tokens`, démo `navigation-contrast`, `evaluation-rating-focus`. Ces tests ne mesurent pas tous les éléments de chaque écran : relever les paires restantes manuellement. |
| UX-04 — MEP-019/052 | Choisir Bleu, basculer clair/sombre, naviguer puis recharger/reconnecter ; refaire le choix pour les dix palettes. Simuler le refus de sauvegarde prévu par `palettes`. | Mode et couleur indépendants ; préférence personnelle restaurée par le serveur ; succès après réponse réussie. Sur refus, erreur accessible et retour à la couleur précédente ; aucune annonce de succès trompeuse. | Rapport `palettes`, `PalettePicker.test.tsx`, `AppPalette.test.tsx` ; captures succès/refus et valeurs avant/après. Le thème est stocké dans le navigateur, la palette côté serveur. |
| UX-05 — MEP-053/017/049 | Visiter les collections, ouvrir Apparence et les dialogues ; paginer et faire défiler aux tailles prévues. Refaire Dashboard, Utilisateurs/dialogue, Passation et Résultats à zoom 200 %, puis revenir à 100 %. | Aucun débordement horizontal du document ; tableau large défilable dans sa région. Desktop : header/sidebar stables, contenu et pagination accessibles ; mobile : flux naturel. Texte long entier accessible, actions atteignables par scroll/clavier ; passation sans scroll imbriqué autre que son corps. Refus : texte essentiel rogné, action perdue ou piège de scroll. | Captures aux tailles et niveaux de zoom indiqués, mesure `scrollWidth ≤ clientWidth` du document, action atteinte ; `product-shell`, `theme-surfaces`, `evaluation-taking-layout`, `results-layout`. Zoom navigateur : preuve manuelle distincte, aucune assimilation à un simple redimensionnement. |
| UX-06 — MEP-018/050/051 | Sans souris : Tab/Shift+Tab, ouvrir et annuler les dialogues Utilisateurs/Organisation/Planification, parcourir Apparence et les onglets Résultats. Refaire ouverture/fermeture et scroll au tactile. | Focus visible, contenu dans le dialogue, retour au déclencheur ou repère pertinent ; intitulés accessibles ; Échap respecte les protections de sauvegarde. Aucune action dépendant du survol seul. Refus : focus perdu, sortie du dialogue ou annulation détruisant une saisie protégée. | Rapport `dialog-accessibility`, `dialog-taking-accessibility`, `palettes`, `results-layout` ; courte capture vidéo clavier/tactile avec action et focus décrits. Le tactile hors notation reste manuel. |
| UX-07 — MEP-044/013/045 | Coach : ouvrir une passation vierge, avancer sans noter, revenir, choisir explicitement 5 puis 0 et 10 ; reprendre après reload, finir seulement lorsque complet. Tester flèches/Home/End/Entrée et toucher le curseur. | « Aucune note sélectionnée » distinct de 0 et 5 ; focus seul n’enregistre rien ; entier 0–10 et repère inférieur renseigné corrects. Incomplet : validation désactivée et refus serveur 400 ; reprise conserve les notes choisies. Refus : note présélectionnée persistée, faux succès ou finalisation incomplète. | `evaluation-explicit-rating` (souris/tactile), `appreciation-markers`, `evaluation-rating-focus` ; captures vierge/0/5/10, état repris et réponse de finalisation expurgée. |
| UX-08 — MEP-045/050 | Dans la passation, provoquer le refus 400 de sauvegarde du test, tenter Échap/Fermer, lever le refus puis « Réessayer la sauvegarde ». Observer en cours/erreur/succès. | Erreur visible et annoncée, note conservée, fermeture protégée tant que non sauvée ; « Note enregistrée » seulement après succès serveur. Géométrie des actions stable entre les états ; reprise conserve la valeur. Refus : perte de saisie, fermeture silencieuse ou succès avant réponse. | Rapports `dialog-taking-accessibility`, `evaluation-taking-layout`, `EvaluationTakingNavigation.test.tsx` ; séquence des états et réponse serveur expurgée. |
| UX-09 — MEP-014/046/047/048/015/016 | Admin : Utilisateurs en chargement → liste vide → erreur 500 ; Résultats : choisir modèle/équipes, radar → données → critère historique → retour ; Pilotage : ouvrir une source autorisée. Viewer : consulter les seuls résultats complétés. | Enveloppe stable loading/vide/erreur, message explicite ; données et sélections conservées entre restitutions, axes/légende/actions accessibles, tableau consultable au clavier. Absence de données distincte d’une note 0 ; accès non autorisé refusé sans données. Refus : écran muet, sélection perdue, chiffre ambigu ou action inaccessible. | `shell-states`, `results-layout`, `results-history-layout`, `results-longitudinal`, `viewer-results`, `steering` et `ResultsPageErrors.test.tsx` ; captures des états et du retour avec mêmes équipes sélectionnées. |

## Réutiliser les preuves existantes

Les noms E2E ci-dessus correspondent à `frontend/e2e/<nom>.spec.ts` ; les fichiers React sont dans
`frontend/src/`. Les tests démo sont dans `frontend/demo-e2e/`. Lire leurs assertions : les captures produites
ne sont pas toutes des comparaisons automatiques à une image de référence.
Commandes existantes, depuis la racine ; exécuter seulement la sélection pertinente au correctif :

```powershell
npm.cmd run test:e2e --prefix frontend -- theme-tokens.spec.ts theme-surfaces.spec.ts palettes.spec.ts
npm.cmd run test:e2e:demo --prefix frontend -- navigation-contrast.spec.ts
npm.cmd run test:e2e --prefix frontend -- evaluation-explicit-rating.spec.ts evaluation-taking-layout.spec.ts evaluation-rating-focus.spec.ts dialog-accessibility.spec.ts dialog-taking-accessibility.spec.ts
npm.cmd run test:e2e --prefix frontend -- product-shell.spec.ts shell-states.spec.ts results-layout.spec.ts results-history-layout.spec.ts results-longitudinal.spec.ts viewer-results.spec.ts steering.spec.ts appreciation-markers.spec.ts
npm.cmd run test:quick --prefix frontend -- PalettePicker.test.tsx AppPalette.test.tsx EvaluationTakingNavigation.test.tsx ResultsPageErrors.test.tsx
```

Pour la démo, lancer auparavant `npm.cmd run build:demo --prefix frontend` ; le test démarre sa preview.
Les [commandes ciblées](test-commands.md) précisent ports et isolation ; les fixtures E2E modifient la base locale.
`npm run quality:targeted` reste le choix normal pour le plan d’impact, le pre-push et la CI imposent leurs gates.
Ce PBI documentaire ne lance pas ces campagnes applicatives et n’en revendique aucun résultat nouveau.

## Consigner et refuser sans ambiguïté

Une ligne de compte rendu par scénario et combinaison exécutée :
`ID | SHA | date/auteur | navigateur/OS | rôle/jeu fictif | viewport/zoom | thème/palette | mesure attendue/observée | preuve | Passé/Échoué/Non exécuté | anomalie/PBI`.
Joindre rapport de test (commande, sélection, sortie), captures comparables et mesures manuelles ; expurger
identifiants réels, cookies et secrets. Pour U1, conserver les images avant/après du même état et le relevé des écarts.
Un scénario non exécuté, une preuve absente ou provenant d’un autre état ne peut être noté Passé.
Un jugement « plus joli/lisible » sans mesure ni résultat observable refuse le compte rendu.
Un échec reste un échec lié au PBI de correction existant ; aucune capacité absente n’est supposée livrée.

La [revue MEP-067](ux-acceptance-review.md) vérifie la complétude de ce cahier et sa DoD documentaire.
