"use client";

import { useState } from "react";
import { LoaderCircle, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import type { AdminActionResult } from "@/app/admin/actions";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  action,
  actionId,
  onSuccess,
  compact = false,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm?: () => Promise<AdminActionResult>;
  action?: (id: string) => Promise<AdminActionResult>;
  actionId?: string;
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  async function confirm() {
    setBusy(true);
    try {
      const result = action && actionId ? await action(actionId) : await onConfirm?.();
      if (!result) {
        showToast("The action could not be completed.", "error");
        return;
      }
      if (!result.ok) {
        showToast(result.error ?? "The action could not be completed.", "error");
        return;
      }
      showToast(result.warning ?? "Deleted successfully.", result.warning ? "warning" : "success");
      onSuccess?.();
      setOpen(false);
      router.refresh();
    } catch {
      showToast("The action could not be completed. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label={title} className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#eaeaea] text-[#7c3732] transition hover:border-[#e4c4c1] hover:bg-[#fff7f6] ${compact ? "size-9" : "px-3 py-2 text-xs font-medium"}`}>
      <Trash2 size={15} />{!compact && confirmLabel}
    </button>
    {open && <div className="fixed inset-0 z-[90] grid place-items-center bg-black/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setOpen(false); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" className="w-full max-w-md rounded-xl border border-[#eaeaea] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4"><div><h2 id="confirm-title" className="text-lg font-semibold tracking-[-0.025em]">{title}</h2><p id="confirm-description" className="mt-2 text-sm leading-6 text-[#666]">{description}</p></div><button type="button" onClick={() => setOpen(false)} disabled={busy} aria-label="Close dialog" className="rounded-md p-1 text-[#777] hover:bg-[#f3f3f3]"><X size={17} /></button></div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} disabled={busy} className="rounded-lg border border-[#eaeaea] px-4 py-2.5 text-sm text-[#444] hover:bg-[#f7f7f7]">Cancel</button><button type="button" onClick={confirm} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#333] disabled:opacity-60">{busy && <LoaderCircle size={15} className="animate-spin" />}{confirmLabel}</button></div>
      </section>
    </div>}
  </>;
}
