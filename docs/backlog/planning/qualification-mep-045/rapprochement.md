# MEP-045 — Rapprochement des deux worktrees

Le 2026-10-31, rapprochement demandé par l’utilisateur entre la qualification initiale
(branch `qualification/mep-045`, base `029857a`) et le correctif (`fix/mep-045-escape`, `08d0263`).
Le second worktree porte le dossier consolidé, puis la clôture documentaire.

## Comparaison des preuves

- 24 fichiers initiaux comparés : 20 identiques octet par octet, dont les dix captures.
- `defaut-echap.md` : seul un bandeau de renvoi au correctif est ajouté, avec normalisation du BOM.
- `visuel.md` : historique conservé, renvoi ajouté vers la reprise des seules cellules Échap/zoom.
- README initial conservé dans [qualification-initiale.md](qualification-initiale.md), avec le lien
  vers les validations initiales corrigé et normalisation du BOM ; nouveau bilan dans [README.md](README.md).
- Validations initiales identiques après normalisation BOM/CRLF dans [validations-initiales.md](validations-initiales.md) ;
  bilan du correctif dans [validations.md](validations.md).
- Aucun commit propre à la branche initiale, aucun autre fichier non ignoré ni test MEP-045 supplémentaire.

## Conservation locale avant nettoyage

Les fichiers du dossier initial et son cache ont été archivés sans écrasement, puis comparés par SHA256 : 922 fichiers vérifiés.
Archive locale : `Assess-teams-mep-045-archive-20261031.zip`, dans le répertoire temporaire utilisateur,
hors des deux worktrees ; empreinte SHA256 :

`665d05f9212671954cde2f853e249e10b789845f2be13d59f059c01298567f2d`

Cette archive de travail n’est pas nécessaire pour consulter les preuves versionnées.
Le nettoyage des deux seuls worktrees MEP-045 intervient après publication documentaire et CI verte.
Aucune qualification générale ni modification des sept autres comportements n’est réalisée.
