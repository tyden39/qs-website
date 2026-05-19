import Link from "next/link";
import { adminListServices } from "@/lib/data/services";
import { ServicesClient } from "./_components/services-client";

export default async function ServicesPage() {
  const rows = await adminListServices();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl tracking-tight">Dịch vụ</h1>
        <Link
          href="/admin/services/new"
          className="px-4 py-2 bg-ink text-paper text-sm font-medium hover:opacity-90"
        >
          + Thêm dịch vụ
        </Link>
      </div>
      <ServicesClient initialRows={rows} />
    </div>
  );
}
