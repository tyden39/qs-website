import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-ink-2 text-[#a8a499] mt-0">
      <div className="qs-wrap py-16 grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-12">
        <div>
          <div className="flex items-center gap-3.5">
            <Image src="/logo-st.png" alt="ST" width={140} height={48} className="h-12 w-auto brightness-110"/>
            <div>
              <b className="font-display font-bold text-[22px] bg-gold-grad bg-clip-text text-transparent tracking-[.02em] block">QS TECHNOLOGY CO., LTD</b>
              <div className="h-px bg-gold-1 w-4/5 mt-1.5"></div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed max-w-md">Nhà sản xuất bộ điều khiển CNC, servo và board mở rộng — thiết kế tại Việt Nam, phục vụ cơ khí chính xác trong nước và xuất khẩu.</p>
        </div>
        <FootCol title="Sản phẩm" links={[["/products","Bộ điều khiển CNC"],["/products","Servo motor"],["/products","Board mở rộng"],["/products","Phụ kiện"]]}/>
        <FootCol title="Hỗ trợ" links={[["/service","Chế tạo riêng"],["/downloads","Tải tài liệu"],["/applications","Ứng dụng"],["/contact","Liên hệ kỹ thuật"]]}/>
        <FootCol title="Công ty" links={[["/about","Giới thiệu"],["/news","Tin tức"],["/contact","Văn phòng"],["#","Tuyển dụng"]]}/>
      </div>
      <div className="border-t border-[#2a2620]">
        <div className="qs-wrap py-5 flex flex-col md:flex-row justify-between gap-3 text-[11px] font-mono tracking-wider text-[#7a7570]">
          <span>© 2026 QS TECHNOLOGY CO., LTD · MST 0312345678</span>
          <span>123 KCN Tân Bình, Q. Tân Bình, TP.HCM · sales@qstechnology.vn</span>
        </div>
      </div>
    </footer>
  );
}
function FootCol({ title, links }: { title: string; links: readonly (readonly [string,string])[] }) {
  return (
    <div>
      <h4 className="font-mono text-[10px] tracking-[.18em] text-gold-2 uppercase mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map(([h,l]) => <li key={l}><Link href={h} className="text-sm hover:text-white transition-colors">{l}</Link></li>)}
      </ul>
    </div>
  );
}
