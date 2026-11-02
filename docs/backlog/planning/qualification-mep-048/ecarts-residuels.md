# MEP-048 — écarts résiduels reproductibles

> Historique de qualification : les réserves et restrictions de cette phase sont conservées.
> Voir le [rapport consolidé](rapport.md) pour la correction et la proposition actuelles.

Observations locales du 2026-11-02, auteur Codex.
SHA `826cc51063ab1120ddc052f2a01bb4b77479c4b0` ; Chromium 153.0.8010.12, Windows.
Les identifiants B01/B02 sont des repères du rapport, pas des PBI ni des statuts canoniques.
Aucun correctif développé. [Décision](rapport.md) ; [preuves](preuves-complement.md).

## B01 — la note des états quitte le cadre lors du parcours clavier mobile

**Contexte :** Admin MEP048, jeu J1, 390×844, palette Vert, clair puis sombre.
D=02/11/2026 ; quatre équipes actives ; deux retards.
Attendu : la table large peut défiler ; la note expliquant Jamais évaluée / En retard / À jour
reste lisible dans sa région ou accessible par un défilement clairement utilisable.

Reproduction exacte :

1. Se connecter, ouvrir /steering ; ouvrir « Comprendre les indicateurs ».
2. Attendre la fin des animations ; la note commence à x=16 px, largeur 343 px.
3. Placer le focus sur la région « Équipes suivies » ; Flèche droite, Tab, Tab.
4. Le focus atteint « Voir les résultats de A1 » ; observer la note sous le tableau.

Observé dans les deux thèmes : la note est complètement hors cadre à **x=−554 px**,
largeur 343 px (son bord droit est à −211 px).
La table reste navigable vers le lien, mais le texte expliquant les états a disparu de l’écran.
Le document mesure toujours 390/390 px : le seul contrôle d’absence de débordement global passe à tort.

Mesures complémentaires : `.collection-scroll.scrollLeft=570`,
scrollWidth=928, clientWidth=343 ; la note et la table ont toutes deux x=−554.
Le conteneur parent défile, au lieu du seul tableau : observation géométrique, pas correctif présumé.
Aucun calque sortant, aucune animation en cours au moment de la capture.

Preuves cache : `mobile-diagnostic.json`, `collection-diagnostic.json`,
`mobile-day-initial.png`, `mobile-day-keyboard-link.png`,
`mobile-night-initial.png`, `mobile-night-keyboard-link.png`.
Scripts de reproduction ponctuels conservés en cache : `mobile-diagnostic.mjs`,
`absence-et-conteneur.mjs`. Ces scripts ne sont pas des tests versionnés.

**Impact :** indisponibilité de l’explication des états pendant le parcours source autorisé.
Critères affectés : Q1, retards/interprétation et lecture actionnable ; aucun écart de calcul.
Responsabilité à confirmer : présentation Pilotage / conteneur partagé de collection.
Un futur test de non-régression devra vérifier la note dans le cadre après cette séquence,
et pas seulement la largeur du document ou la présence du texte dans le DOM.

## B02 — la ligne sans résultat n’est pas lisible avec les définitions ouvertes

**Contexte :** Admin MEP048-uncompleted, J3, 1280×720, Vert clair.
Une équipe active sans aucune complétion, aucune échéance et aucun Coach.
Attendu : lire les définitions et les absences réelles de la ligne, avec une zone défilable exploitable.

Reproduction :

1. Ouvrir /steering à 1280×720 ; ouvrir « Comprendre les indicateurs ».
2. Faire défiler à la molette dans « Contenu de la collection » jusqu’en bas.
3. Observer la ligne « Sans completion » sous l’en-tête fixe.

Observé : collection visible **72 px**, en-tête **91 px** ; la ligne n’offre pas de lecture exploitable.
Au bas du défilement : scrollHeight=304, scrollTop=232 ; ligne y=509,45 à 614,45,
zone visible y=602,45 à 674,45 ; l’en-tête occupe encore l’intersection supérieure.
La note peut apparaître mais les cellules d’absence de la ligne sont occultées.
Fermer les définitions augmente la collection à environ 202 px : la géométrie dépend bien de l’aide ouverte.
Le DOM et les assertions « visible » de Playwright seuls ne prouvent pas que les cellules soient lisibles.

Preuves cache : `desktop-diagnostic.json`, `desktop-wheel.json`,
`desktop-definitions-open.png`, `desktop-definitions-open-wheel.png`,
`desktop-definitions-closed.png`. Zéro calque sortant.
Reproductions : `desktop-diagnostic.mjs`, `desktop-wheel.mjs`.

**Impact :** lecture conjointe définitions/absences non démontrée et occultation observée, Q1/Q3.
Pas de valeur inventée, de zéro substitué à une absence ni de droit supplémentaire.
Responsabilité à confirmer : géométrie partagée de collection / en-tête fixe et Pilotage.
Un futur test devra vérifier la surface réellement lisible des cellules avec l’aide ouverte,
au format reproduit, puis les seuls formats affectés par la correction autorisée.
