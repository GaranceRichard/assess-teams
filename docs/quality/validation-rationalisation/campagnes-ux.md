# Campagnes UX : reconstruction et limites

## Sources et méthode

Deux journaux locaux `~/.codex/sessions/2026/10/27/rollout-*.jsonl` :
`01a17d11-e851-7770-9beb-c0e5a7f7ca6c` (transitions initiales) et
`01a17f4f-b09d-75b2-b5a2-3a72a2eaf728` (continuité corrigée).
Les agents de revue automatique, le backlog et le chantier Résultats archivés sont exclus du comptage.
Les [observations expurgées](ux-observations.md) conservent heures UTC d'observation et métriques.
Les heures ci-dessous sont celles des commandes en America/Toronto (UTC−4 à ces dates).
Les suites imprimées à nouveau par `Select-String` sont dédupliquées ; les `[RUN]` des fixtures des
tests de politique ne prouvent pas une exécution pytest réelle. Un essai de publication n'est pas un run.

Les fichiers `.cache` des worktrees UX nettoyés et les snapshots de runtime antérieurs ne sont plus
disponibles. Les traces sont partielles ; aucune durée de commande entière n'est reconstruite depuis
une pause de conversation. [Recette](../ux-transitions/recette-correctif.md),
[mesures initiales](../ux-transitions/mesures.md) et historique Git complètent les observations.

## Campagnes identifiables

`F` = repository + backend complet + frontend complet + E2E application/démo.
« Atteint E2E » implique un backend réussi dans ce runner séquentiel qui s'arrête au premier scope rouge ;
ce statut est une inférence explicite lorsqu'aucun résumé pytest n'est conservé.
Une durée pytest n'inclut ni statiques ni empreintes. `Q` renvoie aux justifications du tableau suivant.

| ID / commande locale | Déclencheur et plan retenu | Contrôles / résultat observable | Preuves antérieures et invalidation | Coût observable | Plan suffisant / oracles |
| --- | --- | --- | --- | --- | --- |
| I0 — 27/10 07:26, quality-transitions.log | Première animation, vidéo et helper ; F | Repository rouge : README 202 lignes ; aucun pytest réel démontré | Pas de preuve recevable pour ce gate | Non mesuré | Repository corrige le refus ; pas de suite applicative à compter |
| I1 — 27/10 07:28, quality-transitions-final.log | Rendu, tests et vidéo ; F via vidéo/helper inconnus | 1 444 pytest verts ; frontend puis E2E | Preuve initiale absente ; pas de clé historique complète | Pytest 1 566,10 s ; frontend 128,607 s via métrique | Repository, statiques/related, E2E entiers ; Q1/Q2 |
| I2 — 27/10 08:11, quality-transitions-resynced.log | Rebase sur e957c09, correctif curseur CSS/test et nouveaux éléments UX ; F cumulé | Repository 79,932 s ; backend commencé puis arrêté à 08:17 avant reprise ciblée | Preuve I1 disponible en principe ; clé non conservée, cause exacte non attribuable | Backend partiel non mesuré | Même frontière frontend/E2E, aucun pytest ; Q1/Q2 |
| I3 — 27/10 08:24, publish-transitions.log | Commit 09c8c09 au-dessus de 37ea6d7 ; F du diff à main | 1 444 pytest verts ; E2E rouge sur géométrie/focus | Prose 09c8c09 seule n'élargit pas ; vidéo/helper du diff cumulé maintiennent F | Pytest 1 202,36 s ; E2E 993,917 s, statut 1 | Statiques/related et E2E complets ; Q1/Q2 détectent les défauts |
| I4 — 27/10 12:30, publish-transitions-final.log | Sélecteurs/baselines 6c3a608 après E2E rouge ; F cumulé | 1 444 pytest verts ; publication puis CI Linux rouge sur zoom | Les deux specs seules seraient ciblées ; F vient encore des changements non intégrés | Pytest 1 174,21 s ; autre coût non conservé | E2E conservés ; sélecteurs concernés et configuration du vrai navigateur ; Q2/Q3 |
| C1 — 27/10 18:11, quality-final.log | Copie sortante, focus, géométrie, helpers, démo, captures ; F | 1 456 pytest verts, 443 Vitest ; E2E rouge et entrées E2E modifiées | Première preuve du correctif ; assets non Markdown dans les trois clés | Backend gate 1 206,785 s dont pytest 1 189,30 s ; frontend 66,060 s ; E2E rouge 564,008 s | Repository + frontend complet (src/demo touché) + tous E2E ; Q1/Q2 |
| C2 — 27/10 18:47, quality-final-2.log | Corrections UI/sélecteurs ; F cumulé | Backend réussi **déduit** : E2E atteint et backend.json présent ; E2E encore rouge, démo 10 verts | C1 avait des preuves backend/frontend ; changement d'assets/entrées larges possible, clé exacte absente | Pytest non conservé ; démo 38,2 s | Même frontière sans pytest ; vrais refus/notes/focus via Q1/Q2 |
| C3 — 28/10 21:07, publication.log | 18 échecs E2E ciblés réparés puis c7efd22 ; F | 1 456 pytest verts, frontend ; 109 E2E verts, date de démo rouge | Preuves C2 présentes ; assets non exécutables inclus dans backend ; attribution exacte des autres entrées inconnue | Pytest 1 178,72 s ; app 16,6 min ; démo finale non verte | Frontend + E2E complets, date courante de la démo ; Q1/Q2 |
| C4 — 28/10 22:01, publication-2.log | 618e9a8 : dates démo, reports.ts, configs Playwright ; F | Backend commencé ; processus arrêté à 22:07 pour corriger les captures | Entrées frontend/E2E modifiées ; PNG suivant invaliderait aussi backend | Backend partiel, aucun total fiable | Repository + statiques frontend + E2E ; Q2/Q3, puis Q4 pour les PNG |
| C5 — 28/10 22:09, publication-3.log | 0544f1e : frames de preuve corrigées au-dessus du diff non publié ; F | 1 456 pytest, 443 Vitest, 109 app et 10 démo verts ; preuve E2E refusée sur mutation debug.log | Changement PNG invalide backend/frontend ; mutation du journal installé invalide E2E | Pytest 1 238,78 s ; app 16,4 min ; démo 37,7 s | Pas de pytest/Vitest métier supplémentaire pour les seuls PNG ; gate d'intégrité, E2E requis par le diff navigateur restant ; Q3/Q4 |
| C6 — 29/10 07:13, publication-4.log | eede631 : Chromium complet Windows et diagnostics ; F | Backend réussi **déduit** de 443 Vitest puis 109 app ; publication réussie, CI Linux rouge (600 px) | Backend non modifié ; F et preuves larges hérités de l'outillage/captures | Pytest absent ; Vitest 39,30 s ; app 17,0 min | Repository + statiques frontend + E2E locaux et CI Linux indépendante ; Q2/Q3 |
| C7 — 29/10 08:27, publication-5.log | 029857a : padding desktop et preuves régénérées ; F via PNG/WebM | 1 456 pytest, 443 Vitest, 109 app et 10 démo verts ; CI du SHA verte | CSS n'impose pas F ; captures renouvelées invalident aussi backend et frontend | Pytest 1 161,31 s ; app 17,1 min ; démo 40,3 s | Documentation/intégrité + statiques/related et E2E entiers (CSS partagé) ; Q1/Q2/Q4 |

