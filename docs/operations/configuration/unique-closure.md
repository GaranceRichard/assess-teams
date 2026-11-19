# MEP-021 — Clôture fonctionnelle approuvée — 2026-11-19

[Contrat MEP-054](unique-contract.md) · [réalisation et historique](unique-loading.md) ·
[registre canonique E03](../../backlog/tracking/mess-e03.md) · [source](../../backlog/source/mess/f10.md).

## Décision du responsable produit

Le 19 novembre 2026, le responsable produit approuve explicitement la clôture de
**MEP-021 — Charger et valider la configuration unique**, sur la base des preuves présentées,
et demande l'enregistrement de cette décision avec la date de réalisation **2026-11-19**.
Seul ce PBI passe de Ouvert/N/A à Réalisé ; aucune clôture d'un autre PBI n'est déduite.

Qualification sans correction sur `c14e60cf26885e10f7acaf699d4bd521657f2e96` : implémentation
`c1b4d0c`, correction du harnais `fa5822491ff5e5a41f33d34285eca35882d95850`, intégrées dans main.
Aucun écart démontré au contrat canonique ; aucune nouvelle modification applicative nécessaire.

## Critères et vrais refus vérifiés

| Critère | Preuve permanente existante | Verdict / écart |
| --- | --- | --- |
| Source commune | `test_installation_processes.py` : WSGI, ASGI, alias, commandes et trois workers ; fichier/base/valeurs communs depuis un autre cwd | Conforme / aucun |
| Validation avant effet | `test_installation_contract.py`, `test_installation_processes.py` : champs absents, version inconnue, valeurs invalides, application partielle refusés ; sentinelles DB/réseau/FS, base existante inchangée | Conforme / aucun |
| Sources concurrentes | `test_installation_contract.py` : présence des 18 variables historiques refusée même vide ; processus réel refusant une origine concurrente identique | Conforme / aucun |
| Confidentialité | Contrat/processus/startup : JSON illisible/invalide et secrets absents/faibles refusés sans contenu privé ; aucune exportation de secret dans l'environnement | Conforme / aucun |
| Consommateurs compatibles | Processus/workers, protections startup/HTTP/SMTP/SQLite/journaux, développement/test et `test_swagger_local_assets.py` | Conforme / aucun |

Le schéma embarqué est identique au bloc MEP-054. Chemins normalisés depuis le parent du fichier,
collisions et destinations interdites refusées. Invariants SQLite, HTTP/TLS, SMTP et journaux conservés.
Swagger utilise les ressources locales MEP-058. Aucun service, sauvegarde, purge ou ordonnanceur créé.

## Preuves réutilisées

[Campagne exhaustive GitHub réussie, run 44445399152](https://github.com/GaranceRichard/assess-teams/actions/runs/44445399152),
SHA `ad6a4d79d3e60917ea17997c0033ccd584229a75`, artefact `qualification.json` : success/exhaustive=true.
Rapports JUnit des dix partitions relus : **1 771 tests backend**, aucun échec/erreur/saut,
couverture lignes **98,12 %** ; **150 cas MEP-021** (76 contrat, 32 chemins, 36 processus, 6 workers).
Frontend : **510 tests**, couverture lignes **95,81 %** ; **155 E2E applicatifs et 10 démo**,
chacun exécuté une fois ; statiques, migrations, build et agrégation réussis.
Seul AGENTS.md diffère de ce SHA jusqu'au SHA qualifié `c14e60c` ; sources applicatives inchangées.
[CI documentaire du SHA qualifié réussie](https://github.com/GaranceRichard/assess-teams/actions/runs/44446171810).
Ces preuves restent attachées à leurs SHA et environnements ; aucune qualification exhaustive du futur SHA de clôture n'est revendiquée.

## Portée de l'enregistrement et revue documentaire

Le lot enregistre l'approbation, aligne registre/vues/décomptes et retire les attentes désormais satisfaites
chez les consommateurs directs. Leurs statuts, dates, critères et dépendances fonctionnelles sont conservés.
Indicateurs : global 63/96 (66 %), MESS 35/62 (56 %), E03 5/19 (26 %), FEAT-058 2/2 (100 %).
MEP-023/056/064 deviennent prêts ; MEP-024 attend encore MEP-058 et MEP-060 attend MEP-024.

Revue README, règles agents, charte, DoD, stratégie, architecture et API : aucun impact sur les capacités
publiques, les contrats ou l'installation exposée ; aucune modification technique ni préalable technique à ajouter.
Plan : cohérence des 96 statuts/dates, décomptes, vues et liens, puis gates documentaires du diff réel.
Tests backend/frontend/E2E, couverture, migrations et build supplémentaires non applicables à ce lot de prose.
Publication par `npm run publish`, pré-push bloquant, CI indépendante du SHA exact et synchronisation sûre requis.

Les limites de recette réelle sont conservées : ACL/compte effectif, nature du stockage, certificats et
confiance TLS/SMTP, relais, routage et service des statiques sur site. Aucun site MESS ni GO qualifié ici.

## Contrôles de l'enregistrement

Contrôle documentaire ciblé réussi : seule transition/date MEP-021 parmi 96 entrées,
62 statuts/dates MESS alignés, 33 aptitudes non réalisées et 368 liens locaux vérifiés.
Les 13 documents respectent 200 lignes ; critères/refus/dépendances F10 inchangés.
`git diff --check` et `npm run quality:targeted` : PASS, documentation seule, zéro échec.
Les résultats du pré-push et de la CI du SHA publié sont fournis dans la remise de publication.