# EVAL-004 — Configurer les repères d’appréciation par question

- **Feature parente :** `FEAT-012 — Définir les modalités de notation`.
- **User story :** en tant qu’Admin, je veux associer des appréciations à certains scores
  d’une question pour guider le Coach pendant la passation.
- **Priorité / dépendances :** P0 ; `EVAL-002`, `EVAL-003`, `PASS-001`.
- **Critères :** repères facultatifs, texte libre sur un ou plusieurs entiers 0–10 ;
  un seul par niveau/question ; ajout/modification/suppression en DRAFT ;
  copies indépendantes par version et immutabilité VALIDATED/ARCHIVED.
- **Passation :** infobulle au-dessus du niveau au survol/focus, texte sélectionné persistant,
  clavier/mobile, aucun texte inventé ; descriptif de la borne inférieure renseignée la plus proche,
  note réelle, range et calculs conservés. Onze points discrets et modale stable à défilement interne.
- **Histoire :** référence exacte question/version et copie au démarrage dans les snapshots ;
  anciennes passations sans repères ajoutés, résultats jamais reconstruits depuis une version récente.
- **Preuves :** migration 0015, API/ORM/OpenAPI, tests React et Playwright v1/v2/mobile/démo ;
  contrôle `quality:full`, pre-push et CI.
- **Limites :** aucune modalité de notation supplémentaire, pondération, seuil,
  règle de calcul ou changement de score. `FEAT-012` reste partiellement livré.

[Contrat, persistance et revue documentaire](../../architecture/appreciation-markers.md).
