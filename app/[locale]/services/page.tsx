import type { Metadata } from "next";
import Link from "next/link";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildBreadcrumbList, JsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

const titles: Record<string, string> = {
  vi: "Dịch vụ chế tạo & nâng cấp máy",
  en: "Machine Manufacturing & Upgrade Services",
};
const descs: Record<string, string> = {
  vi: "Chế tạo máy gia công theo yêu cầu và nâng cấp bộ điều khiển cho máy cũ — thiết kế, lắp đặt và bàn giao trọn gói tại Việt Nam.",
  en: "Custom machine manufacturing and controller upgrades for legacy machines — turnkey design, installation, and delivery in Vietnam.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = titles[locale] ?? titles.vi;
  const description = descs[locale] ?? descs.vi;
  return {
    title,
    description,
    alternates: buildAlternates("/services"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      url: "/services",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Placeholder copy — real content supplied later
const LOREM =
  "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.";

const specs: [string, string][] = [
  ["Số trục điều khiển", "5 trục"],
  ["Kích thước", "1800×700×1800 mm"],
  ["Bộ điều khiển", "Astro 10i"],
  ["Số cổng I/O", "24/16"],
  ["Servo/Drive", "400W"],
];

export default async function Service({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const breadcrumb = buildBreadcrumbList([
    { name: locale === "en" ? "Home" : "Trang chủ", url: `${APP_URL}${locale === "en" ? "/en" : ""}` },
    { name: titles[locale] ?? titles.vi, url: `${APP_URL}${locale === "en" ? "/en" : ""}/services` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line"
               style={{ background: "linear-gradient(180deg, #fafaf7 0%, #f0eee8 100%)" }}>
        <div className="absolute inset-0 qs-grid-bg opacity-50"></div>
        <div className="relative max-w-wrap mx-auto px-12 pt-12 pb-16">
          <div className="qs-crumb mb-8">
            <Link href="/">Trang chủ</Link><span className="sep">/</span>
            <span className="here">Dịch vụ</span>
          </div>
          <div className="qs-eyebrow">Service · Chế tạo & Nâng cấp</div>
          <h1 className="qs-h1 mt-3.5" style={{ fontSize: "clamp(48px,6vw,84px)" }}>
            Dịch vụ chế tạo<br/>
            <em className="not-italic font-semibold bg-gold-grad bg-clip-text text-transparent">&amp; nâng cấp máy</em>
          </h1>
          <p className="qs-lede mt-6 max-w-[64ch]">{LOREM}</p>

          {/* machine image strip */}
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {["Máy delta robot", "Máy phay CNC", "Máy gia công"].map((label) => (
              <Frame key={label} label={label} className="aspect-[4/3]" />
            ))}
          </div>
        </div>
      </section>

      {/* THÔNG TIN DỰ ÁN CHẾ TẠO */}
      <section className="py-24 bg-white">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Dự án chế tạo ]</span>
              <h2 className="qs-h2 mt-2">Thông tin dự án chế tạo</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">Case study</span>
          </div>

          <div className="grid md:grid-cols-[1fr_1.15fr] gap-12 items-start">
            <Frame label="Máy gia công kim hoàn" className="aspect-[4/5]" />

            <div>
              <h3 className="font-display font-bold text-[26px] tracking-[-.01em] uppercase m-0">
                Chế tạo máy gia công kim hoàn
              </h3>

              <div className="mt-7">
                <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase mb-3">Thông số kỹ thuật</div>
                <ul className="list-none p-0 m-0">
                  {specs.map(([l, v]) => (
                    <li key={l} className="grid grid-cols-[1fr_auto] gap-4 items-baseline border-b border-line py-2.5 last:border-b-0">
                      <span className="text-sm text-[#4a4842]">{l}</span>
                      <span className="font-display text-[15px] font-semibold text-ink">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[15px] leading-[1.75] text-[#3a3a3a] mt-7 mb-3.5">{LOREM}</p>
              <p className="text-[15px] leading-[1.75] text-[#3a3a3a] m-0">{LOREM}</p>
            </div>
          </div>

          {/* detail images */}
          <div className="grid sm:grid-cols-2 gap-6 mt-10">
            {["Chi tiết cụm trục", "Chi tiết cơ khí"].map((label) => (
              <Frame key={label} label={label} className="aspect-[16/9]" />
            ))}
          </div>
        </div>
      </section>

      {/* DỊCH VỤ NÂNG CẤP MÁY */}
      <section className="py-24 bg-paper border-y border-line">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Nâng cấp ]</span>
              <h2 className="qs-h2 mt-2">Dịch vụ nâng cấp máy</h2>
            </div>
            <span className="font-mono text-[11px] text-muted tracking-[.1em] uppercase">Before · After</span>
          </div>

          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            <div>
              <div className="font-mono text-[11px] text-muted tracking-[.18em] uppercase text-center mb-3">Trước</div>
              <Frame label="Máy trước nâng cấp" className="aspect-[3/4]" />
            </div>
            <div className="hidden sm:flex items-center justify-center text-gold-1 text-2xl pt-7" aria-hidden>→</div>
            <div>
              <div className="font-mono text-[11px] text-ink tracking-[.18em] uppercase text-center mb-3">Sau</div>
              <Frame label="Máy sau nâng cấp" className="aspect-[3/4]" />
            </div>
          </div>

          <p className="text-[15px] leading-[1.75] text-[#3a3a3a] max-w-[80ch] mt-10 m-0">{LOREM}</p>
        </div>
      </section>

      {/* MÔ TẢ YÊU CẦU */}
      <section className="py-24 bg-white" id="quote">
        <div className="max-w-wrap mx-auto px-12">
          <div className="qs-section-head">
            <div>
              <span className="font-mono text-[11px] text-gold-1 tracking-[.16em] uppercase">[ Liên hệ ]</span>
              <h2 className="qs-h2 mt-2">Mô tả yêu cầu</h2>
            </div>
          </div>

          <form className="bg-paper border border-line p-8 max-w-[820px]">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Họ và tên *" name="name" />
              <Field label="Số điện thoại *" name="phone" type="tel" />
              <Field label="Email *" name="email" type="email" />
            </div>
            <div className="mt-5">
              <label className="block">
                <span className="block font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-1.5">Nội dung</span>
                <textarea name="message" rows={6}
                          className="w-full border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors resize-y" />
              </label>
            </div>
            <div className="flex justify-end mt-5">
              <button type="submit" className="qs-btn qs-btn-gold justify-center">Gửi yêu cầu →</button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function Frame({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`qs-img-ph ${className}`} role="img" aria-label={label}>
      <span className="px-4 text-center">{label}</span>
    </div>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-1.5">{label}</span>
      <input name={name} type={type} className="w-full border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors" />
    </label>
  );
}
