"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ApplicationFormValues } from "@/lib/validation/application-schema";

type Props = {
  index: number;
  register: UseFormReturn<ApplicationFormValues>["register"];
  errors: UseFormReturn<ApplicationFormValues>["formState"]["errors"];
  onRemove: () => void;
  label: string;
};

export function DeploymentCard({ index, register, errors, onRemove, label }: Props) {
  const [open, setOpen] = useState(true);
  const dep = errors.deployments?.[index];

  return (
    <div className="border border-line bg-white">
      <div className="flex items-center justify-between px-3 py-2 bg-paper-2 border-b border-line">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 text-left text-sm font-medium"
        >
          {open ? "▾" : "▸"} {label}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-600 hover:underline ml-3"
        >
          Xoá
        </button>
      </div>

      {open && (
        <div className="p-3 grid gap-2">
          <label className="block">
            <span className="text-xs text-muted">Tên khách hàng *</span>
            <input
              {...register(`deployments.${index}.name`)}
              className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
              placeholder="Client name"
            />
            {dep?.name && (
              <span className="text-xs text-red-600">{dep.name.message}</span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs text-muted">Địa điểm (VI) *</span>
              <input
                {...register(`deployments.${index}.loc.vi`)}
                className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                placeholder="Hà Nội, Việt Nam"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Địa điểm (EN)</span>
              <input
                {...register(`deployments.${index}.loc.en`)}
                className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                placeholder="Hanoi, Vietnam"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
