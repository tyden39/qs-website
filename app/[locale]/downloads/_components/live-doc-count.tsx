"use client";

import { useLiveManuals } from "@/lib/crm/live-manuals-context";

// of the static file set baseCount was built from.
export default function LiveDocCount({ baseCount }: { baseCount: number }) {
  const liveItems = useLiveManuals();
  const total = baseCount + (liveItems?.length ?? 0);
  return <>{total}</>;
}
