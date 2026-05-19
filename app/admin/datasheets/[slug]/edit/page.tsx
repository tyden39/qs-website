import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/require";
import { db } from "@/lib/db/client";
import { datasheet } from "@/lib/db/schema/catalog";
import { DatasheetForm } from "../../_components/datasheet-form";
import { updateDatasheet } from "@/app/admin/_actions/datasheets";
import type { I18nText } from "@/lib/db/schema/catalog";

type Props = { params: Promise<{ slug: string }> };

export default async function EditDatasheetPage({ params }: Props) {
  await requireRole(["admin", "editor"]);
  const { slug } = await params;

  const [row] = await db.select().from(datasheet).where(eq(datasheet.slug, slug));
  if (!row) notFound();

  const defaultValues = {
    slug: row.slug,
    name: row.name as I18nText,
    fileUrl: row.fileUrl,
    productSlug: row.productSlug ?? undefined,
    category: row.category,
    series: row.series,
    lang: row.lang,
    ext: row.ext,
    version: row.version ?? undefined,
    sizeBytes: row.sizeBytes,
    status: row.status as "draft" | "published",
    sort: row.sort,
  };

  async function handleUpdate(data: unknown) {
    "use server";
    // Extract slug from data to pass separately; rest is the update payload
    const { slug: _s, ...updateData } = data as { slug: string; [k: string]: unknown };
    await updateDatasheet(slug, updateData);
    redirect("/admin/datasheets");
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted tracking-[.14em] uppercase mb-2">
          <Link href="/admin/datasheets" className="hover:text-ink transition-colors">Datasheets</Link>
          <span>/</span>
          <span className="text-gold-1">{slug}</span>
          <span>/</span>
          <span className="text-gold-1">Sửa</span>
        </div>
        <h1 className="font-display font-bold text-2xl tracking-[-.01em]">Sửa Datasheet</h1>
      </div>

      <DatasheetForm
        defaultValues={defaultValues}
        onSubmit={handleUpdate}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}
