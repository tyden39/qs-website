import Link from "next/link";

export const metadata = { title: "404 — Không tìm thấy trang | QS Technology" };

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-paper grid items-center"
             style={{ padding: "96px 0", minHeight: "calc(100vh - 380px)" }}>
      <div className="absolute inset-0 qs-grid-bg opacity-40"></div>
      <div className="relative max-w-wrap mx-auto px-12 text-center flex flex-col items-center gap-2">
        <div className="font-mono text-[11px] text-gold-1 tracking-[.2em] uppercase flex gap-3 items-center
                        before:content-[''] before:w-8 before:h-px before:bg-gold before:opacity-60
                        after:content-[''] after:w-8 after:h-px after:bg-gold after:opacity-60">
          Error · E.NF.404
        </div>

        <div className="relative font-display font-bold leading-[.9] tracking-[-.04em] mt-3.5
                        bg-gold-grad bg-clip-text text-transparent"
             style={{ fontSize: "clamp(160px, 22vw, 280px)" }}>
          404
          <span className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full"
                style={{ bottom: "8%", background: "#c8553d", boxShadow: "0 0 0 6px rgba(200,85,61,.18)" }}></span>
        </div>

        <h1 className="font-display font-bold tracking-[-.015em] text-ink mt-3.5"
            style={{ fontSize: "clamp(28px, 3vw, 40px)" }}>
          Không tìm thấy trang
        </h1>
        <p className="text-[15px] leading-[1.7] text-[#4a4842] mt-3.5 max-w-[48ch]">
          URL bạn vừa truy cập không có trong sơ đồ trang của QS Technology — có thể đã được di chuyển, đổi tên, hoặc bạn gõ sai địa chỉ.
        </p>
        <div className="flex gap-2.5 mt-8">
          <Link className="qs-btn qs-btn-gold" href="/">← Về trang chủ</Link>
          <Link className="qs-btn qs-btn-ghost" href="/contact">Liên hệ</Link>
        </div>
      </div>
    </section>
  );
}
