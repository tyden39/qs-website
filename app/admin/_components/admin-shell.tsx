import type { ReactNode } from "react";
import { Sidebar, type NavRole } from "./sidebar";
import { UserMenu } from "./user-menu";

type Props = {
  user: { name?: string | null; email: string; role?: string | null };
  children: ReactNode;
};

export function AdminShell({ user, children }: Props) {
  const role: NavRole = user.role === "admin" ? "admin" : "editor";

  return (
    <div className="min-h-screen bg-paper-2 text-ink grid grid-cols-[240px_1fr]">
      <aside className="hidden md:block sticky top-0 h-screen">
        <Sidebar role={role} />
      </aside>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white border-b border-line h-14 flex items-center justify-between px-5">
          <div className="font-mono text-[10px] tracking-[.18em] uppercase text-muted">
            QS Admin Console
          </div>
          <UserMenu user={user} />
        </header>
        <main className="flex-1 px-6 py-7 max-w-[1280px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
