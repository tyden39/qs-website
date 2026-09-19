"use client";

// Feeds the CRM's live "Website" doc tree into the original two-pane
// DownloadsTree layout (sidebar + right-side DocTable) via
// live-download-groups.ts's adapter — same design as before the ERP
// rewrite, just backed entirely by ERP data now instead of a static
// baseline (see page.tsx). An empty family/product still renders its own
// sidebar row and an empty table on the right, exactly like the original
// design's "no rows" case, instead of the section disappearing.

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useLiveWebsiteDocs } from "@/lib/crm/live-website-docs-context";
import { DownloadsTree } from "./downloads-tree";
import { buildLiveDownloadGroups } from "./live-download-groups";

export function LiveWebsiteTree() {
  const t = useTranslations("downloads.index");
  const locale = useLocale();
  const root = useLiveWebsiteDocs();

  const docTypeLabels = t.raw("docGroup") as Record<string, string>;
  const familyLabels = t.raw("families") as Record<string, { label: string; heading: string; desc: string }>;
  const groups = useMemo(
    () => buildLiveDownloadGroups(root, t("tree.generic"), docTypeLabels, locale, familyLabels),
    [root, t, docTypeLabels, locale, familyLabels],
  );

  if (root === null) {
    return <p className="text-meta text-muted">{t("latest.loading")}</p>;
  }
  if (groups.length === 0) {
    return <p className="text-meta text-muted">{t("latest.empty")}</p>;
  }

  return (
    <DownloadsTree
      groups={groups}
      eyebrow={t("tree.eyebrow")}
      allLabel={t("tree.all")}
      headers={{ name: t("table.name"), version: t("table.version"), download: t("table.download") }}
      support={{ title: t("tree.support"), cta: t("tree.supportCta") }}
    />
  );
}
