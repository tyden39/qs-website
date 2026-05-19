import type { Metadata } from "next";
import "./globals.css";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

const sans = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans" });
const display = Inter_Tight({ subsets: ["latin", "vietnamese"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://qstech.vn";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "QS Technology — Bộ điều khiển CNC Made in Vietnam",
    template: "%s | QS Technology",
  },
  description:
    "Thiết kế và sản xuất bộ điều khiển CNC, servo, board mở rộng tại Việt Nam. Hỗ trợ trực tiếp tại 35 tỉnh thành, bảo hành 24 tháng.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    siteName: "QS Technology",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@qstechnology",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // lang stays "vi" at the root; locale-aware layouts can override it
  // for the dynamic part if SEO crawlers need exact language tagging.
  return (
    <html lang="vi" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
