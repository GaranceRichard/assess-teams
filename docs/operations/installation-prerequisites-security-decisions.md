# MEP-055 — Fiches D04–D06 : confiance, flux et identités

Fiches d’atelier du 2026-11-14. [Synthèse et validation](installation-prerequisites-arbitration.md).
Toutes les recommandations sont **proposées, non approuvées** ; contraintes dans le
[contrat initial](installation-prerequisites.md) et [sécurité HTTP](../architecture/http-security.md).

## D04 — DNS, certificats, PKI, TLS et clés

- **Besoin opérationnel :** permettre l’accès HTTPS de confiance aux utilisateurs et l’usage TLS du relais
  SMTP interne, avec renouvellement possible en environnement sans Internet.
- **Obligatoire :** HTTPS production, origine React/API commune exacte sans sous-chemin, noms couverts,
  chaîne reconnue côté clients et Python/SMTP ; clés privées protégées, aucune désactivation de validation.
- **Proposition du contrat :** DNS/PKI MESS et terminaison au frontal ; noms, autorités, politique TLS,
  validité/révocation et renouvellement restent entièrement à faire approuver.
- **Options pertinentes :** PKI interne déjà distribuée, si disponible ; chaîne d’une autre autorité autorisée
  seulement si sa confiance et son cycle de vie fonctionnent sans Internet sur cible. Aucun achat ni
  certificat auto-signé ad hoc n’est recommandé comme solution implicite.
- **Avantages, limites et risques :** PKI interne facilite la gouvernance MESS et les flux internes, mais
  impose la diffusion des racines/intermédiaires à tous les consommateurs. Une autre autorité peut être
  déjà reconnue par certains clients, sans garantir accès hors ligne à ses services de révocation.
- **Recommandation motivée :** utiliser la PKI et les procédures MESS existantes si elles satisfont le
  hors ligne ; faire approuver ensemble confiance navigateur, frontal et Python/SMTP. Aucune version
  TLS, durée ni algorithme n’est imposé comme politique MESS par ce dossier.
- **Incompatibilités à vérifier :** D03/D05/D08, noms et ports d’origine/CSRF, magasins de confiance
  réellement utilisés, chaîne complète, expiration, distribution et accès CRL/OCSP internes si requis.
  Une validation SMTP exige Internet ou une suppression de vérification : option à refuser/revoir.
- **Responsable attendu :** sécurité/PKI MESS ; infrastructure/DNS et messagerie pour leurs composants.
- **Décision précise :** quels FQDN/origine, autorité/chaîne, politique TLS, emplacements de clés, lecteurs,
  responsables de renouvellement/révocation et services internes de confiance sont autorisés ?
- **Preuve attendue :** fiche DNS/PKI/TLS approuvée datée, référence/approbateurs et réserves ; références
  protégées des clés uniquement. Les tests de confiance/expiration sur cible relèvent de MEP-034/068.
- **Entrées aval après approbation :** MEP-054/021, inventaire MEP-057 et recette MEP-034 ; pas de
  qualification TLS MESS acquise par la validation syntaxique des settings.

## D05 — Flux, ports, origines et accès

- **Besoin opérationnel :** relier uniquement les utilisateurs et services internes nécessaires à l’application.
- **Obligatoire :** pas d’Internet requis ni de port SQLite/broker ; backend accessible aux seuls pairs
  autorisés ; origine HTTPS et listes proxy/LOGIN cohérentes, contrôle d’accès applicatif conservé.
- **Proposition du contrat :** clients → frontal TCP 443 (8443 si décidé), TCP 80 facultatif pour redirection ;
  frontal → backend loopback TCP 8000 illustratif ; SMTP 587 STARTTLS ou 465 implicite, DNS/temps/PKI
  internes autorisés. Ces ports ne sont pas des règles MESS déjà ouvertes.
- **Options pertinentes :** HTTPS seul si les clients connaissent l’URL ; ajout de redirection HTTP si besoin
  établi. Frontal local et loopback, ou frontal distant avec pair et protection du lien explicites (D03).
- **Avantages, limites et risques :** HTTPS seul réduit l’exposition ; la redirection aide l’accès initial sans
  sécuriser un envoi de credentials déjà fait en HTTP. Loopback évite un flux inter-hôtes ; proxy distant
  ajoute segmentation et protection du transport. Ni wildcard réseau ni ouverture générale ne conviennent.
