import type { Organization } from "./organizations";

type Props = {
  organizations: Organization[];
  value: number | null;
  onChange: (organizationId: number | null) => void;
};

export function EvaluationOrganizationSelect({
  organizations,
  value,
  onChange,
}: Props) {
  return (
    <label htmlFor="evaluation-organization">
      Organisation
      <select
        id="evaluation-organization"
        onChange={(event) =>
          onChange(event.target.value ? Number(event.target.value) : null)
        }
        value={value ?? ""}
      >
        <option value="">Choisir une organisation</option>
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
    </label>
  );
}
