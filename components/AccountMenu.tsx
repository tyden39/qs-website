"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
import { issueSSOTicket } from "@/lib/auth/api";
import { AccountInfoModal } from "@/components/AccountInfoModal";

// Same "portal or ERP, by role" decision as erp-fe's TopBar account menu.
export function AccountMenu({ className = "", onNavigate }: { className?: string; onNavigate?: () => void }) {
  const t = useTranslations("auth.menu");
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const displayName = user?.full_name || user?.username || "";
  const isCustomer = user?.roles?.some((role) => role.code === "customer") ?? false;
  // "erp access" = holds any role other than the plain customer role (admin,
  // staff, etc.) — mirrors erp-fe's own TopBar gating.
  const isErpUser = user?.roles?.some((role) => role.code !== "customer") ?? false;
  const portalUrl = process.env.NEXT_PUBLIC_API_PORTAL ?? "";
  const erpUrl = process.env.NEXT_PUBLIC_API_ERP ?? "";

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  const openWithSSO = async (targetUrl: string) => {
    close();
    if (!targetUrl) return;
    try {
      const { ticket } = await issueSSOTicket();
      window.open(`${targetUrl}/sso?ticket=${encodeURIComponent(ticket)}`, "_blank", "noopener,noreferrer");
    } catch {
      // Best-effort: still let the user reach the target app and log in manually.
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const item = "block w-full text-left px-3 py-2.5 text-[13px] text-ink hover:bg-paper rounded";

  return (
    <div ref={rootRef} className={`relative items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={t("ariaLabel")}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 text-[13px] font-medium text-ink hover:text-black"
      >
        <span className="max-w-[140px] truncate">{displayName}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 top-full mt-2 min-w-[180px] bg-white border border-line rounded-md shadow-[0_18px_40px_-20px_rgba(20,18,14,.35)] p-1.5 z-50">
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              close();
              setIsInfoOpen(true);
            }}
          >
            {t("viewInfo")}
          </button>
          {isErpUser && (
            <button
              type="button"
              role="menuitem"
              className={item}
              disabled={!erpUrl}
              onClick={() => openWithSSO(erpUrl)}
            >
              {t("erp")}
            </button>
          )}
          {isCustomer && (
            <button
              type="button"
              role="menuitem"
              className={item}
              disabled={!portalUrl}
              onClick={() => openWithSSO(portalUrl)}
            >
              {t("portal")}
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className={`${item} text-red-600`}
            onClick={() => {
              close();
              void logout();
            }}
          >
            {t("logout")}
          </button>
        </div>
      )}

      {isInfoOpen && user && <AccountInfoModal user={user} onClose={() => setIsInfoOpen(false)} />}
    </div>
  );
}
