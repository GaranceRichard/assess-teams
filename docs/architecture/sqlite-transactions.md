# Intégrité des transactions métier SQLite — Job 1.3 / MEP-003

SQLite reste la base de référence en développement et production, via les mêmes réglages de
`settings_base.py`. Les contraintes de clés étrangères, unicité et notes ainsi que les protections
des références historiques restent en place. Aucune migration de modèle n'est nécessaire.

## Frontières métier

Les mutations composées utilisent des blocs Django `transaction.atomic` explicites.
Une exception sort de ces blocs avant d'être traduite en réponse HTTP : les modifications dépendantes
et les activités du Journal sont entièrement annulées. Les transactions imbriquées des services
forment des savepoints ; elles ne valident pas indépendamment de leur appelant.

| Opération | Écritures validées ensemble |
| --- | --- |
| Organisation | organisation, membres, Journal ; cascades de suppression autorisées |
| Équipe | nom, Coachs, archivage et Journal |
| Identité | identité, appartenance, responsabilités à réaffecter et Journal |
| Modèle/version | famille/version, questions copiées, archivage précédent et Journal |
| Planification | planification, attente, rattachement du Coach et Journal |
| Démarrage | état, nom figé, questions, lignées et repères figés |
| Complétion | état COMPLETED, auteur/date et activité de succès |
| Révision | toutes les notes, dernière provenance et activité ; auteur/date initiaux conservés |
| Échéance mise en file | attente, prochaine date et intentions de notification |

La frontière API des mutations de passation inclut la préparation de la réponse :
un échec de sérialisation annule aussi les écritures du service.
Les notes de brouillon validées par une requête précédente restent enregistrées après une
complétion refusée. Une révision refusée conserve tous les résultats initiaux et leur provenance.
Une autre opération indépendante déjà validée reste intacte.

## Erreurs et diagnostic

Les refus de validation et de permissions conservent leurs codes et messages existants.
Une exception interne, notamment une erreur SQLite, retourne HTTP 500 avec le JSON :
`{"detail": "L’opération n’a pas pu être réalisée. Veuillez réessayer."}`.
Le schéma OpenAPI décrit ce contrat commun ; Swagger reste accessible.
Les détails techniques ne sont pas exposés dans cette réponse.

Le Log HTTP est enregistré après rollback, avec `X-Correlation-ID` et contexte vérifié.
Il peut donc tracer l'échec sans ajouter une activité de succès ni référencer une création annulée.
Une panne de capture des Logs ne modifie pas la réponse métier.
L'interface de passation conserve sa modale et ses notes et indique le refus avant une nouvelle tentative.

## Réseau et commit

Les invitations, informations de modification/activation et notifications de planning
sont persistées dans la transaction métier via la [file durable MEP-004](email-notifications.md).
Un rollback annule l’intention ; le réseau SMTP intervient après commit ou dans un worker,
sans transaction d’écriture ouverte. Une panne réseau conserve le succès métier et laisse
une notification diagnostiquable, reprenable sans rejouer les écritures métier.

Le traitement quotidien valide ensemble l’attente, la prochaine date et les intentions de remise.
Sans destinataire, l’attente éligible est conservée, le warning est enregistré et la date n’avance pas.
Une écriture refusée annule ces dépendances et ne soumet aucun courriel au relais.
Les remises incertaines après interruption sont isolées pour vérification SMTP avant reprise ;
les messages déjà acceptés ne sont pas volontairement renvoyés. SMTP ne garantit pas une remise
exactement une fois sans coopération du relais.
Les optimisations de contention, sauvegarde/restauration et changement de moteur sont hors périmètre.

## Preuves et revue documentaire

Les tests `test_transaction_taking` injectent une panne après une première question figée,
un échec de Journal à la complétion/révision, une interruption et une erreur de sérialisation.
Ils vérifient l'absence de données partielles, la conservation des opérations antérieures et la reprise.

Les tests `test_transaction_relations` écrivent une première activité avant l'échec, puis vérifient
identités, appartenance, remplacement de membres et nom/Coachs d'équipe après rollback.
Les suites de versionnement et de suppression existantes protègent copies, cascades et références.

Les tests `test_transaction_delivery` couvrent succès, panne SMTP, erreur d'enregistrement de date,
absence de réseau en transaction et succès conservé après commit.
`test_transaction_callbacks` exerce les quatre actions d'identité après une panne d'e-mail.
`test_transaction_contract` vérifie les erreurs OpenAPI et Swagger.
Playwright vérifie le refus HTTP 500 de finalisation, les notes encore persistées et une nouvelle tentative.

`test_transaction_crash` arrête brutalement un processus avec `os._exit` après une première question
insérée dans une transaction sur fichier SQLite, pour les réglages développement et production.
Une nouvelle connexion vérifie la récupération, `integrity_check`, `foreign_key_check`,
l'absence de snapshot partiel et la conservation d'une complétion indépendante déjà validée.

Revue effectuée : README, règles des agents, charte, DoD, stratégie et inventaire des tests,
fondamentaux, contrat API, sources et suivi pré-MEP. Les règles qualité restent applicables ;
les évolutions documentées portent sur ces frontières, preuves et limites réseau.