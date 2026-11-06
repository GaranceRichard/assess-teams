# MEP-012 — Qualification documentaire et proposition C06

Dossier du **2026-11-06**, base `62fb3ab` ; branche `docs/mep-012-qualification`,
worktree `C:\Users\garan\Desktop\Projets\Assess-teams-MEP-012`.
**Proposition non approuvée : C06 ouvert ; MEP-012 Bloqué, date N/A.**
La publication de ce dossier ne vaut ni approbation C06 ni clôture du PBI.

## Périmètre et autorité

- [Matrice critère initial → décision → preuve → traitement](reconciliation.md).
- [Proposition motivée C06, effets et refus](proposition-c06.md).
- [Source F04](../../backlog/source/mess/f04.md),
  [fiche d’audit du 27 octobre](../../backlog/planning/audit-20261027/fiches/MEP-012.md),
  [registre canonique](../../backlog/tracking/mess-e01.md).
- [Audit du 20 octobre](README.md), [décision du 21 et clôture MEP-043](../mep-043/closure.md),
  [circuit CI applicable](../ci.md).

Réutilisation des preuves versionnées, sans nouvel audit Apps ni essai destructif.
Aucun code applicatif, workflow, ruleset ou protection GitHub modifié ; aucune PR créée.
Les règles effectives sont relues en lecture seule par `publish` avant le push.
Ce dossier distingue les constats datés de la configuration courante : il ne transforme
pas une preuve du 21 octobre en attestation distante du 6 novembre.

## Résultat de l’examen

L’audit initial refuse légitimement la conformité au 20 octobre. La décision du 21 octobre
révise le périmètre de MEP-043 : push direct, intégrité main, pré-push bloquant et CI après intégration.
Elle accepte l’absence de barrière CI serveur, les pouvoirs du propriétaire et G05 non vérifié.
La phrase « MEP-012 reste clôturée » de la clôture 043 contredit le registre Bloqué/N/A.
La source F04 et C06 dans l’audit du 27 octobre maintiennent explicitement cette décision de suivi ouverte.
Aucune de ces pièces ne permet à l’agent de choisir seul une date ou de déclarer MEP-012 Réalisé.

## Qualification des scénarios demandés

| Scénario / état initial | Examen / résultat observé | Verdict |
| --- | --- | --- |
| 1 — critères initiaux et décision disponibles | Chaque exigence et G01–G05 rattachés aux preuves et décisions dans la matrice ; historique conservé | Réconciliation préparée |
| 2 — circuit publish approuvé | Serveur : intégrité main ; client : pré-push ; après intégration : CI indépendante ; limites explicites | Distinction démontrée par les pièces existantes |
| 3 — C06 explicitement approuvé | Précondition absente ; modifications canoniques décrites dans la proposition, sans les appliquer | En attente de validation humaine |
| 4 — C06 absent | Source, registre, date et indicateurs inchangés ; Bloqué/N/A maintenu malgré 043 réalisé | Refus de clôture observé |

Preuve manquante ou exigence initiale non satisfaite et non révisée : même refus de clôture.
G05 est une réserve déjà acceptée, pas une nouvelle exigence bloquante.

## Revue documentaire et DoD applicable

README, AGENTS/règles, charte, DoD, stratégie de tests, architecture et contrat API relus.
Impact : README d’orientation, ce dossier et lien préparatoire dans la fiche analytique.
Audit initial et dossier 043 conservés intégralement ; aucun statut canonique modifié.
La contradiction de clôture est explicitée ici, sans réécriture des pièces historiques.

Tests applicatifs, couvertures, lint applicatif, build/typecheck, migrations, OpenAPI et E2E :
non applicables à ce diff de prose ; aucune entrée applicative modifiée.
Les acquis techniques nommés dans la matrice restent des preuves historiques, pas une nouvelle campagne.
Les contrôles frais requis sont documentaires : lignes ≤ 200, secrets, cohérence, structure et README.
Validation locale par `npm run quality:targeted`, puis commit et `npm run publish` :
pré-push documentaire bloquant, CI indépendante `quality.yml` de l’événement push sur le SHA exact,
main principal propre et avancé en fast-forward. Un échec applicable interdit le succès de livraison.
Le SHA final et son URL CI sont fournis dans le compte rendu après publication ; aucun résultat anticipé.
Cette qualification documentaire ne constitue ni qualification exhaustive ni promotion MESS.

## Conservation

Le dossier est versionné dans main avant nettoyage du seul chantier MEP-012.
MEP-018 et MEP-051 restent hors périmètre : ni modification, ni nettoyage de leurs branches/worktrees.
La décision C06 et son éventuelle application feront l’objet d’un lot documentaire distinct après approbation.

## Vérifications locales du 6 novembre

`npm run quality:targeted` : succès, 0 échec ; seul scope documentation requis.
`git diff --check` : succès ; liens Markdown locaux des cinq fichiers du lot : cibles présentes.
Aucun diff dans la source F04, les registres/vues/jalon ou les dossiers historiques MEP-012/043.
Les nouveaux fichiers sont sous 200 lignes ; README conserve exactement 200 lignes.
La clôture du PBI reste refusée faute de C06, indépendamment du succès de ces contrôles.
