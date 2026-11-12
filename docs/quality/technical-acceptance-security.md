# MEP-031 — Transport et démarrage sécurisé

[Index](technical-acceptance.md) · [P0, jeux G, R0 et PV](technical-acceptance-protocol.md).

## TEC-03

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-03 — Qualifier la confiance TLS et empêcher le contournement par un faux proxy ou un hôte arbitraire. |
| Références | [HTTP MEP-002](../architecture/http-security.md), [configuration HTTP](../operations/configuration/http.md), [D03/D04/D05](../operations/installation-prerequisites-validation.md). |
| Préconditions | P0 ; exploitants PKI/réseau et responsable recette ; D03–D05 approuvées ; frontal/serveur réels, pair `REMOTE_ADDR` préservé, origine exacte et chaîne privée provisionnée. G-A connecté en HTTPS. |
| Données | Hôte nominal du profil, origine étrangère de recette et certificats de test approuvés (non reconnu, expiré, nom différent), jamais de clé privée dans le rapport. Backend et frontal sur clone réservé. |
| Procédure | 1. Vérifier chaîne/nom/validité sans Internet depuis client neuf ; enregistrer le certificat public et le magasin de confiance utilisé. 2. Vérifier redirection HTTP sûre vers l'origine configurée et accès initial sans credentials HTTP. 3. Observer `REMOTE_ADDR` réel et remplacement de `X-Forwarded-Proto` au frontal. 4. Injecter chaque variante depuis un pair de test non approuvé, puis depuis le proxy approuvé. 5. Contrôler ACL réseau backend, HSTS et `private, no-store` sur `/api/`. 6. Exercer renouvellement/révocation selon procédure PKI D04, encore à fournir si absente. |
| Injection | Certificat non conforme, Host non autorisé, pair non fiable avec `X-Forwarded-Proto: https` et faux `X-Forwarded-For` ; valeur forwarded multiple/invalide ; proxy fiable HTTP omettant le protocole ; POST HTTP sans credential. Utiliser l'injecteur approuvé D03/D05, aucune route de diagnostic ajoutée. |
| Attendu | Certificat nominal reconnu hors ligne ; en-tête client écrasé, backend inaccessible aux clients non autorisés. GET HTTP sûr : 301 vers origine configurée ; variantes applicatives de proxy/Host : 400. POST HTTP : 400 sans mutation/session. HSTS et cookies conformes au contrat. |
| Seuil | Valeurs fixes MEP-002 (dont HSTS 31536000 s), pas un SLA ; versions TLS, validité/rotation/révocation et flux = décisions D03–D05 requises. Délais d'intervention : `À définir — C11 / MEP-022`. |
| Refus | Client refuse certificat non reconnu/expiré/nom erroné avant session ; faux proxy/Host reçoit le refus contractuel, aucun changement d'origine ni mutation. Ne pas cliquer une exception TLS. Politique de révocation non définie = variante Bloquée ; 500 inattendu ou boucle de redirection = échec. |
| Preuves | Certificats publics/chaîne et dates, décision PKI, résultats client, statuts/headers expurgés, preuve de pair réel et règles réseau, comparaison métier/activité avant/après refus. |
| Remise en état | R0 ; remettre le certificat approuvé, retirer certificats/règles de test et vérifier la chaîne nominale sans exception navigateur. |
| Consommateur / verdict | MEP-034 — **Non exécuté**. |

