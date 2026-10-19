# MEP-042 — Configuration de conservation des journaux

Contrat du 2026-10-18, issu de [F03](../../backlog/source/mess/f03.md), sur les acquis
[JOURNAL-001/002](../../architecture/journals-api.md). [Preuves et DoD](journal-retention-validation.md).
Il prépare les entrées du contrat unique MEP-054/021 et le consommateur MEP-020.

## Paramètres et périmètres

Les variables du processus sont chargées dans tous les modes Django, sans fichier `.env` implicite.
`config.journal_retention.journal_retention_settings(environment)` retourne le contrat normalisé
`JOURNAL_RETENTION = {"activity": None, "technical": None | entier}`.
`None` signifie **sans échéance configurée**, jamais zéro jour ni autorisation de destruction.

| Variable / type normalisé | Périmètre exact | Défaut / valeurs |
| --- | --- | --- |
| `JOURNAL_ACTIVITY_RETENTION_DAYS` / `activity` | Toutes les `ActivityEntry` : actions réussies, finalisations, révisions, identités, relations et snapshots historiques | Absente ou `keep` ; toute durée finie est refusée faute de politique métier autorisée |
| `JOURNAL_TECHNICAL_RETENTION_DAYS` / `technical` | Toutes les `LogEntry` : HTTP, événements applicatifs explicites, tous niveaux/sources, historique sans méthode HTTP | Absente ou `keep`, ou entier positif de jours |

Un jour représente une durée de 24 heures, fondée sur `created_at` en UTC pour le futur consommateur.
La durée technique utilise une écriture décimale ASCII sans signe, espace, zéro initial ni fraction,
entre 1 et 999999999. La borne supérieure est celle de `datetime.timedelta`, **pas une durée conseillée
ou réglementaire**. Vide, zéro, négatif, booléen, décimal, notation scientifique ou dépassement sont refusés.
`keep` est sensible à la casse. Aucune durée numérique n'est livrée par défaut.

Chaque règle couvre l'instance entière : toutes organisations, entrées globales et entrées dont
l'organisation a été supprimée (`SET_NULL`). Aucun filtre par rôle, organisation, gravité ou source ne
peut modifier la protection. Les deux types restent distincts, même pour une même corrélation HTTP.
Sauvegardes, traces stdout/stderr du serveur, fichiers du frontal/OS, mail et données d'évaluation
ne sont pas des `LogEntry` : leur cycle de vie relève de leurs contrats d'exploitation respectifs.

## Validation et accès

L'import des settings refuse les variables invalides ; `ConfigurationConfig.ready()` valide à nouveau
les settings effectifs, y compris ceux d'un module dérivé, avant service ou commande/worker.
Le dictionnaire doit avoir exactement les deux clés attendues, avec `None` ou un véritable entier,
sans booléen, champ de dérogation ou autorisation ajoutée. Une durée finie `activity` reste refusée.
Le diagnostic nomme le paramètre et la correction, sans reproduire l'entrée ni chaîner son parsing.
Cette validation ne lit ni ne modifie SQLite. Une erreur arrête le démarrage, sans repli silencieux.

| Acteur / responsabilité | Accès applicable |
| --- | --- |
| Admin | Consulte les journaux de son organisation unique selon les permissions existantes ; remonte ses besoins de preuve ; aucun accès applicatif d'écriture à cette configuration |
| Superadmin | Consulte les journaux globaux et organisationnels ; coordonne les besoins ; son rôle produit seul n'accorde ni accès OS ni droit de destruction des preuves |
| Exploitant habilité de l'instance | Injecte les variables approuvées dans API et workers, vérifie le démarrage et redémarre les consommateurs ; protège configuration et SQLite par les ACL du service |
| MESS / responsables métier et de conformité à désigner | Arbitrent finalités, durées et droit de destruction ; une intervention technique ou un rôle Admin ne vaut pas décision métier |

La configuration est un paramètre d'installation de sensibilité C, sans secret. Elle n'a aucun endpoint,
écran d'administration ou modification à chaud. Restreindre son écriture aux exploitants habilités,
et sa lecture au compte du service et aux administrateurs autorisés, selon les protections
[MEP-009](startup-security.md#approvisionnement-et-protection). Les ACL effectives restent à vérifier en recette MESS.

Pour un changement, conserver dans le suivi d'exploitation la référence de décision, les types concernés,
l'ancienne/nouvelle politique, l'approbateur, l'exécutant, la version et le résultat du contrôle de démarrage.
Préparer l'injection sans exposer l'environnement complet, contrôler puis redémarrer API et workers
sur la même politique. En cas de refus, corriger ou rétablir la dernière configuration validée.
Revenir à `keep` est accepté ; réduire une durée technique ne supprime rien dans MEP-042.

## Preuves métier et arbitrages nécessaires

En l'absence de décision canonique autorisant leur destruction, **toutes** les `ActivityEntry` sont
considérées comme preuves nécessaires, y compris les plus anciennes et les snapshots sans FK vivante.
Aucun nombre, accord libre ou référence de politique fourni dans les settings ne lève ce verrou.
Une politique future devra être décidée, versionnée et testée explicitement ; une variable ne peut
pas s'auto-attribuer une autorisation métier. La durée technique ne se propage jamais aux activités.

Restent à arbitrer avec MESS, sans valeur ni responsable nominatif inventé :

- la durée technique d'exploitation et la justification par finalité, volume et besoin de diagnostic ;
- les catégories de preuves métier requises, leurs durées et l'autorité habilitée à approuver leur destruction ;
- les suspensions de destruction (litige, enquête, gel), leur levée et les preuves d'autorisation ;
- les éventuelles traces techniques à préserver comme preuves : elles exigent `keep` en attendant une
  politique de gel ciblé ; la présente configuration ne sait pas autoriser des exceptions par entrée ;
- les durées des sauvegardes et journaux externes, et la cohérence après restauration.

Le défaut conservatoire n'est ni une recommandation de conservation illimitée, ni une conformité
réglementaire démontrée. Ces décisions restent à rendre avant toute destruction des preuves métier.

## Consommateur MEP-020

Configurer une durée ne déclenche aucune action. La [commande distincte MEP-020](../journal-purge.md)
consomme et revalide ce contrat, respecte `keep`, les périmètres et les preuves, traite les dates
aux bornes et fournit simulation, bornage, reçus séparés et reprise transactionnelle.
Un paramètre technique valide n'est pas à lui seul une autorisation d'exécuter une purge :
l'exploitant doit demander explicitement l'exécution avec une référence de décision approuvée.
