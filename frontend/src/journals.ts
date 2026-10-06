export type JournalFilters = {
  date: string;
  organizationId: string;
  player: string;
  team: string;
};

export type LogLevel = "INFO" | "WARNING" | "ERROR";
export type JournalEntry = {
  id: number;
  created_at: string;
  organization_id: number | null;
  organization_name: string;
  actor_name: string;
  team_name: string;
};

export type ActivityEntry = JournalEntry & {
  target_user?: number | null;
  target_user_name?: string;
  action: string;
  description: string;
};

export type LogEntry = JournalEntry & {
  method: string;
  status_code: number | null;
  actor_id: number | null;
  team_id: number | null;
  evaluation_id: number | null;
  evaluation_name: string;
  level: LogLevel;
  source: string;
  operation: string;
  category: string;
  message: string;
  correlation_id: string;
};

export type JournalPage<T extends JournalEntry> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function query(filters: JournalFilters, page: number): string {
  const params = new URLSearchParams({ page: String(page) });
  if (filters.date) params.set("date", filters.date);
  if (filters.organizationId)
    params.set("organization_id", filters.organizationId);
  if (filters.player) params.set("player", filters.player);
  if (filters.team) params.set("team", filters.team);
  return params.toString();
}

async function list<T extends JournalEntry>(
  endpoint: string,
  filters: JournalFilters,
  page: number,
): Promise<JournalPage<T>> {
  const response = await fetch(`${endpoint}?${query(filters, page)}`, {
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("Journal request failed");
  return (await response.json()) as JournalPage<T>;
}

export function listActivityEntries(filters: JournalFilters, page: number) {
  return list<ActivityEntry>("/api/admin/activity-journal/", filters, page);
}
