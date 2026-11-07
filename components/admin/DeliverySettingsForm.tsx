"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, Save, Truck } from "lucide-react";
import { saveDefaultDeliveryFee } from "@/app/admin/actions";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function DeliverySettingsForm({ defaultFee }: { defaultFee: number }) {
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const result = await saveDefaultDeliveryFee(new FormData(event.currentTarget));
      if (!result.ok) {
        showToast(result.error ?? "Delivery settings could not be saved.", "error");
        return;
      }
      showToast("Default delivery fee updated.");
    } catch {
      showToast("Delivery settings could not be saved. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={handleSubmit} className="admin-form-section max-w-2xl">
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-[#eaeaea] bg-[#f5f5f4] text-[#555]"><Truck size={18} /></span>
      <div><h2>Default delivery fee</h2><p className="mt-1 text-xs leading-5 text-[#777]">Applied once to each order. Set it to 0 for free base delivery.</p></div>
    </div>
    <label className="admin-field mt-5 block max-w-sm"><span>Delivery fee (PKR)</span><Input name="default_delivery_fee" type="number" min="0" max="1000000" step="0.01" required defaultValue={defaultFee.toFixed(2)} className="admin-input" /></label>
    <div className="mt-5 border-t border-[#eaeaea] pt-4">
      <button type="submit" disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 text-xs font-medium text-white transition-colors hover:bg-[#333] disabled:cursor-wait disabled:opacity-60">{busy ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}{busy ? "Saving…" : "Save delivery fee"}</button>
    </div>
  </form>;
}
