# MEP-045 — Qualification de la confirmation de sauvegarde

**Verdict : Non conforme. Issue C — défaut réel ; clôture non proposée.**

Le 2026-10-29, Codex a qualifié le SHA applicatif
`029857a96b730aaf6357c123b429860f56e445a0`, dernier `origin/main` récupéré au démarrage.
Le troisième appui consécutif sur Échap ferme le dialogue malgré une note refusée.
Le serveur conserve 0 ; la note locale 7 n’est plus proposée au rechargement.
Défaut reproduit en clair et sombre, sans zoom : [reproduction et correction minimale proposée](defaut-echap.md).

## Critères et refus, individuellement

| Critère | Attendu | Observé | Test/preuve | Verdict |
| --- | --- | --- | --- | --- |
| 1. En cours | Enregistrement… pendant l’attente serveur, annoncé | Statut `role=status`, dernière sélection 7, aucune confirmation ; serveur encore null puis 0 | 12 scénarios intégrés ; lectures `attente-0-et-7` / `0-persiste-7-attend` dans [traces](traces.md) ; [captures](visuel.md) | Conforme |
| 2. Confirmation | Note enregistrée seulement après succès | Message après réponse 204 du dernier PUT, GET=7 ; aucun succès pour les deux 400 | Scénario intégré, séquence réseau 204/400/400/204 ; trois états capturés | Conforme |
| 3. Échec | Erreur explicite et accessible | Texte « La note n’a pas été enregistrée. Réessayez avant de continuer. », `role=alert`, réessai nommé ; texte entier atteignable par défilement | 12 intégrés, 4 sondes visuelles formats courts, [visuel](visuel.md) | Conforme |
| 4. Aucun faux succès | Pas de succès prématuré/trompeur | 7 local ne devient jamais enregistré pendant sa requête retardée ou son refus ; GET reste 0 | Deux barrières de réponse ; assertions du statut ; [sonde](sonde-integree.md) | Conforme |
| 5. Réessai | Note refusée disponible et enregistrable | 7 conservé au refus ; réessai explicite envoie 7, 204 puis GET=7, sans ressaisie | 12 intégrés, lectures `refus-7` / `reessai-7` | Conforme |
| 6. Persistance | Reprendre la dernière note réellement sauvée | Navigation, fermeture, reload, reprise : GET et curseurs retrouvent [7,0] ; vierge=[null,null] | 12 intégrés, `deuxieme-0` / `reprise-apres-reload` ; tests API/ORM ciblés | Conforme |
| 7. Sélections rapides | Ordre cohérent, pas de mutation indue ni double finalisation | 0 puis 7 en attente : une seule requête initiale ; 0 persiste avant 7 ; 5 PUT justifiés, un seul POST de finalisation au double clic ; révision distincte | [Traces](traces.md), 12 intégrés et 13 React ; [comptage](executions.md) | Conforme |
| 8. Navigation protégée | Aucune fermeture silencieuse d’une note non enregistrée | Fermer désactivé, Suivant réessaie sans avancer sur 400, premiers Échap bloqués ; **troisième Échap ferme le dialogue** ; après reload, 0 restauré au lieu de 7 local | Deux tests de régression réels **en échec**, [défaut](defaut-echap.md), captures avant/après et GET serveur | **Non conforme** |

Les verdicts « Conforme » portent sur la sélection locale documentée ; ils n’effacent pas le refus bloquant 8.
La sauvegarde de zéro est démontrée séparément de null, avant tout refus de 7 et sur la deuxième question.

## Révision Admin

« Note à valider » reste distinct de « Note enregistrée ». Changer 7 en 5 ne déclenche
aucun PUT individuel et GET reste [7,0]. Valider la révision envoie un unique PUT `/revision/`
et GET devient [5,0]. Vérification répétée dans les 12 scénarios ; [capture](captures/revision-admin.png).
Aucune sauvegarde individuelle prématurée ; aucun changement d’API ou de règle métier.

## Contexte, périmètre et décision

- Windows, Chromium 153.0.8010.12, Node 24.20.0, Python 3.12.10, Django 5.2.18 ; détails [exécutions](executions.md).
- Coach/Admin fictifs, modèle à deux questions, SQLite isolée ; palette Vert, deux thèmes,
  six formats CSS, tactile émulé à 390×844, clavier ailleurs.
- [Recette visuelle](visuel.md), [reproduction](defaut-echap.md), [traces serveur](traces.md),
  [contrôles et revue DoD](validations-initiales.md), sondes reproductibles documentées.
- Les tests automatisés verts ne constituent pas une acceptation visuelle utilisateur.
  Codex a relu les captures ; aucune validation utilisateur ni recette MESS cible n’est revendiquée.
- Le zoom natif clair atteint 200 % ; sa séquence 100/200/100 échoue ensuite sur Échap.
  La cellule sombre correspondante est **Non démontrée**, arrêt de la sonde au défaut.
  Elle devra être reprise après correction, sans campagne générale.

La source [F05](../../source/mess/f05.md), le [dossier canonique](../audit-20261027/sortie-mep-045.md),
la [fiche](../audit-20261027/fiches/MEP-045.md),
[UX-07/08](../../../quality/ux-acceptance.md) et la
[DoD](../../../quality/definition-of-done.md) restent les références.
Aucun statut canonique, nouvel identifiant PBI, code applicatif ou contrat n’est modifié.
Aucun commit, push, PR ou déploiement. Le dossier reste local, soumis à validation du verdict.
