# Apparence et accents personnels

## Comportement attendu

Le mode clair associe des bandeaux sidebar/header clairement perceptibles à un fond central gris
très clair subtilement teinté. Les cartes restent blanches, les surfaces internes gris léger et les
bordures discrètes. La palette colore les bandeaux, le fond central et les interactions ; jamais les cartes.

Le mode sombre validé conserve ses valeurs, sa hiérarchie de surfaces, ses ombres et sa densité.
Changer Clair/Sombre ne change jamais la couleur choisie ; changer de couleur ne change jamais le mode.
En clair, les dix palettes suivent la même dérivation pour les accents, les bandeaux et le fond central.
Les cartes et les surfaces internes restent identiques quelle que soit la palette ; le layout, le shell,
les scrolls, la pagination et la persistance ne changent pas.

Le [Dashboard personnel](dashboard-api.md) expose les dix choix dans Mon profil → Apparence.
Le header conserve le toggle soleil/lune. Aucun comportement métier ni contrat API ne change.

Le symbole officiel est l’asset vectoriel `frontend/src/assets/assess-teams-logo.svg`, dont les
tracés et le viewBox fournis sont conservés. La sidebar l’utilise comme masque CSS en `currentColor` :
le symbole suit `text` dans les deux modes. Son cadre de 1,8 rem et le gap de marque restent inchangés ;
`contain` préserve les proportions. La sidebar repliée masque le nom, mais conserve le lien accessible.

## Tokens des surfaces

`theme.css` centralise les surfaces et les textes ; `palette.css` fournit les accents des dix couleurs.
`light-appearance.css`, importé par le thème, contient uniquement des sélecteurs excluant `night` :
les dérivés des bandeaux et les raffinements visuels du Dashboard ne peuvent pas s’appliquer au sombre.
Les composants consomment ces rôles communs, sans thème complet ni patch Dashboard par palette.

| Token                     | Clair                              | Sombre validé                      |
| ------------------------- | ---------------------------------- | ---------------------------------- |
| `background`              | alias LIGHT de `light-background`  | 24 % `accent-day` + 76 % `#171717` |
| `surface`                 | `#ffffff`                          | 24 % `accent-day` + 76 % `#262626` |
| `surface-raised`          | `#ffffff`                          | 24 % `accent-day` + 76 % `#303030` |
| `surface-secondary`       | `#f3f3f3`                          | alias de `background`              |
| `light-background`        | 3 % `accent-day` + 97 % `#f7f7f7`  | non appliqué                       |
| `light-band-background`   | 12 % `accent-day` + 88 % `#f8f8fa` | non appliqué                       |
| `light-navigation-active` | 20 % `accent-day` + 80 % `#ffffff` | non appliqué                       |
| `light-navigation-text`   | alias de `accent-hover`            | non appliqué                       |
| `border`                  | `#e3e3e3`                          | `#525252`                          |
| `input-border`            | `#737373`                          | `#a3a3a3`                          |
| `text`                    | `#171717`                          | `#f5f5f5`                          |
| `text-muted`              | `#525252`                          | `#b8b8b8`                          |

Les trois mélanges sRGB sombres sont conservés exactement. En clair, les cartes ne dépendent pas de
l’accent ; le fond central utilise seulement 3 % de couleur sur sa base grise. Les bandeaux passent de
6 % à 12 %, et la navigation active de 14 % à 20 %, pour renforcer la hiérarchie chromatique. Le texte
du menu actif/survolé utilise l’accent assombri existant (`accent-hover`) pour garder un contraste
≥ 4,5:1, y compris Orange. Les bases d’accent ne changent pas. Aucune couleur n’a de règle dédiée.
`heading`, `muted`, `secondary-text`, `navigation-background`, `navigation-text` et `sidebar-border`
restent des alias. En clair, `navigation-background` et le header utilisent `light-band-background`,
`navigation-active` utilise `light-navigation-active`. En sombre, ces rôles gardent leurs valeurs
validées (`surface` et `accent-subtle`). Menus/modales/tooltips utilisent `surface-raised`.
`sidebar-control` utilise `surface-secondary`, dont la valeur sombre préserve son ancien fond.
Les entêtes de tableaux clairs utilisent le gris secondaire ; cartes et lignes d’activité restent
séparées par la bordure neutre. Le Dashboard conserve ses sections et comportements : son identité et
son sélecteur sont plus compacts en clair, l’Apparence séparée par une ligne, l’activité structurée par
les espaces et textes secondaires. Les cartes blanches reçoivent une ombre légère ; le panneau inline
des palettes utilise le gris secondaire avec des échantillons blancs. La vue desktop représentative
(trois événements) avec sélecteur fermé tient dans un viewport de 720 px. Aucun style de disposition du shell n’est modifié.

