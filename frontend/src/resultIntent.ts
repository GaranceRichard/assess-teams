export type ResultIntent = {
  organizationId: string;
  familyId: string;
  teamId: number;
};

export function readResultIntent(): ResultIntent | null {
  const params = new URLSearchParams(window.location.search);
  const keys = ["organization_id", "family_id", "team_id"];
  const values = keys.map((key) => params.get(key));
  if (
    !keys.every(
      (key, i) =>
        params.getAll(key).length === 1 &&
        /^[1-9]\d*$/.test(values[i] ?? "") &&
        Number.isSafeInteger(Number(values[i])),
    )
  )
    return null;
  return {
    organizationId: values[0]!,
    familyId: values[1]!,
    teamId: Number(values[2]),
  };
}
