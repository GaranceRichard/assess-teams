import { useEffect, useState } from "react";

import { getSteering, listSteeringOrganizations } from "./steering";
import type { SteeringOrganization, SteeringProjection } from "./steering";

export function useSteering(isSuperuser: boolean) {
  const [organizations, setOrganizations] = useState<SteeringOrganization[]>(
    [],
  );
  const [organizationId, setOrganizationId] = useState("");
  const [selection, setSelection] = useState({ organizationId: "", page: 1 });
  const page = selection.organizationId === organizationId ? selection.page : 1;
  const [data, setData] = useState<SteeringProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    listSteeringOrganizations().then(
      (items) => {
        if (!current) return;
        setOrganizations(items);
        if (!isSuperuser && items.length === 1) {
          setOrganizationId(String(items[0].id));
        } else setLoading(false);
      },
      () => {
        if (!current) return;
        setError("Impossible de charger les organisations.");
        setLoading(false);
      },
    );
    return () => {
      current = false;
    };
  }, [isSuperuser]);
  useEffect(() => {
    if (!organizationId) return;
    let current = true;
    getSteering(Number(organizationId), page).then(
      (projection) => {
        if (!current) return;
        setData(projection);
        setLoading(false);
      },
      () => {
        if (!current) return;
        setError("Impossible de charger le pilotage de cette organisation.");
        setLoading(false);
      },
    );
    return () => {
      current = false;
    };
  }, [organizationId, page]);
  function selectOrganization(value: string) {
    setOrganizationId(value);
    setData(null);
    setError("");
    setLoading(Boolean(value));
  }
  return {
    organizations,
    organizationId,
    data,
    loading,
    error,
    selectOrganization,
    page,
    changePage: (page: number) => {
      setLoading(true);
      setError("");
      setSelection({ organizationId, page });
    },
  };
}
