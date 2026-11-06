# MEP-051 — Erreurs et reprises

Qualification du 2026-11-06 (America/Toronto), Windows / Chromium, données fictives.
Base synchronisée : `5f212e5642aef97ece27cce897e85f3851b44a80` ; clôture MEP-050 publiée,
[CI verte du SHA exact](https://github.com/GaranceRichard/assess-teams/actions/runs/42031705335).
Branche `pbi/mep-051-erreurs-reprise`, worktree indépendant de MEP-017/018.
Le SHA final et sa CI sont confirmés dans le compte rendu de publication.

## Résultat et correction bornée

La planification conserve déjà les saisies après les vrais refus POST/PUT : aucun changement
à ses composants n’est nécessaire. Un écart F1 est démontré dans la gestion des utilisateurs :
`managedUsers.request` transmettait le `detail` d’un HTTP 500 directement à l’alerte du dialogue.
Une réponse injectée contenant un diagnostic confidentiel fictif apparaît avant correction.
Une panne réseau propageait également son exception technique sans indication de reprise.
Aucun secret réel n’a été utilisé, capturé ou conservé.

Le correctif localise ces échecs dans `frontend/src/managedUsers.ts` : message français fixe
pour HTTP 5xx et échec de connexion, saisie conservée et reprise explicite, sans relance automatique.
Les validations métier existantes restent affichées. Les méthodes, URL, corps, codes HTTP,
permissions, transactions, unicité et mécanismes SMTP restent inchangés.
Le message de panne ne prétend ni que la mutation a été annulée ni que le courriel a été remis.

## Cartographie et verdicts

| Scénario / rôle autorisé | Attendu et observé | Preuve / verdict |
| --- | --- | --- |
| S1 — Admin : invitation ; Coach : modification d’un Viewer | HTTP 500 injecté : alerte dans le dialogue, diagnostic masqué, identifiant/mail conservés, bouton de reprise disponible ; levée de panne puis 201/200, une ligne utilisateur et aucune annonce de remise SMTP | `error-invitation-recovery.spec.ts`, deux cas verts ; F1 rouge Admin avant correction puis Conforme |
| S1 — Erreur réseau | Message de connexion en français, aucun diagnostic brut, aucun nouvel appel automatique ; validation métier 400 conservée | `ManagedUserRecovery.test.ts`, quatre échecs avant / cinq succès après ; Conforme |
| S2 — Admin : création de planification | Responsable choisi puis adresse supprimée côté serveur après chargement : vrai 400 ; équipe, modèle, responsable, cadence et date conservés ; zéro planification en base ; autre responsable choisi puis POST 201 | `error-planning-recovery.spec.ts`, clair 1280×844 et sombre 390×844 ; Conforme avant correction |
| S2 — Admin : modification de planification | PUT 400 réel sur responsable sans mail ; cinq champs conservés ; ancienne cadence/date toujours en base ; adresse corrigée puis PUT 200 sur le même ID ; une planification, nouvelle échéance relue après reload | Même suite et assertions ORM avant/après ; Conforme avant correction |
| S3 — Invitation/planification et SMTP indisponible | Opération métier 201 conservée malgré SMTP 451 ; notification `retry`, une occurrence métier ; reprise limitée au destinataire en échec | `test_email_business.py`, sélection SMTP fraîche ; Conforme |
| S3 — Remise différée/incertaine | File persistante `pending`, acceptation requise avant `sent`, échecs `retry/failed/unknown` distincts ; remise incertaine non relancée automatiquement ; pas de diagnostic privé dans les logs | `test_email_queue.py`, `test_email_admin.py` ; Conforme |
| S4 — Confidentialité, perte ou faux succès | F1 refusé avant correction, action responsable localisée ; régression exige message borné, champs conservés et absence de succès SMTP inventé ; vrais refus de planification sans écriture partielle | Journaux rouge/vert et huit captures inventoriés ; Conforme après correction |

Le Coach n’invite pas et le Viewer n’administre pas les utilisateurs ou planifications.
La qualification ne leur ouvre aucun parcours supplémentaire.
Les deux géométries de planification sont deux variantes exécutées, pas quatre combinaisons thème/taille.

## Acquis réutilisés et autres formulaires

- Passation Coach / révision Admin : [MEP-045 accepté](../../backlog/planning/qualification-mep-045/cloture.md),
  refus 400, note conservée, Échap/Fermer protégés, réessai 204 puis GET=7 et focus.
  Cette preuve reste attribuée au correctif `08d0263`, sans nouvelle recette manuelle annoncée.
- Lecture des collections, Results et Pilotage : [MEP-050 accepté](../mep-050/cloture.md),
  erreur/refus distingués du vide et des notes zéro, filtres et périmètres conservés.
- Organisation/équipe/questions et utilisateurs : `DialogPending.test.tsx`, `dialog-accessibility.spec.ts`
  couvrent champs conservés, alertes accessibles, focus contenu/restauré et protections pendant mutation.
- Viewer / préférence personnelle : `palettes.spec.ts` vérifie échec PATCH, annonce accessible,
  retour à la couleur précédente, absence de faux succès et restauration après reload.
- Mots de passe : `PasswordPages.test.tsx` couvre les refus/réessais existants ; la demande de récupération
  conserve son message conditionnel, sans confirmer l’existence du compte ou une remise SMTP.

Les suites générales exécutées par le gate complètent ces acquis ; elles ne remplacent pas
la preuve historique du comportement natif Échap ni une recette sur téléphone physique.

## Reproduction, tests et preuves

Avant modification applicative : deux parcours planification passent ; F1 échoue dans le navigateur
Admin sur l’alerte contenant le diagnostic fictif ; quatre tests unitaires techniques échouent,
le cas métier 400 passe. Après correction : 20 tests React ciblés et quatre parcours E2E passent.
La sélection backend existante compte 49 tests verts (file, SMTP, administration et planification).
Commandes, empreintes, captures et limites : [inventaire des preuves](preuves.md).

Les premières tentatives de harnais (sélecteur strict, lancement concurrent utilisant la même base,
et action d’invitation indisponible au Coach) ont été corrigées et sont exclues des verdicts produit.
Le refus rouge retenu est l’assertion Admin sur le diagnostic affiché, corroborée par les tests unitaires.

## Revue visuelle, UX-06/08 et limites

Trois captures finales relues : invitation Admin, refus PUT clair desktop et sombre mobile.
Erreur en texte entier dans le dialogue, champs lisibles et action d’enregistrement identifiable ;
le focus visible reste dans le formulaire. Les autres PNG sont des preuves automatisées,
sans relecture individuelle annoncée. `role=alert` est vérifié ; aucune écoute de lecteur d’écran
ni certification d’accessibilité déduite. UX-08 passation réutilise MEP-045.
Vidéo clavier/tactile nouvelle, tactile physique, nouveau zoom natif de ces erreurs et environnement
MESS : non exécutés. Les preuves UX-06 antérieures et parcours automatisés restent bornés à leur portée.

## DoD, indépendance et proposition

README annoncé avant tests/correction, puis intégré au paragraphe notifications existant pour
respecter ses 200 lignes. Revue des règles agents, charte, DoD, stratégie/coûts de validation,
fondamentaux, contrats API et notifications : aucune évolution d’architecture ou de contrat backend.
Aucune migration, dépendance, file SMTP, permission ou pipeline modifié ; aucun changement des
composants de MEP-017/018, de leurs worktrees ou branches. Leurs documents partagés restent hors diff.
Les nouveaux tests et ce dossier portent la traçabilité ; la stratégie de tests existante reste applicable.

Le plan calculé exige documentation fraîche, frontend complet (lint, formatage, build, quatre seuils
à 90 %) et tous les E2E applicatifs/démo. Le backend complet n’est pas requis par ce diff frontend ;
la sélection de 49 tests SMTP est une qualification supplémentaire, sans prétention de couverture globale.
Pré-push bloquant, publication `npm run publish`, CI du SHA exact et fast-forward principal restent
les conditions de livraison ; leurs résultats finaux sont donnés au compte rendu.

Clôture fonctionnelle **proposée sur ces preuves**, après livraison verte ; statut canonique MEP-051
laissé Ouvert en attente de décision. MEP-017/018, recette cible MEP-069/070 et GO MESS restent distincts.
