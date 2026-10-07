# Apparence et accents personnels

## Comportement attendu

Le système précédent gardait les grandes surfaces neutres : choisir Bleu ou Violet laissait les cartes
blanches en clair. L’exigence actualisée est de colorer aussi ces fonds, avec des teintes claires lumière
allumée et des teintes foncées lumière éteinte. Les deux choix restent indépendants : changer Clair/Sombre
ne change jamais la couleur sélectionnée ; changer de couleur ne change jamais le mode.

Le [Dashboard personnel](dashboard-api.md) expose les dix choix dans Mon profil → Apparence.
Le header conserve le toggle soleil/lune. Aucun comportement métier ni contrat API ne change.

## Tokens des surfaces

`theme.css` centralise les bases, les proportions et les rôles de surface. `palette.css` fournit les
bases des dix couleurs ; aucune palette ne duplique le thème complet ni les styles des composants.

| Rôle | Base Clair | Base Sombre | Part de couleur Clair / Sombre |
| --- | --- | --- | --- |
| `background` | `#f5f5f5` | `#171717` | 35 % / 24 % |
| `surface` | `#ffffff` | `#262626` | 25 % / 24 % |
| `surface-raised` | `#ffffff` | `#303030` | 18 % / 24 % |

Les mélanges utilisent `color-mix(in srgb, couleur proportion, base)`. En clair, la couleur des fonds
est la base lumineuse `accent-night` ; en sombre, c’est la base profonde `accent-day`. Les noms de ces
bases indiquent leur usage comme accent d’action, tandis que les fonds utilisent la base opposée pour
préserver leur luminosité et le contraste. La couleur choisie est donc visible dans les deux modes.

Exemple Bleu : le fond de page passe d’environ `#d2e2f8` en clair à `#192739` en sombre.
Le panneau, les cartes, le header, la sidebar, les champs et les modales suivent ces rôles partagés.

| Token lisible | Clair | Sombre |
| --- | --- | --- |
| `border` | `#d4d4d4` | `#525252` |
| `input-border` | `#737373` | `#a3a3a3` |
| `text` | `#171717` | `#f5f5f5` |
| `text-muted` | `#525252` | `#b8b8b8` |

Les textes et bordures restent neutres et dépendent uniquement du mode. `heading`, `muted`,
`secondary-text`, `navigation-background`, `navigation-text`, `sidebar-control` et `sidebar-border`
restent des alias ; header et sidebar utilisent `surface`, menus/tooltips/modales `surface-raised`.
Les overlays et ombres restent noirs. Le toggle utilise les fonds assortis sans changer la préférence.

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
- `accent-subtle` : mélange de 12 % d’accent et 88 % de base de surface, pour préserver le contraste des sélections ;
- `accent-border` : mélange de 65 % d’accent et 35 % de surface ;
- `accent-contrast` : `#ffffff` en clair, `#171717` en sombre.

Les alias `primary`, `primary-hover`, `on-primary`, `accent-text`, `focus`, `selection` et
`navigation-active` permettent aux composants existants de consommer ces rôles. L’accent s’applique aux
actions principales, liens, navigation active, focus, contrôles sélectionnés et surtitres.
Les fonds subtils signalent les sélections locales ; les grandes surfaces utilisent les mélanges dédiés.
Les statuts métier, dangers et avertissements conservent leurs couleurs sémantiques indépendantes.
Le radar et les courbes conservent leurs séries distinctes, formes et pointillés indépendants des accents ;
leurs textes/grilles suivent les mêmes gris clair/sombre que l’interface.

## Sélecteur et persistance

Dans Mon profil → Apparence, le menu **Couleurs** expose dix pastilles avec libellés et boutons radio accessibles au clavier.
Le groupe « Couleur de l’interface » et le texte du profil expliquent aussi l’effet sur les fonds.
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
Results/radar/historique, Pilotage et tableaux. Les surfaces suivent les mêmes tokens teintés, sans
couleur verte structurelle codée en dur. Le vert ne colore les fonds que lorsque cette palette est choisie.
Les modales Utilisateurs, Organisations, Équipes, Modèles, Planification et Passation partagent
`surface-raised`. Les liens/focus Results et Pilotage suivent l’accent. Le danger de Planification garde
un texte blanc indépendant du contraste des boutons primaires ; les dangers outline suivent le mode.

Les tests de migration protègent les quatre choix historiques et les rattachements ; les tests API couvrent
les dix accents, les rôles, la persistance, l’isolation, les valeurs invalides, CSRF et OpenAPI.
React vérifie les dix choix, le fallback, l’indépendance des dimensions, la restauration et le rollback.
Un seul test navigateur parcourt les bases clair/sombre : dix fonds distincts par rôle et par mode,
luminosité claire/foncée, textes/bordures indépendants de la palette, contrastes ≥ 4,5:1 pour textes
principaux et secondaires, accents et hover. Il échoue avant correction : dix palettes donnaient un seul fond.
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
