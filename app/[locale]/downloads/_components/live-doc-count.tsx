"use client";

import { useLiveManuals } from "@/lib/crm/live-manuals-context";

// The hero's "N Tài liệu" stat. baseCount is the static, build-time total
// (public/downloads + series data — see page.tsx); once ManualHub's live
// documents resolve (shared fetch via LiveManualsProvider, same one the
// sidebar tree merges in), each one is simply added on top — a live
// document is never already counted in baseCount, since ManualHub only
// attaches to product codes the static catalogue already knows about (see
// live-downloads-tree.tsx's FAMILY_BY_PRODUCT_CODE) but isn't itself part
// of the static file set baseCount was built from.
export default function LiveDocCount({ baseCount }: { baseCount: number }) {
  const liveItems = useLiveManuals();
  const total = baseCount + (liveItems?.length ?? 0);
  return <>{total}</>;
}
