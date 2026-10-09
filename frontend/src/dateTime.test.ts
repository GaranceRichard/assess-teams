import { expect, it } from "vitest";
import { formatDate, formatTime, formatDateTime } from "./dateTime";

it.each([
  ["2026-01-02T09:05:47.123Z", "02/01/2026 - 09:05"],
  ["2026-01-02T00:00:59Z", "02/01/2026 - 00:00"],
  ["2026-01-02T12:00:01Z", "02/01/2026 - 12:00"],
])(
  "formats %s without seconds or loss of original precision",
  (value, expected) => {
    const instant = new Date(value);
    const timestamp = instant.getTime();
    expect(formatDateTime(instant, "UTC")).toBe(expected);
    expect(formatDate(value, "UTC")).toBe(expected.slice(0, 10));
    expect(formatTime(value, "UTC")).toBe(expected.slice(-5));
    expect(instant.getTime()).toBe(timestamp);
  },
);

it.each([
  ["UTC", "2026-10-09T01:05:47Z", "09/10/2026 - 01:05"],
  ["America/Toronto", "2026-10-09T01:05:47Z", "08/10/2026 - 21:05"],
  ["Asia/Tokyo", "2026-10-09T23:05:47Z", "10/10/2026 - 08:05"],
  ["America/Toronto", "2026-03-08T06:59:59Z", "08/03/2026 - 01:59"],
  ["America/Toronto", "2026-03-08T07:00:01Z", "08/03/2026 - 03:00"],
  ["America/Toronto", "2026-11-01T05:30:00Z", "01/11/2026 - 01:30"],
  ["America/Toronto", "2026-11-01T06:30:00Z", "01/11/2026 - 01:30"],
])(
  "respects %s at day and daylight-saving boundaries",
  (zone, value, expected) => {
    expect(formatDateTime(value, zone)).toBe(expected);
    expect(formatDate(value, zone)).toBe(expected.slice(0, 10));
    expect(formatTime(value, zone)).toBe(expected.slice(-5));
  },
);

it("keeps calendar dates independent of time zone and uses local time by default", () => {
  expect(formatDate("2026-01-02", "America/Toronto")).toBe("02/01/2026");
  expect(formatDate("2026-01-02", "Asia/Tokyo")).toBe("02/01/2026");
  expect(formatDateTime(new Date(2026, 0, 2, 9, 5, 47))).toBe(
    "02/01/2026 - 09:05",
  );
  expect(formatTime(new Date(2026, 0, 2, 0, 0, 47))).toBe("00:00");
});

it.each([null, undefined, "", "invalid", new Date(NaN)])(
  "handles missing or invalid date %s without crashing the interface",
  (value) => {
    expect(formatDate(value)).toBe("—");
    expect(formatTime(value)).toBe("—");
    expect(formatDateTime(value)).toBe("—");
  },
);
