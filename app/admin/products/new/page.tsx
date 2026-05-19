import { ProductForm } from "../_components/product-form";

export const metadata = { title: "Thêm sản phẩm — QS Admin" };

export default function AdminProductNewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Thêm sản phẩm mới</h1>
        <p className="text-sm text-muted mt-0.5">
          Điền thông tin bên dưới và nhấn Lưu để tạo sản phẩm.
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
