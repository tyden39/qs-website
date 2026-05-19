"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ApplicationTable } from "./application-columns";
import { deleteApplication } from "@/app/admin/_actions/applications";
import type { ApplicationRow } from "@/lib/data/applications";

type Props = { initialRows: ApplicationRow[] };

export function ApplicationsClient({ initialRows }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(slug: string) {
    if (!confirm(`Xoá ứng dụng "${slug}"?`)) return;
    startTransition(async () => {
      const res = await deleteApplication(slug);
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.slug !== slug));
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  }

  return <ApplicationTable rows={rows} onDelete={handleDelete} />;
}
