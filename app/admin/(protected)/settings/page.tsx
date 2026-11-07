import type { Metadata } from "next";
import { DeliverySettingsForm } from "@/components/admin/DeliverySettingsForm";
import { getDefaultDeliveryFee } from "@/lib/supabase/delivery";

export const metadata: Metadata = { title: "Delivery settings · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const defaultFee = await getDefaultDeliveryFee();

  return <main className="admin-content">
    <header className="mb-7">
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Store configuration</div>
      <h1 className="!my-0">Delivery settings</h1>
      <p className="!mt-2 text-sm text-[#666]">Set the standard delivery price customers see at checkout.</p>
    </header>
    <DeliverySettingsForm defaultFee={defaultFee} />
  </main>;
}
