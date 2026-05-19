import "./globals.css";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

const sans = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans" });
const display = Inter_Tight({ subsets: ["latin", "vietnamese"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // lang stays "vi" at the root; locale-aware layouts can override it
  // for the dynamic part if SEO crawlers need exact language tagging.
  return (
    <html lang="vi" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
