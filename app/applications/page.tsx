import Link from "next/link";

const apps = [
  { slug:"khuon-mau",   name:"Gia công khuôn mẫu",     count:"3 model"  },
  { slug:"tien-cnc",    name:"Tiện CNC chính xác",     count:"2 model"  },
  { slug:"phay-router", name:"Phay & router gỗ",       count:"2 model"  },
  { slug:"laser-plasma",name:"Cắt laser / plasma",     count:"2 model"  },
  { slug:"day-chuyen",  name:"Dây chuyền lắp ráp",     count:"3 model"  },
  { slug:"robot",       name:"Robot công nghiệp",      count:"2 model"  },
  { slug:"khac-laser",  name:"Khắc laser CO₂",         count:"1 model"  },
  { slug:"5-truc",      name:"Phay 5 trục đồng thời",  count:"2 model"  },
];

export const metadata = { title: "Ứng dụng — QS Technology" };

export default function Applications() {
  return (
    <section className="py-20">
      <div className="qs-wrap">
        <div className="qs-eyebrow">[ {apps.length} loại máy ]</div>
        <h1 className="qs-h2 mt-2 mb-10">QS controller chạy ở đâu?</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
          {apps.map(a => (
            <Link key={a.slug} href={`/applications/${a.slug}`} className="bg-white p-7 hover:bg-paper-2 transition-colors">
              <div className="font-mono text-[10px] text-gold-1 tracking-[.16em] uppercase">{a.count}</div>
              <h3 className="font-display font-semibold text-lg mt-2">{a.name}</h3>
              <span className="font-mono text-xs text-muted mt-3 inline-block">→ Xem chi tiết</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
