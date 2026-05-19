import Link from "next/link";
import { NewApplicationForm } from "../_components/new-application-form";

export default function NewApplicationPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/applications" className="text-sm text-muted hover:underline">
          ← Danh sách
        </Link>
        <h1 className="font-display font-bold text-2xl tracking-tight">Thêm ứng dụng</h1>
      </div>
      <NewApplicationForm />
    </div>
  );
}
