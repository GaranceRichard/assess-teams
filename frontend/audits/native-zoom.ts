import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { chromium, expect, type TestInfo } from "@playwright/test";
import { browserLogArgs } from "../e2e/reports";
import { frontendURL } from "../e2e/urls";

export async function nativeZoom(info: TestInfo) {
  const extension = info.outputPath("zoom-extension");
  mkdirSync(extension, { recursive: true });
  writeFileSync(
    resolve(extension, "manifest.json"),
    JSON.stringify({
      manifest_version: 3,
      name: "UX-05 zoom probe",
      version: "1.0",
      permissions: ["tabs"],
      background: { service_worker: "worker.js" },
    }),
  );
  writeFileSync(
    resolve(extension, "worker.js"),
    "chrome.runtime.onInstalled.addListener(() => {});",
  );
  const context = await chromium.launchPersistentContext(
    mkdtempSync(join(tmpdir(), "at-ux05-")),
    {
      channel: "chromium",
      headless: false,
      viewport: null,
      deviceScaleFactor: undefined,
      args: [
        "--window-size=1280,720",
        "--window-position=-1800,0",
        `--disable-extensions-except=${extension}`,
        `--load-extension=${extension}`,
        ...browserLogArgs("app"),
      ],
    },
  );
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const page = context.pages()[0];
  const cdp = await context.newCDPSession(page);
  await page.goto(frontendURL);
  const { windowId, bounds } = await cdp.send("Browser.getWindowForTarget");
  const initial = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
  }));
  await cdp.send("Browser.setWindowBounds", {
    windowId,
    bounds: {
      width: bounds.width + 1280 - initial.width,
      height: bounds.height + 720 - initial.height,
    },
  });
  return {
    context,
    page,
    async zoom(value: number) {
      const actual = await worker.evaluate(`(async () => {
        const [tab] = await chrome.tabs.query({url: '${frontendURL}/*'});
        await chrome.tabs.setZoom(tab.id, ${value});
        return chrome.tabs.getZoom(tab.id);
      })()`);
      expect(actual).toBe(value);
      await expect
        .poll(() => page.evaluate(() => innerWidth))
        .toBe(1280 / value);
      const metrics = await page.evaluate(() => ({
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio,
        pinch: visualViewport!.scale,
        cssZoom: getComputedStyle(document.documentElement).zoom,
      }));
      expect(metrics.height).toBe(720 / value);
      expect(metrics.dpr).toBe(value);
      expect(metrics.pinch).toBe(1);
      expect(metrics.cssZoom).toBe("1");
      return { zoom: actual, ...metrics };
    },
    async capture(name: string) {
      const capture = await cdp.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      });
      writeFileSync(
        info.outputPath(name + ".png"),
        Buffer.from(capture.data, "base64"),
      );
    },
  };
}
