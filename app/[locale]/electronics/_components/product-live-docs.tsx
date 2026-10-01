"use client";

// A product detail page's own Documentation list, sourced live from the
// CRM's "Website" doc tree instead of the static data/downloads.ts /
// data/series.ts catalogue — the same source the /downloads page renders
// (see live-download-groups.ts / live-website-tree.tsx). Each exported
// component wraps its own LiveWebsiteDocsProvider so a caller just drops it
// in without wiring up context — the provider's localStorage cache (see
// live-website-docs-context.tsx) keeps repeat mounts on the same page load
// from doubling the fetch.
//
// Renders nothing once the tree has loaded and no CRM folder resolves to
// this product's slug (see live-download-groups.ts's findProductDocsNode)
// or that folder has no released documents yet — including while still
// loading, so a caller-rendered header never flashes above an empty table.

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LiveWebsiteDocsProvider, useLiveWebsiteDocs } from "@/lib/crm/live-website-docs-context";
import { buildProductDocGroups } from "@/app/[locale]/downloads/_components/live-download-groups";
import { DocTable, type DlDocGroup } from "@/app/[locale]/downloads/_components/downloads-tree";

/** Resolves this product's live CRM doc groups, `undefined` while still
 *  loading or once loaded with nothing to show. */
function useProductDocGroups(slug: string): DlDocGroup[] | undefined {
  const t = useTranslations("downloads.index");
  const locale = useLocale();
  const root = useLiveWebsiteDocs();
  const docTypeLabels = t.raw("docGroup") as Record<string, string>;
  const groups = buildProductDocGroups(root, slug, docTypeLabels, locale, t("tree.generic"));
  if (root === null) return undefined;
  if (!groups || groups.every((g) => g.rows.length === 0)) return undefined;
  return groups;
}

/** Doc-type tab strip (only when there's more than one) plus the active
 *  tab's table — the part shared between the two layouts below. */
function DocGroupsBody({ groups }: { groups: DlDocGroup[] }) {
  const t = useTranslations("downloads.index");
  const [active, setActive] = useState(0);
  const current = groups[active] ?? groups[0];

  return (
    <div className="flex flex-col gap-4">
      {groups.length > 1 ? (
        <div className="w-full overflow-x-auto">
          <div role="tablist" className="flex min-w-max border-b border-line">
            {groups.map((g, i) => {
              const on = g.id === current.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  className={`group/tab -mb-px inline-flex items-center gap-2 px-4 sm:px-5 pb-3 pt-2 rounded-t-[3px] text-meta font-semibold tracking-[-.005em] whitespace-nowrap border-b-[3px] transition-colors cursor-pointer
                    focus-visible:outline-none focus-visible:text-ink ${
                    on
                      ? "text-ink border-gold-2 bg-[linear-gradient(180deg,transparent,rgba(201,163,90,.13))]"
                      : "text-muted border-transparent hover:text-ink hover:border-line-2 hover:bg-paper"
                  }`}
                >
                  {g.label}
                  <span className="font-mono text-label-xs tabular-nums text-line-2 group-data-[active=true]:text-gold-1">
                    {String(g.rows.length).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <DocTable
        rows={current.rows}
        headers={{ name: t("table.name"), version: t("table.version"), download: t("table.download") }}
      />
    </div>
  );
}

function ProductLiveDocsInner({
  slug,
  eyebrow,
  heading,
  hint,
}: {
  slug: string;
  eyebrow: string;
  heading: string;
  hint: string;
}) {
  const groups = useProductDocGroups(slug);
  if (!groups) return null;

  return (
    <section className="py-8 sm:py-10 lg:py-14 bg-paper border-b border-line">
      <div className="qs-wrap-detail">
        <div className="qs-eyebrow mb-2">{eyebrow}</div>
        <h2 className="qs-h2 mb-3">{heading}</h2>
        <p className="text-meta text-muted leading-[1.7] max-w-[62ch] mb-10">{hint}</p>
        <DocGroupsBody groups={groups} />
      </div>
    </section>
  );
}

/** Full Documentation section (eyebrow/heading/hint + tabs/table) for a
 *  series detail page (QS Servo, inverters), which has nothing else sharing
 *  that tab. */
export function ProductLiveDocs(props: { slug: string; eyebrow: string; heading: string; hint: string }) {
  return (
    <LiveWebsiteDocsProvider>
      <ProductLiveDocsInner {...props} />
    </LiveWebsiteDocsProvider>
  );
}

function ProductLiveDocsListInner({ slug, heading }: { slug: string; heading: string }) {
  const groups = useProductDocGroups(slug);
  if (!groups) return null;
  const count = groups.reduce((n, g) => n + g.rows.length, 0);

  return (
    <div className="relative">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-3 mb-4">
        <h3 className="font-display text-title font-semibold tracking-[-.015em] text-ink m-0">{heading}</h3>
        <span className="font-mono text-label-xs text-muted tracking-[.14em] shrink-0">
          {String(count).padStart(2, "0")}
        </span>
      </div>
      <DocGroupsBody groups={groups} />
    </div>
  );
}

/** Bare list (own h3 heading + tabs/table, no outer section) for a controller
 *  detail page, whose Resources tab sits the model's manuals next to the
 *  shared editor/explorer software list inside one two-column grid. */
export function ProductLiveDocsList(props: { slug: string; heading: string }) {
  return (
    <LiveWebsiteDocsProvider>
      <ProductLiveDocsListInner {...props} />
    </LiveWebsiteDocsProvider>
  );
}
