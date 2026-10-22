# MEP-019 — Lisibilité du thème clair

Audit du 2026-10-22 par Codex, selon [F09](../backlog/source/mess/f09.md),
[UX-02/03/04](ux-acceptance.md) et la [DoD](definition-of-done.md).
Référence : `4bfb4a52b79e2b679255e88bdbb04cc3a14546cd` sur origin/main, avec MEP-052 et MEP-053 livrés.
Les [empreintes des sources](mep-019/sources.md) relient les mesures au candidat.
Les mesures et captures utilisent Chromium sur Windows, viewport 1280 × 720, zoom 100 %,
les fixtures fictives existantes, Admin / Coach / Viewer et Superadmin pour son formulaire global.

## Défauts démontrés et corrections

| Élément | Avant | Après | Décision |
| --- | --- | --- | --- |
| Nom d’organisation, création/renommage | `#e3e3e3` sur blanc : 1,283:1 | `#737373` sur blanc : 4,742:1 | Bordure de contrôle existante |
| Sélecteur Organisation et nom d’équipe | 1,283:1 | 4,742:1 | Même token `input-border` |
| Nom de modèle/question et texte de repère | 1,283:1 | 4,742:1 | Même token |
| Sélecteurs et champs de Planification | 1,283:1 | 4,742:1 | Même token |
| Piste de notation native | Pixels `#e3e3e3` sur blanc : 1,283:1 | Pixels `#737373` : 4,742:1 | Même token, Chromium et Firefox |
| Modèle sélectionné | Fond teinté seul ; bouton sans état accessible | Coche visible et `aria-pressed` | Sélection compréhensible sans couleur |

Les 23 lignes CSS ajoutées à `light-appearance.css` excluent toutes `night` et réemploient
le rôle de contrôle de MEP-052. Les séparateurs décoratifs restent discrets. Deux lignes JSX
suffisent pour rendre la sélection explicite dans le composant existant, dans les deux thèmes.
Le modèle sélectionné, ses actions et les données ne changent pas. Aucun nouvel élément de design,
aucune dépendance, règle métier, API, préférence, règle Git ou CI n’est ajouté ou modifié.

Les 1 590 paires distinctes finales passent : 1 300 textes (minimum 5,157:1 ≥4,5),
150 bordures de contrôle (minimum 4,742:1 ≥3) et 140 paires graphiques (minimum 3,140:1 ≥3).
Les autres paires mesurées sont conformes : aucune retouche des textes, accents,
cartes blanches, bandeaux, fonds, ombres, typographie ou dix palettes.
Les statuts portent leurs libellés ; erreurs et sauvegardes ont leurs messages ; les choix de
palette et d’équipe restent des radios/checkboxes ; les résultats gardent légendes numérotées,
formes/pointillés et tableaux détaillés. La coche corrige le seul écart sémantique découvert.

## Mesures et preuves comparables

Les fichiers `mep-019/baseline-<palette>.csv` et `final-<palette>.csv` donnent écran, élément
représentatif, rôle, couleurs composées, ratio, seuil et résultat. Une paire identique répétée
sur un même écran est dédupliquée ; les autres rôles/couleurs restent présents.
`baseline-track.csv` / `final-track.csv` mesurent les pixels réels de la piste native.
Les [comparaisons sombres](mep-019/dark-comparison.csv) trouvent zéro pixel différent dans le dialogue
(rectangle 368/242/544/236), dans les dix palettes. Les différences hors dialogue correspondent
à la coche et au déplacement de son libellé dans la liste sélectionnée, évolution intentionnelle.
Les captures de même nom dans `mep-019/baseline/` et `mep-019/final/` sont comparables :
même fixture, état, palette, viewport et zoom. Les identifiants sont exclusivement fictifs.

Écrans : Dashboard/profil/Apparence, navigation ouverte/repliée, Utilisateurs/tableau/dialogue,
Organisation/création/renommage, Équipes/sélecteur/dialogue, Modèles/question/repères,
Planification, Passation vierge/erreur/sauvegardée, Pilotage, Résultats radar/historique et
leurs tableaux détaillés, Journal/Logs. Les dix palettes sont toutes mesurées et capturées.
Chaque `mep-019/executions-<palette>.md` consigne les combinaisons UX-02/03/04, jeux et résultats.
Revue visuelle : contours identifiables, focus entier, hiérarchie et équilibre des surfaces conservés.
Le [refus de préférence visible après défilement](mep-019/final/palette-refusal-visible.png) complète les vues comparables.

- Question Vert : [avant](mep-019/baseline/question-dialog-green.png), [après](mep-019/final/question-dialog-green.png).
- Planification Bleu : [avant](mep-019/baseline/planning-blue.png), [après](mep-019/final/planning-blue.png).
- Passation Orange : [avant](mep-019/baseline/taking-unanswered-orange.png), [après](mep-019/final/taking-unanswered-orange.png).
- Sélection de modèle : [avant](mep-019/baseline/appreciation-green.png), [après](mep-019/final/appreciation-green.png).
- Focus clavier : [champ](mep-019/final/question-focus-green.png), [notation](mep-019/final/taking-focus.png).
- [Mesures Vert avant](mep-019/baseline-green.csv) / [après](mep-019/final-green.csv).

Les transparences des éléments DOM sont composées de la racine vers l’élément avec un canvas
sRGB ; le ratio porte sur ces couleurs rendues. En présence d’un dialogue, seul son contenu
est mesuré : le fond masqué n’est pas un état interactif de recette. Les contrôles désactivés
sont exclus des seuils des actions actives. Aucun seuil numérique de focus n’est ajouté :
contour calculé présent et captures du focus, complétés par `evaluation-rating-focus`.
Les textes/grilles et les cinq séries des graphiques réutilisent leurs configurations existantes.
Leur remplissage translucide reste décoratif ; les traits, points, légendes et données portent le sens.

## Vérifications et DoD

`light-theme`, `light-taking` et la création globale dans `light-preferences` échouent sur
les bordures/piste initiales à 1,283:1, puis passent sur le correctif. Le test React existant
`EvaluationVersions.test.tsx` échoue avant la correction : `aria-pressed` attendu, reçu `null` ;
il passe ensuite, avec contrôle du transfert de sélection et de la coche.
Les vrais refus existants restent vérifiés : nom vide, sauvegarde de note refusée puis reprise,
et refus de préférence avec retour au choix sauvegardé, sans faux succès.

UX-04 parcourt les dix choix réellement sauvegardés : bascule sombre, navigation Résultats,
reload, déconnexion/reconnexion, retour clair ; palette et mode indépendants et restaurés.
Le refus 500 restaure Turquoise et affiche une erreur accessible, encore conservée après reload.
Les tests `palettes`, `PalettePicker` et `AppPalette` complètent navigateur neuf et réponses tardives.

Revue documentaire : README préparé avant le code ; documentation des palettes ajustée.
Règles des agents, charte, DoD, stratégie, fondamentaux, contrat API et cahier UX relus :
aucune évolution de contrat, architecture, sécurité ou règle qualité nécessaire.
Migrations et nouveaux tests API/backend non applicables aux changements de présentation.
Les gates calculés par le plan existant restent bloquants, y compris toute sélection conservatrice.
Ce rapport qualifie seulement MEP-019 ; aucune certification normative ni GO MESS global.

Publication et clôture seront consignées après les validations et la CI du SHA publié.