En clair seulement, `shadow-surface` vaut `0 0.5rem 1.5rem rgb(0 0 0 / 4%)` et `shadow-raised`
`0 0.75rem 2rem rgb(0 0 0 / 10%)`. Les règles conditionnelles couvrent les cartes/tableaux et les menus/
modales existants. Le panneau inline Apparence reste sans ombre. Les ombres sombres restent inchangées.
Le texte d’aide clair décrit les accents ; le texte sombre validé conserve sa mise en page.

## Dix palettes d’accent

`palette.css` définit uniquement les bases d’accent et leurs rôles ; `palette.ts` porte les choix nommés.
Chaque couleur possède une base sombre pour le mode clair et une base claire pour le mode sombre.

| Accent    | Valeur persistée | Base Clair | Base Sombre |
| --------- | ---------------- | ---------- | ----------- |
| Bleu      | `blue`           | `#205ba3`  | `#90beff`   |
| Indigo    | `indigo`         | `#4338ca`  | `#a5b4fc`   |
| Violet    | `violet`         | `#7e22ce`  | `#d8b4fe`   |
| Rose      | `pink`           | `#9b2866`  | `#f5a4cc`   |
| Rouge     | `red`            | `#ac3036`  | `#ffaaa7`   |
| Orange    | `orange`         | `#b0430a`  | `#fdba74`   |
| Ambre     | `amber`          | `#8a5700`  | `#fcd34d`   |
| Vert      | `green`          | `#28703c`  | `#86d99b`   |
| Émeraude  | `emerald`        | `#15654d`  | `#70cbb0`   |
| Turquoise | `turquoise`      | `#0e6974`  | `#67d5df`   |

Les cinq rôles sont partagés, sans créer dix thèmes complets :

- `accent` : base du mode courant ;
- `accent-hover` : mélange sRGB de 88 % d’accent et 12 % de texte ;
- `accent-subtle` : mélange de 12 % d’accent et 88 % de base de surface, pour préserver le contraste des sélections ;
- `accent-border` : mélange de 65 % d’accent et 35 % de surface ;
- `accent-contrast` : `#ffffff` en clair, `#171717` en sombre.

Les alias `primary`, `primary-hover`, `on-primary`, `accent-text`, `focus`, `selection` et
`navigation-active` permettent aux composants existants de consommer ces rôles. L’accent s’applique aux
actions principales, liens, navigation active, focus, contrôles sélectionnés et surtitres.
Les fonds subtils signalent les sélections locales ; les cartes claires restent blanches sur le fond
central légèrement teinté. Les trois proportions LIGHT sont communes à toutes les palettes.
Les statuts métier, dangers et avertissements conservent leurs couleurs sémantiques indépendantes.
Le radar et les courbes conservent leurs séries distinctes, formes et pointillés indépendants des accents ;
leurs textes/grilles suivent les mêmes gris clair/sombre que l’interface.

## Sélecteur et persistance

Dans Mon profil → Apparence, le menu **Couleurs** expose dix pastilles avec libellés et boutons radio accessibles au clavier.
Le groupe « Couleur de l’interface » expose le choix personnel ; l’aide claire décrit son rôle d’accent.
Chaque échantillon montre sa propre base dans le mode courant ; le choix est aussi signalé par le radio
et la bordure. Un enregistrement sérialise les écritures et annonce le succès ; un refus rétablit le
choix précédent et affiche une erreur accessible. Une réponse tardive après déconnexion est ignorée.
`usePalettePreference` reste monté dans le shell pendant la navigation : une sauvegarde commencée sur
le dashboard conserve son résultat ou son rollback après un changement de page, sans second appel API.

