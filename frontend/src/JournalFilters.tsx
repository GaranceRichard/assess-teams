import type { Organization } from "./organizations";
import type { JournalFilters as FilterValues } from "./journals";

type Props = {
  value: FilterValues;
  organizations: Organization[];
  showOrganizations: boolean;
  showLogFilters?: boolean;
  onChange: (value: FilterValues) => void;
  onApply: () => void;
  onClear: () => void;
};

export function JournalFilters({
  value,
  organizations,
  showOrganizations,
  showLogFilters = false,
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
      {showLogFilters && (
        <>
          <label>
            Niveau
            <select
              value={value.level}
              onChange={(event) => field("level", event.target.value)}
            >
              <option value="">Tous</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
          </label>
          <label>
            Source
            <select
              value={value.source}
              onChange={(event) => field("source", event.target.value)}
            >
              <option value="">Toutes</option>
              <option value="teams">teams</option>
              <option value="assessments">assessments</option>
              <option value="planning">planning</option>
              <option value="notifications">notifications</option>
              <option value="identities">identities</option>
              <option value="organizations">organizations</option>
              <option value="system">system</option>
            </select>
          </label>
        </>
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
