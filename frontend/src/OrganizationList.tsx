import type { Organization } from "./organizations";

type Props = {
  organizations: Organization[];
  isSuperadmin: boolean;
  onDelete: (organization: Organization) => void;
  onEditMembers: (organization: Organization) => void;
  onRename: (organization: Organization) => void;
};

export function OrganizationList({
  organizations,
  isSuperadmin,
  onDelete,
  onEditMembers,
  onRename,
}: Props) {
  return (
    <div className="organization-list">
      <h2>Organisations existantes</h2>
      {organizations.length === 0 ? (
        <p>Aucune organisation.</p>
      ) : (
        <ul>
          {organizations.map((organization) => (
            <li key={organization.id}>
              <div className="organization-summary">
                <strong>{organization.name}</strong>
                <span>
                  {organization.users.map((user) => user.identifier).join(", ")}
                </span>
              </div>
              <div className="organization-actions">
                <button
                  className="secondary"
                  onClick={() => onRename(organization)}
                  type="button"
                >
                  Renommer
                </button>
                <button
                  className="secondary"
                  onClick={() => onEditMembers(organization)}
                  type="button"
                >
                  Gérer les membres
                </button>
                {isSuperadmin && (
                  <button
                    className="organization-danger-outline"
                    onClick={() => onDelete(organization)}
                    type="button"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
