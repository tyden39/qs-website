"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { leadStatusUpdate, type LeadStatusUpdate } from "@/lib/validation/lead-schema";
import { updateLeadStatus } from "@/app/admin/_actions/leads";

const STATUS_LABELS: Record<string, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  qualified: "Tiềm năng",
  closed: "Đóng",
};

const STATUS_COLORS: Record<string, string> = {
  new: "border-blue-300 bg-blue-50 text-blue-700",
  contacted: "border-yellow-300 bg-yellow-50 text-yellow-700",
  qualified: "border-green-300 bg-green-50 text-green-700",
  closed: "border-line bg-paper text-muted",
};

interface Props {
  leadId: number;
  currentStatus: string;
  currentAssignedTo: string | null;
}

export function LeadStatusForm({ leadId, currentStatus, currentAssignedTo }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LeadStatusUpdate>({
    resolver: zodResolver(leadStatusUpdate),
    defaultValues: {
      status: currentStatus as LeadStatusUpdate["status"],
      assignedTo: currentAssignedTo ?? undefined,
    },
  });

  function onSubmit(data: LeadStatusUpdate) {
    setError("");
    startTransition(async () => {
      try {
        await updateLeadStatus(leadId, data);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block font-mono text-[10px] text-muted tracking-[.16em] uppercase mb-1.5">
          Trạng thái
        </label>
        <select
          {...register("status")}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-ink transition-colors"
        >
          {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
            <option key={val} value={val}>{lbl}</option>
          ))}
        </select>
        {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>}
      </div>

      {error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="qs-btn qs-btn-gold qs-btn-sm disabled:opacity-60"
      >
        {isPending ? "Đang lưu…" : "Cập nhật trạng thái"}
      </button>

      {/* Status legend */}
      <div className="pt-2 space-y-1.5">
        {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
          <div key={val} className="flex items-center gap-2">
            <span className={`inline-block px-2 py-0.5 font-mono text-[10px] tracking-[.1em] uppercase border ${STATUS_COLORS[val]}`}>
              {lbl}
            </span>
          </div>
        ))}
      </div>
    </form>
  );
}
