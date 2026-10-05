import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
const excluded = new Set([
  "node_modules",
  ".git",
  ".vercel",
  "artifacts",
  "dist",
  "test-results",
  "playwright-report",
]);
async function files(dir = ".") {
  const list = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (excluded.has(item.name)) continue;
    const name = path.join(dir, item.name);
    if (item.isDirectory()) list.push(...(await files(name)));
    else list.push(name);
  }
  return list;
}
const patterns = [
  [
    "secret",
    /\b(?:sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{25,}|AIza[A-Za-z0-9_-]{30,}|AKIA[A-Z0-9]{16})\b/,
  ],
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["machine-path", /\/(?:Users|home)\/[A-Za-z][\w.-]+\//],
  [
    "private-network",
    /https?:\/\/(?:10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|[^\s/]+\.internal)\b/,
  ],
];
const issues = [];
const list = await files();
for (const file of list) {
  if (file.startsWith(".env")) issues.push({ file, kind: "environment-file" });
  const text = await readFile(file, "utf8");
  for (const [kind, pattern] of patterns)
    if (pattern.test(text)) issues.push({ file, kind });
}
const runtime = (await files("src")).filter((f) => /\.(tsx?|json)$/.test(f));
for (const file of runtime) {
  const text = await readFile(file, "utf8");
  if (
    /dangerouslySetInnerHTML|\beval\s*\(|\bnew Function\s*\(|\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\b/.test(
      text,
    )
  )
    issues.push({ file, kind: "manual-sink-review-required" });
}
console.log(
  JSON.stringify(
    { reviewedFiles: list.length, runtimeFiles: runtime.length, issues },
    null,
    2,
  ),
);
if (issues.length) process.exitCode = 1;
