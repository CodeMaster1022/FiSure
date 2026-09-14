#!/usr/bin/env node
// BRD §9.3: marketing copy must use community-impact framing, never investment-return
// framing. This is a compliance requirement, not a style preference, so it runs as
// part of `npm run lint` rather than relying on manual review.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const BANNED_COPY = [
  "invest in a property",
  "earn a return",
  "expected yield",
  "roi",
  "investment portfolio",
  "profit from claims",
  "high-return catastrophe",
];

const MARKETING_TARGETS = [
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/components/landing",
];

function walk(path) {
  const stat = statSync(path, { throwIfNoEntry: false });
  if (!stat) return [];
  if (stat.isFile()) return [path];
  return readdirSync(path).flatMap((entry) => walk(join(path, entry)));
}

const files = MARKETING_TARGETS.flatMap((target) => walk(join(process.cwd(), target))).filter(
  (file) => /\.(tsx?|jsx?)$/.test(file),
);

let violations = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8").toLowerCase();
  for (const phrase of BANNED_COPY) {
    if (text.includes(phrase)) {
      console.error(`Banned investment-framing phrase "${phrase}" found in ${file}`);
      violations += 1;
    }
  }
}

if (violations > 0) {
  console.error(
    `\n${violations} marketing-copy compliance violation(s) found. See BRD §9.3 — use community-impact framing instead.`,
  );
  process.exit(1);
}

console.log(`Marketing-copy check passed (${files.length} files scanned).`);
