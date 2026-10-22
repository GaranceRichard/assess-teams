# MEP-053 — Typographie et hiérarchie visuelle

Recette du 2026-10-21 par Codex, selon [F09](../backlog/source/mess/f09.md),
[UX-01/05 de MEP-067](ux-acceptance.md) et la [DoD](definition-of-done.md).
État de référence : `d782cbd5f77faa5ef93edfe6dd76d0d6a5d7196e` (MEP-052 déjà intégré).
Code candidat : `5c4c53f3fd430cd5bdb5dafc8b3e59948a554068` ; [empreintes des sources](mep-053/sources.csv).
Le SHA intégré et les gates seront consignés après publication ; MEP-053 reste En cours jusque-là.

## Audit et corrections observables

Famille conservée partout : `Inter, system-ui, sans-serif`, sans police téléchargée.
Les relevés sont en pixels CSS à 1280 × 720, zoom 100 %, palette Vert.
Les CSV donnent famille, taille, graisse, interligne, marges, padding, gap et dimensions,
avec un exemple de chaque rôle/style distinct par écran ; les répétitions identiques sont dédupliquées.

| Écran / rôle | Avant | Après / correction |
| --- | --- | --- |
| Dashboard, titre | Clair 48/55,2 px, sombre 32/36,8 px | 32/38,4 px dans les deux thèmes ; même titre que les autres parcours |
| Profil / Apparence | En sombre, h3 18,72 px > h2 17,6 px | h2 20/26 px, h3 16/24 px ; niveaux distincts, même rythme dans les deux thèmes |
| Utilisateurs / dialogue | Titres de dialogue 17,6 px sans interligne défini ; actions 16 px/750 | Titre 20/26 px/700, actions 14/21 px/650 ; actions repliables |
| Organisation / Équipes | Titres de section sans interligne, en-têtes sensibles aux libellés longs | Même rôle h2 ; minima flex nuls et retours à la ligne des en-têtes |
| Modèles / questions | Sélecteur natif 13,6 px/700 collé au libellé ; questions poussées à droite | Sélecteur 16 px/400, séparé du label ; numéro + texte alignés à gauche, actions à droite puis sous le texte |
| Planification | Champs héritant du libellé gras, rythmes implicites | Champs 16 px/400, labels 14/21 px/600 et titres de section communs |
| Évaluations / passation | Titres et interlignes par défaut, h3 18,72 px | Titre de dialogue 20/26 px, question 18/27 px/650 ; copies de dimensionnement conservées |
| Résultats | Sélecteurs 13,6 px/700 ; métadonnées 12 px grasses par héritage | Sélecteurs 16 px/400 ; métadonnées 13/19,5 px/400, titres identiques aux autres pages |
| Pilotage | Chiffres et libellés sans rythme de lecture explicite | Interligne 1,5 et retours à la ligne des cartes, sans changer les indicateurs |
| Journal / Logs | Typographie implicite des tableaux et en-têtes | Lecture à interligne 1,5 ; entêtes 13/19,5 px, actions et titre communs |
| Apparence | Labels 12 px en clair, 13,6 px en sombre | 14/21 px/600 dans les deux thèmes ; dix choix entiers accessibles |

`product-typography.css` porte ces rôles communs, importés par les panneaux déjà partagés.
Les règles typographiques du Dashboard ont quitté la feuille spécifique au clair ; ses couleurs,
surfaces et ombres y restent. `dark-appearance.css`, les tokens et les dix palettes sont inchangés.
Aucun flux, droit, calcul, contrat API ou règle métier n’est modifié.

## Preuves comparables et revue visuelle

[Clair avant](mep-053/baseline-day-styles.csv) / [après](mep-053/final-day-styles.csv) ;
[sombre avant](mep-053/baseline-night-styles.csv) / [après](mep-053/final-night-styles.csv).
Les dossiers `mep-053/baseline/` et `mep-053/final/` conservent les captures comparables de même nom,
avec mêmes fixtures, viewport et palette. L’éditeur attend ses questions chargées avant capture ; les géométries complémentaires sont qualifiées sur le candidat final. Les trois événements du Dashboard sont chargés,
Apparence fermée ; les dates d’événements fictifs sont stabilisées.
Le navigateur de référence reçoit les composants modifiés et les CSS du SHA initial ; le candidat utilise ses fichiers courants.

Comparaisons principales :

- Dashboard : [avant clair](mep-053/baseline/dashboard-day.png), [après clair](mep-053/final/dashboard-day.png), [avant sombre](mep-053/baseline/dashboard-night.png), [après sombre](mep-053/final/dashboard-night.png).
- Questions : [avant](mep-053/baseline/templates-day.png), [après](mep-053/final/templates-day.png).
- Dialogue : [avant](mep-053/baseline/user-dialog-day.png), [après](mep-053/final/user-dialog-day.png).
- Passation étroite : [avant](mep-053/baseline/taking-day-320-568.png), [après](mep-053/final/taking-day-320-568.png).

Revue visuelle des captures : le titre ne domine plus excessivement le Dashboard clair ;
les niveaux profil/Apparence sont ordonnés ; le sélecteur Modèles et les numéros/questions
se lisent immédiatement. Les paragraphes respirent avec un interligne stable ; les dates et aides
restent secondaires. Les cartes, accents, séries et direction artistique sont préservés.
Les raccourcis restent entièrement dans les 720 px, dans les deux thèmes, avec trois événements.

