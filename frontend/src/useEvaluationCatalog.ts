import { useCallback, useEffect, useState } from "react";
import {
  listEvaluations,
  listQuestions,
  type Evaluation,
  type Question,
} from "./evaluations";
import { listOrganizations, type Organization } from "./organizations";
import { usePagedCollection } from "./usePagedCollection";

export function useEvaluationCatalog(
  organizationId: number | null,
  selectedId: number | null,
  setError: (error: string | null) => void,
) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const load = useCallback(
    (page: number) => listEvaluations(page, organizationId),
    [organizationId],
  );
  const collection = usePagedCollection<Evaluation>(
    load,
    String(organizationId),
    organizationId !== null,
  );
  useEffect(() => {
    listOrganizations()
      .then(setOrganizations)
      .catch(() => setError("Impossible de charger les évaluations."));
  }, [setError]);
  useEffect(() => {
    if (selectedId === null) return;
    let active = true;
    listQuestions(selectedId).then(
      (loaded) => {
        if (active) {
          setQuestions(loaded);
          setError(null);
        }
      },
      () => {
        if (active) setError("Impossible de charger les questions.");
      },
    );
    return () => {
      active = false;
    };
  }, [selectedId, setError]);
  return { organizations, questions, setQuestions, collection };
}
