# MEP-048 — preuves de correction et conservation

[Rapport consolidé](rapport.md) ; [causes et non-régressions](correction.md).
Campagne du 2026-11-02, Codex ; données uniquement fictives.
Les originaux sont archivés hors des worktrees pour permettre le rapprochement et leur nettoyage.

## Pièces retenues

- Audit initial : backend.txt (46 passés), frontend.txt (27 assertions), e2e.txt (9 passés),
  jeu-fixe.json, recette et empreintes ; résultats liés au SHA initial 2d9b6c3.
- Qualification complémentaire : inputs.json, observations.json, http.json, diagnostics de cadrage,
  captures de rôles/refus/sources, manifeste ; résultats liés au SHA 826cc51.
- Correction : red-final.log (lignes), red-mobile.log (note à x=−554),
  green.log (4 passés), green-final.log (5 passés, pagination comprise), quatre géométries vertes et huit copies de captures avant/après.
- Validation proportionnée : quality-complete.log (correctif final) ; plan et preuves du cache qualité
  conservés séparément des anciens constats, sans transposer leur SHA.

Les premières tentatives de réglage du nombre de Tab ne sont pas utilisées comme preuve rouge.
Les tests mobiles finaux échouent sur le cadrage de la note, pas sur un problème de connexion ou de fixture.
Les rouges de ligne montrent 72/105 px et des hit-tests occultés ; les verts montrent 105/105
et une intersection complète des huit cellules dans les deux thèmes.

## Captures stabilisées retenues

Les noms simples ci-dessous sont des copies identiques des fichiers originaux produits par Playwright.
Après correction, les captures des deux thèmes ont été ouvertes et relues.
Les sources de capture attendent polices, fin d’animation et absence de calque sortant.

| Pièce locale dans mep-048-fix/pieces | SHA-256 |
| --- | --- |

| B01-day-after.png | `637f689c2d2f4be8651f8d49297566aa13a11282b0a253b48016b1cb3d5158d0` |
| B01-day-before.png | `deb5918081470075b6ca17c8fd2eb0a1edc0ee8c5c387558ac898428e294d7f6` |
| B01-night-after.png | `6af5c03596015677f1207bd1d32dd93896e1938e6c0a90bf33e53bc84e7b5f22` |
| B01-night-before.png | `2c2e8cd996d95689a2569579078529696c22e6a8b21289ae2fb26349e6ca5646` |
| B02-day-after.png | `f224257555898928d8469241368a03666938a35ae5d12f9c627d97dc26895195` |
| B02-day-before.png | `68adbb6198a1e80bde1098e24c05235fbf407a8de3976da7b6f5e84e941018b3` |
| B02-night-after.png | `976857c6e76cc71c7cec4ab9c32752955381e903c231348184ee493d89e43973` |
| B02-night-before.png | `e41b87fcc5ad33e8dc87243b6f533986d716b3e603a480610241181cc79a9c62` |

## Disponibilité et intégrité

Archive locale créée et vérifiée : `MEP-048-preuves-20261102.zip` dans le dossier local
`C:/Users/garan/AppData/Local/Temp/assess-teams-mep-048-preuves-20261102`.
Le manifeste SHA-256 de chaque entrée, ainsi que le contrôle du ZIP, accompagnent cette archive.
Les copies originales des rapports avant normalisation des liens y sont conservées.
Les bases SQLite, cookies, runtimes et dépendances installées sont exclus de cette archive de livraison.
Aucun original n’est présenté comme un fichier hébergé ou un artefact CI disponible à distance.

Les références `.cache/...` des rapports historiques désignent les chemins de collecte, pas des liens
Git. Les extraits chiffrés, résultats et empreintes de ce dossier restent consultables dans le dépôt.
Les originaux locaux restent distincts de ces extraits et de l’acceptation MESS.

Archive : **10 255 255 octets**, 259 pièces plus le manifeste.
SHA-256 : b4ce3e38d5124fd9d16f04ecfbbb166ee396d634e3d9ac71f8bf45a552642519.
ZIP contrôlé sans erreur ; chaque entrée correspond à son empreinte du manifeste.
