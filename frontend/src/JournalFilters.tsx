import type { Organization } from "./organizations";
import type { JournalFilters as FilterValues } from "./journals";

type Props = {
  value: FilterValues;
  organizations: Organization[];
  showOrganizations: boolean;
  onChange: (value: FilterValues) => void;
  onApply: () => void;
  onClear: () => void;
};

export function JournalFilters({
  value,
  organizations,
  showOrganizations,
  onChange,
  onApply,
  onClear,
}: Props) {
  function field(name: keyof FilterValues, nextValue: string) {
    onChange({ ...value, [name]: nextValue });
  }

  return (
    <form
      className="journal-filters"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <label>
        Date
        <input
          type="date"
          value={value.date}
          onChange={(event) => field("date", event.target.value)}
        />
      </label>
      {showOrganizations && (
        <label>
          Organisation
          <select
            value={value.organizationId}
            onChange={(event) => field("organizationId", event.target.value)}
          >
            <option value="">Toutes</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Joueur
        <input
          value={value.player}
          onChange={(event) => field("player", event.target.value)}
          placeholder="Nom du joueur"
        />
      </label>
      <label>
        Équipe
        <input
          value={value.team}
          onChange={(event) => field("team", event.target.value)}
          placeholder="Nom de l’équipe"
        />
      </label>
      <div className="journal-filter-actions">
        <button type="submit">Filtrer</button>
        <button className="secondary" type="button" onClick={onClear}>
          Effacer
        </button>
      </div>
    </form>
  );
}
