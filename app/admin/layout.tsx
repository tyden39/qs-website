import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/auth/require";
import { AdminShell } from "./_components/admin-shell";

const ALLOWED_ROLES = new Set(["admin", "editor"]);

export const metadata = {
  title: "QS Admin Console",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCachedSession();
  if (!session) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }
  const role = session.user.role ?? "customer";
  if (!ALLOWED_ROLES.has(role)) {
    redirect("/403");
  }

  return <AdminShell user={{ ...session.user, role }}>{children}</AdminShell>;
}
