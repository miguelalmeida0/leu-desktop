import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.BASE_URL ?? "http://127.0.0.1:4179";
const name = process.env.SMOKE_NAME ?? "local";
const output = `artifacts/desktop-release-20261005/${name}-smoke`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const checks = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
try {
  for (const [label, path, title] of [
    ["home", "/", "Good to see you."],
    ["library", "/library", "Library"],
    ["reader", "/reader/react?page=1", "State is a snapshot"],
    ["study", "/study?doc=react", "Learning Lab"],
    ["trails", "/trails", "Connections"],
  ]) {
    const response = await page.goto(base + path);
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(title);
    const headers = await response.allHeaders();
    expect(headers["content-security-policy"]).toContain("script-src 'self'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("no-referrer");
    await page.screenshot({
      path: `${output}/${label}.png`,
      fullPage: true,
      animations: "disabled",
    });
    checks.push({ label, url: page.url(), status: response.status(), headers });
  }
  await page.goto(base + "/reader/react?page=1");
  await page.getByRole("link", { name: "Teach Leu", exact: true }).click();
  await page
    .getByLabel("Your explanation", { exact: true })
    .fill(
      "Setting state requests another render; a functional updater receives the previous pending value.",
    );
  await page.getByRole("button", { name: "Compare with source" }).click();
  await expect(
    page.getByRole("heading", { name: "Compare your explanation" }),
  ).toBeVisible();
  await page
    .locator(".result")
    .getByRole("link", { name: /View exact source/ })
    .click();
  await expect(page.getByRole("status")).toContainText("React Notes · Page 2");
  const pdf = await page.request.get(base + "/samples/React%20Notes.pdf");
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await page.reload();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("leu-desktop:v1")).attempts.length,
    ),
  ).toBe(1);
  expect(errors).toEqual([]);
  await writeFile(
    `${output}/result.json`,
    JSON.stringify(
      {
        base,
        status: "PASS",
        checks,
        journey: "Teach -> compare -> exact source -> reload persisted result",
        pdfStatus: pdf.status(),
        consoleErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log(`${name} browser smoke PASS: ${base}`);
} catch (error) {
  await writeFile(
    `${output}/result.json`,
    JSON.stringify(
      {
        base,
        status: "FAIL",
        checks,
        error: String(error),
        consoleErrors: errors,
      },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser.close();
}
