"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ServiceTable } from "./service-columns";
import { deleteService } from "@/app/admin/_actions/services";
import type { ServiceRow } from "@/lib/data/services";

type Props = { initialRows: ServiceRow[] };

export function ServicesClient({ initialRows }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(slug: string) {
    if (!confirm(`Xoá dịch vụ "${slug}"?`)) return;
    startTransition(async () => {
      const res = await deleteService(slug);
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.slug !== slug));
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  }

  return <ServiceTable rows={rows} onDelete={handleDelete} />;
}
