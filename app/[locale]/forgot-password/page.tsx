import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.forgot" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="min-h-[70vh] bg-paper grid place-items-center px-4">
      <ForgotPasswordForm />
    </section>
  );
}
