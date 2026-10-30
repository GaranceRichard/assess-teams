# Validation du correctif MEP-045

2026-10-30, Codex ; base `029857a96b730aaf6357c123b429860f56e445a0`.
[Qualification initiale](validations-initiales.md) conservée avec son contexte du 2026-10-29.
Ce bilan porte sur le correctif et le dossier préparés pour revue avant publication.

## Contrôles ciblés exécutés

| Contrôle | Commande / résultat |
| --- | --- |
| Deux tests exacts initiaux avant | `test:e2e -- mep045-escape.spec.ts` : code 1, 2 failed sur le dernier main |
| Comparaison après correction | `test:e2e -- mep045-escape.spec.ts evaluation-taking-escape.spec.ts` : code 0, 4 passed |
| Version permanente finale avant / après | `test:e2e -- evaluation-taking-escape.spec.ts` : 2 failed avant, puis code 0, 2 passed après ; sorties séparées conservées |
| Zoom natif | `test:e2e -- --config .cache/mep045-zoom.config.ts --output ../.cache/mep-045/zoom-fixed-results --max-failures=1` : code 0, 1 passed, 18 cellules clair/sombre × 100/200/100 × trois états |
| Formatage des fichiers applicatifs modifiés | Prettier `--check` : code 0 |

Tests ciblés avec backend 29220, frontend 29221 et `ASSESS_E2E_DB=backend/.cache/e2e.sqlite3`.
Les snapshots de données ne contiennent aucune identité réelle, cookie ou credential.
Le rejet HTTP est réel : intention locale 7, injection de 11 sur une requête de test, Django répond 400.
Le réessai normal envoie 7 et reçoit 204 ; les lectures GET vérifient l’effet persistant.

## Gates obligatoires

`quality:targeted -- --plan` exige **repository, backend, frontend, e2e**, à cause des captures PNG
non cartographiées. Le composant nécessite également ses tests liés et les parcours conservateurs.
Aucune modification du classificateur ni contournement de gate n’est effectué.
`npm.cmd run quality:targeted` : **code 0**, quatre domaines verts ; [résultats effectifs](correction/gates.md).
Un premier contrôle a détecté README à 202 lignes : l’annonce a été replacée dans son paragraphe
de périmètre existant ; le fichier conserve 200 lignes sans suppression de contenu.
Aucun résultat d’un run interrompu n’est revendiqué comme réussite.

## Revue DoD et documentaire

- Huit critères fonctionnels conformes selon [la matrice actualisée](README.md).
- Correctif limité à un gestionnaire clavier dans le dialogue ; deux tests E2E permanents.
- Les deux régressions initiales et les deux tests permanents échouent avant et passent après.
- Attente/refus, cinq appuis, réessai, GET=7, focus, fermeture volontaire et snapshot de sortie vérifiés.
- Zoom natif clair/sombre repris ; aucune cellule fonctionnelle requise ne reste non démontrée.
- README annoncé avant correction ; règles agents, charte, DoD, stratégie, fondamentaux,
  backend-api et contrat de passation relus ; README, contrat de passation et ce dossier sont affectés.
- API, règles métier, modèles, migrations, persistance, styles et messages inchangés.
- Les preuves des sept critères conformes sont conservées avec leur SHA/date, pas réexécutées
  volontairement ; les tests des gates imposés sont indépendants.
- Les seuils de couverture, lint, formatage, build, sécurité et limite 200 lignes restent bloquants.
- Publication et CI du commit exact : non exécutées, présentation du diff demandée avant publication.
- Statut canonique inchangé ; verdict de clôture soumis à validation.

## Bilan final local

Les quatre gates obligatoires sont verts : 1 456 backend (couverture 97,50 %),
443 frontend (94,38 % statements, 92,90 % branches, 95,81 % fonctions, 95,26 % lignes),
111 E2E application et 10 E2E démo. Lint, formatage, build et migrations conformes.
Aucun écart fonctionnel résiduel identifié sur les huit critères.
Clôture proposée, sous validation du verdict ; publication et CI du commit exact différées
par instruction utilisateur. Le statut canonique reste inchangé.
