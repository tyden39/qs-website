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
import { createApplication } from "@/app/admin/_actions/applications";
import { ApplicationFormFields } from "./application-form-fields";

export function NewApplicationForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  // Use input type (ApplicationFormValues) so zodResolver type inference aligns
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      slug: "", title: { vi: "" }, summary: { vi: "" },
      heroImage: "", workflow: [], specs: [], deployments: [],
      status: "draft", sort: 0,
    },
  });

  const workflowArray = useFieldArray({ control: form.control, name: "workflow" });
  const specsArray = useFieldArray({ control: form.control, name: "specs" });
  const deploymentsArray = useFieldArray({ control: form.control, name: "deployments" });

  async function onSubmit(data: ApplicationFormValues) {
    setServerError(null);
    // After zodResolver validates, output matches SchemaType
    const res = await createApplication(data as ApplicationSchemaType);
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
      submitLabel="Tạo ứng dụng"
      cancelHref="/admin/applications"
      slugEditable
    />
  );
}
