export type Product = {
  slug: string;
  name: string;
  axes: string;
  display: string;
  tag: string;
  specs: { l: string; v: string }[];
};

export const products: Product[] = [
  { slug:"f54",  name:"F54",  axes:"3 trục", display:"Màn 5\"",
    tag:"Controller cơ bản cho phay, router gỗ, máy khắc CNC vừa và nhỏ.",
    specs:[{l:"Số trục",v:"3"},{l:"Màn hình",v:"5\" 800×480"},{l:"I/O",v:"24in / 16out"},{l:"Bộ nhớ",v:"8 GB"},{l:"Nguồn",v:"24 VDC"},{l:"Bảo hành",v:"24 tháng"}] },
  { slug:"f86",  name:"F86",  axes:"6 trục", display:"Màn 8\"",
    tag:"Controller đa trục cho máy phay 5 trục có ATC, gia công khuôn nhôm.",
    specs:[{l:"Số trục",v:"6"},{l:"Màn hình",v:"8\" 1024×768"},{l:"I/O",v:"40in / 32out"},{l:"Bộ nhớ",v:"16 GB"},{l:"Nguồn",v:"24 VDC"},{l:"Bảo hành",v:"24 tháng"}] },
  { slug:"f10t", name:"F10T", axes:"Touch", display:"10.1\" cảm ứng",
    tag:"Controller cảm ứng cho máy tiện CNC chính xác, có biến thể xoay 270°.",
    specs:[{l:"Số trục",v:"4"},{l:"Màn hình",v:"10.1\" cảm ứng"},{l:"I/O",v:"32in / 24out"},{l:"Bộ nhớ",v:"16 GB"},{l:"Nguồn",v:"24 VDC"},{l:"Bảo hành",v:"24 tháng"}] },
  { slug:"astro-6ah",name:"Astro 6AH",axes:"6 trục", display:"Vòng kín",
    tag:"Controller vòng kín cho dây chuyền tự động hoá, hỗ trợ servo encoder tuyệt đối.",
    specs:[{l:"Số trục",v:"6 vòng kín"},{l:"Encoder",v:"Tuyệt đối"},{l:"Cycle",v:"500 µs"},{l:"Fieldbus",v:"EtherCAT"},{l:"Nguồn",v:"24 VDC"},{l:"Bảo hành",v:"24 tháng"}] },
  { slug:"astro-10i",name:"Astro 10i",axes:"10 trục", display:"EtherCAT",
    tag:"Controller cho dây chuyền lắp ráp, đồng bộ 10 trục qua EtherCAT thời gian thực.",
    specs:[{l:"Số trục",v:"10"},{l:"Cycle",v:"250 µs"},{l:"Fieldbus",v:"EtherCAT"},{l:"OPC UA",v:"Có"},{l:"Nguồn",v:"24 VDC"},{l:"Bảo hành",v:"24 tháng"}] },
  { slug:"astro-12x",name:"Astro 12X",axes:"12 trục", display:"Vision",
    tag:"Flagship 2026 — 12 trục đồng bộ, tích hợp module thị giác máy GigE Vision.",
    specs:[{l:"Số trục",v:"12"},{l:"Cycle",v:"250 µs"},{l:"Vision",v:"GigE 5MP"},{l:"Màn hình",v:"12.1\" IP65"},{l:"Bộ nhớ",v:"64 GB SSD"},{l:"Bảo hành",v:"24 tháng"}] },
];
