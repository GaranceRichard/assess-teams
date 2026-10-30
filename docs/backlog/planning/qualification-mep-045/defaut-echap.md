# Défaut MEP-045 — Échap répété ferme une note refusée

**Historique initial, corrigé localement le 2026-10-30 : [bilan et preuves](correction/README.md).**

**Issue C : défaut du critère 8 et du refus canonique « navigation perdant une note ».**

SHA : `029857a96b730aaf6357c123b429860f56e445a0` ; 2026-10-29, Codex.
Chromium 153.0.8010.12 / Windows ; 1280×720 CSS, zoom 100 %, clair et sombre.
Ni zoom ni transition de question nécessaires. Aucun défaut global de transition invoqué.

## Reproduction bornée

1. Avec la fixture fictive `taking-fixture`, ouvrir Passation E2E, deux questions vierges.
2. Choisir explicitement 0 à la première question et attendre « Note enregistrée ».
   GET du détail : `[0,null]`.
3. Injecter un refus réel de Django pour le prochain PUT : le navigateur choisit 7,
   la sonde transmet 11 sur cette seule requête de test. Le serveur répond 400 avec erreur de borne.
   Cette injection provoque la branche d’échec ; elle ne signifie pas que l’interface propose 11.
4. Constater la note locale 7, l’erreur accessible et Fermer désactivé.
5. Sans nouvelle sélection ni changement de question, appuyer trois fois sur Échap.
6. Constater la disparition du dialogue, sans validation ni message demandant d’abandonner 7.
7. Recharger, reprendre, revenir à la première question : le curseur indique 0 ; GET reste `[0,null]`.

Attendu : le dialogue reste ouvert et le réessai de 7 disponible tant que la note n’est pas sauvée.
Observé : les deux premiers appuis sont empêchés ; le troisième ferme le dialogue natif.
Le serveur ne perd pas 0 et n’enregistre pas 7 à tort. C’est la protection de la saisie locale qui échoue.

## Preuves

- [Avant : 7 refusé, Fermer indisponible](captures/echap-avant.png).
- [Après le troisième Échap : dialogue fermé](captures/echap-apres.png).
- [Traces](traces.md), lignes `escape-day` et `escape-night` : `attempts=3`, `open=false`,
  GET avant/après reload `[0,null]`, curseur restauré `"0"`.
- [Sonde de régression](sonde-echap.md), deux cas réellement exécutés : **2 failed**.
  Assertion : `unsafe repeated Escape must keep the refused local score available` ;
  attendu `true`, reçu `false`. Ces échecs restent consignés comme tels.

La trace native montre, à chaque thème :

| Appui | `cancel.cancelable` | `defaultPrevented` | Dialogue |
| --- | --- | --- | --- |
| 1 | true | true | Ouvert |
| 2 | true | true | Ouvert |
| 3 | false | false | Fermé ; événement `close` |

L’ordre de remontée des deux derniers callbacks dans le JSON peut différer :
le relevé de `cancel` est différé d’un tour pour observer `defaultPrevented` après React.

## Localisation et correction minimale à proposer

`frontend/src/EvaluationTakingDialog.tsx`, gestionnaire `onCancel` :
`preventDefault()` et garde `!saving && !unsaved` protègent une annulation annulable.
Les événements enregistrés montrent qu’au troisième appui, `cancelable=false` :
ce seul gestionnaire ne suffit plus à empêcher la fermeture native.

Correction minimale candidate, **non développée ici** : intercepter l’action clavier Échap
avant la fermeture native lorsque `saving || unsaved`, empêcher son comportement par défaut,
et conserver la fermeture normale une fois la sauvegarde réussie.
Le propriétaire est le dialogue de passation ; aucune refonte du hook, toast, API,
temporisation ou règle de sauvegarde n’est nécessaire pour cette proposition.
L’implémentation exacte reste à valider par les événements réels du navigateur.

La régression doit échouer sur ce SHA puis passer après correction : Échap répété pendant
attente/refus, réessai disponible et GET correct, fermeture autorisée après succès ; deux thèmes.
Reprendre aussi la seule cellule interrompue du zoom 100/200/100, dans les deux thèmes.
Les gestes protégés déjà verts, Suivant et Fermer, doivent conserver leur comportement.
Aucune correction ni clôture ne doit être déduite de ce dossier avant validation utilisateur.
