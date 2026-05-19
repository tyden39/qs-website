import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/data/products";
import { ProductTable } from "./_components/product-columns";

export const metadata = { title: "Sản phẩm — QS Admin" };

export default async function AdminProductsPage() {
  const rows = await getAllProductsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sản phẩm</h1>
          <p className="text-sm text-muted mt-0.5">
            {rows.length} sản phẩm trong hệ thống
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 transition-colors"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      <ProductTable rows={rows} />
    </div>
  );
}