## UX-05 : tailles, zoom réel et accès aux actions

La [matrice d’exécution](mep-053/executions.csv) donne une ligne par scénario et combinaison.
Onze écrans : 1280 × 720, 1920 × 1080, 1280 × 480 et 390 × 844, dans les deux thèmes.
Passation : aussi 320 × 568 et 568 × 320 ; un seul corps scrollable, pied et actions visibles.
Les textes longs des questions reviennent à la ligne ; les tableaux restent dans leur région scrollable.

Le [relevé du zoom](mep-053/zoom.csv) et les captures `mep-053/zoom/` sont une preuve distincte :
Chromium avec fenêtre donnant 1280 × 720 à 100 %, zoom natif `chrome.tabs.setZoom`,
contrôlé avec `getZoom` après chaque navigation (la portée par onglet se réinitialise).
Aucun zoom CSS, redimensionnement de viewport ou simple facteur d’échelle CDP ne remplace ce contrôle.
À 200 %, `innerWidth/innerHeight` = 640/360, `devicePixelRatio` = 2, largeur document/client = 632/632.
À 100 %, les valeurs sont 1280/720, 1 et 1280/1280 ; retour à 100 % vérifié.

Les vingt états couvrent Dashboard/raccourcis, Apparence/dernier choix, Utilisateurs/Valider,
Résultats/lien du critère détaillé et Passation/Suivant, dans les deux thèmes et aux deux zooms.
Chaque action est focalisée, amenée dans le viewport et mesurée entièrement visible.
Les captures utilisent le framebuffer Chromium complet pour conserver le zoom réellement rendu.
Aucun débordement horizontal du document, action perdue ou texte essentiel tronqué constaté.
Les scénarios UX-02/03/04 restent portés par MEP-019/052 ; ils ne sont pas clôturés par MEP-053.

## Densité du graphique en faible hauteur

Le test existant `demo-e2e/results-history-layout.spec.ts` a refusé le candidat intermédiaire
`f478568` : canvas de 69,4 px à 1280 × 480, sous son minimum existant de 70 px.
Le filtre Critère cumulait une marge de label avec le gap déjà prévu entre les contrôles.
La marge redondante est supprimée ; le canvas atteint 76,6 px dans les deux thèmes,
sans réduire les titres, cacher un contrôle ou changer le test, les graphiques ou leurs calculs.
[Avant clair](mep-053/demo-density/before-day.png) / [après clair](mep-053/demo-density/after-day.png) ;
[avant sombre](mep-053/demo-density/before-night.png) / [après sombre](mep-053/demo-density/after-night.png).
Le test existant passe après correction ; ses deux preuves démo restent liées à `e41ad45`,
leur code Résultats étant inchangé. La validation exhaustive est imposée au pre-push.

## Densité de passation sur Linux

La première CI du SHA `af6b600` a refusé deux scénarios desktop existants : dialogue
à 607,9 px sur Linux, contre le maximum strict de 600 px. Les tests locaux Windows passaient.
Le padding vertical du dialogue passe de 24 à 16 px, avec 24 px conservés horizontalement
et la règle mobile de 12 px conservée. Titres, interlignes et cibles restent inchangés.
Les huit tests ciblés de passation et les quatre tests de typographie passent sous Windows.
Les vingt états de zoom natif sont rejoués après correction ; captures et styles finaux actualisés.
Le seuil existant reste inchangé ; la CI Linux doit confirmer le résultat avant clôture.
[Échec initial](https://github.com/GaranceRichard/assess-teams/actions/runs/39656406706).

## Contrôles et DoD

Le contrôle complémentaire du titre mobile a reproduit un écart de −6,39 px sur le candidat
intermédiaire : la marge compensant le gap desktop était appliquée à un conteneur bloc mobile.
Les surtitres et titres sont maintenant regroupés avec un gap positif de 5,6 px ; le Dashboard
mobile suit une grille en flux naturel. L’assertion d’absence de chevauchement échoue avant
cette correction et passe après. Les captures `*-mobile-heading.png` montrent chaque titre.

Les quatre tests `typography` / `taking-typography` échouent sur le rendu antérieur et passent
sur le candidat. Ils couvrent niveaux de titres, champs, alignement, question longue, raccourcis,
absence de débordement et contrôles atteignables, dans les deux thèmes.
Les suites existantes de shell, surfaces, passation, résultats, dialogues, palettes et rôles
restent les protections des interactions et refus métier. Frontend complet : 428 tests passants ; statements 96,42 %, branches 94,78 %, fonctions 96,63 %, lignes 97,30 %. Build, typecheck, lint et formatage passent ; gate complet et CI encore requis.

Revue documentaire : README préparé avant le code ; shell et stratégie de tests mis à jour.
Règles des agents, charte, DoD, fondamentaux, API et cahier UX relus : aucune évolution requise
hors documentation de la présentation. Migrations, nouveaux contrats et tests métier ne sont
pas applicables au correctif ; la campagne conservatrice existante reste exécutée par le plan.
La CI du SHA publié et le pre-push restent bloquants avant clôture canonique.
