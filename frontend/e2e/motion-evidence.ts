import { writeFile } from "node:fs/promises";
import { expect, type Page, type TestInfo } from "@playwright/test";

type Frame = {
  time: number;
  opacity: number;
  x: number;
  y: number;
  fixed: number[][];
};
export type Motion = {
  name: string;
  duration: number;
  frames: Frame[];
  done: boolean;
};
type MotionWindow = Window & { motion: Motion[] };

export async function observeMotion(page: Page) {
  await page.evaluate(() => {
    const state = window as MotionWindow;
    state.motion = [];
    document.addEventListener("animationstart", (event) => {
      if (
        !["page-enter", "dialog-enter", "question-enter"].includes(
          event.animationName,
        )
      )
        return;
      const element = event.target as HTMLElement;
      const animation = element
        .getAnimations()
        .find(
          (item) =>
            (item as CSSAnimation).animationName === event.animationName,
        )!;
      const motion: Motion = {
        name: event.animationName,
        duration: Number(animation.effect!.getTiming().duration),
        frames: [],
        done: false,
      };
      state.motion.push(motion);
      const fixedSelector =
        event.animationName === "question-enter"
          ? ".taking-dialog, #taking-title, .taking-footer, .taking-note-action"
          : event.animationName === "page-enter"
            ? ".product-sidebar, .workspace > header"
            : "";
      function sample() {
        const style = getComputedStyle(element);
        const matrix = new DOMMatrixReadOnly(style.transform);
        motion.frames.push({
          time: Number(animation.currentTime),
          opacity: Number(style.opacity),
          x: matrix.m41,
          y: matrix.m42,
          fixed: fixedSelector
            ? [...document.querySelectorAll(fixedSelector)].map((item) => {
                const rect = item.getBoundingClientRect();
                return [rect.x, rect.y, rect.width, rect.height];
              })
            : [],
        });
        if (animation.playState === "finished" || !element.isConnected)
          motion.done = true;
        else requestAnimationFrame(sample);
      }
      sample();
    });
  });
}

export async function moving(
  page: Page,
  name: string,
  action: () => Promise<unknown>,
) {
  await page.evaluate(() => {
    (window as MotionWindow).motion = [];
  });
  await action();
  await expect
    .poll(() =>
      page.evaluate(
        (name) =>
          (window as MotionWindow).motion.some(
            (item) => item.name === name && item.done,
          ),
        name,
      ),
    )
    .toBe(true);
  const motions = await page.evaluate(() => (window as MotionWindow).motion);
  expect(motions.map((motion) => motion.name)).toEqual([name]);
  const motion = motions[0];
  expect(motion.duration).toBe(name === "question-enter" ? 230 : 180);
  expect(motion.frames.length).toBeGreaterThan(2);
  const first = motion.frames[0];
  const last = motion.frames.at(-1)!;
  expect(first.opacity).toBeLessThan(1);
  expect(last.opacity).toBe(1);
  expect(last.x).toBe(0);
  expect(last.y).toBe(0);
  for (let index = 1; index < motion.frames.length; index++) {
    const frame = motion.frames[index];
    expect(frame.time).toBeGreaterThanOrEqual(motion.frames[index - 1].time);
    expect(frame.opacity).toBeGreaterThanOrEqual(
      motion.frames[index - 1].opacity,
    );
    expect(frame.fixed).toEqual(first.fixed);
  }
  return motion;
}

export async function noNewMotion(page: Page, action: () => Promise<unknown>) {
  await page.evaluate(() => {
    (window as MotionWindow).motion = [];
  });
  await action();
  // Let style/layout and pending animation events reach the next rendered frames.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(await page.evaluate(() => (window as MotionWindow).motion)).toEqual(
    [],
  );
}

export async function attachMotion(
  info: TestInfo,
  name: string,
  data: unknown,
) {
  const path = info.outputPath(`${name}.json`);
  await writeFile(path, JSON.stringify(data, null, 2));
  await info.attach(name, { path, contentType: "application/json" });
}
