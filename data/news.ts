export type News = { slug:string; title:string; date:string; cat:string; excerpt:string };

export const news: News[] = [
  { slug:"astro-12x",
    title:"QS công bố Astro 12X — flagship 12 trục cho dây chuyền tự động hoá",
    date:"28 · 04 · 2026",
    cat:"Sản phẩm mới",
    excerpt:"Phiên bản mở rộng EtherCAT, hỗ trợ tới 12 trục đồng bộ với chu kỳ 250µs, tích hợp module thị giác máy. Dự kiến giao hàng từ Q3/2026 cho khách hàng OEM trong nước. Đây là controller có số trục lớn nhất từng được sản xuất tại Việt Nam." },

  { slug:"vme-2026",
    title:"QS tham dự VME 2026 — Booth A23 tại SECC TP.HCM",
    date:"22 · 04 · 2026",
    cat:"Sự kiện",
    excerpt:"Triển lãm Cơ khí Chế tạo & Phụ trợ 2026 sẽ diễn ra 22–25/04 tại Trung tâm Hội chợ Triển lãm Sài Gòn. QS giới thiệu Astro 12X mới và demo trực tiếp." },

  { slug:"precitech-long-an",
    title:"Bàn giao 24 controller F86 cho PRECITECH Long An",
    date:"15 · 04 · 2026",
    cat:"Khách hàng",
    excerpt:"Lô hàng được lắp đặt trên dây chuyền phay khuôn nhôm tại nhà máy mới của PRECITECH, dự kiến vận hành từ tháng 5/2026." },

  { slug:"firmware-v42",
    title:"Firmware v4.2 — G-code tuỳ biến và post-processor Mastercam",
    date:"02 · 04 · 2026",
    cat:"Kỹ thuật",
    excerpt:"Bản cập nhật miễn phí cho toàn bộ controller QS từ 2018 trở đi, bổ sung 14 macro G-code và file post cho Mastercam 2026." },

  { slug:"binh-duong-expansion",
    title:"QS mở rộng nhà máy Bình Dương lên 4.200m²",
    date:"18 · 03 · 2026",
    cat:"Công ty",
    excerpt:"Khu mở rộng 1.800m² đi vào vận hành từ tháng 3/2026, nâng công suất bo mạch hàng tháng từ 720 lên 1.800. Tuyển thêm 18 nhân sự sản xuất." },

  { slug:"f10t-r",
    title:"F10T phiên bản touch xoay 270° ra mắt — F10T-R",
    date:"10 · 03 · 2026",
    cat:"Sản phẩm",
    excerpt:"Biến thể có cụm màn xoay điện tử cho máy phay đứng / nằm chuyển đổi. Đặt hàng trước nhận ưu đãi 8% đến 30/05/2026." },

  { slug:"shark-haiphong",
    title:"Triển khai Astro 10i tại xưởng đóng tàu SHARK Hải Phòng",
    date:"25 · 02 · 2026",
    cat:"Khách hàng",
    excerpt:"Hệ thống điều khiển 6 trục cho máy phay tấm thép vỏ tàu kích thước lớn. Là đơn hàng đầu tiên của QS trong ngành đóng tàu." },
];
