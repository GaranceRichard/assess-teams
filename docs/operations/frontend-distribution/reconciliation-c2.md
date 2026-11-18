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
