"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const left  = [["/products","Sản phẩm"],["/applications","Ứng dụng"],["/service","Dịch vụ"],["/downloads","Tải về"]] as const;
const right = [["/about","Giới thiệu"],["/news","Tin tức"],["/contact","Liên hệ"]] as const;

function openSearch(){ document.getElementById("qs-search-panel")?.classList.add("open"); document.getElementById("qs-search-backdrop")?.classList.add("open"); }

export default function Header() {
  const path = usePathname();
  const is = (href: string) => path === href || (href !== "/" && path.startsWith(href));

  return (
    <>
      <div className="bg-ink text-[#a8a499] text-[11px] tracking-[.12em] font-mono uppercase">
        <div className="qs-wrap py-2 flex justify-between gap-4">
          <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-2 mr-2 align-middle"></span>Hotline 24/7 · +84 28 3636 1234</span>
          <span className="hidden md:inline">Hỗ trợ tại 35 tỉnh thành · 24h on-site</span>
        </div>
      </div>

      <nav className="bg-white border-b border-line sticky top-0 z-50">
        <div className="qs-wrap flex items-center justify-between gap-8 h-[72px]">
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo-st.png" alt="ST" width={120} height={42} priority className="h-[42px] w-auto" />
              <div className="flex flex-col leading-[1.1]">
                <b className="font-display font-bold text-sm tracking-[.04em]">QS TECHNOLOGY</b>
                <small className="font-mono text-[9px] text-muted tracking-[.18em] uppercase">CNC · Automation · Vietnam</small>
              </div>
            </Link>
            <div className="hidden md:flex">
              {left.map(([h,l]) => (
                <Link key={h} href={h} className={`px-3 py-2 text-sm transition-colors ${is(h) ? "text-ink font-semibold" : "text-[#5a5650] hover:text-ink"}`}>{l}</Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex">
              {right.map(([h,l]) => (
                <Link key={h} href={h} className={`px-3 py-2 text-sm transition-colors ${is(h) ? "text-ink font-semibold" : "text-[#5a5650] hover:text-ink"}`}>{l}</Link>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={openSearch} aria-label="Tìm kiếm" className="w-9 h-9 grid place-items-center border border-line hover:border-ink">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </button>
              <button aria-label="Ngôn ngữ" className="w-9 h-9 grid place-items-center border border-line hover:border-ink font-mono text-[10px] tracking-wider">VI</button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
