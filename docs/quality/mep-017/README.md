# MEP-017 — Tableaux et contenus sur petits écrans

Qualification initiale du 2026-11-03 par Codex, Windows/Chromium, palette Vert, données fictives.
Complétée le 2026-11-05 après resynchronisation sur `4793611` (MEP-050) ; seules les preuves finales sont régénérées.
Base applicative : `76f486a0b84168f28229476cf04dffe094ffd81d` (SHA complet et empreintes dans le manifeste).
[Contrat F08](../../backlog/source/mess/f08.md) · [fiche](../../backlog/planning/audit-20261027/fiches/MEP-017.md) ·
[UX-05](../ux-acceptance.md) · [DoD](../definition-of-done.md).
**Proposition de clôture fonctionnelle sur preuves après publication et CI verte ; registre inchangé.**

## Acquis réutilisés et cellules complémentaires

Un test présent n'est pas assimilé à une exécution. Les rapports historiques portent leurs propres états ;
les suites existantes restent les protections de non-régression du candidat.
Aucune refonte responsive globale, modification de données, droits, messages ou états vides MEP-050.

| Cellules | Acquis / écart à compléter | Qualification de ce lot |
| --- | --- | --- |
| Shell et pagination desktop | `product-shell` : collections bornées, chrome fixe | Textes longs : 8 collections × 4 formats × 2 thèmes, pages 1→2→1 |
| Mobile et faible hauteur | Navigation [MEP-049](../mep-049/README.md), textes de collections peu exercés | Mêmes 64 cellules : régions, actions de ligne/pagination, défilement clavier réel |
| Dialogues | MEP-005 : modalité, focus, refus et fermeture protégée | 5 dialogues × 2 formats × 2 thèmes = 20 cellules ; contenu long, commandes et clavier |
| Radar / tableaux | [MEP-015](../mep-015/README.md) : 12 critères longs, 24 scores, 4 formats, 2 thèmes | Acquis conservés ; aucun CSS/composant Results modifié |
| Historique | [MEP-014](../results-hierarchy.md), `results-history-layout`, `results-longitudinal` | Acquis conservés ; quatre restitutions complétées au zoom natif actuel |
| Zoom Dashboard / Apparence / Passation | [MEP-053](../typography.md), MEP-013/044 et `transition-zoom` | Acquis conservés, aucune correction sur ces composants |
| Zoom Utilisateurs / dialogue | MEP-053 : ancien contrôle natif | Nouvelle collection >20 lignes, pagination et clavier, cycle complet dans les deux thèmes |
| Zoom Results après MEP-015 | Les images MEP-014 précèdent la clé numérotée MEP-015 | 4 restitutions × 3 étapes × 2 thèmes = 24 mesures, critères longs et sélections conservées |

Formats CSS : 1920×1080, 1280×720, 1280×480 et 390×844 ; dialogues aux deux derniers.
Les tailles supplémentaires 320×568 et 568×320 restent celles de la passation, déjà testée.
Admin exerce les collections autorisées ; Coach/Viewer conservent les composants partagés et leurs scopes
contrôlés par les suites de rôles, Viewer Results et navigation mobile existantes. Aucun accès élargi.

## Refus reproduit et seul correctif

À 1280×480, Planification dispose d'une région de **48 px** pour une ligne longue de **158 px**.
Après focus et `scrollIntoViewIfNeeded`, le centre de l'action n'est pas atteignable : `elementFromPoint`
ne retrouve pas le bouton. Les deux thèmes échouent ; aucune autre cellule de collection ne déborde.
Le responsable est `.planning-workspace`, comprimé entre l'en-tête, le sélecteur et la pagination.
Les [mesures initiales](baseline/collections-day.jsonl), [mesures sombres](baseline/collections-night.jsonl)
et l'[extrait rouge](baseline/reproduction.txt) identifient le composant et le vrai refus UX-05.

`planning.css` fixe uniquement le minimum du panneau à **24 rem** en desktop de hauteur ≤600 px.
La page peut défiler dans le shell, avant que la liste ne devienne inutilisable ; la pagination reste séparée.
La région mesurée atteint **232 px**, le même bouton de 158 px devient atteignable, et les deux suites passent.
Le header/sidebar restent fixes ; aucun changement de breakpoint mobile, de typographie ou de logique métier.
Les textes, pages, filtres, données et sélections restent identiques après navigation.

## Mesures et revue visuelle

