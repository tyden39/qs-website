import { ImageResponse } from "next/og";
import { OgImageTemplate } from "@/lib/seo/og-image-template";

export const dynamic = "force-static";
export const alt = "QS Technology — Bộ điều khiển CNC Made in Vietnam";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgImageTemplate
        title="Bộ điều khiển CNC Made in Vietnam"
        subtitle="Sáu dòng controller cho mọi cấu hình máy — phay, uốn, dán keo, kim hoàn."
        tag="QS Technology"
      />
    ),
    { width: 1200, height: 630 },
  );
}
