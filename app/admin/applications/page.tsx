import Link from "next/link";
import { adminListApplications } from "@/lib/data/applications";
import { ApplicationsClient } from "./_components/applications-client";

export default async function ApplicationsPage() {
  const rows = await adminListApplications();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl tracking-tight">Ứng dụng</h1>
        <Link
          href="/admin/applications/new"
          className="px-4 py-2 bg-ink text-paper text-sm font-medium hover:opacity-90"
        >
          + Thêm ứng dụng
        </Link>
      </div>
      <ApplicationsClient initialRows={rows} />
    </div>
  );
}
