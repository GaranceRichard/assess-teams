type DateValue = string | number | Date | null | undefined;
const missing = "—";

function parts(value: DateValue, timeZone?: string) {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );
}

/** Calendar dates retain their day; instants use the existing browser time zone. */
export function formatDate(value: DateValue, timeZone?: string): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  const date = parts(value, timeZone);
  return date ? `${date.day}/${date.month}/${date.year}` : missing;
}

export function formatTime(value: DateValue, timeZone?: string): string {
  const date = parts(value, timeZone);
  return date ? `${date.hour}:${date.minute}` : missing;
}

export function formatDateTime(value: DateValue, timeZone?: string): string {
  const date = parts(value, timeZone);
  return date
    ? `${date.day}/${date.month}/${date.year} - ${date.hour}:${date.minute}`
    : missing;
}
