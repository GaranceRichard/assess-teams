# Pré-MEP — rapprochements et écarts au 2026-10-10

Réconciliation limitée aux [sources du backlog](../README.md), au [registre canonique](../tracking/pbis.md),
à l’architecture, aux fichiers du dépôt et à Git : départ 0cdb1dc, resynchronisation sur dcbfe34.
Les audits ont été réalisés hors dépôt et leurs rapports ne sont pas disponibles localement, selon
la clarification du demandeur. Les 36 entrées du prompt, jalon inclus, sont les points à vérifier ;
aucune anomalie n’est présumée confirmée par un audit, aucune conclusion ni référence d’audit n’est inventée.
Les observations étayées par le dépôt sont signalées comme telles. Aucun PBI nouveau n’est déclaré réalisé.

## Acquis conservés et compléments

| Travaux | Acquis et preuve existante | Complément ou réutilisation |
| --- | --- | --- |
| 1.1 — Authentification | AUTH-001 — Session produit ; AUTH-002 — Récupération ; AUTH-003 — Modification personnelle, réalisés | MEP-001 renforce notamment la connexion ; aucune réimplémentation des mots de passe |
| 1.2 — HTTPS/CSRF | Middleware et vues protégées ; settings_production partiels | MEP-002 complète cookies, proxy de confiance et HTTPS cible |
| 1.3 / 2.2 — Transactions/concurrence | ORG-001, USER-004, EVAL-003 et AUTH-002, réalisés ; tests SQLite ciblés | MEP-003 traite atomicité/effets externes ; MEP-010 traite contention multi-processus et charge cible |
| 1.4 — SMTP/reprises | NOTIF-001 — Courriels de planning, réalisé ; file et reprises de récupération dans AUTH-002 | MEP-004 complète les autres remises ; aucune file de récupération à recréer |
| 1.5 / 3.1 — Modales/passation | PASS-001 et EVAL-004 réalisés ; correctifs 1c798d8, 70766d4, preuve versionnée 0cdb1dc et focus du curseur dcbfe34 | MEP-005 complète l’accessibilité globale ; MEP-013 complète les frictions restantes |
| 1.6 / 6.2 — Apache/transfert | Aucun LICENSE/NOTICE racine retrouvé | MEP-006 prépare les droits de distribution ; MEP-029 documente ensuite le fork |
| 1.7 — Note explicite | score null dans le brouillon ; interface propose 5, next sauvegarde score ?? 5 | MEP-007 supprime cette attribution implicite tout en gardant curseur/repères |
| 1.8 / 2.3 — Permissions/isolation | Permissions de vues et scopes existants ; pas de DEFAULT_PERMISSION_CLASSES dans settings_base | MEP-008 ferme le défaut DRF ; MEP-011 complète les frontières, sans refaire les rôles |
| 2.4 — Journalisation | JOURNAL-001 — Activités réussies et JOURNAL-002 — Logs réalisés ; extension HTTP 2026-10-05 | Aucun nouveau PBI ; états et dates conservés ; purge 4.1 et qualification 7.3 distinctes |
| 2.5 — GitHub/CI | Hooks et Full quality gate ; CI parallèle/shards déjà livrés | MEP-012 vérifie les protections distantes et compatibilité du circuit, sans inventer un nouveau gate |
| 3.2 / 3.3 — Résultats/radar | RESULT-001/002 réalisés ; Analyse/Restitution db94189, switch f6d982d, retrait menu 9a490b4 | MEP-014/015 complètent lisibilité et comparaison ; fonctionnalités livrées acquises |
| 3.4 — Vocabulaire/pilotage | STEER-001 — Couverture et échéances réalisé ; vision sans score ni surveillance | MEP-016 clarifie le sens ; aucune nouvelle métrique individuelle |
| 3.5 / 3.6 / 3.7 — Transverse UX | Shell, mobile, palettes, états et corrections ciblées déjà livrés ; DASH-001 réalisé | MEP-017/018/019 complètent les écarts globaux ; aucun redesign implicite |
| 4.1 à 7.3 — Exploitation/installation/recette | Réglages production, build et documentation de développement disponibles | MEP-020 à MEP-034 qualifient le MESS ; bootstrap npm/pip de développement ne vaut pas installation hors ligne |

Les PBIs réalisés conservent leur Feature et leurs dates. Les 34 travaux complémentaires deviennent
MEP-001 à MEP-034 ; MEP-035 porte la décision finale. Le travail 2.4 réutilise deux PBIs historiques,
sans double comptage dans EPIC-011. L’absence de preuve cible ne signifie pas absence du socle livré.

## Incohérences et points ouverts à prendre en compte

- **Notation :** “Note sélectionnée : 5” sur une question sans réponse et sauvegarde par Suivant
  contredisent le choix explicite demandé. La correction est planifiée en 1.7, sans modifier PASS-001 réalisé.
- **Suppression organisationnelle :** ORG-004 reste Bloqué par ARB-ORG-005 ; la protection d’une passation
  commencée ne règle pas toutes les cascades. Une MEP exposant cette suppression exige résolution ou limitation
  explicite du périmètre avant GO. L’arbitrage reste dans son registre existant.
- **Contrats métier ouverts :** USER-002/003, ORG-002, TEAM-002/003/005/006/007 restent ouverts.
  MEP-011 doit renvoyer les écarts correspondants vers ces PBIs, sans les dupliquer ni les déclarer achevés.
- **Historique/partage :** ARB-ORG-006/007/010/013 et les limites de révision restent explicites.
  La pré-MEP ne les tranche pas ; seul un écart impactant le périmètre retenu bloque son GO.
- **Protection GitHub :** une CI présente ne prouve pas un ruleset distant actif. MEP-012 exige la preuve
  et la compatibilité avec le push branche dédiée vers main, sans imposer arbitrairement une PR.
- **Déploiement :** README et architecture parlent de SQLite “initial” et de prérequis Node en développement.
  Le périmètre pré-MEP fixe SQLite en production et sépare build et cible ; leur actualisation reste en 4.4.
- **MESS :** OS, serveur applicatif/proxy, certificats, droits, chemins, ordonnanceurs et objectifs de reprise
  restent à définir dans 4.3 ; aucun choix technique n’est inventé par cette mise à jour.
- **Ancien ordonnancement :** le point 7 suggérait une passation à livrer sans citer PASS-001 acquis.
  Il est clarifié dans le présent changement ; les Features plus larges restent partielles.
- **Audits :** rapports hors dépôt non disponibles localement ; les entrées fournies sont à vérifier
  par les PBIs correspondants. Réutiliser les acquis prouvés et ne corriger que les écarts avérés.
