type VersionReference = {
  family_name: string;
  evaluation_name: string;
  evaluation_version: number;
};

export function versionLabel(family: string, version: number): string {
  return `${family} v${version}`;
}

export function referenceLabel(reference: VersionReference): string {
  const version = versionLabel(
    reference.family_name,
    reference.evaluation_version,
  );
  return reference.evaluation_name === reference.family_name
    ? version
    : `${reference.evaluation_name} · ${version}`;
}
