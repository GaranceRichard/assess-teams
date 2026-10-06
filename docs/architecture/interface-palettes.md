# Apparence et accents personnels

## Cause racine et périmètre

L’audit part de `origin/main` (`51574e0`). `palette.css` associait chaque accent à une famille
`--sidebar*` : changer de préférence recolorait donc toute la navigation. `theme.css` définissait aussi
les fonds `#eef2ef`, `#101817`, les cartes `#1a2624` et des textes/bordures teintés de vert.
Le test de régression navigateur reproduit le défaut avant correction : Vert → Bleu changeait
`--navigation-background` de `#102c2a` à `#142c49`.

L’apparence Clair/Sombre et la couleur d’accent sont désormais deux dimensions indépendantes.
Le Dashboard personnel avec section Apparence n’est pas présent sur ce main : le sélecteur reste
provisoirement dans le header pour préserver le chantier Dashboard. Aucun comportement métier ne change.

## Tokens structurels

`theme.css` est la source des surfaces, textes et bordures neutres. Seul `data-theme` les contrôle.
Les composants utilisent les mêmes tokens dans tous les accents ; aucune palette ne les redéfinit.

| Token | Clair (`day`) | Sombre (`night`) |
| --- | --- | --- |
| `background` | `#f5f5f5` | `#171717` |
| `surface` | `#ffffff` | `#262626` |
| `surface-raised` | `#ffffff` | `#303030` |
| `border` | `#d4d4d4` | `#525252` |
| `input-border` | `#737373` | `#a3a3a3` |
| `text` | `#171717` | `#f5f5f5` |
| `text-muted` | `#525252` | `#b8b8b8` |

`heading`, `muted`, `secondary-text`, `navigation-background`, `navigation-text`, `sidebar-control`
et `sidebar-border` sont des alias structurels. Header et sidebar utilisent `surface` ; menus, tooltips
et modales utilisent `surface-raised`. Les champs utilisent `surface`. Les overlays et ombres sont noirs.
Le toggle jour/nuit utilise lui aussi les surfaces et textes neutres, sans toucher à l’accent.

## Dix palettes d’accent

`palette.css` définit uniquement les bases d’accent et leurs rôles ; `palette.ts` porte les choix nommés.
Chaque couleur possède une base sombre pour le mode clair et une base claire pour le mode sombre.

| Accent | Valeur persistée | Base Clair | Base Sombre |
| --- | --- | --- | --- |
| Bleu | `blue` | `#205ba3` | `#90beff` |
| Indigo | `indigo` | `#4338ca` | `#a5b4fc` |
| Violet | `violet` | `#7e22ce` | `#d8b4fe` |
| Rose | `pink` | `#9b2866` | `#f5a4cc` |
| Rouge | `red` | `#ac3036` | `#ffaaa7` |
| Orange | `orange` | `#b0430a` | `#fdba74` |
| Ambre | `amber` | `#8a5700` | `#fcd34d` |
| Vert | `green` | `#28703c` | `#86d99b` |
| Émeraude | `emerald` | `#15654d` | `#70cbb0` |
| Turquoise | `turquoise` | `#0e6974` | `#67d5df` |

Les cinq rôles sont partagés, sans créer dix thèmes complets :

- `accent` : base du mode courant ;
- `accent-hover` : mélange sRGB de 88 % d’accent et 12 % de texte ;
- `accent-subtle` : mélange de 12 % d’accent et 88 % de surface ;
- `accent-border` : mélange de 65 % d’accent et 35 % de surface ;
- `accent-contrast` : `#ffffff` en clair, `#171717` en sombre.

Les alias `primary`, `primary-hover`, `on-primary`, `accent-text`, `focus`, `selection` et
`navigation-active` permettent aux composants existants de consommer ces rôles. L’accent s’applique aux
actions principales, liens, navigation active, focus, contrôles sélectionnés et surtitres.
Les fonds subtils se limitent aux sélections locales ; les grandes surfaces restent neutres.
Les statuts métier, dangers et avertissements conservent leurs couleurs sémantiques indépendantes.
Le radar et les courbes conservent leurs séries distinctes, formes et pointillés indépendants des accents ;
leurs textes/grilles suivent les mêmes gris clair/sombre que l’interface.

## Sélecteur et persistance

Le menu **Couleurs** expose dix pastilles avec libellés et boutons radio accessibles au clavier.
Chaque échantillon montre sa propre base dans le mode courant ; le choix est aussi signalé par le radio
et la bordure. Un enregistrement sérialise les écritures et annonce le succès ; un refus rétablit le
choix précédent et affiche une erreur accessible. Une réponse tardive après déconnexion est ignorée.

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
Results/radar/historique, Pilotage et tableaux. Les fonds et textes verts historiques, surfaces de sidebar
par palette, contrôles de sidebar, tooltips, ombres vertes et overlays teintés sont neutralisés à leur source.
Les modales Utilisateurs, Organisations, Équipes, Modèles, Planification et Passation partagent
`surface-raised`. Les liens/focus Results et Pilotage suivent l’accent. Le danger de Planification garde
un texte blanc indépendant du contraste des boutons primaires ; les dangers outline suivent le mode.

Les tests de migration protègent les quatre choix historiques et les rattachements ; les tests API couvrent
les dix accents, les rôles, la persistance, l’isolation, les valeurs invalides, CSRF et OpenAPI.
React vérifie les dix choix, le fallback, l’indépendance des dimensions, la restauration et le rollback.
Un seul test navigateur de tokens parcourt les bases clair/sombre et vérifie invariance structurelle,
neutres achromatiques et contraste des accents/hover avec leur texte et les surfaces (≥ 4,5:1).
Il ne multiplie pas les parcours métier pour les vingt combinaisons.
`palettes.spec.ts` couvre persistance réelle, reconnexion, navigateur neuf, clavier et refus.
`theme-surfaces.spec.ts` vérifie les fonds calculés et capture des écrans représentatifs dans les deux
modes et sur mobile ; les E2E Results et Pilotage protègent aussi les composants et séries existants.

La revue documentaire porte sur README, fondamentaux, contrat API, stratégie de tests, règles des agents,
charte qualité et Definition of Done. Les trois derniers restent applicables sans modification.
Les validations requises incluent lint/formatage, build TypeScript/Vite, migrations, schéma OpenAPI,
tests/coverage ≥ 90 %, E2E, limite de 200 lignes, secrets et `npm run quality:full`, répété au pre-push.
