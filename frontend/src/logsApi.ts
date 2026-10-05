import type { JournalPage, LogEntry } from "./journals";
export type LogFilters = {
  organization: string;
  actor: string;
  team: string;
  evaluation: string;
  from: string;
  to: string;
  method: string;
  level: string;
  source: string;
  status_code: string;
};
export const emptyLogFilters: LogFilters = {
  organization: "",
  actor: "",
  team: "",
  evaluation: "",
  from: "",
  to: "",
  method: "",
  level: "",
  source: "",
  status_code: "",
};
export async function listHttpLogs(
  filters: LogFilters,
  page: number,
): Promise<JournalPage<LogEntry>> {
  const params = new URLSearchParams({ page: String(page) });
  for (const [key, value] of Object.entries(filters)) {
    if (value)
      params.set(
        key,
        key === "from" || key === "to" ? new Date(value).toISOString() : value,
      );
  }
  const response = await fetch(`/api/admin/logs/?${params}`, {
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("Log request failed");
  return response.json() as Promise<JournalPage<LogEntry>>;
}
