# MEP-050 — Inventaire des preuves locales

Campagne du 2026-11-03 ; jeux fictifs, Windows / Chromium / Django / SQLite isolés.

Stockage persistant : `C:/Users/garan/Desktop/Projets/Assess-teams-preuves-mep-050`.
Les PNG ne sont pas publiés dans Git ; leurs empreintes et les observations utiles le sont.
Le répertoire `o1` conserve la première correction avant déplacement du message au-dessus du radar.
Le répertoire `final` contient les 32 captures du code final : 24 O1 et 8 collections.

## Relecture visuelle effectuée

- Admin O1 : `390-day-radar.png`, message entier avant le radar, sans série ni case.
- Coach O1 : `1280-night-details.png`, absence explicite, axes conservés et aucune note affichée.
- Viewer O1 : `390-night-details.png`, message entier et aucun CTA de mutation.
- Collections Admin à 390 px : `absence.png`, `filter.png`, `error-500.png` : messages distincts, champ de recherche effaçable et aucun compteur en échec.

Ces six captures finales sont relues individuellement. Les autres sont des captures automatisées,
avec assertions de visibilité, de droits et de contenu ; elles ne sont pas déclarées relues.
Les captures O1 sont prises après accès à la restitution, avec scroll pour lire le message complet.
Les captures collections utilisent des réponses HTTP injectées ; les trois parcours O1 utilisent
les vrais comptes, snapshots et refus API. Aucun test physique ou environnement MESS déduit.

## Empreintes SHA-256

