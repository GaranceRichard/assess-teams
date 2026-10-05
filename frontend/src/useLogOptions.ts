import { useEffect, useState } from "react";

import { listEvaluations, type Evaluation } from "./evaluations";
import { listOrganizations, type Organization } from "./organizations";
import { listTeams, type Team } from "./teams";

export function useLogOptions(organization: string, isSuperadmin: boolean) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [options, setOptions] = useState<{
    organization: string;
    teams: Team[];
    evaluations: Evaluation[];
  }>({ organization: "", teams: [], evaluations: [] });
  const [error, setError] = useState("");
  const selected = isSuperadmin
    ? organization
    : String(organizations[0]?.id ?? "");

  useEffect(() => {
    let active = true;
    listOrganizations()
      .then((items) => {
        if (active) setOrganizations(items);
      })
      .catch(() => {
        if (active) setError("Impossible de charger les organisations.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (selected) {
      Promise.all([listTeams(Number(selected), true), listEvaluations()])
        .then(([teams, evaluations]) => {
          if (active) {
            setOptions({
              organization: selected,
              teams,
              evaluations: evaluations.filter(
                (item) => String(item.organization_id) === selected,
              ),
            });
            setError("");
          }
        })
        .catch(() => {
          if (active) setError("Impossible de charger les filtres dépendants.");
        });
    }
    return () => {
      active = false;
    };
  }, [selected]);

  return {
    organizations,
    selected,
    error,
    users:
      organizations.find((item) => String(item.id) === selected)?.users ?? [],
    teams: options.organization === selected ? options.teams : [],
    evaluations: options.organization === selected ? options.evaluations : [],
  };
}
