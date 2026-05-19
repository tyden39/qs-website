"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDatasheet } from "@/app/admin/_actions/datasheets";

export function DeleteDatasheetButton({ slug }: { slug: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Xoá datasheet "${slug}"? Không thể hoàn tác.`)) return;
    startTransition(async () => {
      try {
        await deleteDatasheet(slug);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Xoá thất bại.");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center border border-red-200 px-3 py-1.5 font-mono text-[10px] tracking-[.12em] uppercase text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50"
    >
      {isPending ? "…" : "Xoá"}
    </button>
  );
}
