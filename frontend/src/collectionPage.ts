export type CollectionPage<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function collectionPage<T>(
  data: CollectionPage<T> | T[],
): CollectionPage<T> {
  return Array.isArray(data)
    ? { count: data.length, next: null, previous: null, results: data }
    : data;
}

export function pageQuery(page: number, organizationId?: number | null) {
  const query = new URLSearchParams({ page: String(page) });
  if (organizationId != null)
    query.set("organization_id", String(organizationId));
  return `?${query}`;
}
