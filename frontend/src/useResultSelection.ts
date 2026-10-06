import { useEffect, useRef, useState } from "react";
import { readResultIntent } from "./resultIntent";

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
  const intent = useRef(readResultIntent());
  const [selectionNotice, setSelectionNotice] = useState("");
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
        const requested = data.find(
          (org) => String(org.id) === intent.current?.organizationId,
        );
        if (requested || (!isSuperuser && data.length > 0)) {
          setOrganizationId(String((requested ?? data[0]).id));
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
        const requested = data.find(
          (family) => String(family.family_id) === intent.current?.familyId,
        );
        if (requested && organizationId === intent.current?.organizationId) {
          setFamilyId(String(requested.family_id));
          setLoadingComparison(true);
        }
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
        if (intent.current) {
          const requested = data.teams.find(
            (team) => team.team_id === intent.current?.teamId,
          );
          if (requested) setSelected([requested.team_id]);
          else
            setSelectionNotice(
              "L’équipe demandée n’a pas de résultat exploitable sur la version radar courante. Choisissez une équipe disponible.",
            );
          intent.current = null;
        }
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
    intent.current = null;
    setSelectionNotice("");
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
    selectionNotice,
    selectOrganization,
    selectFamily,
    toggleTeam,
  };
}
