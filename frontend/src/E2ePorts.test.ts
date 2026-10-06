import { describe, expect, it } from "vitest";

import { e2ePort } from "../e2e/port";

describe("isolated E2E ports", () => {
  it("retains the default and accepts a dedicated port", () => {
    expect(e2ePort(undefined, 8100)).toBe(8100);
    expect(e2ePort("8194", 8100)).toBe(8194);
  });

  it.each(["", "0", "65536", "5194;echo", "3.5"])(
    "refuses an invalid server port: %s",
    (value) => expect(() => e2ePort(value, 8100)).toThrow("port E2E"),
  );
});
