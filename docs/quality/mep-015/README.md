# MEP-015 — Présentation des radars

Qualification du 2026-11-01 par Codex, sur Windows/Chromium, données exclusivement fictives.
Source : [PBI canonique FEAT-054](../../backlog/source/mess/f06.md), sans modification de son périmètre.
Base auditée : `8f219aacf5231fc85d2fcfda597f195f54e87a33`.

## Qualification préalable

La sonde `frontend/e2e/results-radar-presentation.spec.ts` utilise Django/SQLite réels et
`seedResultsContext(false, critères)` : v1 archivée, 12 critères longs, équipes A/B sélectionnées.
A = répétition de [0,10,7], B = répétition de [8,3,5] ; ancienne A = [2,2,2] non retenue.
Le scénario lit Chart.js et compare les scores aux cellules correspondantes du tableau.

Avant toute correction, la version initiale de la sonde (géométrie et concordance) échoue avec 26 signalements, identiques entre thèmes :

| Viewport CSS, zoom 100 % | Avant, par thème | Décision |
| --- | --- | --- |
| 1920×1080 | Aucun rognage/chevauchement détecté | Acquis conservé |
| 1280×720 | Aucun rognage/chevauchement détecté | Acquis conservé |
| 1280×480 | 8 paires chevauchées : 1/2, 1/12, 2/3, 5/6, 6/7, 7/8, 8/9, 11/12 | Écart démontré |
| 390×844 | Labels 4 et 10 rognés ; paires 2/3, 5/6, 8/9 chevauchées | Écart démontré |

Captures faible hauteur/mobile relues avant correction : textes mêlés et libellés latéraux coupés.
Le tableau présente déjà tous les textes et les scores exacts. La légende conserve numéro, nom
et traits plein/pointillé correspondant aux séries ; sa distinction ne repose pas sur la seule couleur.
Les acquis de sélection/version/permissions [MEP-047](../mep-047/README.md) ne sont pas réimplémentés.

## Correction bornée

- Repères numériques stables sur le radar, associés à une clé « Axes du radar » avec libellés complets.
- Clé liée au canvas par `aria-describedby`, boutons clavier ; aucune ouverture sans lignée explicite.
- Clé à défilement interne sur desktop, en flux sous le graphique sur mobile ; aucun texte tronqué.
- Infobulles avec texte complet ; sélection, scores, échelle 0–10, versions et séries conservés.
- Légende d’équipes et restitution tabulaire existantes conservées ; la légende reste immédiatement sous le tracé mobile.

La régression vérifie bornes et collisions des repères, correspondance clé/axes, traits de légende,
24 scores par format, zéro réel, textes du tableau, navigation par flèches, accès au dernier axe
et ouverture par Entrée. Décocher A retire sa colonne et sa série sans renuméroter B.
Les tests React vérifient aussi le refus d’ouverture d’un axe sans lignée.

## Résultats finaux observés

Les deux parcours ciblés `results-radar-presentation` et `results-layout` passent après la correction.
La relecture du premier rendu corrigé a montré la légende mobile repoussée sous les douze libellés :
une assertion supplémentaire échoue dans les deux thèmes, puis passe après réordonnancement CSS mobile.
La légende reste ainsi près du tracé, avant la clé complète ; aucune retouche desktop supplémentaire.

| Viewport, clair et sombre / Vert / 100 % | Canvas CSS | Rayon observé | Refus finaux |
| --- | --- | ---: | --- |
| 1920×1080 | 700,2×676,2 | 301 | Aucun rognage ni collision de repères |
| 1280×720 | 412,2×316,2 | 121 | Aucun rognage ni collision de repères |
| 1280×480 | 419,4×162,3 | 46 | Aucun rognage ni collision ; clé défilable atteignable |
| 390×844 | 358×358 | 140,65 | Aucun rognage ni collision ; légende avant la clé |

Les huit combinaisons conservent les mêmes 24 scores, les douze libellés complets, les deux styles
et les sélections attendues ; retrait de A puis ouverture clavier du premier critère vérifiés.
Codex a relu les 16 captures finales (radar et tableau, quatre formats, deux thèmes) : repères et textes complets lisibles, styles distincts, zéro mesuré conservé et flux/scrolls cohérents. Les mesures finales contiennent zéro défaut. Les [empreintes des originaux](manifest.md) identifient
les 16 PNG et le JSON de chaque phase, indépendamment des futurs runs recréant les sorties de test.

Première campagne exhaustive réussie : 1 456 tests backend (97,50 %), 455 tests frontend dans
112 fichiers (statements 94,39 %, branches 92,92 %, fonctions 95,83 %, lignes 95,27 %),
112 E2E réels et 10 démo. Après le dernier ajustement CSS, le pré-push revalide les entrées finales ;
les seules preuves dont les entrées et sélections restent identiques peuvent être réutilisées.

## Preuves et limites

Les sorties originales sont conservées hors worktree dans
`C:/Users/garan/Desktop/Projets/Assess-teams-mep-015-evidence` : `baseline` et `final`.
Ces PNG/JSON locaux ne sont pas annoncés disponibles à distance ; les observations utiles sont versionnées ici.
La sonde versionnée régénère les captures et mesures dans `frontend/test-results` à chaque exécution.
Aucun secret réel, cookie, base ou dépendance n’est versionné.

Commande de reproduction :

```powershell
npm run quality:targeted -- e2e e2e/results-radar-presentation.spec.ts e2e/results-layout.spec.ts
```

La qualification MEP-015 est distincte d’une recette MESS, du tactile physique, du zoom natif 200 %
et du GO/NO-GO ; ces derniers ne sont pas déclarés exécutés par cette campagne.
Les rôles utilisent le composant partagé ; leurs accès restent ceux de MEP-047 et des E2E existants.

## Revue documentaire et DoD

README mis à jour avant le code et la sonde ; revue AGENTS/règles, charte, DoD, stratégie,
validation proportionnée, fondamentaux, API backend et résultats : seule la documentation de présentation
radar évolue. Aucun endpoint, calcul, migration, permission, dépendance ou circuit de publication ajouté.
Les critères/refus sont exercés par la régression avant/après et la relecture des captures.
Les tests sans lignée protègent un vrai refus existant, sans règle métier nouvelle.

Le plan automatique classe `resultRadarConfig.ts` comme transverse et impose l’exhaustif ; aucune réduction
manuelle des gates. La livraison exige pré-push bloquant, publication par `npm run publish`, CI du SHA exact,
fast-forward du main principal puis nettoyage du seul chantier MEP-015. Le registre ne sera clôturé
qu’après confirmation des contrôles et de l’intégration.
