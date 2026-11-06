import { useEffect, useState } from "react";
import { listOrganizations, type Organization } from "./organizations";
import { listEvaluations, type Evaluation } from "./evaluations";
import { listTeams, type Team } from "./teams";

export function usePlanningContext() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    Promise.all([listOrganizations(), listEvaluations()])
      .then(([loadedOrganizations, loadedEvaluations]) => {
        if (!active) return;
        setLoading(false);
        setOrganizations(loadedOrganizations);
        setEvaluations(loadedEvaluations);
        if (loadedOrganizations.length === 1) {
          setLoadingTeams(true);
          setOrganizationId(loadedOrganizations[0].id);
        }
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
        setError("Impossible de charger la planification.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (organizationId === null) return;
    let active = true;
    listTeams(organizationId).then(
      (items) => {
        if (!active) return;
        setTeams(items);
        setLoadingTeams(false);
      },
      () => {
        if (!active) return;
        setLoadingTeams(false);
        setError("Impossible de charger les équipes.");
      },
    );
    return () => {
      active = false;
    };
  }, [organizationId]);

  function selectOrganization(id: number | null) {
    if (id === organizationId) return;
    setTeams([]);
    setError(null);
    setLoadingTeams(id !== null);
    setOrganizationId(id);
  }
  return {
    organizations,
    evaluations,
    teams,
    organizationId,
    selectOrganization,
    loading,
    loadingTeams,
    error,
  };
}
