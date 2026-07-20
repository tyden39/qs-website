import Image from "next/image";
import { getTranslations } from "next-intl/server";
import CircuitTraces from "./circuit-traces";

/* Monochrome glyphs — the gold circle is provided by the .qs-foot-ic badge. */
const fb = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.6l.4-3h-3V8.1c0-.86.24-1.45 1.5-1.45h1.6V4a21 21 0 0 0-2.34-.12c-2.32 0-3.9 1.42-3.9 4.02V10H7.7v3h2.66v8h3.14z"/></svg>`;
const yt = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M9 7.5v9l8-4.5z"/></svg>`;
const zalo = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.9 3 3 6.5 3 10.8c0 2.4 1.3 4.6 3.3 6-.1.9-.5 2-1.4 2.9-.2.2 0 .55.32.5 1.8-.25 3.18-.85 4.18-1.45.83.2 1.7.3 2.6.3 5.1 0 9-3.5 9-7.8S17.1 3 12 3z"/></svg>`;
const pin =`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>`;
const phone = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1l-2.22 2.2z"/></svg>`;
const mail = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`;

export default async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="qs-foot mt-24 relative overflow-hidden">
      {/* PCB traces concentrated in top-right & lower-left — mirrored opposite to the hero's corners.
          The lower-left block is lifted above the copyright/separator bar (bottom-[18%]) and its mask
          is centred on the left edge so the traces never clutter the gold separator line. */}
      <div className="absolute top-0 right-0 w-[36%] h-[58%] opacity-[.5] pointer-events-none [mask-image:radial-gradient(ellipse_at_top_right,#000_38%,transparent_74%)] [-webkit-mask-image:radial-gradient(ellipse_at_top_right,#000_38%,transparent_74%)]" aria-hidden="true">
        <CircuitTraces variant="dark" className="w-full h-full" />
      </div>
      <div className="absolute bottom-[18%] left-0 w-[36%] h-[52%] opacity-[.5] pointer-events-none [mask-image:radial-gradient(ellipse_at_left,#000_30%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_left,#000_30%,transparent_70%)]" aria-hidden="true">
        <CircuitTraces variant="dark" className="w-full h-full" />
      </div>

      <div className="qs-foot-inner relative z-10">
        {/* Masthead — brand lockup + spec line */}
        <div className="qs-foot-masthead">
          <div className="flex items-center gap-3.5">
            <div className="grid place-items-center h-12">
              <Image src="/logo-st.png" alt="ST" width={1707} height={877} className="h-12 w-auto block brightness-105"/>
            </div>
            <div>
              <b className="font-display font-bold text-[22px] bg-gold-grad bg-clip-text text-transparent tracking-[.02em] block">QS TECHNOLOGY CO., LTD</b>
            </div>
          </div>
          <div className="qs-foot-tagline">
            <b>{t("tagline1")}</b><br/>
            {t("tagline2")}
          </div>
        </div>

        {/* Three-column datasheet */}
        <div className="qs-foot-cols">
          {/* About the company */}
          <div>
            <h5>{t("about.title")}</h5>
            <p className="text-[#a8a395] leading-relaxed text-[15px] mt-0">
              {t("about.body")}
            </p>
            <a href="http://online.gov.vn/Website/chi-tiet-135123" target="_blank" rel="noopener noreferrer"
               className="inline-block mt-7 transition-opacity hover:opacity-90" aria-label={t("moctt")}>
              <Image src="/footer/da-thong-bao-bo-cong-thuong.png" alt={t("moctt")}
                     width={300} height={114} className="h-[58px] w-auto block"/>
            </a>
          </div>

          {/* Social media */}
          <div>
            <h5>{t("social.title")}</h5>
            <ul className="qs-foot-social">
              <Social href="https://www.facebook.com/groups/434216619411709/" svg={fb}   label="Facebook" handle="QS Technology CNC" />
              <Social href="https://youtube.com/@qstechnology7516"            svg={yt}   label="Youtube"  handle="@qstechnology7516" />
              <Social href="https://zalo.me/0905438533"                       svg={zalo} label="Zalo"     handle="0905 438 533" />
            </ul>
          </div>

          {/* Contact information */}
          <div>
            <h5>{t("contact.title")}</h5>
            <div className="qs-foot-contact">
              <ContactGroup svg={phone} label={t("contact.phone")}>
                <Line href="tel:+84909663350">(+84) 909.663.350</Line>
                <Line href="tel:+84922322338">(+84) 922.322.338</Line>
              </ContactGroup>
              <ContactGroup svg={mail} label={t("contact.email")}>
                <Line href="mailto:support@qstcnc.com">support@qstcnc.com</Line>
              </ContactGroup>
              <ContactGroup svg={pin} label={t("contact.address")}>
                <Line href="https://maps.app.goo.gl/axYe5FydxeNHuCXT6">117 Đường Trương Thị Như, Xuân Thới Sơn, Hóc Môn, Thành phố Hồ Chí Minh – Việt Nam (700000).</Line>
              </ContactGroup>
            </div>
          </div>
        </div>
      </div>

      <div className="qs-foot-bottom relative z-10">
        <span>© 2026 QS Technology Co., Ltd · All rights reserved</span>
        <span className="made"><span className="qs-live-dot" aria-hidden="true"></span>{t("made")}</span>
      </div>
    </footer>
  );
}

function GoldIcon({ svg }: { svg: string }) {
  return (
    <span
      className="qs-foot-ic shrink-0 w-[30px] h-[30px] rounded-full bg-gold-grad grid place-items-center text-[#1a1206]"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function Social({ href, svg, label, handle }: { href: string; svg: string; label: string; handle: string }) {
  return (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="qs-foot-social-row group">
        <span className="qs-foot-social-ic">
          <GoldIcon svg={svg} />
        </span>
        <span className="qs-foot-social-name group-hover:text-gold-2">{label}</span>
        <span className="qs-foot-social-handle">{handle}</span>
        <span className="qs-foot-social-arrow" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </a>
    </li>
  );
}

/* Contact readout: icon → mono micro-label → stacked values */
function ContactGroup({ svg, label, children }: { svg: string; label: string; children: React.ReactNode }) {
  return (
    <div className="qs-foot-contact-row group">
      <span className="qs-foot-social-ic">
        <GoldIcon svg={svg} />
      </span>
      <div className="min-w-0">
        <div className="font-mono text-[10px] tracking-[.16em] uppercase text-gold-2/85 mb-1.5">{label}</div>
        <div className="flex flex-col gap-1">{children}</div>
      </div>
    </div>
  );
}

function Line({ href, children }: { href?: string; children: React.ReactNode }) {
  const cls = "text-[15px] leading-relaxed text-[#c2bdb0]";
  if (!href) return <span className={cls}>{children}</span>;
  const external = href.startsWith("http");
  return (
    <a href={href} className={`${cls} hover:text-gold-2 transition-colors`}
       {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}
