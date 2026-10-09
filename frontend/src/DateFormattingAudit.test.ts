/// <reference types="vite/client" />
import { expect, it } from "vitest";

const sources = import.meta.glob("./**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

it("keeps date presentation centralized across product and public demo", () => {
  const violations: string[] = [];
  for (const [path, source] of Object.entries(sources)) {
    if (
      path.includes(".test.") ||
      path.startsWith("./test/") ||
      path === "./dateTime.ts"
    )
      continue;
    if (
      /toLocale(?:DateString|TimeString|String)\(|Intl\.DateTimeFormat|dateStyle:|timeStyle:/.test(
        source,
      )
    )
      violations.push(path);
    if (
      path.endsWith(".tsx") &&
      /\.get(?:Hours|Minutes|Seconds)\(\)/.test(source)
    )
      violations.push(path);
    // Native controls depend on browser locale and can expose seconds.
    if (/type=["'](?:date|time|datetime-local)["']/.test(source))
      violations.push(path);
    if (/\{(?:team\.next_due_date|data\.as_of_date)\}(?!>)/.test(source))
      violations.push(path);
  }
  expect(violations).toEqual([]);
});