## TEC-04

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-04 — Refuser une mutation sans jeton/origine autorisés sans détruire une session légitime. |
| Références | [HTTP/session/CSRF](../architecture/http-security.md), [API](../architecture/backend-api.md), [contrôles API MEP-030](functional-acceptance-data.md). |
| Préconditions | P0 ; TEC-03 nominal conforme, recette et Admin G-A, navigateur séparé par acteur ; settings production, CSRF réel, cookies manipulés uniquement en mémoire dans le client de recette approuvé. |
| Données | G-A ; mutation nominale de palette personnelle observée via l'interface, valeur avant/après relevée ; aucun changement de droits utilisé pour tester CSRF. |
| Procédure | 1. Anonyme, GET `/api/session/` : 403 initialise CSRF. 2. Se connecter avec jeton/origine valides, vérifier le renouvellement et les attributs des cookies. 3. Observer puis reproduire la mutation nominale suivant OpenAPI. 4. Rejouer séparément sans jeton, avec jeton invalide, avec jeton valide mais Origin étrangère ; sans Origin, tester Referer HTTPS autorisé puis étranger selon le contrat. 5. Relire palette et session après chaque refus. 6. Vérifier logout et attributs de suppression du cookie. |
| Injection | Retirer ou remplacer un seul élément CSRF/origine de la requête nominale, session conservée. Le navigateur ne permet pas toutes les modifications d'Origin : outil approuvé de reproduction requis, pas de commande inventée. |
| Attendu | Nominal accepté ; variantes CSRF : 403 ; session encore active et palette inchangée après refus. Session Secure/HttpOnly/SameSite=Lax, CSRF Secure/SameSite=Lax lisible par React ; chemin `/`, sans domaine partagé ; API non cachée. |
| Seuil | Codes et attributs exacts MEP-002 ; aucune durée de session supplémentaire inventée. |
| Refus | Toute mutation sans protection, changement de privilège, suppression de session légitime ou cookie affaibli échoue. Un 403 de permission dû à un mauvais rôle ne démontre pas le refus CSRF. Aucun faux succès d'enregistrement. |
| Preuves | Statuts, attributs sans valeurs des cookies, état palette/session avant/après, captures expurgées, variantes Origin/Referer et corrélations. Ne pas conserver de copie brute de requête authentifiée. |
| Remise en état | R0 ; rétablir la palette initiale par requête autorisée puis déconnecter les profils de recette. |
| Consommateur / verdict | MEP-034 — **Non exécuté**. |

## TEC-05

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-05 — Arrêter les consommateurs avant effet lorsqu'une configuration est dangereuse et protéger les secrets. |
| Références | [MEP-009](../operations/configuration/startup-security.md), [inventaire MEP-036](../operations/configuration/README.md), [MEP-042](../operations/configuration/journal-retention.md), futurs MEP-054/021. |
| Préconditions | P0 ; exploitant secrets/service habilité et sécurité ; D06/D07 approuvées ; clone arrêté, configuration nominale conservée dans stockage privé ; aucun secret dans arguments ou traces. |
| Données | G-A ; entrées privées nominales, absence de clé, valeur de test volontairement faible non réutilisée, origine HTTP, `/0` proxy, SMTP TLS+SSL et durée activité finie comme variantes indépendantes. |
| Procédure | 1. Vérifier ACL service/configuration/SQLite/backups et absence de secret dans package/assets/logs. 2. Exécuter `check --deploy` avec injection nominale et relever diagnostics. 3. Arrêter tous consommateurs, appliquer une seule variante, tenter check puis lancement API et chaque worker avec les mêmes settings. 4. Relever arrêt/diagnostic et absence de mutation/SMTP. 5. Rétablir puis exercer rotation coordonnée de la clé selon MEP-009 : anciennes sessions/liens invalidés, nouvelles connexions possibles, données conservées. |
| Injection | Configuration invalide à l'import ou contrôle effectif ; tester aussi les valeurs réellement chargées par le futur chargeur commun MEP-021. Pas de module settings affaibli ajouté au candidat. |
| Attendu | Nominal : uniquement W005/W021 admis ; refus `ImproperlyConfigured` nommant le paramètre/correction sans valeur ni repli development, avant réseau/base. Aucune divergence API/workers/scripts. Rotation révoque ancienne clé sans effacer mots de passe ni historique. |
| Seuil | Exigences structurelles des secrets MEP-009 inchangées ; aucune valeur d'exemple ne devient secret cible. Chemins, ACL et précédence définitive attendent D06/D07 et MEP-054/021. Délai de rotation/interruption : `À définir — C11 / MEP-022`. |
| Refus | Code non nul/consommateur non démarré, aucune requête métier, migration ni remise SMTP ; secret jamais reproduit dans diagnostic. Un check réussi malgré une protection désactivée refuse le scénario ; aucune indisponibilité réseau ne remplace un test de configuration. |
| Preuves | Versions/références privées, attestations ACL, codes/diagnostics expurgés, inventaire PID/port et comparaison état/queues, résultat de révocation sans token ni secret. |
| Remise en état | R0 ; restaurer configuration approuvée ; conserver les nouveaux secrets après rotation, ne jamais réactiver une clé révoquée. |
| Consommateur / verdict | MEP-034 — **Non exécuté**. |
