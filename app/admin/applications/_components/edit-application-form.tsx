"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  applicationSchema,
  type ApplicationFormValues,
  type ApplicationSchemaType,
} from "@/lib/validation/application-schema";
import { updateApplication } from "@/app/admin/_actions/applications";
import { ApplicationFormFields } from "./application-form-fields";
import type { ApplicationRow } from "@/lib/data/applications";
import type { I18nText, ApplicationWorkflow, ApplicationDeployment } from "@/lib/db/schema/catalog";

type Props = { row: ApplicationRow };

function toFormValues(row: ApplicationRow): ApplicationFormValues {
  return {
    slug: row.slug,
    title: row.title as I18nText,
    summary: row.summary as I18nText,
    heroImage: row.heroImage ?? "",
    workflow: (row.workflow as ApplicationWorkflow[]).map((w) => ({
      n: w.n,
      label: w.label as I18nText,
      title: w.title as I18nText,
      desc: w.desc as I18nText,
    })),
    specs: (row.specs as Array<{ label: I18nText; value: I18nText }>).map((s) => ({
      label: s.label,
      value: s.value,
    })),
    deployments: (row.deployments as ApplicationDeployment[]).map((d) => ({
      name: d.name,
      loc: d.loc as I18nText,
    })),
    status: row.status as "draft" | "published",
    sort: row.sort,
  };
}

export function EditApplicationForm({ row }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: toFormValues(row),
  });

  const workflowArray = useFieldArray({ control: form.control, name: "workflow" });
  const specsArray = useFieldArray({ control: form.control, name: "specs" });
  const deploymentsArray = useFieldArray({ control: form.control, name: "deployments" });

  async function onSubmit(data: ApplicationFormValues) {
    setServerError(null);
    const res = await updateApplication(row.slug, data as ApplicationSchemaType);
    if (!res.ok) { setServerError(res.error ?? "Lỗi không xác định"); return; }
    router.push("/admin/applications");
    router.refresh();
  }

  return (
    <ApplicationFormFields
      form={form}
      workflowArray={workflowArray}
      specsArray={specsArray}
      deploymentsArray={deploymentsArray}
      onSubmit={onSubmit}
      serverError={serverError}
      submitLabel="Lưu thay đổi"
      cancelHref="/admin/applications"
      slugEditable={false}
    />
  );
}
