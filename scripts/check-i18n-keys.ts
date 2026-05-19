#!/usr/bin/env tsx
/**
 * CI lint: compare key sets between messages/vi/<ns>.json and messages/en/<ns>.json.
 * Exits non-zero if any namespace has missing or extra keys in EN relative to VI.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const VI_DIR = path.join(ROOT, "messages", "vi");
const EN_DIR = path.join(ROOT, "messages", "en");

function flatten(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return [prefix];
  }
  const record = obj as Record<string, unknown>;
  return Object.keys(record).flatMap((key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return flatten(record[key], fullKey);
  });
}

function readJson(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as unknown;
}

const viFiles = fs
  .readdirSync(VI_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

let hasErrors = false;

for (const filename of viFiles) {
  const viPath = path.join(VI_DIR, filename);
  const enPath = path.join(EN_DIR, filename);

  if (!fs.existsSync(enPath)) {
    console.error(`[MISSING FILE] messages/en/${filename} does not exist`);
    hasErrors = true;
    continue;
  }

  const viKeys = flatten(readJson(viPath)).sort();
  const enKeys = flatten(readJson(enPath)).sort();

  const missing = viKeys.filter((k) => !enKeys.includes(k));
  const extra = enKeys.filter((k) => !viKeys.includes(k));

  const ns = filename.replace(".json", "");

  if (missing.length > 0) {
    console.error(`[${ns}] Missing keys in EN (${missing.length}):`);
    for (const k of missing) {
      console.error(`  - ${k}`);
    }
    hasErrors = true;
  }

  if (extra.length > 0) {
    console.error(`[${ns}] Extra keys in EN not present in VI (${extra.length}):`);
    for (const k of extra) {
      console.error(`  + ${k}`);
    }
    hasErrors = true;
  }

  if (missing.length === 0 && extra.length === 0) {
    console.log(`[${ns}] OK (${viKeys.length} keys)`);
  }
}

// Check for EN files that have no VI counterpart
const enFiles = fs
  .readdirSync(EN_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

for (const filename of enFiles) {
  const viPath = path.join(VI_DIR, filename);
  if (!fs.existsSync(viPath)) {
    console.warn(`[WARN] messages/en/${filename} has no VI counterpart — skipping`);
  }
}

if (hasErrors) {
  console.error("\ni18n key check FAILED. Fix the above issues.");
  process.exit(1);
} else {
  console.log("\ni18n key check PASSED.");
}
