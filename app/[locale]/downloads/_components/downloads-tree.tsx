"use client";

import { Link } from "@/lib/i18n/navigation";
import { setFilterParams, useFilterParams } from "@/lib/use-filter-params";

/** Active family branch, named by id so a link survives reordering. */
const GROUP_KEY = "g";
/** Product (model) selected inside the active family. */
const PRODUCT_KEY = "t";
/** Document-group tab selected inside the active product. */
const DOC_KEY = "d";

/** One downloadable variant of a document (a language edition, or a single
 *  external source file). */
export type DlVariant = {
  /** Badge/button label for the edition, e.g. "VI", "EN", "ZH". */
  lang: string;
  url: string;
  sizeLabel: string;
  /** External source (opens in a new tab, no `download` attribute). */
  external?: boolean;
};

/** A document row: one logical document with its language/source variants. */
export type DlRow = {
  key: string;
  title: string;
  /** File-type badge label, e.g. "PDF", "ZIP". */
  ext: string;
  /** Version or date display; "—" when neither is known. */
  version: string;
  /** Product detail link when the document belongs to a catalogue product. */
  productHref?: string;
  productLabel?: string;
  variants: DlVariant[];
};

/** A document group inside a product (e.g. Manuals, Drawings) — rendered as a
 *  titled section in the list, not a separate menu. */
export type DlDocGroup = { id: string; label: string; rows: DlRow[] };

/** Second level: a product/model, carrying its document groups. */
export type DlProduct = { id: string; label: string; groups: DlDocGroup[] };

/** Top level: a product family. Families with a product level carry `products`;
 *  leaf families (catalogue, software) carry `rows` directly. */
export type DlGroup = {
  id: string;
  label: string;
  heading: string;
  desc: string;
  products?: DlProduct[];
  rows?: DlRow[];
};

type SupportLabels = { title: string; cta: string };

const pad = (n: number) => String(n).padStart(2, "0");
const productCount = (p: DlProduct) => p.groups.reduce((n, g) => n + g.rows.length, 0);
const familyCount = (f: DlGroup) =>
  f.products ? f.products.reduce((n, p) => n + productCount(p), 0) : f.rows?.length ?? 0;

/** First-appearance id or a fallback, so a stale or absent param opens the
 *  default (first) item. */
function resolveId<T extends { id: string }>(items: T[], param: string | null): string | null {
  return (items.some((i) => i.id === param) ? param : null) ?? items[0]?.id ?? null;
}

