import { formatDate } from "./dateTime";

export function dateInputLabel(value: string, withTime: boolean): string {
  if (!value) return "";
  return (
    formatDate(value.slice(0, 10)) +
    (withTime ? ` - ${value.slice(11, 16)}` : "")
  );
}

/** Parse presentation without converting time zones or modifying stored instants. */
export function parseDateInput(
  label: string,
  withTime: boolean,
): string | null {
  if (label === "") return "";
  const pattern = withTime
    ? /^(\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2})$/
    : /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = pattern.exec(label);
  if (!match) return null;
  const [, day, month, year, hour, minute] = match;
  const isoDate = `${year}-${month}-${day}`;
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (
    Number(year) === 0 ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== isoDate
  )
    return null;
  if (withTime && (Number(hour) > 23 || Number(minute) > 59)) return null;
  return isoDate + (withTime ? `T${hour}:${minute}` : "");
}
