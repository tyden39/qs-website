import Link from "next/link";
import { NewServiceForm } from "../_components/new-service-form";

export default function NewServicePage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/services" className="text-sm text-muted hover:underline">
          ← Danh sách
        </Link>
        <h1 className="font-display font-bold text-2xl tracking-tight">Thêm dịch vụ</h1>
      </div>
      <NewServiceForm />
    </div>
  );
}