`responsive-collections.spec.ts` mesure document, page, région et pagination : dimensions client/scroll,
overflows, position et centre atteignable des actions. Le clavier fait défiler la région puis active
Suivant/Précédent ; le contenu de page 1 est retrouvé exactement. Les Logs sont filtrés sur ERROR,
avec 25 messages fictifs longs, pour éviter la variation légitime des nouveaux logs HTTP de consultation.
Les libellés mobiles de Planification gardent leur défilement horizontal existant : flèche droite vérifiée
sur le bouton long (largeur de contenu 2465 px, largeur client 293 px, déplacement observé 38 px).
`responsive-dialogs.spec.ts` ouvre Utilisateurs, membres d'organisation (>30), suppression d'équipe à nom long,
création de modèle et planification. Il mesure le contenu visible/scrollable, atteint chaque commande,
exerce Tab/Shift+Tab et Échap, puis vérifie le retour du focus. Aucune mutation destructive exécutée.
Les assertions refusent débordement de document, centre masqué, commande hors viewport ou contenu de dialogue rogné.

Le zoom utilise `chrome.tabs.setZoom/getZoom`, via une extension locale de test et Chromium complet.
La fenêtre donne exactement 1280×720 à 100 %, 640×360 à 200 %, puis 1280×720 au retour ;
DPR 1→2→1, zoom CSS 1 et échelle de pincement 1 sont mesurés. Ce n'est pas une émulation de viewport.
L'extension et le profil sont jetables et non versionnés ; le profil est hors du dossier surveillé par Vite.
Les captures natives retiennent le framebuffer. Les graphiques gardent un canvas positif,
les textes détaillés et les deux équipes sélectionnées ; les onglets restent atteignables au clavier.

Le [manifeste](manifest.md) inventorie mesures, captures retenues et empreintes. La revue visuelle représentative contrôle
textes/actions, liste avant/après, dialogues longs, données et graphiques à 200 % dans les deux thèmes.
Elle complète les assertions, sans prétendre à une comparaison automatique d'esthétique.

## Reproduction

```powershell
npm.cmd run quality:targeted -- e2e e2e/responsive-collections.spec.ts e2e/responsive-dialogs.spec.ts
```

Les deux recettes natives restent hors collecte CI, comme la recette MEP-014 existante.
Créer une configuration locale héritant de celle du produit, sans modifier les gates :

```powershell
New-Item -ItemType Directory -Force frontend/.cache, .cache/tmp | Out-Null
Set-Content -Encoding utf8 frontend/.cache/responsive.config.ts 'import base from "../playwright.config"; import { defineConfig } from "@playwright/test"; export default defineConfig({ ...base, testDir: "../audits", testMatch: "responsive*zoom.audit.ts", outputDir: "../.cache/zoom-results" });'
$env:ASSESS_E2E_BACKEND_PORT = '21717'
$env:ASSESS_E2E_FRONTEND_PORT = '21718'
$env:ASSESS_E2E_DB = Join-Path (Get-Location) 'backend/.cache/mep017-native.sqlite3'
$env:TEMP = Join-Path (Get-Location) '.cache/tmp'
npm.cmd run test:e2e --prefix frontend -- --config .cache/responsive.config.ts
```

Lancer sur une base jetable distincte et des ports libres ; jamais sur une base de production.
Les sorties complètes sont archivées hors worktree avant nettoyage ; seuls mesures et rendus utiles sont versionnés.

## DoD et revue documentaire

README annoncé avant sondes/correctifs ; shell, stratégie de tests, cahier UX et lien F08 actualisés.
Règles agents, charte, DoD, fondamentaux et contrat API/OpenAPI relus : aucune règle, API, migration,
permission, calcul ou dépendance ne change. Les refus métier restent couverts par les suites existantes ;
le nouveau refus est la géométrie réellement reproduite avant correction. Fichiers maintenus ≤200 lignes.
Plan automatique, pré-push et CI du SHA publié restent bloquants. Publication par `npm run publish`,
sans PR, avec fast-forward sûr du main principal. Résultats des gates et intégration consignés à la livraison.
Aucune cellule non exécutée n'est notée passée. Recette MESS cible, tactile physique et GO global restent distincts.


## Validation complète initiale

Campagne terminée le 2026-11-03 sur les entrées initiales : 1 456 tests backend, couverture 97,50 %,
461 tests frontend (statements 94,47 %, branches 92,88 %, fonctions 95,85 %, lignes 95,34 %),
129 E2E application et 10 E2E démo passants. Lint, formatage, typecheck, builds et contrôles du dépôt verts.
Ces résultats précèdent la resynchronisation avec MEP-050 ; le pré-push revalide le candidat final.
