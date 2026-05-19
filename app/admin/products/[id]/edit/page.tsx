import { notFound } from "next/navigation";
import { getProductByIdForAdmin } from "@/lib/data/products";
import { ProductForm } from "../../_components/product-form";
import type {
  I18nText,
  ProductImage,
  ProductSpec,
} from "@/lib/db/schema/catalog";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Sửa: ${id} — QS Admin` };
}

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;
  const row = await getProductByIdForAdmin(id);

  if (!row) notFound();

  const name = row.name as I18nText;
  const desc = row.desc as I18nText;
  const tag = row.tag as I18nText;
  const bullets = (row.bullets as I18nText[]).map((b) => ({
    vi: b.vi ?? "",
    en: b.en ?? "",
  }));
  const specs = row.specs as ProductSpec[];
  const images = (row.images as ProductImage[]).map((img) => ({
    url: img.url,
    alt: { vi: img.alt?.vi ?? "", en: img.alt?.en ?? "" },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          Chỉnh sửa: {name.vi}
        </h1>
        <p className="text-sm text-muted mt-0.5 font-mono">{row.slug}</p>
      </div>

      <ProductForm
        mode="edit"
        defaultValues={{
          id: row.slug,
          slug: row.slug,
          series: row.series,
          axes: row.axes,
          display: row.display,
          badge: row.badge ?? "",
          tag,
          name,
          desc,
          bullets,
          specs,
          images,
          status: row.status as "draft" | "published" | "archived",
          sort: row.sort,
        }}
      />
    </div>
  );
}
