# MEP-043 — Mise en œuvre et limites

Accord utilisateur explicite D1–D5 du 2026-10-20, après présentation des décisions.
Branche/worktree existants conservés ; resynchronisation sur main `d24fb35` avant implémentation.
Aucune modification du dossier d’audit MEP-012 ou de son statut dans le registre canonique.

## Garanties implémentées

- `npm run publish` conserve le verrou commun jusqu’à fusion, CI du SHA intégré et synchronisation.
- `-Prepare` publie et valide la PR, sans fusion ; aucun fallback direct-main.
- Le pré-push accepte HEAD vers sa propre branche dédiée et vérifie tout le diff main→candidat.
- Une mise à jour distante doit être fast-forward ; main est intégré par merge après publication.
- CI et plan archivé lient la bonne PR, head, base et merge synthétique ; App/suite du check vérifiées.
- Fusion avec HEAD attendu après lecture des règles effectives sans bypass ; arbre intégré vérifié.
- Checkout principal propre sur main, ascendance et fast-forward seuls, puis dernier rattrapage.

## G05 — Blocage de preuve autorisée

Les lectures API autorisées confirment dépôt public, droits admin et support théorique des rulesets.
La disponibilité effective est démontrée par le ruleset jetable actif et les [refus/chemins verts](server-refusals.md).
`GET /user/installations` refuse toujours avec 403 : le jeton CLI n’est pas autorisé à une GitHub App.
L’inventaire navigateur `cua.getState()` ne présente aucune application ni session navigateur accessible.
Aucun secret n’a été demandé, collecté ou exposé ; aucun droit ou credential créé/révoqué.

Les acteurs visibles restent le propriétaire `GaranceRichard` et GitHub Actions pour la qualité.
Les clés de déploiement et webhooks sont vides dans les lectures datées préparatoires.
Cela ne démontre pas un inventaire exhaustif des Apps, PAT, OAuth et SSH personnels utilisables.
MEP-043 reste Bloqué, date N/A, tant qu’une preuve administrateur/attestation propriétaire précise
ne couvre pas ces catégories, leurs détenteurs et leurs droits effectifs sur ce dépôt.
L’identité CLI actuelle conserve des droits plus larges que la cible de publication ; aucun droit
administratif n’est supposé supprimé par le ruleset ni par la migration du script.

## Validation et livraison

Tests ciblés du publisher et de la garde réelle : 17 réussis, zéro échec.
Les fixtures ne constituent pas une preuve de refus serveur GitHub.
La campagne proportionnée calcule ici un plan exhaustif, car scripts et règles de livraison sont transversaux.
Résultats exhaustifs, CI, activation et refus distants à consigner après exécution, sans résultat anticipé.
Une intégration technique réussie ne clôt pas MEP-043 si G05 reste incomplet.

## Incident de validation locale

La campagne initiale termine à 1 433 succès et un échec de délai sur
`test_critical_conflicts[compatible_admins-production]`, couverture backend 97,48 %.
Après une interruption du poste d’environ deux heures, Python signale un temps restant négatif
`-7030.141 s` pour un délai nominal de 90 s ; le sous-processus termine avec le code 0.
Le cas exact, relancé avec les temporaires isolés canoniques et sans changer son délai,
passe en 4,83 s. Aucun fichier backend ni test métier modifié ; aucune exemption de gate.
Une relance complète du plan au pré-push reste obligatoire avant toute publication de branche.
