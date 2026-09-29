export type JournalFilters = {
  date: string;
  organizationId: string;
  player: string;
  team: string;
  level: string;
  source: string;
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
  action: string;
  description: string;
};

export type LogEntry = JournalEntry & {
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
  if (filters.level) params.set("level", filters.level);
  if (filters.source) params.set("source", filters.source);
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

export function listLogEntries(filters: JournalFilters, page: number) {
  return list<LogEntry>("/api/admin/logs/", filters, page);
}
