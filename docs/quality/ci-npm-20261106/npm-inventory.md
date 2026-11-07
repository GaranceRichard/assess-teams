# Inventaire npm et chaînes de dépendances

Audit npm 11.19.0, Node 24.20.0, Windows ; lockfiles v3 de la base du [rapport](README.md).
Tous les paquets ci-dessous ont `dev: true` dans les locks. D = poste de développement,
B = build/coverage, C = runner CI. P = application de production : aucun de ces paquets.
Le build Vite produit des fichiers statiques React, sans serveur Node ; les tests utilisent jsdom.
`npm audit --omit=dev` racine et frontend : zéro signalement ; cela ne mesure pas le Node embarqué
avec d’autres logiciels, les dépendances Python ou l’environnement MESS.

## Tous les paquets signalés initialement

Une ligne par entrée npm, y compris les propagations. Les codes renvoient aux [avis](npm-advisories.md).
La décision C signifie corrigé dans les locks, Q signifie qualifié, reste présent sans acceptation.

| Emplacement / paquet | Version avant → après | Sévérité npm | Chaîne depuis un manifest | Environnement | Avis / décision |
| --- | --- | --- | --- | --- | --- |
| racine / concurrently | 9.2.4 → 9.2.5 | critique | devDependencies → concurrently → shell-quote | D, outillage C | S / C |
| racine / shell-quote | 1.9.0 → 1.12.0 | critique | concurrently → shell-quote (version exacte) | D, outillage C | S / C |
| frontend / @eslint/config-array | 0.23.5 inchangé | modérée | eslint → config-array → minimatch | D/C lint | M / Q |
| frontend / @eslint/js | 10.0.1 inchangé | modérée | @eslint/js → peer eslint → minimatch | D/C lint | M / Q |
| frontend / @typescript-eslint/eslint-plugin | 8.70.0 inchangé | modérée | typescript-eslint → eslint-plugin → parser/type-utils/utils → estree → minimatch | D/C lint | M / Q |
| frontend / @typescript-eslint/parser | 8.70.0 inchangé | modérée | typescript-eslint → parser → estree → minimatch | D/C lint | M / Q |
| frontend / @typescript-eslint/type-utils | 8.70.0 inchangé | modérée | typescript-eslint → eslint-plugin → type-utils → estree/utils → minimatch | D/C lint | M / Q |
| frontend / @typescript-eslint/typescript-estree | 8.70.0 inchangé | modérée | typescript-eslint → typescript-estree → minimatch | D/C lint | M / Q |
| frontend / @typescript-eslint/utils | 8.70.0 inchangé | modérée | typescript-eslint → utils → estree → minimatch | D/C lint | M / Q |
| frontend / @vitest/coverage-v8 | 5.0.1 → 5.0.3 | modérée | coverage-v8 → peer vitest → mocker | D/B/C tests | T1/T2 / C |
| frontend / @vitest/mocker | 5.0.1 → 5.0.3 | modérée | vitest → mocker | D/C tests | T1/T2 / C |
| frontend / eslint | 10.11.0 inchangé | modérée | eslint → minimatch ; eslint → config-array → minimatch | D/C lint | M / Q |
| frontend / minimatch | 10.2.6 inchangé | modérée | eslint/config-array/typescript-estree → minimatch | D/C lint | M / Q |
| frontend / source-map-js | 1.2.1 → 1.2.2 | élevée | vite → postcss → source-map-js ; jsdom → css-tree → source-map-js ; coverage-v8 → magicast → source-map-js | D/B/C | A / C |
| frontend / typescript-eslint | 8.70.0 inchangé | modérée | typescript-eslint → parser/plugin/estree/utils → minimatch | D/C lint | M / Q |
| frontend / undici | 7.29.1 → 7.30.2 | élevée | jsdom → undici | D/C tests | U1–U8 / C |
| frontend / vite | 8.3.0 → 8.3.3 | élevée | devDependencies → vite (également peer des outils Vitest/React) | D/B/C | V1–V6 / C |
| frontend / vitest | 5.0.1 → 5.0.3 | modérée | vitest → mocker ; peer coverage-v8 | D/B/C tests | T1/T2 / C |
| frontend / zod | 4.6.5 → 4.6.7 | élevée | eslint-plugin-react-hooks → zod ; zod-validation-error → peer zod | D/C lint | Z / C |

Les noms raccourcis config-array, estree, parser, plugin et utils désignent les paquets complets
@eslint/config-array et @typescript-eslint/* des lignes correspondantes, pas des dépendances différentes.
`npm explain` confirme ces routes ; `npm ls --all --json` valide l’arbre installé après `npm ci`.
Les degrés d’indirection multiples sont couverts par les lignes et les champs via/effects de l’audit.

## Compatibilité et bornage

- Manifest racine : plancher concurrently 9.2.5, borne <10 conservée. Son shell-quote exact 1.12.0 corrige S.
- Manifest frontend : Vite 8.3.3 et couple Vitest/coverage 5.0.3 exacts ; mêmes majeures, premiers patchs sûrs.
- source-map-js 1.2.2, undici 7.30.2 et zod 4.6.7 satisfont respectivement ^1.2.1, ^7.25.0 et ^3.25.0 || ^4.0.0.
- Vite 8.3.3 exige rolldown ~1.2.11 : lock 1.2.16, bindings de toutes plateformes correspondants,
  et @oxc-project/types 0.156.0 imposé par rolldown. Ce sont des dépendants de la correction build.
- Vitest impose mocker/spy 5.0.3 et why-is-node-running 3.2.1 ; suppression de siginfo/stackback
  devenus inutiles. Cette majeure transitive exacte est imposée par le patch fournisseur, sans API applicative.
- magic-string 1.4.1 conservé, compatible avec les patchs, pour éviter un rafraîchissement sans rapport.
- Aucune mise à jour des dépendances React/chart.js, d’ESLint, TypeScript, Playwright ou Python.
- Aucune utilisation de `npm audit fix --force`, aucune résolution majeure minimatch forcée.

Les avertissements peer transitoires durant la résolution Vitest 5.0.1 → 5.0.3 ne constituent pas
une preuve de compatibilité : le couple final 5.0.3/5.0.3 est réinstallé par npm ci et npm ls réussit.
Les tests exhaustifs, lint, builds applicatif/démo et E2E sont requis pour le verdict final.
Les exigences moteur restent compatibles avec Node 22 configuré en CI et Node 24.20 du poste :
Vitest ^22.12 || ^24 || >=26, Vite ^20.19 || >=22.12, why-is-node-running >=20.11, undici >=20.18.1.
Les versions resolved et integrity SHA-512 sont versionnées dans les deux lockfiles ; npm ci les vérifie.