- **Recommandation motivée :** partir d’une matrice minimale explicite, TCP 443 et loopback si D03 le permet ;
  demander les destinations DNS/temps/PKI et SMTP réelles avant de créer les règles. N’autoriser TCP 80
  que pour un besoin approuvé ; 5173 et les ports de tests sont exclus de l’exploitation.
- **Incompatibilités à vérifier :** D03/D04/D08 ; conflits de ports, résolution hors Internet, port dans
  APP_BASE_URL/CSRF mais pas dans ALLOWED_HOSTS, origine vue du navigateur et pair vu de Django.
  Attribuer les accès d’administration OS et applicatifs, les sources autorisées et les flux de transfert
  package/maintenance sans inventer leurs protocoles. Les ACL fichiers ne remplacent pas le pare-feu.
- **Responsable attendu :** réseau et sécurité MESS ; exploitation pour administration et maintenance.
- **Décision précise :** pour chaque flux, quelles source, destination, direction, protocole, port, finalité,
  population autorisée et équipe propriétaire ? Quels refus et contrôles des règles effectives sont exigés ?
- **Preuve attendue :** matrice de flux et accès approuvée datée, référence/approbateurs et réserves ; tickets
  de mise en œuvre des règles, puis observations de connectivité/refus sur cible dans MEP-025/034/068.
- **Entrées aval après approbation :** MEP-054, MEP-060 et recettes MEP-034/068, sous leurs prérequis.

## D06 — Comptes, habilitations, ACL et secrets

- **Besoin opérationnel :** exécuter et maintenir les composants avec le minimum de droits, sans exposer
  données personnelles, clés ou secrets dans les assets, commandes, journaux et livrables.
- **Obligatoire :** stockage/injection protégés des secrets ; compte OS distinct des rôles applicatifs ;
  DEBUG désactivé, secret Django fort explicite et contrôle SMTP existant conservés. Aucun bootstrap
  de développement ni identité de démonstration ne doit servir à initialiser la cible.
- **Proposition du contrat :** identité de service initiale commune API/workers, sans administration permanente ;
  identité d’installation séparée. Frontal limité aux assets et, s’il termine TLS, à sa clé privée.
- **Options pertinentes :** identité API/workers commune comme proposé ; identités séparées seulement si
  la politique MESS l’exige. Dans les deux cas, accès au même SQLite local et à sa configuration approuvée.
  Source privée de secrets ou coffre interne : mécanisme à retenir avec MESS et MEP-054/021.
- **Avantages, limites et risques :** identité commune réduit les écarts de configuration/droits, mais partage
  le périmètre de compromission API/workers. Identités séparées isolent certains privilèges tout en
  complexifiant ACL et rotation ; elles n’isolent pas les données dès lors que les deux lisent la même base.
  Un coffre apporte sa gouvernance, mais ne doit ajouter aucune dépendance Internet ni rester sans opérateur.
- **Recommandation motivée :** étudier l’identité commune non administratrice pour API/workers et le frontal
  séparé ; source protégée approuvée avec ACL minimales et injection au lancement, jamais via arguments
  de tâche/service. Faire décider technologie, rotation, récupération et audit ; le chargeur n’existe pas ici.
- **Incompatibilités à vérifier :** D07/D09 ; droit de lancement service/tâche, accès SQLite et auxiliaires,
  logs/temp, confiance TLS et secrets SMTP ; ni frontend ni frontal ne lisent secrets Django/base.
  Ne pas présumer qu’un compte local, compte de domaine ou compte géré fonctionne avec le lanceur choisi.
- **Responsable attendu :** exploitation/sécurité MESS et gestion des identités ; responsable produit pour
  l’administration applicative initiale, distinct du compte OS et des responsables humains C11.
- **Décision précise :** quelles identités par composant, habilitations installation/service/tâches/bootstrap,
  matrice d’ACL, mécanisme de stockage/injection/rotation et responsables habilités sont approuvés ?
- **Preuve attendue :** matrice identités/droits et procédure secrets approuvées datées, référence/approbateurs,
  réserves et références de stockage protégé, sans valeurs sensibles ; vérifications ACL dans MEP-060/062.
- **Entrées aval après approbation :** MEP-054/021/060/062/063 ; aucune identité réelle ni permission
  applicative supplémentaire créée par ce dossier.
