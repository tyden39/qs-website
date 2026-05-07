export type News = { slug:string; title:string; date:string; cat:string; excerpt:string };

export const news: News[] = [
  { slug:"astro-12x", title:"Astro 12X — flagship 12 trục mới", date:"15.04.2026", cat:"Sản phẩm",
    excerpt:"Bản nâng cấp lớn của dòng Astro với 12 trục đồng bộ qua EtherCAT, tích hợp module thị giác máy GigE Vision 5MP." },
  { slug:"hanoi-expo-2026", title:"QS tham gia Hanoi Manufacturing Expo 2026", date:"02.04.2026", cat:"Sự kiện",
    excerpt:"Gian hàng C-21, demo Astro 10i đồng bộ 10 trục thời gian thực, tặng voucher chế tạo board mẫu." },
  { slug:"firmware-v311", title:"Firmware F-series v3.11 phát hành", date:"21.03.2026", cat:"Cập nhật",
    excerpt:"Hỗ trợ chuẩn Macro B, cải thiện look-ahead 1024 block, tối ưu giao diện cảm ứng cho F10T." },
  { slug:"customer-thien-an", title:"Triển khai 24 controller F86 cho Thiên Ân Group", date:"08.03.2026", cat:"Khách hàng",
    excerpt:"Thay thế controller nhập khẩu trên 24 máy phay khuôn nhôm, giảm 40% chi phí bảo trì." },
  { slug:"open-binhduong", title:"Khai trương trung tâm hỗ trợ Bình Dương", date:"15.02.2026", cat:"Công ty",
    excerpt:"Trung tâm hỗ trợ kỹ thuật thứ 5 của QS, phục vụ khu công nghiệp VSIP 1, 2 và Mỹ Phước." },
  { slug:"servo-vk", title:"Servo vòng kín QS — encoder tuyệt đối Made in Vietnam", date:"30.01.2026", cat:"Sản phẩm",
    excerpt:"Dòng servo mới với encoder tuyệt đối 23-bit, momen xoắn đến 22 N·m, tương thích Astro series." },
];
