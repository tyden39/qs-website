import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/require";
import { DatasheetForm } from "../_components/datasheet-form";
import { createDatasheet } from "@/app/admin/_actions/datasheets";

export default async function NewDatasheetPage() {
  await requireRole(["admin", "editor"]);

  async function handleCreate(data: unknown) {
    "use server";
    await createDatasheet(data);
    redirect("/admin/datasheets");
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted tracking-[.14em] uppercase mb-2">
          <Link href="/admin/datasheets" className="hover:text-ink transition-colors">Datasheets</Link>
          <span>/</span>
          <span className="text-gold-1">Thêm mới</span>
        </div>
        <h1 className="font-display font-bold text-2xl tracking-[-.01em]">Thêm Datasheet</h1>
      </div>

      <DatasheetForm onSubmit={handleCreate} submitLabel="Tạo datasheet" />
    </div>
  );
}
