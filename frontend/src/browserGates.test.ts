import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllEnvs());

function expectShardReports(value: unknown, suite: string, index: string) {
  expect(value).toMatchObject({
    outputDir: expect.stringMatching(
      new RegExp(`test-results[/\\\\]${suite}-${index}$`),
    ),
    reporter: [
      ["list"],
      [
        "blob",
        {
          outputFile: expect.stringMatching(
            new RegExp(`blobs[/\\\\]${suite}-${index}[/\\\\]report\\.zip$`),
          ),
        },
      ],
      [
        "json",
        {
          outputFile: expect.stringMatching(
            new RegExp(`${suite}-results-${index}\\.json$`),
          ),
        },
      ],
    ],
  });
}

describe("browser validation configuration contracts", () => {
  it("keeps a non-sharded local run and rejects unsupported shard identities", async () => {
    const { shardReports } = await import("../e2e/reports");
    vi.stubEnv("ASSESS_E2E_SHARD", undefined);
    expect(shardReports("app")).toEqual({ reporter: "list" });
    vi.stubEnv("ASSESS_E2E_SHARD", "3/2");
    expect(() => shardReports("app")).toThrow("Invalid E2E shard");
    vi.resetModules();
    await expect(import("../playwright.config")).rejects.toThrow(
      "Invalid E2E shard",
    );
    await expect(import("../playwright.demo.config")).rejects.toThrow(
      "Invalid E2E shard",
    );
  });

  for (const shard of ["1/2", "2/2"]) {
    it(`preserves independently collectable app/demo reports for ${shard}`, async () => {
      const { shardReports } = await import("../e2e/reports");
      vi.stubEnv("ASSESS_E2E_SHARD", shard);
      const index = shard[0];
      for (const suite of ["app", "demo"] as const)
        expectShardReports(shardReports(suite), suite, index);
    });
  }

  for (const [ci, shard] of [
    [undefined, undefined],
    ["1", undefined],
    ["1", "1/2"],
    ["1", "2/2"],
  ] as const) {
    it(`loads actual app/demo configs: CI=${ci ?? "local"}, shard=${shard ?? "none"}`, async () => {
      vi.stubEnv("CI", ci);
      vi.stubEnv("ASSESS_E2E_SHARD", shard);
      vi.resetModules();
      const { default: app } = await import("../playwright.config");
      const { default: demo } = await import("../playwright.demo.config");
      const { browserLaunchOptions } = await import("../e2e/reports");
      for (const [suite, config, project] of [
        ["app", app, "chromium"],
        ["demo", demo, "demo-chromium"],
      ] as const) {
        expect(Object.keys(config.use ?? {}).sort()).toEqual([
          "baseURL",
          "launchOptions",
          "trace",
        ]);
        expect(config.use?.launchOptions).toEqual(browserLaunchOptions(suite));
        expect(config.projects).toHaveLength(1);
        expect(config.projects?.[0].name).toBe(project);
        expect(config.projects?.[0].use).toMatchObject({
          defaultBrowserType: "chromium",
        });
        expect(config.projects?.[0].use).not.toHaveProperty("launchOptions");
        expect(config.projects?.[0].use).not.toHaveProperty("channel");
        expect(config.projects?.[0].use).not.toHaveProperty("connectOptions");
        expect(config.projects?.[0].use).not.toHaveProperty("browserName");
      }
      expect(app.testDir).toBe("./e2e");
      expect(demo.testDir).toBe("./demo-e2e");
      expect(app.workers).toBe(1);
      expect(demo.workers).toBe(1);
      expect(app.forbidOnly).toBe(ci === "1");
      expect(demo.forbidOnly).toBe(ci === "1");
      expect(app.retries).toBe(ci ? 2 : 0);
      if (!Array.isArray(app.webServer)) throw Error("App services missing");
      expect(app.webServer).toHaveLength(2);
      expect(
        app.webServer.every((server) => server.reuseExistingServer === false),
      ).toBe(true);
      expect(app.webServer[0].command).toContain("dev-backend.ps1 -NoReload");
      expect(app.webServer[1].command).toContain("npm run dev");
      expect(demo.webServer).toMatchObject({
        command: expect.stringContaining("preview:demo"),
        reuseExistingServer: false,
      });
      expect(String(demo.use?.baseURL)).toMatch(/\/assess-teams\/$/);
      if (shard) {
        expectShardReports(app, "app", shard[0]);
        expectShardReports(demo, "demo", shard[0]);
      } else {
        expect(app.reporter).toBe("list");
        expect(demo.reporter).toBe("list");
      }
    });
  }

  it("keeps report consolidation configured for a passive HTML report", async () => {
    const { default: config } = await import("../playwright.merge.config");
    expect(config).toMatchObject({
      testDir: ".",
      reporter: [["html", { open: "never" }]],
    });
    expect(config.webServer).toBeUndefined();
  });

  it("routes diagnostics outside installed binaries and keeps the Windows full browser", async () => {
    const { browserLaunchOptions } = await import("../e2e/reports");
    for (const suite of ["app", "demo"] as const) {
      const options = browserLaunchOptions(suite);
      expect(options.channel).toBe(
        process.platform === "win32" ? "chromium" : undefined,
      );
      expect(options.args[0]).toBe("--enable-logging");
      expect(Object.keys(options).sort()).toEqual(["args", "channel"]);
      expect(options.args).toHaveLength(2);
      expect(options.args[1]).toMatch(
        new RegExp(
          `frontend[/\\\\]\\.cache[/\\\\]e2e[/\\\\]${suite}-chromium\\.log$`,
        ),
      );
    }
  });
});
