import type { SessionUser } from "./auth";
import { SteeringSummary } from "./SteeringSummary";
import { SteeringTeams } from "./SteeringTeams";
import { useSteering } from "./useSteering";
import "./steering.css";

export function SteeringPage({
  actor,
  onNavigate,
}: {
  actor: SessionUser;
  onNavigate: (path: string) => void;
}) {
  const state = useSteering(actor.is_superuser);
  return (
    <section className="steering-page">
      <h1>Pilotage</h1>
      <p>
        Couverture et échéances du dispositif, pour orienter l’accompagnement.
      </p>
      {actor.is_superuser ? (
        <label className="steering-organization">
          Organisation
          <select
            value={state.organizationId}
            onChange={(event) => state.selectOrganization(event.target.value)}
          >
            <option value="">Sélectionner une organisation</option>
            {state.organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        state.organizations.length === 1 && (
          <p>
            Organisation : <strong>{state.organizations[0].name}</strong>
          </p>
        )
      )}
      {state.loading && <p role="status">Chargement du pilotage…</p>}
      {state.error && <p role="alert">{state.error}</p>}
      {!state.loading && !state.error && state.organizations.length === 0 && (
        <p>Aucune organisation accessible.</p>
      )}
      {!state.loading &&
        !state.error &&
        state.organizations.length > 0 &&
        !state.organizationId && (
          <p>Sélectionnez une organisation pour consulter son pilotage.</p>
        )}
      {state.data && (
        <>
          <SteeringSummary data={state.data} />
          <SteeringTeams data={state.data} onNavigate={onNavigate} />
        </>
      )}
    </section>
  );
}
