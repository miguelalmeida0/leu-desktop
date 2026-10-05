import { chromium } from "@playwright/test";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
const base = process.env.BASE_URL ?? "http://127.0.0.1:4179";
const browser = await chromium.launch();
const startup = [];
for (let run = 0; run < 3; run++) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__measure = { cls: 0, longTasks: [], lcp: 0 };
    new PerformanceObserver((list) => {
      for (const e of list.getEntries())
        if (!e.hadRecentInput) window.__measure.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) =>
      window.__measure.longTasks.push(
        ...list.getEntries().map((e) => e.duration),
      ),
    ).observe({ type: "longtask", buffered: true });
    new PerformanceObserver(
      (list) => (window.__measure.lcp = list.getEntries().at(-1).startTime),
    ).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await page.goto(base);
  await page.locator("h1").waitFor();
  await page.waitForTimeout(300);
  startup.push(
    await page.evaluate(() => ({
      ...window.__measure,
      fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime,
      domContentLoaded:
        performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd,
      resources: performance
        .getEntriesByType("resource")
        .map((r) => ({
          name: new URL(r.name).pathname,
          transferSize: r.transferSize,
          decodedBodySize: r.decodedBodySize,
        })),
    })),
  );
  await context.close();
}
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const interactions = { graph: [], reader: [] };
async function clickTiming(locator) {
  return locator.evaluate(
    (element) =>
      new Promise((resolve) => {
        element.addEventListener(
          "click",
          () => {
            const start = performance.now();
            requestAnimationFrame(() =>
              requestAnimationFrame(() => resolve(performance.now() - start)),
            );
          },
          { once: true },
        );
        element.click();
      }),
  );
}
await page.goto(`${base}/trails`);
await page.getByRole("button", { name: "Identity", exact: true }).waitFor();
for (let i = 0; i < 10; i++)
  interactions.graph.push(
    await clickTiming(
      page.getByRole("button", {
        name: i % 2 ? "State" : "Identity",
        exact: true,
      }),
    ),
  );
await page.goto(`${base}/reader/react?page=0`);
await page.getByRole("button", { name: "Next page", exact: true }).waitFor();
for (let i = 0; i < 10; i++)
  interactions.reader.push(
    await clickTiming(
      page.getByRole("button", {
        name: i % 2 ? "Previous page" : "Next page",
        exact: true,
      }),
    ),
  );
const assets = [];
for (const name of await readdir("dist/assets")) {
  const bytes = await readFile(`dist/assets/${name}`);
  assets.push({ name, bytes: bytes.length, gzipBytes: gzipSync(bytes).length });
}
await browser.close();
const report = {
  environment:
    "Local production build, Chromium, 1440x900, no CPU/network throttling; three fresh browser contexts. Click timings are event-to-two-animation-frames, not field INP.",
  startup,
  interactions,
  assets,
};
await writeFile(
  "artifacts/desktop-release-20261005/performance.json",
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      startup: startup.map(({ cls, fcp, lcp, longTasks }) => ({
        cls,
        fcp,
        lcp,
        longTasks,
      })),
      interactions,
      assets,
    },
    null,
    2,
  ),
);
