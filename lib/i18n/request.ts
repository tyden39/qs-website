import fs from "node:fs/promises";
import path from "node:path";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

// Per-namespace message files live under messages/<locale>/<namespace>.json.
// Each parallel stream owns its namespace file to avoid merge conflicts on a
// monolithic JSON blob.
async function loadMessages(locale: string) {
  const dir = path.join(process.cwd(), "messages", locale);
  const entries = await fs.readdir(dir);
  const messages: Record<string, unknown> = {};
  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    const namespace = entry.slice(0, -".json".length);
    const raw = await fs.readFile(path.join(dir, entry), "utf8");
    messages[namespace] = JSON.parse(raw);
  }
  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
