"use client";

// Same one-fetch-shared-across-the-page pattern as live-manuals-context.tsx,
// for the CRM's public Company Doc "Website" tree instead of ManualHub
// documents — see that file's comments for the full rationale (static
// export, no server runtime, localStorage cache to avoid a blank flash).

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getPublicWebsiteTree, type PublicDocNode } from "@/lib/crm/company-docs-client";

const LiveWebsiteDocsContext = createContext<PublicDocNode | null>(null);

const WEBSITE_DOCS_CACHE_KEY = "qs:website-docs-cache:v1";
const WEBSITE_DOCS_CACHE_TTL_MS = 30 * 60 * 1000;

function readCache(): PublicDocNode | null {
  try {
    const raw = localStorage.getItem(WEBSITE_DOCS_CACHE_KEY);
    if (!raw) return null;
    const { fetchedAt, root } = JSON.parse(raw) as { fetchedAt: number; root: PublicDocNode };
    if (typeof fetchedAt !== "number" || Date.now() - fetchedAt > WEBSITE_DOCS_CACHE_TTL_MS) return null;
    return root;
  } catch {
    return null;
  }
}

function writeCache(root: PublicDocNode): void {
  try {
    localStorage.setItem(WEBSITE_DOCS_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), root }));
  } catch {
    // best-effort only
  }
}

export function LiveWebsiteDocsProvider({ children }: { children: ReactNode }) {
  const [root, setRoot] = useState<PublicDocNode | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = readCache();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage read, deferred past hydration by design
    if (cached) setRoot(cached);
    getPublicWebsiteTree().then((result) => {
      if (!cancelled && result.ok) {
        setRoot(result.root);
        writeCache(result.root);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <LiveWebsiteDocsContext.Provider value={root}>{children}</LiveWebsiteDocsContext.Provider>;
}

/** The live CRM "Website" doc tree once loaded, `null` before the first
 *  fetch/cache read resolves. */
export function useLiveWebsiteDocs(): PublicDocNode | null {
  return useContext(LiveWebsiteDocsContext);
}
