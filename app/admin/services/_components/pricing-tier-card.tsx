"use client";

import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn, Control } from "react-hook-form";
import type { ServiceFormValues } from "@/lib/validation/service-schema";

type RegisterFn = UseFormReturn<ServiceFormValues>["register"];

type Props = {
  index: number;
  control: Control<ServiceFormValues>;
  register: RegisterFn;
  label: string;
  onRemove: () => void;
};

export function PricingTierCard({ index, control, register, label, onRemove }: Props) {
  const [open, setOpen] = useState(true);

  // Safe: useFieldArray called unconditionally at component top-level, not in a loop
  const featuresArray = useFieldArray({
    control,
    name: `tiers.${index}.features` as const,
  });

  return (
    <div className="border border-line bg-white">
      <div className="flex items-center justify-between px-3 py-2 bg-paper-2 border-b border-line">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex-1 text-left text-sm font-medium">
          {open ? "▾" : "▸"} {label}
        </button>
        <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline ml-3">Xoá</button>
      </div>

      {open && (
        <div className="p-3 grid gap-3">
          <label className="block">
            <span className="text-xs text-muted">Tên gói (key) *</span>
            <input
              {...register(`tiers.${index}.name`)}
              className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
              placeholder="basic"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Tiêu đề (VI) *</span>
              <input {...register(`tiers.${index}.title.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">Tiêu đề (EN)</span>
              <input {...register(`tiers.${index}.title.en`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Giá (VI) *</span>
              <input {...register(`tiers.${index}.price.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" placeholder="Liên hệ" /></label>
            <label className="block"><span className="text-xs text-muted">Giá (EN)</span>
              <input {...register(`tiers.${index}.price.en`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" placeholder="Contact us" /></label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">Ghi chú giá (VI)</span>
              <input {...register(`tiers.${index}.priceNote.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">Ghi chú giá (EN)</span>
              <input {...register(`tiers.${index}.priceNote.en`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-xs text-muted">CTA (VI) *</span>
              <input {...register(`tiers.${index}.cta.vi`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
            <label className="block"><span className="text-xs text-muted">CTA (EN)</span>
              <input {...register(`tiers.${index}.cta.en`)} className="mt-1 w-full border border-line px-2 py-1.5 text-sm focus:outline-none" /></label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register(`tiers.${index}.featured`)} className="w-4 h-4" />
            <span>Gói nổi bật</span>
          </label>

          {/* Tier features — nested array managed by this component's own useFieldArray */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-medium">Tính năng</span>
              <button
                type="button"
                onClick={() => featuresArray.append({ vi: "" })}
                className="text-xs px-2 py-0.5 border border-line hover:bg-paper-2"
              >
                + Thêm
              </button>
            </div>
            {featuresArray.fields.map((feat, fIdx) => (
              <div key={feat.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                <label className="block">
                  <span className="text-xs text-muted">VI *</span>
                  <input {...register(`tiers.${index}.features.${fIdx}.vi`)} className="mt-1 w-full border border-line px-2 py-1 text-sm focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-xs text-muted">EN</span>
                  <input {...register(`tiers.${index}.features.${fIdx}.en`)} className="mt-1 w-full border border-line px-2 py-1 text-sm focus:outline-none" />
                </label>
                <button type="button" onClick={() => featuresArray.remove(fIdx)} className="mb-0.5 text-xs text-red-600 hover:underline">Xoá</button>
              </div>
            ))}
            {featuresArray.fields.length === 0 && (
              <p className="text-xs text-muted">Chưa có tính năng nào.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