Le correctif zoom isolé `483c962` a ensuite sélectionné statiques frontend et un seul scénario :
21,7 s localement, 18,6 s au pre-push. Il n'est pas une campagne exhaustive.
Les refus de verrou d'intégration entre 12:30 et 12:46 le 27/10 ne lancent pas de tests supplémentaires.
Le plan local de compacité avant renouvellement des captures n'est pas compté comme un backend complet.

## Justification technique et contrôles réellement discriminants

| Réf. | Contrôle pertinent et régression détectable | Contrôle retiré et motif |
| --- | --- | --- |
| Q1 — rendu React/CSS | Lint/format/tsc, Vitest dépendants, tests de refus et copie inerte ; couverture entière si config/demo la requiert | Pytest ne charge ni CSS ni React ; ses tests d'API ne détectent ni fondu manquant ni déplacement du bouton |
| Q2 — parcours navigateur | Tous E2E sur primitives globales : logo qui déborde, géométrie de note, focus, refus, copies, données courantes ; build/démo et CI Linux conservés | Backend exhaustif non requis ; le backend réel reste démarré/sollicité par les parcours applicatifs |
| Q3 — outillage navigateur | Gates, statiques, neuf contrats Vitest des configs réelles/shards/rapports/diagnostics et E2E entiers ; journaux des binaires distingués de la sortie générée | Tests SQLite/concurrence et Vitest métier complet n'observent pas le choix Chromium/Headless Shell ni les sorties GPU |
| Q4 — preuve PNG/WebM | Intégrité du conteneur et liens, revue du récit/frame/source, vérification humaine ; si rendu changé, Q1/Q2 restent requis par le diff source | Suites backend/frontend n'analysent pas les captures documentaires ; une correction de capture ne prouve pas le métier |

Repository/README/secrets restent frais dans chaque campagne applicable. Une validation de sélecteur
ne réhabilite jamais automatiquement un refus métier affaibli ; les assertions de notes/sauvegarde/droits
doivent être revues, et les suites métier requises par les autres changements restent obligatoires.
Le défaut Linux de compacité démontre la nécessité de la CI indépendante et des vrais parcours de géométrie,
pas celle d'un rejeu des transactions SQLite pour un padding ou un journal Chromium.

## Bilan chiffré, sans extrapolation

- Sept résumés pytest complets **mesurés** : trois de 1 444 tests, quatre de 1 456 tests.
  Somme : **8 710,78 s = 145,18 min**, temps pytest uniquement.
- Deux passages backend réussis **inférés** (C2/C6), durée inconnue. Total de neuf campagnes backend
  terminées identifiables, plus deux débuts interrompus (I2/C4). Aucun coût fictif pour ces fragments.
- Sept demandes mesurées et deux déduites auraient été évitées par les plans UX révisés, puisque
  leurs diffs ne touchent pas le backend ni ses chargeurs. Cela n'inclut pas la campagne du chantier
  Résultats archivés `b112c72`, qui modifie une API, des permissions et des tests backend.
- Les replays de neuf commits conservés prouvent la frontière du **diff** ; ils ne reconstruisent pas
  tous les fichiers temporaires ni l'environnement des étapes intermédiaires.
- Réutilisation historique exacte : **nombre indéterminable**. Ni clés complètes ni snapshots d'env/npm/pip
  historiques ; ne pas annoncer « neuf hits ». Les nouvelles réutilisations sont vérifiées par tests.
- Aucune économie CI runners ou délai de livraison chiffrée : parallélisme, files d'attente, essais
  avortés et CI indépendantes ne se déduisent pas de ces sept durées pytest séquentielles.
