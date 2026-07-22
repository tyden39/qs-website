import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMachines, MACHINE_TYPES } from "@/lib/data/machines";
import MachineList, { type MachineSection } from "../../cnc/_components/machine-list";
import { CategoryShell, categoryMetadata } from "../_components/category-page";
import type { Locale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: Locale }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata(params, "machines");
}

export default async function MachinesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "product.page.types" });
  const tb = await getTranslations({ locale, namespace: "product.page.toolbar" });
  const machines = getMachines(locale);
  const sections: MachineSection[] = MACHINE_TYPES.map((id) => ({
    id,
    label: t(`machines.${id}`),
    machines: machines.filter((m) => m.type === id),
  })).filter((s) => s.machines.length > 0);
  return (
    <CategoryShell locale={locale} id="machines" count={machines.length}>
      <MachineList
        machines={machines}
        sections={sections}
        typeNavLabel={t("navLabel")}
        allLabel={t("all")}
        showingLabel={tb("showing")}
        unitLabel={tb("ofMachines")}
      />
    </CategoryShell>
  );
}
