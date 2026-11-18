# C2 — Réconciliation intégrée MEP-058 après C1

[Provenance historique et pré-remises](provenance.md) · [qualification](qualification.md).

## Préparation du changement — 2026-11-18

- Périmètre : reconstruire le candidat frontend sur MEP-021, C1 et C2 intégrés, en conservant les archives historiques et les pré-remises indépendantes.
- Objectif : enregistrer les entrées réellement consommées par le protocole C1, dont son helper Python et son exemple public de configuration, avant qualification du nouveau candidat.
- Effets attendus : ajouter ces deux sources publiques et le test C1 aux empreintes, refuser leur modification non commitée et produire une remise distincte intégralement vérifiée.
- Risques : conserver sans réécriture le protocole C1 publié, les licences et le chargeur MEP-021 ; exclure les documents privés générés, secrets, wheelhouse et runtime Python du payload.
- Vérification : contre-épreuves des nouvelles entrées, deux reconstructions frontend/Swagger, archives relues, refus du vérificateur, dix tests C1 et navigateur sans réseau externe ; pré-push et CI exacts restent bloquants.
- Fichier : `scripts/distribution/frontend-artifact.mjs`
- Fichier : `scripts/distribution/verify.test.mjs`

C1 publié : `6a81c98134a7a6bfe2a16b223b1e560a0541f5ec`, CI verte
[44224685614](https://github.com/GaranceRichard/assess-teams/actions/runs/44224685614).
Le protocole importe `backend/tests/installation_helpers.py`, qui lit le bloc JSON de
`docs/operations/configuration/unique-examples.md`. Ces entrées publiques doivent être hachées ;
la configuration privée temporaire, ses clés et sa base ne sont jamais distribuées.
Le test `scripts/distribution/offline-test.test.mjs` fait désormais partie des outils de qualification.

La première publication C2 n'a pas poussé : le pré-push a refusé un timeout multiprocessus,
avec 1 757 tests backend réussis sur 1 758. La campagne locale antérieure était entièrement verte.
Le timeout sera vérifié de façon ciblée, puis la campagne imposée sera rejouée en pré-push,
sans augmentation de délai ni modification des tests applicatifs ou de la politique qualité.
Les pré-remises `13cc0f505edf` et `5850929cac88` restent des preuves indépendantes non qualifiées
par le protocole C1. Leurs ZIP et empreintes ne seront pas réécrits.


## Résultats intégrés du 2026-11-18

Sources et outils : `b58a5925b718db0b9948c065d45f257fc42c8be5`, descendant de C1 publié et vert.
Les deux nouveaux refus échouent avant correction et passent après ; les 19 acceptations/refus
passent sur le candidat reconstruit. Les dix tests C1 passent sans modification du protocole publié.
Le scénario SQLite antérieurement expiré passe en 6,18 secondes dans un temporaire C2 neuf,
sans augmentation de délai ; le premier rejeu avait été bloqué par l'ACL du temporaire pytest global.

Deux compilations Swagger et deux builds normaux TypeScript/Vite sont reconstruits sur ces sources.
Les 114 archives sont contrôlées par SHA-256/SRI et comparées aux fichiers installés, notices incluses.
Le manifeste identifie 493 sources et huit outils : helper public, exemple JSON public et test C1 ajoutés.
Les fichiers privés temporaires sont nettoyés par C1 et ne figurent jamais dans le payload.
La version reste 0.0.0 : neuf frontend, 186 statiques/inventaire/notices, trois rapports,
soit 198 fichiers contrôlés plus manifest.json, exactement 199 entrées dans chacun des deux ZIP relus.

| Pièce réelle du candidat intégré A | SHA-256 |
| --- | --- |
| ZIP, 1259614 octets | 9f43b0943d40c46414bc97e1f092367518bf123ce044a85ac727dc1e102da7e2 |
| manifest.json | 22a44234d8bd89f8b7e7ca23b52aecc5f597953e82568e5fdf2a58b85f951833 |
| payloadSha256 | b346cf4d27d542f689cb6bdd0aaf930b8aa5b880deceeb59d76c5f3908402cb7 |

La répétition B possède le payload `3c1a800acb13268dac2250bde206278291cb4925fbac59bef39e92dbd28a5be4`
et le ZIP `1c697335f3ef2b24c9c2842bb10ae17906825474490ff03b01c04510e22cd8e0`.
Les ressources exécutables et toutes les notices sont identiques entre répétitions et à l'archive historique.
Seuls bundle-stats.json et standalone-stats.json diffèrent sur issuer, issuerName et issuerPath ;
une comparaison récursive sans ces seuls diagnostics donne des rapports identiques.
Les rapports restent intégraux ; aucune identité binaire des ZIP complets n'est revendiquée.
Les écarts avec l'archive historique portent sur ces diagnostics et sur les métadonnées de provenance,
notamment MEP-021, C1 et C3. Son ZIP historique e376f7d6… conserve son empreinte originale.

Le protocole C1 réussit sur A et B : Chromium 153.0.8010.12,
26 URL locales chacun, réseau externe bloqué, zéro tentative externe, erreur JavaScript ou requête échouée.
Les routes anonymes, l'invitation invalide, les mentions légales, Swagger et son schéma Django réel chargent.
Les ressources/API absentes restent en 404 ; url/configUrl distants n'altèrent pas le schéma local.
Aucun Vite, npm, compilation, téléchargement ou CDN ne sert les ressources du candidat.
Node et Python exécutent seulement la sonde sur le poste de préparation, pas un service cible distribué.
La qualification reste statique/anonyme ; elle ne remplace ni les E2E applicatifs ni le site MESS.

## Revue de contenu et livraison

La préparation a réellement précédé les corrections C2 ; elle porte le contrat de provenance concerné.
Les fichiers C1, le chargeur, le wheelhouse et les travaux C3 restent inchangés ; aucun statut canonique modifié.
README produit, règles agents, charte, DoD, tests, fondamentaux et API ont été revus : aucune capacité publique,
API, permission ou migration changée ; les preuves d'exploitation complètent leurs documents propriétaires.
Le plan local impose repository/backend/frontend/E2E ; il sera exécuté en pré-push, puis indépendamment en CI.
La réussite du protocole ci-dessus ne constitue pas un succès anticipé du pré-push ou de la publication.
La remise hors checkout et les preuves des gates/CI du SHA publié seront fournies après leurs verdicts.
I01 reste ouverte selon C3 ; I02 est traitée pour ces octets reconstruits, le précompilé reste refusé ;
I03 reste ouverte pour Windows Server 2022, TLS, services, collecte des statiques et site MESS.
MEP-058 ne sera pas clôturé sans décision fonctionnelle explicite.
