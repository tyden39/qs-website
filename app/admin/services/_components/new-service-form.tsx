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
import { createService } from "@/app/admin/_actions/services";
import { ServiceFormFields } from "./service-form-fields";

export function NewServiceForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      slug: "",
      title: { vi: "" },
      hero: { headline: { vi: "" }, subhead: { vi: "" } },
      stats: [],
      intro: [],
      process: [],
      included: [],
      faqs: [],
      tiers: [],
      status: "draft",
      sort: 0,
    },
  });

  const processArray = useFieldArray({ control: form.control, name: "process" });
  const includedArray = useFieldArray({ control: form.control, name: "included" });
  const faqsArray = useFieldArray({ control: form.control, name: "faqs" });
  const tiersArray = useFieldArray({ control: form.control, name: "tiers" });

  async function onSubmit(data: ServiceFormValues) {
    setServerError(null);
    const res = await createService(data as ServiceSchemaType);
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
      submitLabel="Tạo dịch vụ"
      cancelHref="/admin/services"
      slugEditable
    />
  );
}
