# MEP-020 — Purge technique planifiable

Prérequis livré : [MEP-042 et sa CI exacte](configuration/journal-retention-validation.md).
La commande consomme sa [politique](configuration/journal-retention.md) et les collections
[JOURNAL-001/002](../architecture/journals-api.md). [Preuves et DoD](journal-purge-validation.md).

## Préparer une intervention

L'exploitant habilité utilise le Python du service, son répertoire `backend`, la même base SQLite
et les mêmes settings de production que l'API. Appliquer les migrations du package avant exécution :
`journals.0010` ajoute uniquement les reçus `JournalPurgeRun`, sans toucher aux collecteurs ni aux entrées.
Une sauvegarde cohérente et sa procédure de restauration doivent être disponibles avant destruction.
L'activation du planificateur et les ACL réelles restent à vérifier dans l'installation MESS.

Conserver dans le suivi d'exploitation l'approbateur, l'exécutant, la décision de conservation approuvée,
sa référence de ticket, la version du package et les sorties de commande. Les rôles Admin/Superadmin
n'accordent aucun accès OS. Seul le compte de service et les exploitants habilités peuvent accéder
à la base, aux arguments de la tâche et aux reçus. Ne jamais y placer de secret ou de donnée personnelle.

`JOURNAL_TECHNICAL_RETENTION_DAYS` doit déjà contenir la durée approuvée selon MEP-042 ; la commande
ne prend aucune durée en argument. `keep`/absence refuse l'opération, même simulée. Toute durée finie
`activity` demeure interdite. Si des traces techniques doivent être gelées comme preuves, conserver
`keep` et suspendre les tâches : aucune exception par ligne ni arbitrage de gel n'est inventé ici.

## Simuler et exécuter

Exemples depuis `backend`, avec limites opérationnelles illustratives, sans durée MESS inventée :

```powershell
.venv\Scripts\python.exe manage.py purge_journals --settings=config.settings_production
.venv\Scripts\python.exe manage.py purge_journals --execute --authorization OPS-123 --max-rows 1000 --batch-size 100 --max-batches 20 --settings=config.settings_production
```

La simulation est le défaut : zéro suppression, mais reçu persistant et comptage des candidats.
Une simulation n'autorise pas une destruction : l'exécution crée son propre reçu et recalcule son instant
de référence. `--execute` exige la référence d'une décision réelle, de forme `OPS-123` (exemple fictif) :
2–16 lettres majuscules, tiret, puis 1–12 chiffres sans zéro initial. Le ticket doit exister dans le suivi
d'exploitation ; la commande vérifie sa forme, pas l'approbation dans un système externe.

| Option | Contrat |
| --- | --- |
| `--scope` | Uniquement `technical`, défaut ; activité, autre type ou périmètre refusés |
| `--max-rows` | Défaut 1000, entier 1–100000 ; plafond total de candidats de ce reçu |
| `--batch-size` | Défaut 100, entier 1–1000 ; plafond par transaction |
| `--max-batches` | Défaut 10, entier 1–1000 ; plafond de transactions d'une invocation |
| `--resume UUID` | Reprend le reçu existant ; conserver `--execute` pour un reçu d'exécution |

Les nombres sont décimaux positifs sans signe, espace ou zéro initial. Aucun identifiant d'entrée,
filtre d'organisation/source/gravité, date forcée, chemin de fichier à supprimer ou durée de remplacement
n'est accepté. Le périmètre MEP-042 est toute l'instance, y compris les entrées globales et `SET_NULL`.
Seule `LogEntry` est supprimable. Activités, utilisateurs, équipes, évaluations, notifications, fichiers,
sauvegardes et traces serveur externes sont exclus.

## Bornes, intégrité et preuve

À la création, le reçu fige l'instant UTC, la durée, l'échéance et le plus grand identifiant existant.
Seules les entrées `created_at < instant - durée × 24 h` sont éligibles : l'égalité reste conservée.
Une durée valide dépassant le calendrier représentable n'échoit aucune ligne. Les nouveaux identifiants
sont exclus de cette fenêtre. Les dates des journaux restent immuables par leur contrat de lecture.

