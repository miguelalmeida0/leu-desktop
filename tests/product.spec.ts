import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
const evidence = "artifacts/desktop-release-20261005";
const nav = (page: Page, name: string) =>
  page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name, exact: true });
const readState = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("leu-desktop:v1") ?? "null"),
  );
test("complete recruiter journey with persisted source identity", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
  await expect(page).toHaveTitle("Leu — Read. Learn. Connect.");
  await expect(
    page.getByRole("heading", { name: "Good to see you." }),
  ).toBeVisible();
  await nav(page, "Library").click();
  await page
    .getByRole("link", { name: "Open React Notes", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "State is a snapshot", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Teach Leu", exact: true }).click();
  await page
    .getByLabel("Your explanation", { exact: true })
    .fill(
      "Setting state requests another render. It does not change the current state variable in an event handler. A functional updater receives the previous pending value.",
    );
  await page.getByRole("button", { name: "Compare with source" }).click();
  await expect(
    page.getByRole("heading", { name: "Compare your explanation" }),
  ).toBeVisible();
  let state = await readState(page);
  expect(state.attempts).toHaveLength(1);
  expect(state.attempts[0]).toMatchObject({
    documentId: "react",
    page: 1,
    mode: "teach",
  });
  await page
    .locator(".result")
    .getByRole("link", { name: /View exact source/ })
    .click();
  await expect(page).toHaveURL(/reader\/react\?page=1&source=1/);
  await expect(page.getByRole("status")).toContainText(
    "Exact source · React Notes · Page 2",
  );
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Keys describe identity", exact: true }),
  ).toBeVisible();
  await nav(page, "Study").click();
  await page.getByRole("link", { name: "Quiz Test your knowledge." }).click();
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Supported by the source" }),
  ).toBeVisible();
  await page
    .locator(".result")
    .getByRole("link", { name: /View exact source/ })
    .click();
  await expect(page.getByRole("status")).toContainText("React Notes · Page 3");
  await nav(page, "Trails").click();
  await page.getByRole("button", { name: "Identity", exact: true }).click();
  await expect(page.locator(".related-panel")).toContainText(
    "Keys describe identity",
  );
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(page.locator(".graph-controls")).toContainText("115%");
  await page.getByRole("button", { name: "Reset graph view" }).click();
  await page.getByRole("button", { name: "Create trail" }).click();
  await page.getByLabel("Trail name").fill("My React connections");
  await page.getByRole("button", { name: "Save trail", exact: true }).click();
  await expect(page.locator(".related-panel h2")).toHaveText(
    "My React connections",
  );
  await page.reload();
  await page
    .getByRole("button", { name: "My React connections", exact: true })
    .click();
  await expect(page.locator(".related-panel")).toContainText(
    "React Notes · Page 3",
  );
  await nav(page, "Home").click();
  state = await readState(page);
  expect(state.trails).toHaveLength(2);
  expect(state.attempts).toHaveLength(2);
  expect(state.progress.react).toBe(2);
  await expect(page.locator(".metric").nth(2)).toContainText("1");
  expect(errors).toEqual([]);
});
test("visual surfaces, source passages, accessibility and responsive bounds", async ({
  page,
}, info) => {
  const violations: unknown[] = [];
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const screens = [
    ["Home", "/"],
    ["Library", "/library"],
    ["Reader", "/reader/react?page=1"],
    ["Learning-Lab", "/study?doc=react"],
    ["Connections", "/trails"],
    ["Notes", "/notes"],
    ["Settings", "/settings"],
  ];
  await mkdir(`${evidence}/SCREENSHOTS`, { recursive: true });
  for (const [name, url] of screens) {
    await page.goto(url);
    await expect(page.locator("h1")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${name} horizontal overflow`,
    ).toBe(true);
    await page.screenshot({
      path: `${evidence}/SCREENSHOTS/${info.project.name}-${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    violations.push(
      ...axe.violations.map((v) => ({
        screen: name,
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    );
  }
  await writeFile(
    `${evidence}/axe-${info.project.name}.json`,
    JSON.stringify(violations, null, 2),
  );
  expect(violations).toEqual([]);
  expect(errors).toEqual([]);
});
test("search, filters, sort and keyboard source navigation", async ({
  page,
}) => {
  await page.goto("/library");
  await page
    .getByLabel("Search books, PDFs, or passages")
    .fill("functional updater");
  await expect(page.locator(".document-card")).toHaveCount(1);
  await expect(page.locator(".document-card")).toContainText("React Notes");
  await page.getByLabel("Search books, PDFs, or passages").fill("not-a-source");
  await expect(
    page.getByRole("heading", { name: "No documents found" }),
  ).toBeVisible();
  await page.getByLabel("Search books, PDFs, or passages").fill("");
  await page.getByRole("button", { name: "Backend", exact: true }).click();
  await expect(page.locator(".document-card")).toHaveCount(2);
  await page.getByLabel("Sort documents").selectOption("title");
  await expect(page.locator(".document-card").first()).toContainText(
    "Design Patterns",
  );
  await page.goto("/reader/react?page=0");
  await page.locator("h1").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("h1")).toHaveText("State is a snapshot");
  await page.getByRole("button", { name: "Highlight source" }).click();
  await expect(page.locator(".highlighted")).toContainText("Setting state");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Highlight source" }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("notes edit, delete, dialog keyboard focus and reset persistence", async ({
  page,
}) => {
  await page.goto("/notes");
  await page.getByRole("button", { name: "New note" }).click();
  await page
    .getByLabel("Note", { exact: true })
    .fill("A useful source-backed observation.");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await page.reload();
  await expect(page.locator(".note-card")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Edit note: A useful source-backed observa" })
    .click();
  await page.getByLabel("Note", { exact: true }).fill("A revised observation.");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(
    page.getByText("A revised observation.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete note: A revised observation." })
    .click();
  await page.getByRole("button", { name: "Keep note", exact: true }).click();
  await expect(page.locator(".note-card")).toHaveCount(4);
  await page.goto("/settings");
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Reset demo", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await page.getByRole("button", { name: "Restore sample state" }).click();
  await page.reload();
  const state = await readState(page);
  expect(state.notes).toHaveLength(3);
  expect(state.attempts).toHaveLength(0);
  expect(state.trails).toHaveLength(1);
  expect(state.imported).toHaveLength(0);
});
test("local PDF import stays local and survives reload; invalid PDF rejected", async ({
  page,
}) => {
  const outbound: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (
      r.method() !== "GET" ||
      new URL(r.url()).origin !==
        new URL(process.env.BASE_URL ?? "http://127.0.0.1:4179").origin
    )
      outbound.push(`${r.method()} ${r.url()}`);
  });
  await page.goto("/library");
  await page.getByRole("button", { name: "Import PDFs", exact: true }).click();
  await page
    .getByLabel("Choose a local PDF")
    .setInputFiles({
      name: "invalid.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("not a pdf"),
    });
  await expect(page.getByRole("status")).toContainText("not a valid PDF");
  await page
    .getByLabel("Choose a local PDF")
    .setInputFiles("public/samples/React Notes.pdf");
  await expect(page.getByRole("status")).toContainText(
    "Imported React Notes.",
    { timeout: 20000 },
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Imported", exact: true }).click();
  await expect(page.locator(".document-card")).toHaveCount(1);
  await page.locator(".document-card").click();
  await expect(page.locator(".source-text")).toContainText(
    "A component describes",
  );
  await page.reload();
  await expect(page.locator(".source-text")).toContainText(
    "A component describes",
  );
  expect((await readState(page)).imported).toHaveLength(1);
  expect(outbound).toEqual([]);
  expect(errors).toEqual([]);
});
test("private searches stay out of URLs and saved markup stays inert", async ({
  page,
}) => {
  const marker = "confidential-search-marker-59182";
  const urls: string[] = [];
  page.on("request", (request) => urls.push(request.url()));
  await page.goto("/library");
  await page.getByLabel("Search books, PDFs, or passages").fill(marker);
  await expect(page).toHaveURL(/\/library$/);
  await page.reload();
  expect(urls.some((url) => url.includes(marker))).toBe(false);
  await page.goto("/notes");
  await page.getByRole("button", { name: "New note" }).click();
  const text =
    '<img src=x onerror="window.__leuXss=true"> <script>window.__leuXss=true</script>';
  await page.getByLabel("Note", { exact: true }).fill(text);
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await page.reload();
  await expect(page.getByText(text, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => "__leuXss" in window)).toBe(false);
  await expect(page.locator(".note-card img,.note-card script")).toHaveCount(0);
});
test("phone fallback retains routes and controls without overflow", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "1440",
    "One additional phone fallback check.",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [name, path] of [
    ["Home", "/"],
    ["Library", "/library"],
    ["Reader", "/reader/react"],
    ["Study", "/study"],
    ["Trails", "/trails"],
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      name,
    ).toBe(true);
    await page.screenshot({
      path: `${evidence}/SCREENSHOTS/390-${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
});
test("invalid storage recovers, storage failure is explicit, reduced motion respected", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("leu-desktop:v1", '{"bad":true}'),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Saved data could not be read",
  );
  await expect(page.locator("h1")).toHaveText("Good to see you.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/library");
  expect(
    await page
      .locator(".document-card")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page
    .getByRole("link", { name: "Open React Notes", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Your change was not saved",
  );
});
