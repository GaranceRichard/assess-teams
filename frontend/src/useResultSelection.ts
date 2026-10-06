import { useEffect, useState } from "react";

import {
  getFamilyComparison,
  listResultFamilies,
  listResultOrganizations,
} from "./results";
import type {
  ResultFamily,
  ResultFamilyComparison,
  ResultOrganization,
} from "./results";

export function useResultSelection(isSuperuser: boolean) {
  const [organizations, setOrganizations] = useState<ResultOrganization[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [families, setFamilies] = useState<ResultFamily[]>([]);
  const [familyId, setFamilyId] = useState("");
  const [comparison, setComparison] = useState<ResultFamilyComparison | null>(
    null,
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    listResultOrganizations().then(
      (data) => {
        if (!current) return;
        setOrganizations(data);
        setLoadingOrganizations(false);
        if (!isSuperuser && data.length > 0) {
          setOrganizationId(String(data[0].id));
          setLoadingFamilies(true);
        }
      },
      () => {
        if (!current) return;
        setError("Impossible de charger les organisations.");
        setLoadingOrganizations(false);
      },
    );
    return () => {
      current = false;
    };
  }, [isSuperuser]);

  useEffect(() => {
    if (!organizationId) return;
    let current = true;
    listResultFamilies(Number(organizationId)).then(
      (data) => {
        if (!current) return;
        setFamilies(data);
        setLoadingFamilies(false);
      },
      () => {
        if (!current) return;
        setError("Impossible de charger les modèles avec résultats.");
        setLoadingFamilies(false);
      },
    );
    return () => {
      current = false;
    };
  }, [organizationId]);

  useEffect(() => {
    if (!familyId) return;
    let current = true;
    getFamilyComparison(Number(familyId)).then(
      (data) => {
        if (!current) return;
        setComparison(data);
        setLoadingComparison(false);
      },
      () => {
        if (!current) return;
        setError("Impossible de charger les résultats de ce modèle.");
        setLoadingComparison(false);
      },
    );
    return () => {
      current = false;
    };
  }, [familyId]);

  function selectFamily(value: string) {
    setFamilyId(value);
    setComparison(null);
    setSelected([]);
    setError("");
    setLoadingComparison(Boolean(value));
  }
  function selectOrganization(value: string) {
    setOrganizationId(value);
    setFamilies([]);
    setLoadingFamilies(Boolean(value));
    selectFamily("");
  }
  function toggleTeam(id: number) {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((teamId) => teamId !== id)
        : [...previous, id],
    );
  }
  return {
    organizations,
    organizationId,
    families,
    familyId,
    comparison,
    selected,
    loading: loadingOrganizations || loadingFamilies || loadingComparison,
    error,
    selectOrganization,
    selectFamily,
    toggleTeam,
  };
}