Les lots progressent par identifiant, sans offset, jusqu'au plafond. Chaque transaction prend le verrou
d'écriture SQLite avant de relire le reçu, revalide la politique effective, l'horloge, les bornes et les
compteurs, puis supprime uniquement les identifiants encore échus. Le détail ORM doit compter exactement
les `LogEntry` attendues ; toute relation inverse future exige une revue explicite et bloque la purge.
Suppression, compteurs, curseur et horodatage du reçu sont atomiques. Aucun appel réseau ni rejeu externe.
Des reprises concurrentes se sérialisent ou refusent la contention, sans doubler les compteurs.

`PRAGMA quick_check(1)` et `foreign_key_check` doivent passer avant une nouvelle invocation et dans la
transaction de fin. Un refus final annule ce dernier lot ; les précédents restent attestés. Ces contrôles
parcourent la base : les plafonds bornent les lignes/transactions, pas une durée murale garantie.
Le timeout SQLite existant reste inchangé ; ajuster les lots et le créneau après mesure sur l'instance.

Les sorties JSON contiennent seulement UUID du reçu, événement de départ, type technique, simulation, statut, échéance,
compteurs et résultat. La table séparée conserve aussi autorisation, bornes et dates ; elle n'est jamais
une cible de purge. Aucun contenu, nom, identifiant d'acteur, requête brute ou exception SQL n'est émis.
Exporter les sorties dans le suivi d'exploitation protégé ; aucune durée de conservation des reçus
ou journaux externes n'est inventée. Les reçus ne constituent pas une protection contre un DBA malveillant.

## Arrêt, reprise et codes de retour

Le premier JSON (`event=started`) fournit le `run_id` avant suppression, sans résultat anticipé.
Après revalidation, `status=completed` signifie que **ce reçu**
est achevé : `window_exhausted` = aucun autre candidat dans sa fenêtre ; `limit_reached` = plafond
atteint, un reliquat peut subsister. `deleted=0` en simulation ou fenêtre vide ne prétend pas une destruction.

Code 0 uniquement si le reçu est terminé. Un budget de lots épuisé, Ctrl+C/SIGTERM, une contention,
un échec d'intégrité ou toute autre erreur provoque un code non nul, un diagnostic fixe et aucune annonce
de succès. Le reçu reste `paused` jusqu'à terminaison ; ce statut est aussi son point de reprise pendant
une exécution, sans bail à débloquer. Le dernier JSON peut précéder un commit validé : la base fait foi.
Un arrêt brutal laisse SQLite annuler le lot non validé à la prochaine ouverture.

Après arrêt, lire les sorties protégées, vérifier que le worker est arrêté, puis reprendre :

```powershell
.venv\Scripts\python.exe manage.py purge_journals --execute --resume UUID_DU_RECU --max-batches 20 --settings=config.settings_production
```

Pour une simulation, omettre `--execute`. Ne pas répéter autorisation, taille de lot ou plafond total :
ils sont figés et ces options sont refusées en reprise. La politique doit être strictement identique et
l'horloge ne doit pas être antérieure à l'instant initial ; un changement vers `keep` bloque toute reprise.
Ne pas éditer le reçu pour forcer un succès. Un reçu terminé est idempotent tant que sa politique reste valide.
Après changement de durée approuvé, abandonner le reçu suspendu dans le suivi et créer une nouvelle simulation.
Une erreur d'intégrité impose une investigation/restauration selon les procédures SQLite, jamais un contournement.

## Planification OS

Déployer d'abord la commande en simulation avec le compte de service et capturer code de retour/stdout/stderr.
Après approbation, enregistrer l'invocation d'exécution ci-dessus dans le Planificateur de tâches Windows
(programme = chemin absolu du Python, arguments = `manage.py purge_journals ...`, démarrer dans = `backend`)
ou le timer/service systemd/cron de l'instance Linux (Python et répertoire absolus). Aucun Node ni réseau requis.
Injecter le même environnement approuvé que l'API, sans l'imprimer dans la tâche ou ses sorties.

Choisir et consigner le créneau/la fréquence avec l'exploitation ; aucune tâche automatique n'est activée
par une migration ou par la configuration. Désactiver les chevauchements et le rattrapage en rafale ;
superviser chaque code non nul et reprendre le UUID suspendu avant le prochain départ régulier.
Chaque départ sans `--resume` crée une nouvelle fenêtre bornée : `limit_reached` appelle un passage ultérieur,
sans boucle infinie. Tester l'arrêt/reprise en recette avant activation et après restauration d'une sauvegarde.
Une purge SQLite ne garantit ni effacement physique des pages ni destruction des copies de sauvegarde.
