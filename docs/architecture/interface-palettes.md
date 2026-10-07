# Apparence et accents personnels

## Comportement attendu

Le mode clair utilise une hiérarchie lumineuse neutre : fond très clair, sidebar/header/cartes blancs,
surfaces secondaires gris léger et bordures discrètes. Les mélanges pastel précédents coloraient toutes
les grandes surfaces avec l’accent ; ils sont retirés uniquement du mode clair.

Le mode sombre validé conserve ses valeurs, sa hiérarchie de surfaces, ses ombres et sa densité.
Changer Clair/Sombre ne change jamais la couleur choisie ; changer de couleur ne change jamais le mode.
En clair, les dix palettes ne colorent que les accents, jamais les grandes surfaces.

Le [Dashboard personnel](dashboard-api.md) expose les dix choix dans Mon profil → Apparence.
Le header conserve le toggle soleil/lune. Aucun comportement métier ni contrat API ne change.

## Tokens des surfaces

`theme.css` centralise les surfaces et les textes ; `palette.css` fournit les accents des dix couleurs.
Les composants consomment ces rôles communs, sans thème complet ni patch Dashboard par palette.

| Token               | Clair     | Sombre validé                      |
| ------------------- | --------- | ---------------------------------- |
| `background`        | `#f7f7f7` | 24 % `accent-day` + 76 % `#171717` |
| `surface`           | `#ffffff` | 24 % `accent-day` + 76 % `#262626` |
| `surface-raised`    | `#ffffff` | 24 % `accent-day` + 76 % `#303030` |
| `surface-secondary` | `#f3f3f3` | alias de `background`              |
| `border`            | `#e3e3e3` | `#525252`                          |
| `input-border`      | `#737373` | `#a3a3a3`                          |
| `text`              | `#171717` | `#f5f5f5`                          |
| `text-muted`        | `#525252` | `#b8b8b8`                          |

Les trois mélanges sRGB sombres sont conservés exactement ; le clair n’a plus de dépendance à un accent.
`heading`, `muted`, `secondary-text`, `navigation-background`, `navigation-text` et `sidebar-border`
restent des alias. Header et sidebar utilisent `surface`, menus/modales/tooltips `surface-raised`.
`sidebar-control` utilise `surface-secondary`, dont la valeur sombre préserve son ancien fond.
Les entêtes de tableaux clairs utilisent le gris secondaire ; cartes et lignes d’activité restent
séparées par la bordure neutre. Structure, padding, typographie et densité du Dashboard sont conservés.

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
Les fonds subtils signalent les sélections locales ; les grandes surfaces claires restent neutres.
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
Results/radar/historique, Pilotage et tableaux. Les grandes surfaces claires suivent les tokens neutres,
sans fond lié au Bleu, Rouge ou Vert ; les surfaces sombres validées restent inchangées.
Les modales Utilisateurs, Organisations, Équipes, Modèles, Planification et Passation partagent
`surface-raised`. Les liens/focus Results et Pilotage suivent l’accent. Le danger de Planification garde
un texte blanc indépendant du contraste des boutons primaires ; les dangers outline suivent le mode.

Les tests de migration protègent les quatre choix historiques et les rattachements ; les tests API couvrent
les dix accents, les rôles, la persistance, l’isolation, les valeurs invalides, CSRF et OpenAPI.
React vérifie les dix choix, le fallback, l’indépendance des dimensions, la restauration et le rollback.
Un seul test navigateur parcourt les palettes : fonds clairs identiques, achromatiques et lumineux,
valeurs sombres égales aux trois mélanges validés, contrastes ≥ 4,5:1 pour textes principaux/secondaires,
accents et hover. Il échoue avant correction car les fonds clairs sont teintés. Les captures sombres
Dashboard, Pilotage et modale sont comparées à la référence avant modification pour protéger leur rendu.
Il ne multiplie pas les parcours métier pour les vingt combinaisons.
`palettes.spec.ts` couvre persistance réelle, reconnexion, navigateur neuf, clavier et refus.
`theme-surfaces.spec.ts` vérifie les fonds calculés et capture des écrans représentatifs dans les deux
modes et sur mobile, avec des métriques de police élargies. La CI Linux a révélé une largeur minimale
intrinsèque du fieldset et des colonnes, causant un débordement de 7 px à 390 px. Le panneau borne sa
largeur au viewport, annule ce minimum et autorise la grille et ses libellés à se replier ; le test
reproduit le débordement avant correction. Les E2E Results et Pilotage protègent aussi les composants et séries existants.

La revue documentaire porte sur README, fondamentaux, contrat API, stratégie de tests, règles des agents,
charte qualité et Definition of Done. Les trois derniers restent applicables sans modification.
Les validations requises incluent lint/formatage, build TypeScript/Vite, migrations, schéma OpenAPI,
tests/coverage ≥ 90 %, E2E, limite de 200 lignes, secrets et `npm run quality:full`, répété au pre-push.