function DocTable({
  rows,
  headers,
}: {
  rows: DlRow[];
  headers: { name: string; version: string; download: string };
}) {
  return (
    <div className="border border-line bg-white">
      <div className="hidden md:grid grid-cols-[1fr_120px_minmax(200px,auto)] gap-4 px-5 py-3 bg-[#0e0e0c] text-[#cfc9b8] font-mono text-label-xs tracking-[.16em] uppercase">
        <span>{headers.name}</span>
        <span>{headers.version}</span>
        <span className="text-right">{headers.download}</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.key}
          className="group/row relative grid grid-cols-1 md:grid-cols-[1fr_120px_minmax(200px,auto)] gap-x-4 gap-y-3 items-center px-5 py-4 border-t border-line transition-colors hover:bg-paper
                     before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gold-grad before:opacity-0 before:transition-opacity hover:before:opacity-100"
        >
          {/* name */}
          <div className="flex items-center gap-4">
            {/* document chip — dark plate, gold label, folded corner */}
            <span className="relative w-11 h-[54px] flex-shrink-0 grid place-items-center bg-[#11120f] text-gold-2 font-mono text-label-xs font-bold tracking-[.06em] overflow-hidden
                             before:content-[''] before:absolute before:top-0 before:right-0 before:border-t-[11px] before:border-l-[11px] before:border-t-transparent before:border-l-[#2a2822]
                             after:content-[''] after:absolute after:top-0 after:right-0 after:border-t-[11px] after:border-r-[11px] after:border-t-gold-2/70 after:border-r-transparent">
              {row.ext}
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-semibold text-ink text-meta tracking-[-.005em] group-hover/row:text-black">
                {row.title}
              </span>
              {row.productHref && (
                <Link
                  href={row.productHref}
                  className="font-mono text-label text-gold-1 tracking-[.06em] hover:underline w-fit"
                >
                  {row.productLabel} →
                </Link>
              )}
            </div>
          </div>
          {/* version / date */}
          <span className="font-mono text-label text-muted md:text-[#3a3a3a] tabular-nums">{row.version}</span>
          {/* download — one button per variant */}
          <div className="flex flex-wrap gap-2 md:justify-end">
            {row.variants.map((v) => (
              <a
                key={v.url}
                href={v.url}
                {...(v.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : { download: true })}
                className="flex-1 md:flex-initial inline-flex flex-col items-center gap-0.5 whitespace-nowrap border border-ink bg-ink text-white px-4 py-2 transition-colors hover:bg-gold-3 hover:border-gold-3
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-2 focus-visible:ring-offset-1"
              >
                <span className="font-mono text-label tracking-[.14em] uppercase">{v.lang} ↓</span>
                <span className="font-mono text-label-xs tracking-[.06em] opacity-60">{v.sizeLabel}</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The right-panel body for one family: a leaf family's flat table, or the
 *  active product's documents behind a doc-group tab strip. A single-group
 *  product drops the tabs and shows its table directly. */
function FamilyBody({
  group,
  product,
  activeDocId,
  onSelectDoc,
  headers,
}: {
  group: DlGroup;
  product: DlProduct | undefined;
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  headers: { name: string; version: string; download: string };
}) {
  if (!group.products) return <DocTable rows={group.rows ?? []} headers={headers} />;
  if (!product) return null;
  const docGroups = product.groups;
  const current = docGroups.find((dg) => dg.id === activeDocId) ?? docGroups[0];
  return (
    <>
      {docGroups.length > 1 ? (
        <div className="mb-6 w-full overflow-x-auto">
          {/* Baseline lives on the tablist (not the wrapper) so the tab's -mb-px
              border overlaps it exactly — no vertical overflow, so overflow-x-auto
              can't spawn a vertical scrollbar. The line also spans the full
              scrollable width. */}
          <div role="tablist" className="flex min-w-max border-b border-line">
            {docGroups.map((dg) => {
              const on = dg.id === current?.id;
              return (
                <button
                  key={dg.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => onSelectDoc(dg.id)}
                  className={`group/tab -mb-px inline-flex items-baseline gap-2 px-4 sm:px-5 pb-3 pt-2 rounded-t-[3px] text-meta font-semibold tracking-[-.005em] whitespace-nowrap border-b-[3px] transition-colors cursor-pointer
                    focus-visible:outline-none focus-visible:text-ink ${
                    on
                      ? "text-ink border-gold-2 bg-[linear-gradient(180deg,transparent,rgba(201,163,90,.13))]"
                      : "text-muted border-transparent hover:text-ink hover:border-line-2 hover:bg-paper"
                  }`}
                >
                  {dg.label}
                  <span
                    className={`font-mono text-label-xs tabular-nums transition-colors ${
                      on ? "text-gold-1" : "text-line-2 group-hover/tab:text-muted"
                    }`}
                  >
                    {pad(dg.rows.length)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <DocTable rows={current?.rows ?? []} headers={headers} />
    </>
  );
}

/**
 * Downloads library as a two-level tree in a left sidebar, mirroring the
 * electronics catalogue tree: product family → product/model. Selecting a
 * family reveals its products; the right panel shows the active product's
 * documents behind a doc-group tab strip (manuals, drawings, …). Leaf families
 * (catalogue, software) skip the product level and list their files directly.
 * All panels are rendered (inactive hidden) so the prerendered HTML carries
 * content for crawlers and switching is a pure client toggle.
 */
export function DownloadsTree({
  groups,
  eyebrow,
  headers,
  support,
}: {
  groups: DlGroup[];
  eyebrow: string;
  headers: { name: string; version: string; download: string };
  support: SupportLabels;
}) {
  const params = useFilterParams();
  const named = groups.findIndex((g) => g.id === params.get(GROUP_KEY));
  const active = named === -1 ? 0 : named;
  const activeGroup = groups[active];

  const products = activeGroup.products ?? [];
  const activeProductId = resolveId(products, params.get(PRODUCT_KEY));
  const activeProduct = products.find((p) => p.id === activeProductId);
  const docGroups = activeProduct?.groups ?? [];
  const activeDocId = resolveId(docGroups, params.get(DOC_KEY));

  // Each level defaults to its first item, kept out of the URL so a family's own
  // link stays short; picking a level clears the selections below it.
  const selectGroup = (i: number) =>
    setFilterParams({ [GROUP_KEY]: i === 0 ? null : groups[i].id, [PRODUCT_KEY]: null, [DOC_KEY]: null });
  const selectProduct = (id: string) =>
    setFilterParams({ [PRODUCT_KEY]: id === products[0]?.id ? null : id, [DOC_KEY]: null });
  const selectDoc = (id: string) =>
    setFilterParams({ [DOC_KEY]: id === docGroups[0]?.id ? null : id });

  return (
    <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-12 lg:items-start">
      {/* LEFT — tree (desktop) / stacked selects (mobile), plus support */}
      <div className="mb-8 lg:mb-0 lg:sticky lg:top-24 flex flex-col gap-6">
        {/* mobile/tablet: family + product selects */}
        <div className="lg:hidden flex flex-col gap-3">
          <select
            aria-label={eyebrow}
            value={active}
            onChange={(e) => selectGroup(Number(e.target.value))}
            className="qs-select w-full font-mono text-[16px] tracking-[.08em] uppercase border border-line py-2 px-3 bg-white cursor-pointer"
          >
            {groups.map((g, i) => (
              <option key={g.id} value={i}>
                {g.label} ({pad(familyCount(g))})
              </option>
            ))}
          </select>
          {products.length > 0 ? (
            <select
              aria-label={activeGroup.label}
              value={activeProductId ?? ""}
              onChange={(e) => selectProduct(e.target.value)}
              className="qs-select w-full font-mono text-[16px] tracking-[.08em] uppercase border border-line py-2 px-3 bg-white cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({pad(productCount(p))})
                </option>
              ))}
            </select>
          ) : null}
        </div>

        {/* desktop: the hierarchical tree */}
        <nav aria-label={eyebrow} className="hidden lg:block border border-line bg-white p-5">
          <div className="pb-3.5 border-b border-ink font-mono text-label tracking-[.16em] uppercase text-ink">
            {eyebrow}
          </div>
          <ul className="list-none p-0 m-0">
            {groups.map((g, i) => {
              const isActive = i === active;
              const kids = g.products ?? [];
              return (
                <li key={g.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    aria-pressed={isActive}
                    aria-expanded={kids.length > 0 ? isActive : undefined}
                    onClick={() => selectGroup(i)}
                    className={`w-full flex items-center gap-3 py-3 text-meta font-medium text-left cursor-pointer bg-transparent border-0 ${
                      isActive ? "text-ink" : "text-ink/85 hover:text-ink"
                    }`}
                  >
                    <span className={`flex-1 min-w-0 ${isActive ? "text-gold-1" : ""}`}>{g.label}</span>
                    <span
                      className={`font-mono text-label-xs tabular-nums ${
                        isActive ? "text-gold-2" : "text-line-2"
                      }`}
                    >
                      {pad(familyCount(g))}
                    </span>
                    {kids.length > 0 ? (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className={`shrink-0 transition-transform ${isActive ? "rotate-180" : ""}`}
                      >
                        <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    ) : null}
                  </button>

                  {isActive && kids.length > 0 ? (
                    <ul className="list-none p-0 m-0 pb-2 pl-3">
                      {kids.map((p) => {
                        const on = p.id === activeProductId;
                        return (
                          <li key={p.id}>
                            <button
                              type="button"
                              aria-pressed={on}
                              onClick={() => selectProduct(p.id)}
                              className={`w-full flex justify-between items-center gap-3 py-1.5 text-meta text-left cursor-pointer bg-transparent border-0 ${
                                on ? "text-gold-1 font-medium" : "text-muted hover:text-ink"
                              }`}
                            >
                              <span className="min-w-0">{p.label}</span>
                              <span
                                className={`font-mono text-label-xs tabular-nums ${
                                  on ? "text-gold-2" : "text-line-2"
                                }`}
                              >
                                {pad(productCount(p))}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        <aside className="hidden lg:block border border-line bg-white p-5">
          <div className="font-mono text-label-xs text-gold-1 tracking-[.16em] uppercase mb-2">
            {support.title}
          </div>
          <p className="m-0 text-meta text-muted leading-[1.6]">
            <a href="tel:+84909663350" className="hover:text-ink">(+84) 909.663.350</a>
            <br />
            <a href="tel:+84922322338" className="hover:text-ink">(+84) 922.322.338</a>
            <br />
            <a href="mailto:support@qstcnc.com" className="hover:text-ink">support@qstcnc.com</a>
          </p>
          <Link className="qs-btn qs-btn-sm mt-3.5" href="/contact">{support.cta}</Link>
        </aside>
      </div>

      {/* RIGHT — the active family's panel; all mounted, inactive hidden. Each
          branched family falls back to its first product so every panel
          prerenders populated. */}
      <div className="min-w-0">
        {groups.map((g, i) => {
          const isActive = i === active;
          const product = isActive ? activeProduct : g.products?.[0];
          const docId = isActive ? activeDocId : (product?.groups[0]?.id ?? null);
          return (
            <div key={g.id} role="region" aria-label={g.label} hidden={!isActive}>
              <div className="mb-8 max-w-[62ch]">
                <span className="font-mono text-label text-gold-1 tracking-[.16em] uppercase">
                  [ {pad(familyCount(g))} ]
                </span>
                <h2 className="qs-h2 mt-2">{g.heading}</h2>
                <p className="text-meta text-muted leading-[1.7] mt-3 mb-0">{g.desc}</p>
                {g.products && product ? (
                  <div className="mt-5 inline-flex items-center gap-2.5 border border-line bg-white pl-2.5 pr-3.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-grad" aria-hidden="true" />
                    <span className="font-mono text-label tracking-[.12em] uppercase text-ink">
                      {product.label}
                    </span>
                  </div>
                ) : null}
              </div>
              <FamilyBody
                group={g}
                product={product}
                activeDocId={docId}
                onSelectDoc={selectDoc}
                headers={headers}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
