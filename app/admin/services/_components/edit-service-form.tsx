"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  serviceSchema,
  type ServiceFormValues,
  type ServiceSchemaType,
} from "@/lib/validation/service-schema";
import { updateService } from "@/app/admin/_actions/services";
import { ServiceFormFields } from "./service-form-fields";
import type { ServiceRow } from "@/lib/data/services";
import type {
  I18nText,
  ServiceProcessStep,
  ServiceIncluded,
  ServiceFaq,
  ServiceTier,
  ServiceStat,
} from "@/lib/db/schema/catalog";

type Props = { row: ServiceRow };

function toFormValues(row: ServiceRow): ServiceFormValues {
  const hero = row.hero as {
    headline: I18nText; subhead: I18nText;
    ctaPrimary?: I18nText; ctaSecondary?: I18nText;
  };
  return {
    slug: row.slug,
    title: row.title as I18nText,
    hero: {
      headline: hero.headline,
      subhead: hero.subhead,
      ctaPrimary: hero.ctaPrimary ?? { vi: "" },
      ctaSecondary: hero.ctaSecondary ?? { vi: "" },
    },
    stats: (row.stats as ServiceStat[]).map((s) => ({
      label: s.label as I18nText,
      value: s.value as I18nText,
    })),
    intro: (row.intro as I18nText[]).map((s) => ({ vi: s.vi, en: s.en })),
    process: (row.process as ServiceProcessStep[]).map((p) => ({
      num: p.num,
      day: p.day as I18nText,
      title: p.title as I18nText,
      desc: p.desc as I18nText,
      duration: p.duration as I18nText,
    })),
    included: (row.included as ServiceIncluded[]).map((i) => ({
      has: i.has,
      name: i.name as I18nText,
      note: i.note as I18nText,
      tag: i.tag as I18nText,
    })),
    faqs: (row.faqs as ServiceFaq[]).map((f) => ({
      q: f.q as I18nText,
      a: f.a as I18nText,
    })),
    tiers: (row.tiers as ServiceTier[]).map((t) => ({
      name: t.name,
      title: t.title as I18nText,
      price: t.price as I18nText,
      priceNote: t.priceNote as I18nText,
      features: (t.features as I18nText[]).map((f) => ({ vi: f.vi, en: f.en })),
      cta: t.cta as I18nText,
      featured: t.featured ?? false,
    })),
    status: row.status as "draft" | "published",
    sort: row.sort,
  };
}

export function EditServiceForm({ row }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: toFormValues(row),
  });

  const processArray = useFieldArray({ control: form.control, name: "process" });
  const includedArray = useFieldArray({ control: form.control, name: "included" });
  const faqsArray = useFieldArray({ control: form.control, name: "faqs" });
  const tiersArray = useFieldArray({ control: form.control, name: "tiers" });

  async function onSubmit(data: ServiceFormValues) {
    setServerError(null);
    const res = await updateService(row.slug, data as ServiceSchemaType);
    if (!res.ok) { setServerError(res.error ?? "Lỗi không xác định"); return; }
    router.push("/admin/services");
    router.refresh();
  }

  return (
    <ServiceFormFields
      form={form}
      processArray={processArray}
      includedArray={includedArray}
      faqsArray={faqsArray}
      tiersArray={tiersArray}
      onSubmit={onSubmit}
      serverError={serverError}
      submitLabel="Lưu thay đổi"
      cancelHref="/admin/services"
      slugEditable={false}
    />
  );
}
