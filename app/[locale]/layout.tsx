import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchPanel from "@/components/SearchPanel";
import { routing } from "@/lib/i18n/routing";

export const metadata: Metadata = {
  title: "QS Technology — Bộ điều khiển CNC Made in Vietnam",
  description:
    "Thiết kế và sản xuất bộ điều khiển CNC, servo, board mở rộng tại Việt Nam. Hỗ trợ trực tiếp tại 35 tỉnh thành, bảo hành 24 tháng.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <Header />
      <SearchPanel />
      {children}
      <Footer />
    </NextIntlClientProvider>
  );
}
