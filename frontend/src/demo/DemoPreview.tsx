import { TeamList } from "../TeamList";
import { routeFor } from "../navigation";
import { teams, organization } from "./fixtures";
import "../teams.css";
export function DemoTeams() {
  return (
    <section className="teams-page product-page">
      <p className="eyebrow">Organisation fictive</p>
      <h1>Équipes</h1>
      <p>
        {organization.name} · Accompagner chaque collectif selon son contexte.
      </p>
      <div className="page-content">
        <TeamList
          teams={teams.map((team) => ({
            ...team,
            organization_id: 1,
            is_active: true,
            coaches: [{ id: 2, identifier: "Alex · Coach fictif" }],
          }))}
        />
        <ul>
          {teams.map((team) => (
            <li key={team.id}>
              <strong>{team.name}</strong> : {team.context}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
const descriptions: Record<string, string> = {
  "/users":
    "Les fonctions Admin, Coach et Viewer délimitent les accès et responsabilités de chacun.",
  "/organization":
    "L’organisation constitue la frontière des équipes, des modèles et des résultats accessibles.",
  "/planning":
    "Un modèle validé est planifié pour une équipe et confié à un responsable. Les trois passations de la démo sont déjà préparées.",
  "/activity-journal":
    "Le journal conserve les événements métier et leur provenance après chaque opération réussie.",
  "/logs":
    "Les logs applicatifs sont en lecture seule et cloisonnés ; ils excluent les données sensibles.",
};
export function DemoPreview({ path }: { path: string }) {
  return (
    <section className="placeholder product-page">
      <p className="eyebrow">Aperçu</p>
      <h1>{routeFor(path)?.title ?? "Découvrir Assess teams"}</h1>
      <p>
        {descriptions[path] ??
          "Rejoignez le tableau de bord pour commencer la découverte."}
      </p>
      <p>
        Cette page présente le fonctionnement de l’application. Ses opérations
        ne sont pas simulées dans la démo.
      </p>
    </section>
  );
}
