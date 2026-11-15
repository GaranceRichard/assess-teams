# Swagger UI hors ligne — inventaire et frontière de préparation

[Index](README.md) · [sources et empreintes](artifacts.md) · dépendances source [1](swagger-components-1.md), [2](swagger-components-2.md).

## Besoin existant

`SpectacularSwaggerView` de drf-spectacular 0.28.0 utilise le schéma local et les fichiers
`swagger-ui.css`, `swagger-ui-bundle.js`, `swagger-ui-standalone-preset.js` et le favicon.
Le défaut CDN `@latest` n’est ni une version figée ni une dépendance hors ligne acceptable.
ReDoc n’est pas routé dans config/urls.py : aucun bundle ReDoc obligatoire n’est inventé.
L’authentification existante n’exige pas OAuth2, mais conserver les deux fichiers oauth2-redirect avec
les assets sélectionnés évite d’en omettre une sous-ressource ; ils ne créent pas de fournisseur d’identité.
`validatorUrl` distant ou toute police/script distant doit être confronté à la configuration effective lors de MEP-058/021 ; aucune configuration n’est modifiée ici.

## Entrées exactes et refus du précompilé examiné

Swagger UI 5.35.0, Apache-2.0, est identifié par son archive source et son package-lock upstream.
Les 201 entrées non-dev ont chacune version, provenance, empreinte et licence dans les tables liées.
La fermeture complète de préparation et les compléments du lock sont séparés dans [build.md](build.md).
Ces entrées source sont disponibles pour traiter la préparation ; aucun bundle de sortie n’est encore produit ni haché à sa place.

Le tarball npm `swagger-ui-dist@5.35.0` examiné possède ses propres empreintes, LICENSE/NOTICE et notices des bundles.
Ses source maps nomment 95 paquets ; trois noms (`@braintree/sanitize-url`, `stampit`, `traverse`) sont absents du lock source de la même version.
Le rapprochement ne permet donc pas d’affirmer les versions transitives exactes incorporées dans ce précompilé.
**Ce précompilé est refusé comme entrée fermée de packaging.** Aucun numéro de version de ces trois composants n’est déduit ou inventé.
Les autres précompilés 5.29.0–5.32.0 sondés présentent le même écart ; aucun downgrade n’est retenu.
Le traitement de cet écart et les assets locaux exacts restent à MEP-058 ; l’inventaire source ne décide ni reconstruction ni nouvelle pile.

| Fichier du précompilé contrôlé, refusé pour packaging | SHA-256 observé |
| --- | --- |
| `swagger-ui.css` | `5ed08757e53da3e026d6cbecc61fe5d43585c9560b302d534ad56692519a273d` |
| `swagger-ui-bundle.js` | `e6a898692f2d768e807c3ba4626068a69a2c5dd960dd6c76f3e4d3a3de180af2` |
| `swagger-ui-standalone-preset.js` | `5243d492e14505e0cab87ac8b0195d0e615943e651743b2b698450a46eb470be` |
| `favicon-32x32.png` | `3ed612f41e050ca5e7000cad6f1cbe7e7da39f65fca99c02e99e6591056e5837` |
| `oauth2-redirect.html` | `f3546c5b74b44eac7de5b4193a641b4f23365470c109b490c566bac0de446745` |
| `oauth2-redirect.js` | `a5c8a34e09e49737382cc5019446eec7c3db3461963fc5bfe448361d3c5549e9` |
| `LICENSE` | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` |
| `NOTICE` | `0d20d1adef18aee3f40dd258172155521ce702ac445cb5f7b7d60ed32dad2fb2` |
| `swagger-ui-bundle.js.LICENSE.txt` | `37eb6e7e59aed57b2c1acf076574b818ea07b74265717e0bd67b59e0baf9abbb` |
| `swagger-ui-standalone-preset.js.LICENSE.txt` | `000580e4e2255ea6ccde0c47f6d75e2f703a1931298fde58756793b67c0daed9` |

Les empreintes ci-dessus permettent de reproduire le constat, et ne signifient pas acceptation de ces fichiers pour distribution.
Le package npm déclare `@scarf/scarf=1.4.0` : outil d’installation/télémétrie, pas un fichier JavaScript nécessaire au navigateur.
Ne pas exécuter son postinstall ni l’embarquer comme capacité cible. La collecte n’a exécuté aucun script npm upstream.

## Droits et textes à conserver

Conserver LICENSE Apache-2.0, NOTICE SmartBear, copyrights et toutes les notices embarquées des bundles.
Les tables source enregistrent les licences MIT/Apache/BSD et les autres licences permissives déclarées.
DOMPurify est double licence MPL-2.0 **ou** Apache-2.0 ; la branche Apache-2.0 est disponible sans relicencier le composant.
`argparse` conserve Python-2.0 ; les expressions AND exigent leurs deux textes ; CC0 et Unlicense gardent leurs dédicaces et disclaimers.
Aucune permission de marque ni soutien SmartBear n’est déduit des licences.

Les paquets suivants expriment leur licence par référence plutôt que par un LICENSE racine complet :

| Paquet exact | Preuve du droit et attribution à préserver | Texte à joindre avec ses notices |
| --- | --- | --- |
| @swagger-api/apidom-ns-asyncapi-3 1.14.0 | package.json Apache-2.0 ; dépôt swagger-api/apidom commit 2df4bb6711b18da6001ebc52680e3c625b76a4cd | LICENSES/Apache-2.0.txt upstream et notices du projet |
| agent-base 6.0.2 | texte MIT complet dans README.md, avec attribution | README.md |
| https-proxy-agent 5.0.1 | texte MIT complet dans README.md, avec attribution | README.md |
| format 0.2.2 | Readme.md, Sami Samhuri, référence explicite MIT | texte MIT complet et attribution de ce Readme |
| highlightjs-vue 1.0.0 | README.md, dédicace explicite CC0-1.0 | texte CC0-1.0 et README |
| short-unique-id 5.3.2 | package.json et README.md, Apache-2.0, auteur upstream Jean Lescure | Apache-2.0 complet et mentions originales |
| toggle-selection 1.0.6 | package.json MIT ; README crédits à shvaikalesh ; auteur upstream sudodoki | MIT complet et mentions originales |

Les hashes des preuves embarquées figurent dans les tables. Une déclaration par référence n’est pas un texte à supprimer :
MEP-058/024 devra joindre les termes complets et les attributions, sans réécrire une licence ni supprimer un disclaimer.
En cas de contradiction réelle ou d’attribution non établie lors de l’assemblage, refuser le composant concerné ; aucune dérogation juridique n’est accordée.

## Caddy associé aux assets

Le frontal reste celui du profil : Caddy 2.11.9 Windows AMD64, Apache-2.0,
compilé avec Go 1.27.3 et les [148 modules inventoriés](caddy-modules.md).
`caddy.exe` SHA-256 : `2622e239c79df700b0eb92cbd950d1edee365e155a7859f358f0e55f002df591` ; LICENSE SHA-256 : `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`.
La sonde `version` renvoie v2.11.9 ; `build-info` recoupe le SBOM et les modules.
Le routage SPA/API/admin, TLS local, le pair transport et CSRF restent à éprouver dans les PBI d’intégration ; ils ne sont pas déduits de cette sonde.
