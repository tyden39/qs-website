"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  Newspaper,
  Cog,
  Wrench,
  FileText,
  Inbox,
  ScrollText,
  Users,
  Settings,
} from "lucide-react";

export type NavRole = "admin" | "editor";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  role?: NavRole;
};

// Locked nav — parallel streams DO NOT edit this list. Placeholder entries
// route to stubs that say "coming soon" until the owning stream lands.
const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Box },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/applications", label: "Applications", icon: Cog },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/datasheets", label: "Datasheets", icon: FileText },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/audit", label: "Audit", icon: ScrollText, role: "admin" },
  { href: "/admin/users", label: "Users", icon: Users, role: "admin" },
  { href: "/admin/settings", label: "Settings", icon: Settings, role: "admin" },
];

export function Sidebar({ role }: { role: NavRole }) {
  const pathname = usePathname();
  const visible = navItems.filter((item) => !item.role || item.role === role);

  return (
    <nav className="border-r border-line bg-paper h-full px-3 py-5 flex flex-col gap-1">
      <div className="px-3 pb-4 mb-1 border-b border-line">
        <Link href="/admin/dashboard" className="font-display font-bold text-lg tracking-tight">
          QS Admin
        </Link>
        <div className="mt-0.5 font-mono text-[10px] text-muted tracking-[.16em] uppercase">
          Console · 2026
        </div>
      </div>
      {visible.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-sm border ${
              active
                ? "bg-ink text-paper border-ink"
                : "border-transparent text-ink hover:border-line hover:bg-white"
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
