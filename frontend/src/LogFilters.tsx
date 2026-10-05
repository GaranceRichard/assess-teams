import { referenceLabel } from "./evaluationVersionLabel";
import type { LogFilters as Values } from "./logsApi";
import type { useLogOptions } from "./useLogOptions";

type Props = {
  value: Values;
  options: ReturnType<typeof useLogOptions>;
  isSuperadmin: boolean;
  onChange: (value: Values) => void;
  onApply: () => void;
  onClear: () => void;
};

export function LogFilters({
  value,
  options,
  isSuperadmin,
  onChange,
  onApply,
  onClear,
}: Props) {
  function field(name: keyof Values, next: string) {
    onChange(
      name === "organization"
        ? { ...value, organization: next, actor: "", team: "", evaluation: "" }
        : { ...value, [name]: next },
    );
  }
  function select(
    name: keyof Values,
    label: string,
    items: { id: number | string; name: string }[],
    disabled = false,
  ) {
    return (
      <label>
        {label}
        <select
          aria-label={label}
          value={name === "organization" ? options.selected : value[name]}
          disabled={disabled}
          onChange={(event) => field(name, event.target.value)}
        >
          <option value="">Tous</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <form
      className="journal-filters"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      {select(
        "organization",
        "Organisation",
        options.organizations,
        !isSuperadmin,
      )}
      {select(
        "actor",
        "Utilisateur",
        options.users.map((user) => ({ id: user.id, name: user.identifier })),
        !options.selected,
      )}
      {select("team", "Équipe", options.teams, !options.selected)}
      {select(
        "evaluation",
        "Évaluation",
        options.evaluations.map((evaluation) => ({
          id: evaluation.id,
          name: referenceLabel({
            family_name: evaluation.family_name,
            evaluation_name: evaluation.name,
            evaluation_version: evaluation.version,
          }),
        })),
        !options.selected,
      )}
      <label>
        Du
        <input
          type="datetime-local"
          value={value.from}
          onChange={(event) => field("from", event.target.value)}
        />
      </label>
      <label>
        Au
        <input
          type="datetime-local"
          value={value.to}
          min={value.from}
          onChange={(event) => field("to", event.target.value)}
        />
      </label>
      {select(
        "method",
        "Méthode",
        ["GET", "POST", "PUT", "PATCH", "DELETE"].map((name) => ({
          id: name,
          name,
        })),
      )}
      {select(
        "level",
        "Niveau",
        ["INFO", "WARNING", "ERROR"].map((name) => ({ id: name, name })),
      )}
      {select(
        "source",
        "Source",
        [
          "teams",
          "assessments",
          "planning",
          "notifications",
          "identities",
          "organizations",
          "system",
        ].map((name) => ({ id: name, name })),
      )}
      <label>
        Statut
        <input
          type="number"
          min="100"
          max="599"
          value={value.status_code}
          onChange={(event) => field("status_code", event.target.value)}
        />
      </label>
      <div className="journal-filter-actions">
        <button type="submit">Filtrer</button>
        <button type="button" className="secondary" onClick={onClear}>
          Effacer
        </button>
      </div>
    </form>
  );
}