| Pièce relative au stockage | Octets | SHA-256 |
| --- | ---: | --- |
| `red.txt` | 132168 | `6f85caffa8e6da0f1785cbe16efc000c22e68577859b764759337b9e422421d6` |
| `final/empty-collections-collecti-62015-d-injected-errors-at-1280px-chromium/absence.png` | 38077 | `bc2f2d55ae302aaafb31880cfa8ce30998ee4b6fdff08f42c0cf50a49b83008a` |
| `final/empty-collections-collecti-62015-d-injected-errors-at-1280px-chromium/error-403.png` | 37817 | `9eb3aa7296b4191e0344f996d6045fb4917237a7484fce2bd89f4744f1ad8a9f` |
| `final/empty-collections-collecti-62015-d-injected-errors-at-1280px-chromium/error-500.png` | 37817 | `9eb3aa7296b4191e0344f996d6045fb4917237a7484fce2bd89f4744f1ad8a9f` |
| `final/empty-collections-collecti-62015-d-injected-errors-at-1280px-chromium/filter.png` | 39027 | `17d7b950f55335f9fb05f5e4b0f32418dcd6360c6a2e6d8073cc594e493f2eb9` |
| `final/empty-collections-collecti-87699-nd-injected-errors-at-390px-chromium/absence.png` | 32540 | `06980317beb5b1b3717e4792be47619c89da2b0ece101f965d85503c06381416` |
| `final/empty-collections-collecti-87699-nd-injected-errors-at-390px-chromium/error-403.png` | 32433 | `bac4bae2443bf47cea590465cc94e298f8c83c0dcf72ceb804937cc2298adc80` |
| `final/empty-collections-collecti-87699-nd-injected-errors-at-390px-chromium/error-500.png` | 32433 | `bac4bae2443bf47cea590465cc94e298f8c83c0dcf72ceb804937cc2298adc80` |
| `final/empty-collections-collecti-87699-nd-injected-errors-at-390px-chromium/filter.png` | 33323 | `e08b6c5fb511893f3a7651b4b5f811c20d67d807fad89767476bd027e1da559d` |
| `final/empty-states-Admin-real-ex-e7729-y-series-and-preserve-scope-chromium/1280-day-details.png` | 57075 | `a82b8253f5875f733df44f0388a0781f1010fdf05f12f9c04949436a31d13bc5` |
| `final/empty-states-Admin-real-ex-e7729-y-series-and-preserve-scope-chromium/1280-day-radar.png` | 68335 | `5c91f16b5b1d50dfb698c4e6f7b0dad2e90c3f8708dc36cd026e992ad0a32a30` |
| `final/empty-states-Admin-real-ex-e7729-y-series-and-preserve-scope-chromium/1280-night-details.png` | 57598 | `152b5cb491d8442d014476b24294eaa666b9f4cdd244b9c7b14969039920e580` |
| `final/empty-states-Admin-real-ex-e7729-y-series-and-preserve-scope-chromium/1280-night-radar.png` | 70176 | `a3c3a459621e661f17e35d459e3d9ea22ea413dd778d334ab12540355623c05c` |
| `final/empty-states-Admin-real-ex-e7729-y-series-and-preserve-scope-chromium/390-day-details.png` | 27542 | `34b77b64df43bf9a61b58f38b6d31d7fa92fefc294b49e204947abbf8c51ec32` |
| `final/empty-states-Admin-real-ex-e7729-y-series-and-preserve-scope-chromium/390-day-radar.png` | 32697 | `61eea6effd6563feca0e33bf400680798d276e072d7231d87eb6d5b9fe28d759` |
| `final/empty-states-Admin-real-ex-e7729-y-series-and-preserve-scope-chromium/390-night-details.png` | 28732 | `65256a1bb3670468603a1406867775a37b02cfaecbd72cb13cebc8b9103b0575` |
| `final/empty-states-Admin-real-ex-e7729-y-series-and-preserve-scope-chromium/390-night-radar.png` | 36509 | `9dc9ba2b7c0f1fb7e2bf6d6f90cb435b57e507735acee2152631a7b0f8357038` |
| `final/empty-states-Coach-real-ex-491e5-y-series-and-preserve-scope-chromium/1280-day-details.png` | 47968 | `9e8baa2895ca154349c47e6fbbe7ed28c9ae300e60263587cb2b6f8e2aabddec` |
| `final/empty-states-Coach-real-ex-491e5-y-series-and-preserve-scope-chromium/1280-day-radar.png` | 58818 | `0ca1fc5ca43aaf658ec5cd0cd22bd5e447b28d9ef571611e9201ae93d19f843e` |
| `final/empty-states-Coach-real-ex-491e5-y-series-and-preserve-scope-chromium/1280-night-details.png` | 48755 | `d43e70daa1d85bb4710d87a67e94773014be7937b8057988b740727df9d9f7c3` |
| `final/empty-states-Coach-real-ex-491e5-y-series-and-preserve-scope-chromium/1280-night-radar.png` | 60947 | `e3c3759c1ed367bac4e6650c62f94357d886a266de1101d002ee050b75170239` |
| `final/empty-states-Coach-real-ex-491e5-y-series-and-preserve-scope-chromium/390-day-details.png` | 27500 | `c761b0a75ac12f9f28308a146e00260dcd124f0be04e0749961dce6659a109e5` |
| `final/empty-states-Coach-real-ex-491e5-y-series-and-preserve-scope-chromium/390-day-radar.png` | 32662 | `4cfed8684065f2ec89f19d3196cbb534e44ae81947ce989eb20ca76fb057dc12` |
| `final/empty-states-Coach-real-ex-491e5-y-series-and-preserve-scope-chromium/390-night-details.png` | 28603 | `a3dcc327d87257564fc72b0a11e4dbcea047ff3d6bc39c8a16fcea7fcaca9a77` |
| `final/empty-states-Coach-real-ex-491e5-y-series-and-preserve-scope-chromium/390-night-radar.png` | 36382 | `cee5945227abde6768553a73652caa6e4ebc226e54cfe816de6fdeb1fc08e5e7` |
| `final/empty-states-Viewer-real-e-50f15-y-series-and-preserve-scope-chromium/1280-day-details.png` | 45296 | `e2307f9b8fca6ad932c553b1f04adcc29a7fa5efab73f9652894c17ed9561c59` |
| `final/empty-states-Viewer-real-e-50f15-y-series-and-preserve-scope-chromium/1280-day-radar.png` | 56098 | `91622096ce856fa0a887a70884def7657f6d6852da58495e14d22a2ef9637495` |
| `final/empty-states-Viewer-real-e-50f15-y-series-and-preserve-scope-chromium/1280-night-details.png` | 46140 | `778a629725fb88957bf30d4ee2773ff1a240ef17810edab6e7f956be8e2c3cc8` |
| `final/empty-states-Viewer-real-e-50f15-y-series-and-preserve-scope-chromium/1280-night-radar.png` | 58317 | `3150e71aa3b88270178eac871b8b5881b95c10dbf694ddea199175fba0bddd3a` |
| `final/empty-states-Viewer-real-e-50f15-y-series-and-preserve-scope-chromium/390-day-details.png` | 27469 | `6aa928f88a886f1c2c046b5088805743070b63b3449cefdd8ef9738fee3e4959` |
| `final/empty-states-Viewer-real-e-50f15-y-series-and-preserve-scope-chromium/390-day-radar.png` | 32647 | `9382f77c93f2a324a695ef034ed394009c1d23c17376af8133f43cf736244290` |
| `final/empty-states-Viewer-real-e-50f15-y-series-and-preserve-scope-chromium/390-night-details.png` | 28612 | `1ffc9f85348069a325f1cb65b1f5eb99431a11c60f323215cda01d71d3615ab5` |
| `final/empty-states-Viewer-real-e-50f15-y-series-and-preserve-scope-chromium/390-night-radar.png` | 36426 | `773a8bd745482b00d9fd83c5c90a8eb850296c4153e55d2353aeda73704e00fc` |
| `validation-frontend-static.json` | 221 | `9637be5b8970c79189e03355097f6e08ba6629bf4503db3e44c7e3c240d6c095` |
| `validation-frontend-targeted.json` | 223 | `5fb8ac07b608aa5970d237ab3312c83070bc1554399e2f63496c27eefefcebb6` |
| `validation-e2e.json` | 209 | `bafb0ea567c70d0169aae0a172041f0d859c107c2efadd09e4148ae5655c363c` |
| `validation-metrics.jsonl` | 9027 | `483b3d6526280ab2ee27d9960fd508f8d7c9227eeebe4b6023502a3c19d624e8` |
| `validation-plan.json` | 7611 | `53525821830eb5408c1d79de41f4e9ea74c6a5db327dbb0bf3ac2276df3bf908` |

Les fichiers `validation-*` figent le plan, les preuves locales par scope et le journal des
passages (relances comprises). Le dernier passage termine avec les quatre scopes requis
conformes ; ils ne constituent pas une qualification MESS ni un remplacement de la CI.
