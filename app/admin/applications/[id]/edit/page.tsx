import { notFound } from "next/navigation";
import Link from "next/link";
import { adminGetApplicationById } from "@/lib/data/applications";
import { EditApplicationForm } from "../../_components/edit-application-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditApplicationPage({ params }: Props) {
  const { id } = await params;
  const row = await adminGetApplicationById(id);
  if (!row) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/applications" className="text-sm text-muted hover:underline">
          ← Danh sách
        </Link>
        <h1 className="font-display font-bold text-2xl tracking-tight">
          Chỉnh sửa: {(row.title as { vi: string }).vi}
        </h1>
      </div>
      <EditApplicationForm row={row} />
    </div>
  );
}
