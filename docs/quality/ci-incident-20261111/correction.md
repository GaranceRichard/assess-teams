# Correction de l’orchestration SQLite

## Défaut corrigé dans le test

L’ancien protocole démarrait le SQL concurrent sous un verrou détenu, observait 30 ms
sans réponse, puis demandait au détenteur de continuer. Il exigeait deux 201, sans pouvoir
garantir le commit du détenteur avant les 100 ms concurrentes. Aucune API ne doit être
modifiée pour satisfaire cette précondition temporelle du test.

## Nouveau passage de relais observable

1. Le premier pair écrit équipe et Journal dans sa transaction réelle, puis émet `written`.
2. Le second démarre sa vraie requête HTTP, entre dans le bloc atomique et atteint la première
   écriture. Il émet `write_attempt`, puis `write_parked`, et attend `continue` **avant le SQL natif**.
3. Le parent observe `write_parked` et l’absence de réponse ; il autorise le détenteur à finir.
4. Le parent exige le premier 201, émis après retour de la requête et de son commit.
5. Il autorise ensuite le SQL du concurrent, exige son 201 et les mêmes invariants durables.

Les deux requêtes se chevauchent et le concurrent est suspendu dans sa transaction, mais
son UPDATE natif intervient après le commit observé. Ce cas qualifie un **passage de relais**,
pas une mesure d’attente native réussie dans le busy handler. Aucune affirmation contraire.
La contention native avec refus reste exercée sans cette suspension dans `apis_timeout` ;
les probes `test_sqlite_contention` conservent leurs scénarios natifs d’attente et de refus.

Le contrôle temporel `poll(0.03)` est remplacé par une barrière explicite et `poll()` sans délai.
Les assertions HTTP 201/500, message/corrélation du refus, transactions, données, Journal,
intégrité et clés étrangères sont conservées. `elapsed < 5`, busy_timeout 100 ms, Pipes 15 s,
joins et limite du sous-processus 60 s sont inchangés. Aucun délai ou retry ajouté.

## Non-régression rouge puis verte

`apis_release_handoff` enveloppe seulement les Pipes du parent, avec les vrais pairs/API/SQL.
Le parent adversarial refuse de reprendre le détenteur sans événement `write_parked` observé,
puis refuse de reprendre le concurrent sans premier résultat 201 observé.
La fonction `apis` elle-même est celle utilisée par le scénario normal, sans double implémentation.
Une régression vers le protocole précédent échoue ainsi sans dépendre de la vitesse de l’hôte.
La matrice passe de 22 à 24 cas, toujours dans development et production.

| Environnement d’exécution | Avant correction | Après correction |
| --- | --- | --- |
| Windows / Python 3.12 | 2 échecs : `Holder resumed before contender was parked` ; 17,41 s | 2 passés ; 9,48 s |
| Linux / Python 3.13.18 | 2 échecs, même assertion ; 13,87 s | 2 passés ; 7,74 s |

Les tests rouges contiennent la nouvelle non-régression et l’ancien corps de `apis`/hook SQL ;
les tests verts utilisent exactement la même non-régression et uniquement le nouveau protocole.
Le refus d’accès initial au temporaire pytest partagé sous Windows est un échec de préparation,
consigné séparément ; il n’est pas compté comme preuve rouge. Le test réel utilise son cache dédié.
Les logs complets sont sous `.cache/ci-incident-20261111/`, série Linux sous `correction/`.
Les [cinq séries bornées, résultats individuels et empreintes](preuves-correction.md) totalisent
30 cas passés. Les gates sont consolidés dans [la validation](validation.md).

## Risques résiduels

L’ordonnancement, le disque et les timeouts des autres scénarios ne sont pas requalifiés par
cette seule correction. Les gardes existantes continuent de signaler un ralentissement excessif.
Aucune couverture de panne DNS générale ni capacité MESS n’est déduite des campagnes.
La cause de l’échec SQLite historique du 11 demeure indéterminée, même après preuve rouge/verte.
