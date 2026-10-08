import type { SessionUser } from "./auth";
import { ResultTeamSelection } from "./ResultTeamSelection";
import { ResultsViews } from "./ResultsViews";
import type { Theme } from "./theme";
import { useResultSelection } from "./useResultSelection";
import "./results.css";
import "./results-views.css";

export function ResultsPage({
  theme,
  actor,
}: {
  theme: Theme;
  actor: SessionUser;
}) {
  const state = useResultSelection(actor.is_superuser);
  const usable = state.comparison && state.comparison.axes.length > 0;
  return (
    <section className="results-page product-page">
      <h1>Résultats</h1>
      <div className="results-selectors">
        <label className="results-model">
          Organisation
          <select
            value={state.organizationId}
            disabled={!actor.is_superuser}
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
        <label className="results-model">
          Modèle
          <select
            value={state.familyId}
            disabled={!state.organizationId || state.families.length === 0}
            onChange={(event) => state.selectFamily(event.target.value)}
          >
            <option value="">Sélectionner un modèle</option>
            {state.families.map((family) => (
              <option key={family.family_id} value={family.family_id}>
                {family.family_name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {state.loading && <p role="status">Chargement des résultats…</p>}
      {state.error && <p role="alert">{state.error}</p>}
      {state.selectionNotice && <p role="status">{state.selectionNotice}</p>}
      {!state.loading && !state.error && state.organizations.length === 0 && (
        <p>Aucune organisation accessible.</p>
      )}
      {!state.loading &&
        !state.error &&
        state.organizationId &&
        state.families.length === 0 && (
          <p>Aucune passation complétée accessible.</p>
        )}
      {!state.loading &&
        !state.organizationId &&
        state.organizations.length > 0 && (
          <p>Sélectionnez une organisation pour consulter ses résultats.</p>
        )}
      {!state.loading &&
        state.organizationId &&
        !state.familyId &&
        state.families.length > 0 && (
          <p>Sélectionnez un modèle pour comparer les équipes.</p>
        )}
      {state.comparison && !usable && (
        <p>Aucun résultat exploitable pour ce modèle.</p>
      )}
      {usable && state.comparison && (
        <>
          <p>
            Version radar : v{state.comparison.version} · Dernière version ayant
            des résultats accessibles
          </p>
          <div className="results-layout page-content">
            <ResultTeamSelection
              teams={state.comparison.teams}
              selected={state.selected}
              onToggle={state.toggleTeam}
            />
            <ResultsViews
              key={state.familyId}
              comparison={state.comparison}
              familyId={Number(state.familyId)}
              selected={state.selected}
              theme={theme}
            />
          </div>
        </>
      )}
    </section>
  );
}