Le backend reste la source de vérité, sans stockage local de l’accent. `GET /api/session/`, la connexion
et `PATCH /api/session/` conservent le contrat existant et restituent la préférence personnelle.
Le choix est restauré après reload, reconnexion et connexion dans un navigateur neuf.
Clair/Sombre conserve son stockage navigateur `assess-teams-theme`, totalement séparé.

La migration `0005` élargit `User.interface_palette` à 16 caractères et étend les choix et la contrainte
SQL aux dix valeurs. Elle ne réécrit aucune préférence : `green`, `blue`, `pink`, `red` restent valides,
avec les mêmes rattachements et identifiants. Le défaut reste `green`, y compris à la déconnexion.
Une réponse serveur inconnue est normalisée vers `green` dans l’affichage sans écriture backend.
Une valeur inconnue envoyée à l’API est refusée avec `400`, sans modifier le choix enregistré.
Une session active et le jeton CSRF restent obligatoires (`403` autrement) ; seul le champ de préférence
est accepté, sans utilisateur cible, rôle, organisation ni CSS libre.

## Audit et validation

L’audit couvre Dashboard, shell/navigation, champs, sélecteur, formulaires/modales de gestion,
Results/radar/historique, Pilotage et tableaux. Le fond applicatif et les bandeaux suivent les dérivés
LIGHT de chaque palette, tandis que les cartes et champs restent blancs ; le sombre reste inchangé.
Les modales Utilisateurs, Organisations, Équipes, Modèles, Planification et Passation partagent
`surface-raised`. Les liens/focus Results et Pilotage suivent l’accent. Le danger de Planification garde
un texte blanc indépendant du contraste des boutons primaires ; les dangers outline suivent le mode.

Les tests de migration protègent les quatre choix historiques et les rattachements ; les tests API couvrent
les dix accents, les rôles, la persistance, l’isolation, les valeurs invalides, CSRF et OpenAPI.
React vérifie les dix choix, le fallback, l’indépendance des dimensions, la restauration et le rollback.
Un seul test navigateur parcourt les palettes : cartes claires identiques et blanches, fond central
subtilement teinté distinct pour chaque accent, bandeaux plus soutenus et menu actif plus visible,
valeurs sombres égales aux trois mélanges validés, contrastes ≥ 4,5:1 pour textes principaux/secondaires,
accents et hover, bandeaux dérivés distincts pour les dix palettes et navigation active lisible.
Il échoue avant correction sur le fond central encore neutre. Les captures sombres Dashboard, Pilotage,
Results et modale sont comparées à la référence avant modification, avec animations et scroll
stabilisés, pour protéger leur rendu.
Il ne multiplie pas les parcours métier pour les vingt combinaisons.
`palettes.spec.ts` couvre persistance réelle, reconnexion, navigateur neuf, clavier et refus.
`theme-surfaces.spec.ts` vérifie les fonds calculés et capture des écrans représentatifs dans les deux
modes, en clair Bleu/Violet/Vert et sur mobile, avec des métriques de police élargies. Il protège aussi
la hauteur de la vue desktop claire avec Apparence repliée. La CI Linux a révélé une largeur minimale
intrinsèque du fieldset et des colonnes, causant un débordement de 7 px à 390 px. Le panneau borne sa
largeur au viewport, annule ce minimum et autorise la grille et ses libellés à se replier ; le test
reproduit le débordement avant correction. Les E2E Results et Pilotage protègent aussi les composants et séries existants.

La revue documentaire porte sur README, fondamentaux, contrat API, stratégie de tests, règles des agents,
charte qualité et Definition of Done. Les trois derniers restent applicables sans modification.
Les validations requises incluent lint/formatage, build TypeScript/Vite, migrations, schéma OpenAPI,
tests/coverage ≥ 90 %, E2E, limite de 200 lignes, secrets et `npm run quality:full`, répété au pre-push.
