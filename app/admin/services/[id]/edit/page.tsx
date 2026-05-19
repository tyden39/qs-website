import { notFound } from "next/navigation";
import Link from "next/link";
import { adminGetServiceById } from "@/lib/data/services";
import { EditServiceForm } from "../../_components/edit-service-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditServicePage({ params }: Props) {
  const { id } = await params;
  const row = await adminGetServiceById(id);
  if (!row) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/services" className="text-sm text-muted hover:underline">
          ← Danh sách
        </Link>
        <h1 className="font-display font-bold text-2xl tracking-tight">
          Chỉnh sửa: {(row.title as { vi: string }).vi}
        </h1>
      </div>
      <EditServiceForm row={row} />
    </div>
  );
}
