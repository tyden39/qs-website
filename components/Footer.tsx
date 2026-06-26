import { Link } from "@/lib/i18n/navigation";
import Image from "next/image";
import { NewsletterForm } from "./newsletter-form";
import CircuitTraces from "./circuit-traces";

const fb = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>`;
const yt = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.2-1.6-.9-2.3c-.9-.9-1.8-.9-2.3-1C16.5 3.5 12 3.5 12 3.5s-4.5 0-7.8.3c-.5 0-1.4 0-2.3 1C1.2 5.4 1 7 1 7S.8 9 .8 11v1.9c0 2 .2 3.9.2 3.9s.2 1.6.9 2.3c.9.9 2.1.9 2.6 1 1.9.2 8 .2 8 .2s4.5 0 7.8-.3c.5 0 1.4 0 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.9V11c0-2-.2-3.9-.2-3.9zM9.7 15V8.5l5.8 3.3L9.7 15z"/></svg>`;
const ig = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>`;

export default function Footer() {
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
      <div className="qs-foot-top relative z-10">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="grid place-items-center h-12">
              <Image src="/logo-st.png" alt="ST" width={140} height={48} className="h-12 w-auto block brightness-105"/>
            </div>
            <div>
              <b className="font-display font-bold text-[22px] bg-gold-grad bg-clip-text text-transparent tracking-[.02em] block">QS TECHNOLOGY CO., LTD</b>
              <div className="h-px bg-[#8a6f35] w-4/5 mt-1.5"></div>
            </div>
          </div>
          <p className="mt-4 text-[#a8a395] max-w-[38ch] leading-relaxed text-[13px]">
            Nhà sản xuất bộ điều khiển CNC, servo và board mở rộng — thiết kế tại Việt Nam, phục vụ cơ khí chính xác trong nước và xuất khẩu.
          </p>
          <div className="flex gap-2.5 mt-6">
            <Social href="#" svg={fb} label="Facebook" />
            <Social href="#" svg={yt} label="YouTube" />
            <Social href="#" svg={ig} label="Instagram" />
          </div>
        </div>

        <FootCol title="Sản phẩm" links={[
          ["/products","Bộ điều khiển CNC"],
          ["/products","Bộ điều khiển robot"],
          ["/products","Thiết bị DNC"],
          ["/products","Servo motor & drive"],
          ["/products","Phụ kiện CNC"],
        ]}/>
        <FootCol title="Công ty" links={[
          ["/about","Giới thiệu"],
          ["/applications","Ứng dụng"],
          ["/services","Dịch vụ"],
          ["/downloads","Tài liệu kỹ thuật"],
          ["/news","Tin tức"],
        ]}/>
        <FootCol title="Liên hệ" links={[
          ["#","123 KCN Tân Bình, TP.HCM"],
          ["tel:+842836361234","+84 28 3636 1234"],
          ["mailto:sales@qstechnology.vn","sales@qstechnology.vn"],
        ]}/>

        <div>
          <h5>Nhận bản tin kỹ thuật</h5>
          <p className="text-[#a8a395] text-[12px] leading-relaxed mt-1 mb-0 max-w-[28ch]">
            Cập nhật sản phẩm, firmware và tài liệu mới nhất từ QS.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="qs-foot-bottom relative z-10">
        <span>© 2026 QS Technology Co., Ltd · All rights reserved</span>
        <span className="made"><span className="qs-live-dot" aria-hidden="true"></span>Thiết kế &amp; sản xuất tại TP. Hồ Chí Minh · VN</span>
        <span>Privacy · Terms · Cookies</span>
      </div>
    </footer>
  );
}

function FootCol({ title, links }: { title: string; links: readonly (readonly [string,string])[] }) {
  return (
    <div>
      <h5>{title}</h5>
      <ul>
        {links.map(([h,l],i) => <li key={i}><Link href={h} className="hover:text-gold-2 transition-colors">{l}</Link></li>)}
      </ul>
    </div>
  );
}

function Social({ href, svg, label }: { href: string; svg: string; label: string }) {
  return (
    <a href={href} aria-label={label}
       className="w-[34px] h-[34px] border border-[#2a2a2a] grid place-items-center text-[#c2bdb0] hover:text-gold-2 hover:border-gold-1 transition-colors"
       dangerouslySetInnerHTML={{__html: svg}} />
  );
}
